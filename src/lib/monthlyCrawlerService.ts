import {
  APIVIAGENS_BASE_URL,
  CREDITS_PER_PROVIDER_SEARCH,
  PreSearchCalendarDay,
} from "@/lib/apiViagensService";
import { SUPABASE_KEY, SUPABASE_URL, logExternalApiTestToSupabase } from "@/lib/db";

export interface MonthlySyncResult {
  origin: string;
  destination: string;
  yearMonth: string;
  cabinClass: string;
  daysIndexed: number;
  verifiedAnchorsCount: number;
  creditsConsumed: number;
  strategyUsed: "MULTITRECHO_6_ANCHORS" | "FIXED_COST_SEASONAL_FEED";
  cheapestDay: PreSearchCalendarDay | null;
  days: PreSearchCalendarDay[];
}

function getApiCredentials() {
  const apiKey = (process.env.APIVIAGENS_API_KEY || "").trim();
  const apiSecret = (process.env.APIVIAGENS_API_SECRET || "").trim();
  return {
    apiKey,
    apiSecret,
    isConfigured: Boolean(apiKey && apiSecret),
  };
}

/**
 * Seleciona até 6 datas âncora distribuídas ao longo do mês (ex: dias 03, 08, 13, 18, 23, 28)
 * para consultar em 1 única requisição `trip_type=multitrecho` na APIVIAGENS (25 créditos = R$ 0,25)
 * ao invés de gastar 30 chamadas separadas (R$ 7,50).
 */
function pickSixMonthlyAnchorDates(yearMonth: string): string[] {
  const [y, m] = yearMonth.split("-").map(Number);
  const daysInMonth = new Date(y || 2026, m || 11, 0).getDate();
  const candidateDays = [3, 8, 13, 18, 23, Math.min(28, daysInMonth)];
  return candidateDays
    .filter((d) => d <= daysInMonth)
    .map((d) => `${yearMonth}-${String(d).padStart(2, "0")}`);
}

/**
 * Alimenta a tabela `public.monthly_fare_calendar` no Supabase com os 30/31 dias do mês
 * para uma rota (Origem -> Destino), usando 6 âncoras reais via `/v1/airfares?trip_type=multitrecho`
 * (quando `useApiAnchors: true`) ou matriz de custo fixo sem consumo de créditos.
 */
export async function crawlAndPopulateMonthlyCalendar(params: {
  origin: string;
  destination: string;
  yearMonth: string; // AAAA-MM
  cabinClass?: string;
  useApiAnchors?: boolean;
  baseReferencePriceBRL?: number;
}): Promise<MonthlySyncResult> {
  const origin = params.origin.trim().toUpperCase();
  const destination = params.destination.trim().toUpperCase();
  const yearMonth = params.yearMonth.trim().slice(0, 7);
  const cabinClass = (params.cabinClass || "ECONOMY").toUpperCase();
  const credentials = getApiCredentials();

  const anchorPricesByDate = new Map<string, number>();
  let creditsConsumed = 0;
  let strategyUsed: MonthlySyncResult["strategyUsed"] = "FIXED_COST_SEASONAL_FEED";

  // Estratégia 1: 1 única chamada /v1/airfares?trip_type=multitrecho com 6 datas âncora do mês
  if (params.useApiAnchors && credentials.isConfigured) {
    try {
      const anchors = pickSixMonthlyAnchorDates(yearMonth);
      const segments = anchors.map((d) => `${origin}:${destination}:${d}`).join(",");
      const url = `${APIVIAGENS_BASE_URL}/v1/airfares?trip_type=multitrecho&adults=1&segments=${encodeURIComponent(
        segments
      )}`;
      const startMs = Date.now();
      const res = await fetch(url, {
        method: "GET",
        headers: {
          "X-Api-Key": credentials.apiKey,
          "X-Api-Secret": credentials.apiSecret,
          Accept: "application/json",
        },
        cache: "no-store",
      });

      if (res.ok) {
        const json = await res.json();
        const multiList: any[] = Array.isArray(json?.multi_city) ? json.multi_city : [];
        if (multiList.length > 0) {
          strategyUsed = "MULTITRECHO_6_ANCHORS";
          creditsConsumed = CREDITS_PER_PROVIDER_SEARCH; // 25 créditos pela chamada única
          const pkg = multiList[0];
          const totalPkg = Number(pkg?.price?.total || 0);
          const legs: any[] = Array.isArray(pkg?.legs) ? pkg.legs : [];
          if (legs.length > 0 && totalPkg > 0) {
            const perLegAvg = Math.round(totalPkg / legs.length);
            for (const leg of legs) {
              const legDate = String(leg?.depart_at || "").slice(0, 10);
              if (legDate) {
                anchorPricesByDate.set(legDate, perLegAvg);
              }
            }
          }
        }

        await logExternalApiTestToSupabase({
          providerName: "APIVIAGENS_MONTHLY_MULTITRECHO_FEEDER",
          endpoint: "/v1/airfares?trip_type=multitrecho",
          requestPayload: { origin, destination, yearMonth, anchors },
          responsePayload: {
            anchorsPopulated: anchorPricesByDate.size,
            creditsConsumed,
          },
          httpStatus: res.status,
          latencyMs: Date.now() - startMs,
          notes: `Pré-aquecimento mensal ${origin}->${destination} (${yearMonth}) com 6 âncoras em 1 chamada`,
        });
      }
    } catch (err) {
      console.warn("Fallback para matriz de custo fixo no feeder mensal:", err);
    }
  }

  const [y, m] = yearMonth.split("-").map(Number);
  const daysInMonth = new Date(y || 2026, m || 11, 0).getDate();
  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const dayOfWeekMultipliers = [1.14, 0.98, 0.88, 0.91, 1.03, 1.18, 0.95];

  const anchorValues = Array.from(anchorPricesByDate.values());
  const basePrice =
    anchorValues.length > 0
      ? Math.round(anchorValues.reduce((a, b) => a + b, 0) / anchorValues.length)
      : params.baseReferencePriceBRL || 980;

  const days: PreSearchCalendarDay[] = [];
  let minPrice = Number.MAX_SAFE_INTEGER;

  for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
    const isoDate = `${yearMonth}-${String(dayNum).padStart(2, "0")}`;
    const dow = new Date(`${isoDate}T12:00:00`).getDay();
    const realAnchorPrice = anchorPricesByDate.get(isoDate);
    const price = realAnchorPrice ?? Math.round(basePrice * dayOfWeekMultipliers[dow]);
    const estimatedMiles = Math.round(((price * 14) / 100)) * 100;

    if (price < minPrice) minPrice = price;

    days.push({
      date: isoDate,
      dayOfWeekLabel: weekDays[dow],
      estimatedLowestSingBRL: price,
      estimatedLowestMiles: estimatedMiles,
      bestProviderHint: dow === 2 || dow === 3 ? "smiles" : "latam",
      isCheapestInWindow: false,
      isSelectedDate: false,
      source: realAnchorPrice ? "CACHE_REAL" : "FIXED_COST_MATRIX",
    });
  }

  const finalizedDays = days.map((d) => ({
    ...d,
    isCheapestInWindow: d.estimatedLowestSingBRL === minPrice,
  }));

  // Persiste os 30/31 dias no Supabase (monthly_fare_calendar)
  const rows = finalizedDays.map((d) => ({
    id: `cal_${origin}_${destination}_${d.date}_${cabinClass}`,
    origin,
    destination,
    year_month: yearMonth,
    flight_date: d.date,
    cabin_class: cabinClass,
    lowest_sing_brl: d.estimatedLowestSingBRL,
    lowest_airline_cash_brl: Math.round(d.estimatedLowestSingBRL * 1.25),
    lowest_miles: d.estimatedLowestMiles,
    best_provider: d.bestProviderHint,
    is_api_verified: d.source === "CACHE_REAL",
    updated_at: new Date().toISOString(),
  }));

  await fetch(`${SUPABASE_URL}/rest/v1/monthly_fare_calendar?on_conflict=id`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify(rows),
  });

  const cheapestDay = finalizedDays.find((d) => d.isCheapestInWindow) || null;

  return {
    origin,
    destination,
    yearMonth,
    cabinClass,
    daysIndexed: finalizedDays.length,
    verifiedAnchorsCount: anchorPricesByDate.size,
    creditsConsumed,
    strategyUsed,
    cheapestDay,
    days: finalizedDays,
  };
}

/**
 * Lê o calendário mensal já indexado no Supabase (custo ZERO de créditos na APIVIAGENS)
 */
export async function getMonthlyCalendarFromSupabase(params: {
  origin: string;
  destination: string;
  yearMonth: string;
  cabinClass?: string;
}): Promise<PreSearchCalendarDay[]> {
  try {
    const origin = params.origin.trim().toUpperCase();
    const destination = params.destination.trim().toUpperCase();
    const yearMonth = params.yearMonth.trim().slice(0, 7);
    const cabinClass = (params.cabinClass || "ECONOMY").toUpperCase();

    const url = `${SUPABASE_URL}/rest/v1/monthly_fare_calendar?origin=eq.${origin}&destination=eq.${destination}&year_month=eq.${yearMonth}&cabin_class=eq.${cabinClass}&order=flight_date.asc`;
    const res = await fetch(url, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
      cache: "no-store",
    });

    if (!res.ok) return [];
    const rows: any[] = await res.json();
    if (!Array.isArray(rows) || rows.length === 0) return [];

    const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    const minPrice = Math.min(...rows.map((r) => Number(r.lowest_sing_brl || 0)));

    return rows.map((r) => {
      const dow = new Date(`${r.flight_date}T12:00:00`).getDay();
      return {
        date: r.flight_date,
        dayOfWeekLabel: weekDays[dow] || "Dia",
        estimatedLowestSingBRL: Number(r.lowest_sing_brl),
        estimatedLowestMiles: Number(r.lowest_miles || 0),
        bestProviderHint: r.best_provider || "latam",
        isCheapestInWindow: Number(r.lowest_sing_brl) === minPrice,
        isSelectedDate: false,
        source: r.is_api_verified ? "CACHE_REAL" : "FIXED_COST_MATRIX",
      };
    });
  } catch {
    return [];
  }
}
