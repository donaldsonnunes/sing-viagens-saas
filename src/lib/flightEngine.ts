import { AIRPORTS, Airport } from "@/data/airports";
import { PricingRuleConfig, AirlineKey } from "@/lib/db";

export interface FlightSearchParams {
  origin: string; // IATA code
  destination: string; // IATA code
  departureDate: string;
  returnDate?: string;
  tripType: "ROUND_TRIP" | "ONE_WAY";
  adults: number;
  childrenAges: number[]; // Idades de cada menor (0 a 17)
  cabinClass: "ECONOMY" | "PREMIUM_ECONOMY" | "BUSINESS";
}

export interface AirlineCompetitorComparison {
  airlineCode: string;
  airlineName: string;
  flightNumber: string;
  directWebsitePriceTotal: number;
  differenceVsSing: number;
  isSameOperatedFlight: boolean;
  baggageNote: string;
}

export interface FlightOfferResult {
  id: string;
  operatingAirlineCode: AirlineKey;
  operatingAirlineName: string;
  flightNumber: string;
  returnFlightNumber?: string;
  originAirport: Airport;
  destinationAirport: Airport;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  stops: number;
  stopsDescription: string;
  baggageIncluded: string;
  eventRecommendationBadge?: string;
  passengerBreakdown: {
    adultsCount: number;
    childrenCount: number; // Crianças (2 a 11 anos)
    infantsCount: number; // Bebês de colo (0 a 1 ano)
    equivalentAdultMultiplier: number;
  };
  pricingBreakdown: {
    totalMilesRequired: number; // Quantidade total de milhas retornada pela API
    mileCostPerThousandApplied: number; // Valor do milheiro da cia parametrizado no Admin (R$)
    milesMonetaryCost: number; // Custo puro das milhas em R$
    boardingTaxesTotal: number; // Taxas de embarque em R$
    totalMilesCostWithTaxes: number; // Custo Base em Milhas + Taxas (Ex: R$ 1.000,00)
    airlineDirectCashPriceTotal: number; // Valor na Companhia Aérea com taxas (Ex: R$ 1.500,00)
    grossSpreadDifference: number; // Diferença entre Cia e Custo Milhas (Ex: R$ 500,00)
    profitSharePercentApplied: number; // % de lucro sobre a diferença parametrizado no Admin (Ex: 50%)
    singProfitAmount: number; // Lucro Sing sobre o spread (Ex: R$ 250,00)
    singFinalSalePriceTotal: number; // Preço Final Sing = Custo Milhas c/ Taxas + Lucro (Ex: R$ 1.250,00)
    singPricePerPersonAvg: number;
  };
  airlineDirectComparison: AirlineCompetitorComparison[];
  bestSavingsVsOperatingAirline: number;
}

function findAirportOrDefault(iata: string, fallbackIata: string): Airport {
  const clean = (iata || "").trim().toUpperCase();
  return (
    AIRPORTS.find((a) => a.iata === clean) ||
    AIRPORTS.find((a) => a.iata === fallbackIata) ||
    AIRPORTS[0]
  );
}

export function searchAndCompareFlights(
  params: FlightSearchParams,
  pricingConfig: PricingRuleConfig
): FlightOfferResult[] {
  const originAirport = findAirportOrDefault(params.origin, "GRU");
  const destinationAirport = findAirportOrDefault(params.destination, "GIG");

  const isInternational =
    originAirport.isInternational || destinationAirport.isInternational;

  const adults = Math.max(1, Number(params.adults) || 1);
  const childrenAges = Array.isArray(params.childrenAges) ? params.childrenAges : [];

  const infantsCount = childrenAges.filter((age) => age < 2).length;
  const childrenCount = childrenAges.filter((age) => age >= 2).length;

  const chdFactor = 1 - pricingConfig.childDiscountPercent / 100;
  const infFactor = 1 - pricingConfig.infantDiscountPercent / 100;

  const equivalentAdultMultiplier =
    adults + childrenCount * chdFactor + infantsCount * infFactor;

  const paidSeatsCount = adults + childrenCount;

  const roundTripMultiplier = params.tripType === "ROUND_TRIP" ? 1.85 : 1.0;
  const cabinMultiplier =
    params.cabinClass === "BUSINESS"
      ? 2.8
      : params.cabinClass === "PREMIUM_ECONOMY"
      ? 1.5
      : 1.0;

  const airlinesSchedule: {
    code: AirlineKey;
    name: string;
    flightPrefix: string;
    depTime: string;
    arrTime: string;
    duration: string;
    stops: number;
    stopsDesc: string;
    baseMilesPerAdultWay: number;
    baseCashFarePerAdultWay: number;
    badge?: string;
  }[] = isInternational
    ? [
        {
          code: "LATAM",
          name: "LATAM Airlines",
          flightPrefix: "LA8084",
          depTime: "22:45",
          arrTime: "11:30 (+1)",
          duration: "09h 45m",
          stops: 0,
          stopsDesc: "Voo Direto",
          baseMilesPerAdultWay: 58000,
          baseCashFarePerAdultWay: 2250,
          badge: "Ideal para Shows e Eventos Internacionais",
        },
        {
          code: "TAP",
          name: "TAP Air Portugal",
          flightPrefix: "TP082",
          depTime: "17:15",
          arrTime: "06:10 (+1)",
          duration: "09h 55m",
          stops: 0,
          stopsDesc: "Voo Direto (Stopover disponível)",
          baseMilesPerAdultWay: 36000,
          baseCashFarePerAdultWay: 2420,
          badge: "Melhor Conexão Europa",
        },
        {
          code: "AMERICAN",
          name: "American Airlines",
          flightPrefix: "AA950",
          depTime: "21:10",
          arrTime: "06:45 (+1)",
          duration: "09h 35m",
          stops: 0,
          stopsDesc: "Voo Direto",
          baseMilesPerAdultWay: 24000,
          baseCashFarePerAdultWay: 2380,
        },
        {
          code: "AZUL",
          name: "Azul Linhas Aéreas",
          flightPrefix: "AD8704",
          depTime: "13:20",
          arrTime: "05:15 (+1)",
          duration: "11h 55m",
          stops: 1,
          stopsDesc: "1 conexão rápida (VCP)",
          baseMilesPerAdultWay: 65000,
          baseCashFarePerAdultWay: 2150,
          badge: "Excelente Custo de Milheiro",
        },
      ]
    : [
        {
          code: "LATAM",
          name: "LATAM Airlines",
          flightPrefix: "LA3418",
          depTime: "08:15",
          arrTime: "09:25",
          duration: "01h 10m",
          stops: 0,
          stopsDesc: "Voo Direto • Horário Nobre",
          baseMilesPerAdultWay: 7200,
          baseCashFarePerAdultWay: 310,
          badge: "Mais Escolhido para Shows & Fim de Semana",
        },
        {
          code: "GOL",
          name: "GOL Linhas Aéreas",
          flightPrefix: "G31042",
          depTime: "11:40",
          arrTime: "12:55",
          duration: "01h 15m",
          stops: 0,
          stopsDesc: "Voo Direto",
          baseMilesPerAdultWay: 9500,
          baseCashFarePerAdultWay: 295,
          badge: "Melhor Oportunidade em Milhas",
        },
        {
          code: "AZUL",
          name: "Azul Linhas Aéreas",
          flightPrefix: "AD4190",
          depTime: "16:30",
          arrTime: "17:45",
          duration: "01h 15m",
          stops: 0,
          stopsDesc: "Voo Direto • Serviço de Bordo VIP",
          baseMilesPerAdultWay: 8400,
          baseCashFarePerAdultWay: 335,
        },
        {
          code: "LATAM",
          name: "LATAM Airlines",
          flightPrefix: "LA3902",
          depTime: "19:50",
          arrTime: "21:05",
          duration: "01h 15m",
          stops: 0,
          stopsDesc: "Voo Direto Noturno",
          baseMilesPerAdultWay: 6600,
          baseCashFarePerAdultWay: 280,
        },
      ];

  const boardingTaxPerSeatWay = isInternational ? 260 : 54;

  return airlinesSchedule.map((item, idx) => {
    const boardingTaxesTotal = Math.round(
      boardingTaxPerSeatWay *
        (params.tripType === "ROUND_TRIP" ? 2 : 1) *
        paidSeatsCount
    );

    // 1. Retorno da API em Milhas + Cálculo pelo Valor do Milheiro da Cia parametrizado no Admin
    const totalMilesRequired = Math.round(
      item.baseMilesPerAdultWay *
        roundTripMultiplier *
        cabinMultiplier *
        equivalentAdultMultiplier
    );

    const mileCostPerThousandApplied =
      pricingConfig.mileCostPerThousand[item.code] ?? 22.0;

    const milesMonetaryCost = Math.round(
      (totalMilesRequired / 1000) * mileCostPerThousandApplied
    );

    const totalMilesCostWithTaxes = milesMonetaryCost + boardingTaxesTotal;

    // 2. Retorno da API em Valor (Preço Direto na Companhia Aérea com taxas)
    const rawAirlineCashTotal = Math.round(
      item.baseCashFarePerAdultWay *
        roundTripMultiplier *
        cabinMultiplier *
        equivalentAdultMultiplier +
        boardingTaxesTotal
    );

    // Garante que o preço na cia seja superior ao custo em milhas para demonstrar a regra do spread com clareza
    const airlineDirectCashPriceTotal = Math.max(
      rawAirlineCashTotal,
      Math.round(totalMilesCostWithTaxes * 1.45)
    );

    // 3. Regra Oficial Sing: Percentual de Lucro sobre a diferença (Spread) entre Custo Milhas e Preço Cia
    const grossSpreadDifference = Math.max(
      0,
      airlineDirectCashPriceTotal - totalMilesCostWithTaxes
    );

    const profitSharePercentApplied = pricingConfig.profitShareOnSavingsPercent;

    const singProfitAmount = Math.round(
      grossSpreadDifference * (profitSharePercentApplied / 100) +
        (pricingConfig.fixedEmissionFeePerPassenger || 0) * paidSeatsCount
    );

    const singFinalSalePriceTotal = totalMilesCostWithTaxes + singProfitAmount;

    // 4. Coluna Comparativa ao lado com as principais Cias Aéreas da rota
    const competitorTemplates = isInternational
      ? [
          {
            airlineCode: item.code,
            airlineName: `${item.name} (Mesmo Voo ${item.flightPrefix})`,
            flightNumber: item.flightPrefix,
            factor: 1.0,
            isSame: true,
            baggageNote: "Mesmo voo direto na Cia",
          },
          {
            airlineCode: "LATAM",
            airlineName: "LATAM Airlines",
            flightNumber: "LA8084",
            factor: 1.03,
            isSame: item.code === "LATAM",
            baggageNote: "Tarifa padrão balcão",
          },
          {
            airlineCode: "TAP",
            airlineName: "TAP Air Portugal",
            flightNumber: "TP082",
            factor: 1.06,
            isSame: item.code === "TAP",
            baggageNote: "Tarifa padrão balcão",
          },
          {
            airlineCode: "AMERICAN",
            airlineName: "American Airlines",
            flightNumber: "AA950",
            factor: 1.04,
            isSame: item.code === "AMERICAN",
            baggageNote: "Tarifa padrão balcão",
          },
        ]
      : [
          {
            airlineCode: item.code,
            airlineName: `${item.name} (Mesmo Voo ${item.flightPrefix})`,
            flightNumber: item.flightPrefix,
            factor: 1.0,
            isSame: true,
            baggageNote: "Mesmo voo direto na Cia",
          },
          {
            airlineCode: "LATAM",
            airlineName: "LATAM Airlines",
            flightNumber: item.code === "LATAM" ? item.flightPrefix : "LA3420",
            factor: item.code === "LATAM" ? 1.0 : 1.04,
            isSame: item.code === "LATAM",
            baggageNote: "Tarifa comercial cia",
          },
          {
            airlineCode: "GOL",
            airlineName: "GOL Linhas Aéreas",
            flightNumber: item.code === "GOL" ? item.flightPrefix : "G31048",
            factor: item.code === "GOL" ? 1.0 : 1.02,
            isSame: item.code === "GOL",
            baggageNote: "Tarifa comercial cia",
          },
          {
            airlineCode: "AZUL",
            airlineName: "Azul Linhas Aéreas",
            flightNumber: item.code === "AZUL" ? item.flightPrefix : "AD4192",
            factor: item.code === "AZUL" ? 1.0 : 1.06,
            isSame: item.code === "AZUL",
            baggageNote: "Tarifa comercial cia",
          },
        ];

    const seen = new Set<string>();
    const airlineDirectComparison: AirlineCompetitorComparison[] = [];

    for (const comp of competitorTemplates) {
      if (seen.has(comp.airlineCode) && !comp.isSame) continue;
      seen.add(comp.airlineCode);

      const directPrice = Math.round(airlineDirectCashPriceTotal * comp.factor);
      airlineDirectComparison.push({
        airlineCode: comp.airlineCode,
        airlineName: comp.airlineName,
        flightNumber: comp.flightNumber,
        directWebsitePriceTotal: directPrice,
        differenceVsSing: directPrice - singFinalSalePriceTotal,
        isSameOperatedFlight: comp.isSame,
        baggageNote: comp.baggageNote,
      });
    }

    return {
      id: `offer-${item.code}-${idx + 1}`,
      operatingAirlineCode: item.code,
      operatingAirlineName: item.name,
      flightNumber: item.flightPrefix,
      returnFlightNumber:
        params.tripType === "ROUND_TRIP"
          ? `${item.flightPrefix.slice(0, 2)}${Number(item.flightPrefix.slice(2)) + 1}`
          : undefined,
      originAirport,
      destinationAirport,
      departureTime: item.depTime,
      arrivalTime: item.arrTime,
      duration: item.duration,
      stops: item.stops,
      stopsDescription: item.stopsDesc,
      baggageIncluded:
        params.cabinClass === "BUSINESS"
          ? "2 Bagagens Despachadas 23kg + Mão 10kg + Sala VIP"
          : "1 Bagagem de Mão 10kg + Item Pessoal + Assistência VIP Sing",
      eventRecommendationBadge: item.badge,
      passengerBreakdown: {
        adultsCount: adults,
        childrenCount,
        infantsCount,
        equivalentAdultMultiplier: Number(equivalentAdultMultiplier.toFixed(2)),
      },
      pricingBreakdown: {
        totalMilesRequired,
        mileCostPerThousandApplied,
        milesMonetaryCost,
        boardingTaxesTotal,
        totalMilesCostWithTaxes,
        airlineDirectCashPriceTotal,
        grossSpreadDifference,
        profitSharePercentApplied,
        singProfitAmount,
        singFinalSalePriceTotal,
        singPricePerPersonAvg: Math.round(
          singFinalSalePriceTotal / Math.max(1, adults + childrenCount)
        ),
      },
      airlineDirectComparison,
      bestSavingsVsOperatingAirline:
        airlineDirectCashPriceTotal - singFinalSalePriceTotal,
    };
  });
}
