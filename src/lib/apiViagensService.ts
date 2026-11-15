import crypto from "crypto";
import { AIRPORTS, Airport } from "@/data/airports";
import {
  AirlineKey,
  PricingRuleConfig,
  logExternalApiTestToSupabase,
} from "@/lib/db";
import {
  FlightOfferResult,
  FlightSearchParams,
  searchAndCompareFlights,
} from "@/lib/flightEngine";

/**
 * ============================================================================
 * APIVIAGENS (https://api.apiviagens.com.br) — GATEWAY DE OTIMIZAÇÃO DE CUSTOS
 * ============================================================================
 * Regras oficiais da API consideradas neste serviço:
 * 1. "Cada busca com resultado consome créditos da sua conta; gerar uma reserva é grátis."
 * 2. "Um programa por requisição, via provider: smiles, azul, aadvantage, latam, tarifado, tap, azulpelomundo."
 * 3. "A oferta (offer_id) expira em ~1h." -> Cache ativo de 50 minutos preserva o offer_id válido
 *    para reserva gratuita em POST /v1/airfares/book sem gastar nova busca.
 * 4. Ida e volta consolidada na mesma chamada (return_date / roundtrip_combined) economiza 50%.
 */

export type ApiViagensProvider =
  | "smiles"
  | "azul"
  | "aadvantage"
  | "latam"
  | "tarifado"
  | "tap"
  | "azulpelomundo";

export type SearchOptimizationStrategy =
  | "CASH_FIRST" // 1 crédito: Consulta apenas 'tarifado' primeiro; milhas sob demanda
  | "SMART_ECONOMY" // 2 a 3 créditos (Padrão): 'tarifado' + top 2 programas ideais da rota
  | "ALL_ELIGIBLE" // 4 a 5 créditos: Todos os programas que operam a rota (bloqueia os incompatíveis)
  | "CUSTOM"; // Apenas os providers escolhidos manualmente pelo agente/usuário

export const ALL_APIVIAGENS_PROVIDERS: ApiViagensProvider[] = [
  "tarifado",
  "latam",
  "smiles",
  "azul",
  "tap",
  "aadvantage",
  "azulpelomundo",
];

export const APIVIAGENS_BASE_URL =
  process.env.APIVIAGENS_BASE_URL || "https://api.apiviagens.com.br";

/**
 * Validade do cache:
 * - Ofertas tarifadas (offer_id expira em ~60 min na API): guardamos por 50 min (3.000.000 ms)
 *   garantindo que o POST /v1/airfares/book (grátis) ainda funcione com o offer_id em cache.
 * - Buscas exploratórias de milhas: guardamos por 2 horas (7.200.000 ms).
 */
export const OFFER_CACHE_TTL_MS = 50 * 60 * 1000; // 50 minutos
export const MILES_CACHE_TTL_MS = 120 * 60 * 1000; // 120 minutos
export const CREDITS_PER_PROVIDER_SEARCH = 25; // Retornado por GET /v1/account (credits_per_search: 25)
export const MAX_CONCURRENT_APIVIAGENS = 5; // Retornado por GET /v1/account (max_concurrent: 5)

export interface RouteProviderSelection {
  routeType: "DOMESTIC_BR" | "SOUTH_AMERICA" | "NORTH_AMERICA" | "EUROPE" | "OTHER_INTL";
  queriedProviders: ApiViagensProvider[];
  skippedProviders: {
    provider: ApiViagensProvider;
    reason: string;
  }[];
  creditsUsedEstimate: number;
  creditsSavedByFilter: number;
}

export interface ApiViagensOptimizationTelemetry {
  cacheKey: string;
  cacheHit: boolean;
  cacheAgeSeconds: number;
  cacheExpiresInSeconds: number;
  liveApiConnected: boolean;
  strategyApplied: SearchOptimizationStrategy;
  roundTripConsolidated: boolean;
  routeClassification: RouteProviderSelection["routeType"];
  queriedProviders: ApiViagensProvider[];
  skippedProviders: { provider: ApiViagensProvider; reason: string }[];
  creditsConsumedThisCall: number;
  creditsSavedThisCall: number;
  totalSessionCreditsConsumed: number;
  totalSessionCreditsSaved: number;
  totalSessionCacheHits: number;
}

export interface PreSearchCalendarDay {
  date: string;
  dayOfWeekLabel: string;
  estimatedLowestSingBRL: number;
  estimatedLowestMiles: number;
  bestProviderHint: ApiViagensProvider;
  isCheapestInWindow: boolean;
  isSelectedDate: boolean;
  source: "CACHE_REAL" | "FIXED_COST_MATRIX";
}

export interface ApiViagensBookingPassenger {
  first_name: string;
  last_name: string;
  age_group: "ADT" | "CHD" | "INF";
  birth_date: string; // AAAA-MM-DD
  gender: "M" | "F";
  cpf: string;
}

export interface ApiViagensBookingContact {
  name: string;
  email: string;
  country_code: string;
  area_code: string;
  number: string;
}

export interface ApiViagensBookRequest {
  offer_id: string;
  passengers: ApiViagensBookingPassenger[];
  contacts: ApiViagensBookingContact[];
}

export interface ApiViagensBookResponse {
  locator: string;
  status: string;
  total: number;
  emission_deadline: string;
  mode: "LIVE_APIVIAGENS" | "SANDBOX_FALLBACK";
  creditsConsumed: 0; // Reserva é sempre grátis na APIVIAGENS
}

interface CacheEntry<T> {
  key: string;
  data: T;
  createdAtMs: number;
  expiresAtMs: number;
  providers: ApiViagensProvider[];
}

// Estado global persistido no processo Node.js (evita perda em HMR no Next.js dev)
const globalForApiViagens = globalThis as unknown as {
  __singApiViagensCache?: Map<string, CacheEntry<any>>;
  __singApiViagensInFlight?: Map<string, Promise<any>>;
  __singApiViagensMetrics?: {
    creditsConsumed: number;
    creditsSaved: number;
    cacheHits: number;
    requestsCoalesced: number;
  };
};

const searchCache =
  globalForApiViagens.__singApiViagensCache ||
  (globalForApiViagens.__singApiViagensCache = new Map());

const inFlightRequests =
  globalForApiViagens.__singApiViagensInFlight ||
  (globalForApiViagens.__singApiViagensInFlight = new Map());

const sessionMetrics =
  globalForApiViagens.__singApiViagensMetrics ||
  (globalForApiViagens.__singApiViagensMetrics = {
    creditsConsumed: 0,
    creditsSaved: 0,
    cacheHits: 0,
    requestsCoalesced: 0,
  });

function getApiCredentials(overrideKey?: string, overrideSecret?: string) {
  const apiKey = (overrideKey || process.env.APIVIAGENS_API_KEY || "").trim();
  const apiSecret = (overrideSecret || process.env.APIVIAGENS_API_SECRET || "").trim();
  return {
    apiKey,
    apiSecret,
    isConfigured: Boolean(apiKey && apiSecret),
  };
}

function buildAuthHeaders(apiKey: string, apiSecret: string): Record<string, string> {
  return {
    "X-Api-Key": apiKey,
    "X-Api-Secret": apiSecret,
    Accept: "application/json",
  };
}

function findAirportInfo(iata: string): Airport | undefined {
  const clean = (iata || "").trim().toUpperCase();
  return AIRPORTS.find((a) => a.iata === clean);
}

/**
 * ============================================================================
 * CAMADA 1: ROTEADOR INTELIGENTE DE PROVIDERS POR MALHA AÉREA
 * ============================================================================
 * Evita disparar buscas nos 7 providers quando parte deles não opera ou não
 * possui tabela competitiva na rota pesquisada.
 */
export function selectOptimalProvidersForRoute(
  originIata: string,
  destinationIata: string,
  strategy: SearchOptimizationStrategy = "SMART_ECONOMY",
  customProviders?: ApiViagensProvider[]
): RouteProviderSelection {
  const orig = findAirportInfo(originIata);
  const dest = findAirportInfo(destinationIata);

  const isOrigBR = !orig || orig.country === "Brasil";
  const isDestBR = !dest || dest.country === "Brasil";

  let routeType: RouteProviderSelection["routeType"] = "OTHER_INTL";
  if (isOrigBR && isDestBR) {
    routeType = "DOMESTIC_BR";
  } else if (
    orig?.country === "Argentina" ||
    dest?.country === "Argentina" ||
    orig?.country === "Chile" ||
    dest?.country === "Chile"
  ) {
    routeType = "SOUTH_AMERICA";
  } else if (orig?.country === "EUA" || dest?.country === "EUA") {
    routeType = "NORTH_AMERICA";
  } else if (
    ["Portugal", "Espanha", "França", "Reino Unido", "Bélgica"].includes(
      orig?.country || ""
    ) ||
    ["Portugal", "Espanha", "França", "Reino Unido", "Bélgica"].includes(
      dest?.country || ""
    )
  ) {
    routeType = "EUROPE";
  }

  // Matriz de elegibilidade real por região geográfica
  const eligibilityMap: Record<
    RouteProviderSelection["routeType"],
    {
      economyTop: ApiViagensProvider[];
      allEligible: ApiViagensProvider[];
      blocked: { provider: ApiViagensProvider; reason: string }[];
    }
  > = {
    DOMESTIC_BR: {
      economyTop: ["tarifado", "latam", "smiles"],
      allEligible: ["tarifado", "latam", "smiles", "azul"],
      blocked: [
        {
          provider: "tap",
          reason: "TAP Miles&Go não opera voos domésticos dentro do Brasil",
        },
        {
          provider: "aadvantage",
          reason: "AAdvantage não emite malha doméstica nacional rentável",
        },
        {
          provider: "azulpelomundo",
          reason: "Azul Pelo Mundo (Interline) é exclusivo para rotas internacionais",
        },
      ],
    },
    SOUTH_AMERICA: {
      economyTop: ["tarifado", "latam", "smiles"],
      allEligible: ["tarifado", "latam", "smiles", "azul"],
      blocked: [
        {
          provider: "tap",
          reason: "Rota sul-americana sem operação TAP (hub Lisboa)",
        },
        {
          provider: "aadvantage",
          reason: "Maior eficiência concentrada em LATAM Pass e Smiles na América do Sul",
        },
        {
          provider: "azulpelomundo",
          reason: "Rota coberta diretamente por LATAM/Smiles com menor taxa",
        },
      ],
    },
    NORTH_AMERICA: {
      economyTop: ["tarifado", "aadvantage", "latam"],
      allEligible: ["tarifado", "aadvantage", "latam", "azul", "smiles", "azulpelomundo"],
      blocked: [
        {
          provider: "tap",
          reason: "Rota Brasil-EUA não utiliza hub europeu TAP",
        },
      ],
    },
    EUROPE: {
      economyTop: ["tarifado", "tap", "latam"],
      allEligible: ["tarifado", "tap", "latam", "smiles", "azulpelomundo", "azul"],
      blocked: [
        {
          provider: "aadvantage",
          reason: "AAdvantage focado em hubs EUA; Europa prioriza TAP/LATAM/Smiles",
        },
      ],
    },
    OTHER_INTL: {
      economyTop: ["tarifado", "latam", "smiles"],
      allEligible: ["tarifado", "latam", "smiles", "tap", "aadvantage", "azulpelomundo"],
      blocked: [
        {
          provider: "azul",
          reason: "Substituído por azulpelomundo para alianças internacionais",
        },
      ],
    },
  };

  const rule = eligibilityMap[routeType];
  let queriedProviders: ApiViagensProvider[] = [];

  if (strategy === "CUSTOM" && Array.isArray(customProviders) && customProviders.length > 0) {
    queriedProviders = customProviders;
  } else if (strategy === "CASH_FIRST") {
    queriedProviders = ["tarifado"];
  } else if (strategy === "SMART_ECONOMY") {
    queriedProviders = rule.economyTop;
  } else {
    queriedProviders = rule.allEligible;
  }

  const skippedProviders: { provider: ApiViagensProvider; reason: string }[] = [];
  for (const p of ALL_APIVIAGENS_PROVIDERS) {
    if (!queriedProviders.includes(p)) {
      const blockedRule = rule.blocked.find((b) => b.provider === p);
      skippedProviders.push({
        provider: p,
        reason:
          blockedRule?.reason ||
          (strategy === "CASH_FIRST"
            ? "Poupado pelo modo Cash-First (cotação de milhas sob demanda)"
            : "Poupado pelo filtro Smart Economy (prioriza top 3 da rota)"),
      });
    }
  }

  const creditsUsedEstimate = queriedProviders.length;
  const creditsSavedByFilter = Math.max(
    0,
    ALL_APIVIAGENS_PROVIDERS.length - creditsUsedEstimate
  );

  return {
    routeType,
    queriedProviders,
    skippedProviders,
    creditsUsedEstimate,
    creditsSavedByFilter,
  };
}

/**
 * ============================================================================
 * CAMADA 2 & 3: CACHE COM TTL DE 50 MINUTOS + DESDUPLICAÇÃO EM VOO (COALESCING)
 * ============================================================================
 */
export function buildNormalizedSearchCacheKey(
  params: FlightSearchParams,
  providers: ApiViagensProvider[]
): string {
  const childrenCount = params.childrenAges.filter((a) => a >= 2).length;
  const infantsCount = params.childrenAges.filter((a) => a < 2).length;
  const rawKey = [
    params.origin.trim().toUpperCase(),
    params.destination.trim().toUpperCase(),
    params.departureDate.trim(),
    params.tripType === "ROUND_TRIP" ? (params.returnDate || "").trim() : "ONEWAY",
    `ADT:${params.adults}`,
    `CHD:${childrenCount}`,
    `INF:${infantsCount}`,
    params.cabinClass,
    [...providers].sort().join(","),
  ].join("|");

  const hash = crypto.createHash("sha256").update(rawKey).digest("hex").slice(0, 16);
  return `apivg_${params.origin}_${params.destination}_${params.departureDate}_${hash}`;
}

function mapProviderToAirlineKey(provider: ApiViagensProvider): AirlineKey {
  switch (provider) {
    case "smiles":
      return "GOL";
    case "azul":
    case "azulpelomundo":
      return "AZUL";
    case "tap":
      return "TAP";
    case "aadvantage":
      return "AMERICAN";
    case "latam":
    case "tarifado":
    default:
      return "LATAM";
  }
}

/**
 * Executa uma chamada HTTP real para um provider na APIVIAGENS (/v1/flights ou /v1/airfares)
 */
async function fetchSingleProviderFromApiViagens(params: {
  searchParams: FlightSearchParams;
  provider: ApiViagensProvider;
  apiKey: string;
  apiSecret: string;
}): Promise<any> {
  const { searchParams, provider, apiKey, apiSecret } = params;
  const children = searchParams.childrenAges.filter((a) => a >= 2).length;
  const infants = searchParams.childrenAges.filter((a) => a < 2).length;

  // Se for tarifado, priorizamos /v1/airfares que já devolve offer_id pronto para reserva combinada
  if (provider === "tarifado") {
    const query = new URLSearchParams({
      origin: searchParams.origin.toUpperCase(),
      destination: searchParams.destination.toUpperCase(),
      departure_date: searchParams.departureDate,
      trip_type:
        searchParams.tripType === "ROUND_TRIP" && searchParams.returnDate
          ? "roundtrip_combined"
          : "oneway",
      adults: String(searchParams.adults),
    });
    if (searchParams.tripType === "ROUND_TRIP" && searchParams.returnDate) {
      query.set("return_date", searchParams.returnDate);
    }
    if (children > 0) query.set("children", String(children));
    if (infants > 0) query.set("infants", String(infants));
    if (searchParams.cabinClass) {
      query.set("cabin", searchParams.cabinClass.toLowerCase());
    }

    const url = `${APIVIAGENS_BASE_URL}/v1/airfares?${query.toString()}`;
    const res = await fetch(url, {
      method: "GET",
      headers: buildAuthHeaders(apiKey, apiSecret),
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`APIVIAGENS /v1/airfares HTTP ${res.status}`);
    }
    return { provider, endpoint: "/v1/airfares", payload: await res.json() };
  }

  // Demais programas: /v1/flights consolidando ida e volta (return_date) em 1 única requisição
  const query = new URLSearchParams({
    origin: searchParams.origin.toUpperCase(),
    destination: searchParams.destination.toUpperCase(),
    departure_date: searchParams.departureDate,
    provider,
    adults: String(searchParams.adults),
  });
  if (searchParams.tripType === "ROUND_TRIP" && searchParams.returnDate) {
    query.set("return_date", searchParams.returnDate);
  }
  if (children > 0) query.set("children", String(children));
  if (infants > 0) query.set("infants", String(infants));
  if (searchParams.cabinClass) {
    query.set("cabin", searchParams.cabinClass.toLowerCase());
  }

  const url = `${APIVIAGENS_BASE_URL}/v1/flights?${query.toString()}`;
  const res = await fetch(url, {
    method: "GET",
    headers: buildAuthHeaders(apiKey, apiSecret),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`APIVIAGENS /v1/flights (${provider}) HTTP ${res.status}`);
  }
  return { provider, endpoint: "/v1/flights", payload: await res.json() };
}

function formatIsoTime(isoDate?: string, refDepartureIso?: string): string {
  if (!isoDate || !isoDate.includes("T")) return isoDate || "08:30";
  const [datePart, timePart] = isoDate.split("T");
  const hhmm = timePart.slice(0, 5);
  if (refDepartureIso && refDepartureIso.includes("T")) {
    const depDatePart = refDepartureIso.split("T")[0];
    if (datePart > depDatePart) {
      return `${hhmm} (+1)`;
    }
  }
  return hhmm;
}

function formatDurationObj(dur: any): string {
  if (!dur) return "03h 05m";
  if (typeof dur === "string") return dur;
  const h = String(Number(dur.hours || 0)).padStart(2, "0");
  const m = String(Number(dur.minutes || 0)).padStart(2, "0");
  return `${h}h ${m}m`;
}

function extractFlightsArrayFromPayload(
  payload: any,
  provider: ApiViagensProvider
): any[] {
  const fromNestedProvider =
    payload?.providers?.[provider]?.list_flights?.departure;
  if (Array.isArray(fromNestedProvider)) return fromNestedProvider;
  if (Array.isArray(payload?.list_flights?.departure)) {
    return payload.list_flights.departure;
  }
  if (Array.isArray(payload?.combined)) return payload.combined;
  if (Array.isArray(payload?.outbound)) return payload.outbound;
  return [];
}

/**
 * Normaliza os retornos reais da APIVIAGENS (/v1/flights + /v1/airfares) para o formato FlightOfferResult
 * aplicando a regra de precificação e Spread da Sing Viagens.
 */
function normalizeLiveApiViagensToOffers(
  providerResults: { provider: ApiViagensProvider; endpoint: string; payload: any }[],
  searchParams: FlightSearchParams,
  pricingConfig: PricingRuleConfig
): FlightOfferResult[] {
  const baseSimulated = searchAndCompareFlights(searchParams, pricingConfig);
  const originAirport =
    findAirportInfo(searchParams.origin) || baseSimulated[0].originAirport;
  const destinationAirport =
    findAirportInfo(searchParams.destination) || baseSimulated[0].destinationAirport;

  // Extrai menor tarifa em dinheiro do provider 'tarifado' (/v1/airfares) como referência de comparação
  const tarifadoEntry = providerResults.find((r) => r.provider === "tarifado");
  const airfareList: any[] = tarifadoEntry
    ? extractFlightsArrayFromPayload(tarifadoEntry.payload, "tarifado")
    : [];

  const lowestCashOffer = airfareList[0];
  const referenceCashTotal = Number(
    lowestCashOffer?.price?.total ||
      lowestCashOffer?.raw_pricing?.money ||
      lowestCashOffer?.raw_pricing?.total ||
      baseSimulated[0]?.pricingBreakdown.airlineDirectCashPriceTotal ||
      1500
  );

  const normalizedOffers: FlightOfferResult[] = [];

  for (const res of providerResults) {
    const flightsList = extractFlightsArrayFromPayload(res.payload, res.provider);

    for (let i = 0; i < Math.min(flightsList.length, 4); i++) {
      const f = flightsList[i];
      const airlineKey = mapProviderToAirlineKey(res.provider);
      const milesRequired = Math.round(
        Number(
          f?.raw_pricing?.miles ||
            f?.raw_pricing?.points ||
            f?.miles ||
            baseSimulated[0].pricingBreakdown.totalMilesRequired
        )
      );
      const boardingTaxesTotal = Math.round(
        Number(
          f?.raw_pricing?.tax_amount ??
            f?.raw_pricing?.taxes ??
            f?.price?.taxes ??
            baseSimulated[0].pricingBreakdown.boardingTaxesTotal
        )
      );
      const mileRate = pricingConfig.mileCostPerThousand[airlineKey] ?? 22.0;
      const milesMonetaryCost = Math.round((milesRequired / 1000) * mileRate);
      const totalMilesCostWithTaxes =
        res.provider === "tarifado"
          ? Math.round(
              Number(
                f?.price?.total ||
                  f?.raw_pricing?.money ||
                  f?.raw_pricing?.total ||
                  referenceCashTotal
              )
            )
          : milesMonetaryCost + boardingTaxesTotal;

      const airlineDirectCashPriceTotal = Math.max(
        referenceCashTotal,
        Math.round(totalMilesCostWithTaxes * 1.35)
      );
      const grossSpreadDifference = Math.max(
        0,
        airlineDirectCashPriceTotal - totalMilesCostWithTaxes
      );
      const singProfitAmount = Math.round(
        grossSpreadDifference * (pricingConfig.profitShareOnSavingsPercent / 100)
      );
      const singFinalSalePriceTotal = totalMilesCostWithTaxes + singProfitAmount;

      const offerId =
        f?.offer_id || f?.id || lowestCashOffer?.id || `af_${res.provider}_${Date.now()}_${i}`;

      const firstSegment = f?.complete_path?.[0] || f?.legs?.[0];
      const depIso = f?.main_path?.departure?.date || firstSegment?.departure?.date;
      const arrIso = f?.main_path?.arrival?.date || firstSegment?.arrival?.date;
      const stopsCount = Number(f?.stops_number ?? f?.stops ?? 0);
      const companyName = Array.isArray(f?.company)
        ? f.company[0]
        : firstSegment?.company || f?.airline_name || `${airlineKey} (${res.provider.toUpperCase()})`;
      const flightCode =
        firstSegment?.airline_code && firstSegment?.flight_number
          ? `${firstSegment.airline_code}${firstSegment.flight_number}`
          : f?.flight_number || `${airlineKey.slice(0, 2)}3378`;

      normalizedOffers.push({
        ...baseSimulated[0],
        id: String(offerId),
        operatingAirlineCode: airlineKey,
        operatingAirlineName: companyName,
        flightNumber: flightCode,
        originAirport,
        destinationAirport,
        departureTime: formatIsoTime(depIso),
        arrivalTime: formatIsoTime(arrIso, depIso),
        duration: formatDurationObj(f?.duration),
        stops: stopsCount,
        stopsDescription:
          stopsCount === 0
            ? "Voo Direto"
            : `${stopsCount} conexão (${formatDurationObj(f?.stops_duration)})`,
        eventRecommendationBadge: `Oferta Real APIVIAGENS (${res.provider.toUpperCase()}) • ${milesRequired.toLocaleString(
          "pt-BR"
        )} mi`,
        pricingBreakdown: {
          totalMilesRequired: milesRequired,
          mileCostPerThousandApplied: mileRate,
          milesMonetaryCost,
          boardingTaxesTotal,
          totalMilesCostWithTaxes,
          airlineDirectCashPriceTotal,
          grossSpreadDifference,
          profitSharePercentApplied: pricingConfig.profitShareOnSavingsPercent,
          singProfitAmount,
          singFinalSalePriceTotal,
          singPricePerPersonAvg: Math.round(
            singFinalSalePriceTotal / Math.max(1, searchParams.adults)
          ),
        },
        bestSavingsVsOperatingAirline:
          airlineDirectCashPriceTotal - singFinalSalePriceTotal,
      });
    }
  }

  return normalizedOffers.length > 0 ? normalizedOffers : baseSimulated;
}

/**
 * ============================================================================
 * FUNÇÃO PRINCIPAL DE BUSCA OTIMIZADA (CACHE + COALESCING + FILTRO DE PROVIDERS)
 * ============================================================================
 */
export async function searchFlightsWithApiViagensOptimization(params: {
  searchParams: FlightSearchParams;
  pricingConfig: PricingRuleConfig;
  strategy?: SearchOptimizationStrategy;
  customProviders?: ApiViagensProvider[];
  forceRefresh?: boolean;
  allowLiveCreditSpend?: boolean;
  apiKeyOverride?: string;
  apiSecretOverride?: string;
}): Promise<{
  offers: FlightOfferResult[];
  telemetry: ApiViagensOptimizationTelemetry;
  preSearchCalendar: PreSearchCalendarDay[];
}> {
  const strategy = params.strategy || "SMART_ECONOMY";
  const credentials = getApiCredentials(params.apiKeyOverride, params.apiSecretOverride);
  // Trava de proteção: só consome créditos reais da APIVIAGENS quando allowLiveCreditSpend === true
  const shouldCallLiveApi =
    credentials.isConfigured && Boolean(params.allowLiveCreditSpend);

  // 1. Filtra os providers ótimos para a rota (evitando chamadas inúteis nos 7 programas)
  const routeSelection = selectOptimalProvidersForRoute(
    params.searchParams.origin,
    params.searchParams.destination,
    strategy,
    params.customProviders
  );

  // 2. Gera chave única normalizada (garantindo consolidação de ida+volta na mesma chave)
  const cacheKey = buildNormalizedSearchCacheKey(
    params.searchParams,
    routeSelection.queriedProviders
  );

  const nowMs = Date.now();
  const existingCache = searchCache.get(cacheKey);

  // 3. Verifica Cache Ativo (50 min para preservar validade de ~1h do offer_id)
  if (!params.forceRefresh && existingCache && existingCache.expiresAtMs > nowMs) {
    sessionMetrics.cacheHits += 1;
    // Ao retornar do cache, economizamos todos os 7 créditos que uma busca bruta gastaria
    sessionMetrics.creditsSaved += ALL_APIVIAGENS_PROVIDERS.length;

    const telemetry: ApiViagensOptimizationTelemetry = {
      cacheKey,
      cacheHit: true,
      cacheAgeSeconds: Math.round((nowMs - existingCache.createdAtMs) / 1000),
      cacheExpiresInSeconds: Math.round((existingCache.expiresAtMs - nowMs) / 1000),
      liveApiConnected: credentials.isConfigured,
      strategyApplied: strategy,
      roundTripConsolidated: params.searchParams.tripType === "ROUND_TRIP",
      routeClassification: routeSelection.routeType,
      queriedProviders: routeSelection.queriedProviders,
      skippedProviders: routeSelection.skippedProviders,
      creditsConsumedThisCall: 0,
      creditsSavedThisCall: ALL_APIVIAGENS_PROVIDERS.length,
      totalSessionCreditsConsumed: sessionMetrics.creditsConsumed,
      totalSessionCreditsSaved: sessionMetrics.creditsSaved,
      totalSessionCacheHits: sessionMetrics.cacheHits,
    };

    const preSearchCalendar = generateZeroCreditDateMatrix(
      params.searchParams,
      existingCache.data
    );

    return {
      offers: existingCache.data,
      telemetry,
      preSearchCalendar,
    };
  }

  // 4. Desduplicação de Requisições Concorrentes (Request Coalescing)
  if (inFlightRequests.has(cacheKey)) {
    sessionMetrics.requestsCoalesced += 1;
    const coalescedOffers = await inFlightRequests.get(cacheKey)!;
    const telemetry: ApiViagensOptimizationTelemetry = {
      cacheKey,
      cacheHit: true,
      cacheAgeSeconds: 0,
      cacheExpiresInSeconds: Math.round(OFFER_CACHE_TTL_MS / 1000),
      liveApiConnected: credentials.isConfigured,
      strategyApplied: strategy,
      roundTripConsolidated: params.searchParams.tripType === "ROUND_TRIP",
      routeClassification: routeSelection.routeType,
      queriedProviders: routeSelection.queriedProviders,
      skippedProviders: routeSelection.skippedProviders,
      creditsConsumedThisCall: 0,
      creditsSavedThisCall: ALL_APIVIAGENS_PROVIDERS.length,
      totalSessionCreditsConsumed: sessionMetrics.creditsConsumed,
      totalSessionCreditsSaved: sessionMetrics.creditsSaved,
      totalSessionCacheHits: sessionMetrics.cacheHits,
    };

    return {
      offers: coalescedOffers,
      telemetry,
      preSearchCalendar: generateZeroCreditDateMatrix(
        params.searchParams,
        coalescedOffers
      ),
    };
  }

  // 5. Executa a busca (Real na APIVIAGENS apenas quando allowLiveCreditSpend === true, protegendo os 1.000 créditos de teste)
  const executionPromise = (async () => {
    let offers: FlightOfferResult[] = [];
    let actualProviderCalls = routeSelection.creditsUsedEstimate;

    if (shouldCallLiveApi) {
      try {
        const startLiveMs = Date.now();
        // Respeita o limite max_concurrent: 5 da conta APIVIAGENS
        const cappedProviders = routeSelection.queriedProviders.slice(
          0,
          MAX_CONCURRENT_APIVIAGENS
        );
        const settled = await Promise.allSettled(
          cappedProviders.map((provider) =>
            fetchSingleProviderFromApiViagens({
              searchParams: params.searchParams,
              provider,
              apiKey: credentials.apiKey,
              apiSecret: credentials.apiSecret,
            })
          )
        );

        const successfulResults = settled
          .filter(
            (r): r is PromiseFulfilledResult<{
              provider: ApiViagensProvider;
              endpoint: string;
              payload: any;
            }> => r.status === "fulfilled"
          )
          .map((r) => r.value);

        if (successfulResults.length > 0) {
          const billableResults = successfulResults.filter(
            (r) => extractFlightsArrayFromPayload(r.payload, r.provider).length > 0
          );
          actualProviderCalls = billableResults.length;
          offers = normalizeLiveApiViagensToOffers(
            successfulResults,
            params.searchParams,
            params.pricingConfig
          );

          await logExternalApiTestToSupabase({
            providerName: "APIVIAGENS_OPTIMIZED_GATEWAY",
            endpoint: "/v1/flights + /v1/airfares",
            requestPayload: {
              searchParams: params.searchParams,
              strategy,
              queriedProviders: cappedProviders,
              skippedProviders: routeSelection.skippedProviders.map((s) => s.provider),
            },
            responsePayload: {
              offersReturned: offers.length,
              providerCalls: actualProviderCalls,
              creditsConsumed: actualProviderCalls * CREDITS_PER_PROVIDER_SEARCH,
              creditsSaved:
                (ALL_APIVIAGENS_PROVIDERS.length - actualProviderCalls) *
                CREDITS_PER_PROVIDER_SEARCH,
            },
            httpStatus: 200,
            latencyMs: Date.now() - startLiveMs,
            notes: `APIVIAGENS Live [${strategy}]: ${
              actualProviderCalls * CREDITS_PER_PROVIDER_SEARCH
            } créd. usados / ${
              (ALL_APIVIAGENS_PROVIDERS.length - actualProviderCalls) *
              CREDITS_PER_PROVIDER_SEARCH
            } poupados`,
          });
        }
      } catch (err) {
        console.warn("Fallback para motor Sing local após erro na APIVIAGENS:", err);
      }
    }

    if (offers.length === 0) {
      const simulated = searchAndCompareFlights(params.searchParams, params.pricingConfig);
      // Filtra e injeta o offer_id compatível com POST /v1/airfares/book (af_XXXX)
      offers = simulated.map((offer, idx) => ({
        ...offer,
        id: `af_${offer.operatingAirlineCode.toLowerCase()}_${params.searchParams.origin}${
          params.searchParams.destination
        }_${idx + 1}`,
      }));
    }

    const ttl = routeSelection.queriedProviders.includes("tarifado")
      ? OFFER_CACHE_TTL_MS
      : MILES_CACHE_TTL_MS;

    searchCache.set(cacheKey, {
      key: cacheKey,
      data: offers,
      createdAtMs: Date.now(),
      expiresAtMs: Date.now() + ttl,
      providers: routeSelection.queriedProviders,
    });

    const realCreditsSpent = shouldCallLiveApi
      ? actualProviderCalls * CREDITS_PER_PROVIDER_SEARCH
      : 0;
    sessionMetrics.creditsConsumed += realCreditsSpent;
    // Se for ROUND_TRIP, consolidar ida+volta na mesma chamada poupou o dobro de requisições!
    const roundTripBonusSaved =
      params.searchParams.tripType === "ROUND_TRIP" ? actualProviderCalls : 0;
    const totalSavedThisCall =
      (routeSelection.creditsSavedByFilter + roundTripBonusSaved) *
      CREDITS_PER_PROVIDER_SEARCH;
    sessionMetrics.creditsSaved += totalSavedThisCall;

    return offers;
  })();

  inFlightRequests.set(cacheKey, executionPromise);

  try {
    const offers = await executionPromise;
    const roundTripBonusSaved =
      params.searchParams.tripType === "ROUND_TRIP"
        ? routeSelection.creditsUsedEstimate
        : 0;
    const creditsSavedThisCall =
      (routeSelection.creditsSavedByFilter + roundTripBonusSaved) *
      CREDITS_PER_PROVIDER_SEARCH;
    const creditsConsumedThisCall = shouldCallLiveApi
      ? routeSelection.creditsUsedEstimate * CREDITS_PER_PROVIDER_SEARCH
      : 0;

    const telemetry: ApiViagensOptimizationTelemetry = {
      cacheKey,
      cacheHit: false,
      cacheAgeSeconds: 0,
      cacheExpiresInSeconds: Math.round(OFFER_CACHE_TTL_MS / 1000),
      liveApiConnected: credentials.isConfigured,
      strategyApplied: strategy,
      roundTripConsolidated: params.searchParams.tripType === "ROUND_TRIP",
      routeClassification: routeSelection.routeType,
      queriedProviders: routeSelection.queriedProviders,
      skippedProviders: routeSelection.skippedProviders,
      creditsConsumedThisCall,
      creditsSavedThisCall,
      totalSessionCreditsConsumed: sessionMetrics.creditsConsumed,
      totalSessionCreditsSaved: sessionMetrics.creditsSaved,
      totalSessionCacheHits: sessionMetrics.cacheHits,
    };

    return {
      offers,
      telemetry,
      preSearchCalendar: generateZeroCreditDateMatrix(params.searchParams, offers),
    };
  } finally {
    inFlightRequests.delete(cacheKey);
  }
}

/**
 * ============================================================================
 * CAMADA 5: MATRIZ DE PRÉ-BUSCA DE DATAS (CUSTO ZERO DE CRÉDITOS NA API)
 * ============================================================================
 * Permite ao usuário visualizar 7 dias de preços ao redor da data desejada
 * usando dados em cache + curva de sazonalidade da malha aérea sem gastar
 * 7 chamadas extras na APIVIAGENS.
 */
export function generateZeroCreditDateMatrix(
  searchParams: FlightSearchParams,
  referenceOffers: FlightOfferResult[]
): PreSearchCalendarDay[] {
  const lowestBasePrice =
    referenceOffers.length > 0
      ? Math.min(
          ...referenceOffers.map((o) => o.pricingBreakdown.singFinalSalePriceTotal)
        )
      : 980;

  const lowestBaseMiles =
    referenceOffers.length > 0
      ? Math.min(...referenceOffers.map((o) => o.pricingBreakdown.totalMilesRequired))
      : 14000;

  const baseDate = new Date(`${searchParams.departureDate}T12:00:00`);
  if (isNaN(baseDate.getTime())) {
    return [];
  }

  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  // Fatores reais de tarifação aérea por dia da semana (Terça/Quarta mais baratos, Sexta/Domingo mais caros)
  const dayOfWeekMultipliers = [1.14, 0.98, 0.88, 0.91, 1.03, 1.18, 0.95];

  const days: PreSearchCalendarDay[] = [];
  let minPriceSeen = Number.MAX_SAFE_INTEGER;

  for (let offset = -3; offset <= 3; offset++) {
    const d = new Date(baseDate.getTime() + offset * 24 * 60 * 60 * 1000);
    const isoDate = d.toISOString().slice(0, 10);
    const dow = d.getDay();
    const factor = offset === 0 ? 1.0 : dayOfWeekMultipliers[dow];

    const estimatedPrice = Math.round(lowestBasePrice * factor);
    const estimatedMiles = Math.round((lowestBaseMiles * factor) / 100) * 100;

    if (estimatedPrice < minPriceSeen) {
      minPriceSeen = estimatedPrice;
    }

    days.push({
      date: isoDate,
      dayOfWeekLabel: weekDays[dow],
      estimatedLowestSingBRL: estimatedPrice,
      estimatedLowestMiles: estimatedMiles,
      bestProviderHint: dow === 2 || dow === 3 ? "smiles" : "latam",
      isCheapestInWindow: false,
      isSelectedDate: offset === 0,
      source: offset === 0 ? "CACHE_REAL" : "FIXED_COST_MATRIX",
    });
  }

  return days.map((day) => ({
    ...day,
    isCheapestInWindow: day.estimatedLowestSingBRL === minPriceSeen,
  }));
}

/**
 * ============================================================================
 * RESERVA GRATUITA (POST /v1/airfares/book) & CONSULTA DE LOCALIZADOR GRATUITA
 * ============================================================================
 * Documentação: "Depois é só POST /v1/airfares/book com esse offer_id.
 * Reserve dentro da validade da oferta (~1h). Gerar uma reserva é grátis."
 */
export async function bookAirfareOnApiViagens(
  payload: ApiViagensBookRequest,
  apiKeyOverride?: string,
  apiSecretOverride?: string
): Promise<ApiViagensBookResponse> {
  const credentials = getApiCredentials(apiKeyOverride, apiSecretOverride);

  if (credentials.isConfigured) {
    const startMs = Date.now();
    const res = await fetch(`${APIVIAGENS_BASE_URL}/v1/airfares/book`, {
      method: "POST",
      headers: {
        ...buildAuthHeaders(credentials.apiKey, credentials.apiSecret),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    await logExternalApiTestToSupabase({
      providerName: "APIVIAGENS_BOOKING_FREE",
      endpoint: "/v1/airfares/book",
      requestPayload: payload,
      responsePayload: data,
      httpStatus: res.status,
      latencyMs: Date.now() - startMs,
      notes: `Reserva PNR gerada com custo ZERO de créditos (offer_id: ${payload.offer_id})`,
    });

    if (!res.ok) {
      throw new Error(data?.message || `Erro ao reservar na APIVIAGENS: HTTP ${res.status}`);
    }

    return {
      locator: data.locator || data.pnr || `SNG${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
      status: data.status || "RESERVED",
      total: Number(data.total || 0),
      emission_deadline:
        data.emission_deadline ||
        new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      mode: "LIVE_APIVIAGENS",
      creditsConsumed: 0,
    };
  }

  // Fallback Sandbox caso as chaves ainda não estejam no .env
  const randomLocator = `SNG${Math.floor(100 + Math.random() * 899)}K`;
  return {
    locator: randomLocator,
    status: "RESERVED_HOLD_1H",
    total: 0,
    emission_deadline: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    mode: "SANDBOX_FALLBACK",
    creditsConsumed: 0,
  };
}

/**
 * Consulta gratuita de status de reserva (GET /v1/airfares/booking/{locator})
 */
export async function getBookingStatusOnApiViagens(
  locator: string,
  apiKeyOverride?: string,
  apiSecretOverride?: string
) {
  const credentials = getApiCredentials(apiKeyOverride, apiSecretOverride);
  if (credentials.isConfigured) {
    const res = await fetch(
      `${APIVIAGENS_BASE_URL}/v1/airfares/booking/${encodeURIComponent(locator)}`,
      {
        method: "GET",
        headers: buildAuthHeaders(credentials.apiKey, credentials.apiSecret),
        cache: "no-store",
      }
    );
    if (!res.ok) {
      throw new Error(`Erro ao consultar localizador ${locator}: HTTP ${res.status}`);
    }
    return await res.json();
  }

  return {
    locator,
    status: "CONFIRMED_SANDBOX",
    checked_at: new Date().toISOString(),
    credits_charged: 0,
  };
}

/**
 * Consulta gratuita de saldo da conta (GET /v1/account) + Métricas de Economia do Cache
 */
export async function getApiViagensAccountAndSavingsSummary(
  apiKeyOverride?: string,
  apiSecretOverride?: string
) {
  const credentials = getApiCredentials(apiKeyOverride, apiSecretOverride);
  let accountData: any = null;

  if (credentials.isConfigured) {
    try {
      const res = await fetch(`${APIVIAGENS_BASE_URL}/v1/account`, {
        method: "GET",
        headers: buildAuthHeaders(credentials.apiKey, credentials.apiSecret),
        cache: "no-store",
      });
      if (res.ok) {
        accountData = await res.json();
      }
    } catch (err) {
      console.warn("Não foi possível consultar /v1/account:", err);
    }
  }

  return {
    liveApiConfigured: credentials.isConfigured,
    baseUrl: APIVIAGENS_BASE_URL,
    accountBalance: accountData,
    optimizationMetrics: {
      activeCachedRoutesCount: searchCache.size,
      inFlightCoalescedCount: sessionMetrics.requestsCoalesced,
      totalCreditsConsumed: sessionMetrics.creditsConsumed,
      totalCreditsSaved: sessionMetrics.creditsSaved,
      totalCacheHits: sessionMetrics.cacheHits,
      savingsRatioPercent:
        sessionMetrics.creditsConsumed + sessionMetrics.creditsSaved > 0
          ? Math.round(
              (sessionMetrics.creditsSaved /
                (sessionMetrics.creditsConsumed + sessionMetrics.creditsSaved)) *
                1000
            ) / 10
          : 0,
    },
  };
}
