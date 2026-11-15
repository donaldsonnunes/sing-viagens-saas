import { AIRPORTS, Airport } from "@/data/airports";
import { PricingRuleConfig, AirlineKey } from "@/lib/db";

export interface FlightSearchParams {
  origin: string; // Código de 3 letras do aeroporto
  destination: string;
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

export interface FlightStopConnection {
  airportCode: string;
  city: string;
  airportName: string;
  layoverDuration: string;
  arrivalAtConnection: string;
  departureFromConnection: string;
  changeAircraft: boolean;
}

export interface FlightBaggagePolicy {
  personalItemIncluded: boolean; // Bolsa / Mochila
  carryOnIncluded: boolean; // Mala pequena de mão (10kg)
  checkedBagsIncluded: number; // Quantidade de malas despachadas (23kg) inclusas
  allowsExtraCheckedBaggage: boolean; // Permite incluir bagagem despachada extra
  extraCheckedBagPricePerWay: number; // Valor por mala despachada extra por trecho
  allowsSpecialBaggage: boolean; // Permite bagagem especial (instrumento, equipamento esportivo, etc.)
  specialBaggagePricePerWay: number; // Valor por bagagem especial por trecho
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
  connections: FlightStopConnection[];
  baggageIncluded: string;
  baggagePolicy?: FlightBaggagePolicy;
  eventRecommendationBadge?: string;
  passengerBreakdown: {
    adultsCount: number;
    childrenCount: number; // Crianças (2 a 11 anos)
    infantsCount: number; // Bebês de colo (0 a 1 ano)
    equivalentAdultMultiplier: number;
  };
  pricingBreakdown: {
    totalMilesRequired: number;
    mileCostPerThousandApplied: number;
    milesMonetaryCost: number;
    boardingTaxesTotal: number;
    totalMilesCostWithTaxes: number;
    airlineDirectCashPriceTotal: number;
    grossSpreadDifference: number;
    profitSharePercentApplied: number;
    singProfitAmount: number;
    singFinalSalePriceTotal: number;
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

  // Hubs dinâmicos para conexões (evitando repetir origem/destino)
  const domesticHub1 =
    originAirport.iata !== "VCP" && destinationAirport.iata !== "VCP"
      ? { code: "VCP", city: "Campinas", name: "Aeroporto de Viracopos" }
      : { code: "CNF", city: "Belo Horizonte", name: "Aeroporto de Confins" };

  const domesticHub2 =
    originAirport.iata !== "BSB" && destinationAirport.iata !== "BSB"
      ? { code: "BSB", city: "Brasília", name: "Aeroporto Internacional JK" }
      : { code: "CNF", city: "Belo Horizonte", name: "Aeroporto de Confins" };

  const intlHub1 =
    originAirport.iata !== "LIS" && destinationAirport.iata !== "LIS"
      ? { code: "LIS", city: "Lisboa", name: "Aeroporto Humberto Delgado" }
      : { code: "MAD", city: "Madrid", name: "Aeroporto de Barajas" };

  const airlinesSchedule: {
    code: AirlineKey;
    name: string;
    flightPrefix: string;
    depTime: string;
    arrTime: string;
    duration: string;
    stops: number;
    stopsDesc: string;
    connections: FlightStopConnection[];
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
          connections: [],
          baseMilesPerAdultWay: 58000,
          baseCashFarePerAdultWay: 2250,
          badge: "Voo Direto • Ideal para Shows Internacionais",
        },
        {
          code: "TAP",
          name: "TAP Air Portugal",
          flightPrefix: "TP082",
          depTime: "17:15",
          arrTime: "08:25 (+1)",
          duration: "12h 10m",
          stops: 1,
          stopsDesc: `1 conexão em ${intlHub1.city} (${intlHub1.code}) • 02h 15m`,
          connections: [
            {
              airportCode: intlHub1.code,
              city: intlHub1.city,
              airportName: intlHub1.name,
              layoverDuration: "02h 15m",
              arrivalAtConnection: "05:05 (+1)",
              departureFromConnection: "07:20 (+1)",
              changeAircraft: true,
            },
          ],
          baseMilesPerAdultWay: 36000,
          baseCashFarePerAdultWay: 2420,
          badge: "Menor Custo em Milhas",
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
          connections: [],
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
          stopsDesc: `1 conexão em ${domesticHub1.city} (${domesticHub1.code}) • 01h 25m`,
          connections: [
            {
              airportCode: domesticHub1.code,
              city: domesticHub1.city,
              airportName: domesticHub1.name,
              layoverDuration: "01h 25m",
              arrivalAtConnection: "14:25",
              departureFromConnection: "15:50",
              changeAircraft: true,
            },
          ],
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
          stopsDesc: "Voo Direto",
          connections: [],
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
          connections: [],
          baseMilesPerAdultWay: 9500,
          baseCashFarePerAdultWay: 295,
          badge: "Melhor Oportunidade em Milhas",
        },
        {
          code: "AZUL",
          name: "Azul Linhas Aéreas",
          flightPrefix: "AD4190",
          depTime: "16:30",
          arrTime: "19:50",
          duration: "03h 20m",
          stops: 1,
          stopsDesc: `1 conexão em ${domesticHub1.city} (${domesticHub1.code}) • 01h 10m`,
          connections: [
            {
              airportCode: domesticHub1.code,
              city: domesticHub1.city,
              airportName: domesticHub1.name,
              layoverDuration: "01h 10m",
              arrivalAtConnection: "17:35",
              departureFromConnection: "18:45",
              changeAircraft: true,
            },
          ],
          baseMilesPerAdultWay: 8400,
          baseCashFarePerAdultWay: 335,
        },
        {
          code: "LATAM",
          name: "LATAM Airlines",
          flightPrefix: "LA3902",
          depTime: "19:50",
          arrTime: "22:55",
          duration: "03h 05m",
          stops: 1,
          stopsDesc: `1 conexão em ${domesticHub2.city} (${domesticHub2.code}) • 00h 55m`,
          connections: [
            {
              airportCode: domesticHub2.code,
              city: domesticHub2.city,
              airportName: domesticHub2.name,
              layoverDuration: "00h 55m",
              arrivalAtConnection: "20:50",
              departureFromConnection: "21:45",
              changeAircraft: false,
            },
          ],
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

    const rawAirlineCashTotal = Math.round(
      item.baseCashFarePerAdultWay *
        roundTripMultiplier *
        cabinMultiplier *
        equivalentAdultMultiplier +
        boardingTaxesTotal
    );

    const airlineDirectCashPriceTotal = Math.max(
      rawAirlineCashTotal,
      Math.round(totalMilesCostWithTaxes * 1.45)
    );

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

    const competitorTemplates = isInternational
      ? [
          {
            airlineCode: item.code,
            airlineName: `${item.name} (Mesmo Voo ${item.flightPrefix})`,
            flightNumber: item.flightPrefix,
            factor: 1.0,
            isSame: true,
            baggageNote: "Mesmo voo na Cia",
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
            baggageNote: "Mesmo voo na Cia",
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
      connections: item.connections,
      baggageIncluded:
        params.cabinClass === "BUSINESS"
          ? "2 Bagagens Despachadas 23kg + Mão 10kg + Sala VIP"
          : params.cabinClass === "PREMIUM_ECONOMY" || idx === 1
          ? "1 Bagagem Despachada 23kg + Mão 10kg + Bolsa Pessoal"
          : "1 Bagagem de Mão 10kg + Item Pessoal (Sem mala despachada)",
      baggagePolicy: {
        personalItemIncluded: true,
        carryOnIncluded: true,
        checkedBagsIncluded:
          params.cabinClass === "BUSINESS"
            ? 2
            : params.cabinClass === "PREMIUM_ECONOMY" || idx === 1
            ? 1
            : 0,
        allowsExtraCheckedBaggage: true,
        extraCheckedBagPricePerWay: isInternational ? 290 : 129,
        allowsSpecialBaggage: true,
        specialBaggagePricePerWay: isInternational ? 450 : 210,
      },
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
