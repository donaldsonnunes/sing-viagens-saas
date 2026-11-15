import { NextResponse } from "next/server";
import {
  fetchDatabaseFromSupabase,
  insertSearchHistoryToSupabase,
  logExternalApiTestToSupabase,
  writeDb,
} from "@/lib/db";
import { FlightSearchParams } from "@/lib/flightEngine";
import {
  searchFlightsWithApiViagensOptimization,
  SearchOptimizationStrategy,
  ApiViagensProvider,
} from "@/lib/apiViagensService";

export async function POST(request: Request) {
  const startMs = Date.now();
  try {
    const body = await request.json();
    const db = await fetchDatabaseFromSupabase();

    const searchParams: FlightSearchParams = {
      origin: body.origin || "GRU",
      destination: body.destination || "GIG",
      departureDate: body.departureDate || "2026-12-10",
      returnDate: body.returnDate || "2026-12-15",
      tripType: body.tripType === "ONE_WAY" ? "ONE_WAY" : "ROUND_TRIP",
      adults: Math.max(1, Number(body.adults) || 1),
      childrenAges: Array.isArray(body.childrenAges)
        ? body.childrenAges.map((n: unknown) =>
            Math.max(0, Math.min(17, Number(n) || 0))
          )
        : [],
      cabinClass: body.cabinClass || "ECONOMY",
    };

    const strategy: SearchOptimizationStrategy =
      body.strategy === "CASH_FIRST" ||
      body.strategy === "ALL_ELIGIBLE" ||
      body.strategy === "CUSTOM"
        ? body.strategy
        : "SMART_ECONOMY";

    const customProviders: ApiViagensProvider[] | undefined = Array.isArray(
      body.customProviders
    )
      ? body.customProviders
      : undefined;

    const { offers, telemetry, preSearchCalendar } =
      await searchFlightsWithApiViagensOptimization({
        searchParams,
        pricingConfig: db.pricingConfig,
        strategy,
        customProviders,
        forceRefresh: Boolean(body.forceRefresh),
        allowLiveCreditSpend: Boolean(body.allowLiveCreditSpend),
      });

    if (offers.length > 0 && body.saveToHistory !== false) {
      const lowestSingPrice = Math.min(
        ...offers.map((o) => o.pricingBreakdown.singFinalSalePriceTotal)
      );
      const lowestAirlineDirectPrice = Math.min(
        ...offers.map(
          (o) =>
            o.airlineDirectComparison.find((c) => c.isSameOperatedFlight)
              ?.directWebsitePriceTotal ||
            o.pricingBreakdown.singFinalSalePriceTotal
        )
      );

      const newHistoryItem = {
        id: `sch-${Date.now()}`,
        userId: body.userId || "usr-demo-1",
        userEmail: body.userEmail || "cliente@singviagens.com.br",
        origin: searchParams.origin,
        destination: searchParams.destination,
        departureDate: searchParams.departureDate,
        returnDate: searchParams.returnDate,
        tripType: searchParams.tripType,
        adults: searchParams.adults,
        childrenAges: searchParams.childrenAges,
        cabinClass: searchParams.cabinClass,
        lowestSingPrice,
        lowestAirlineDirectPrice,
        createdAt: new Date().toISOString(),
      };

      db.searchHistory.unshift(newHistoryItem);
      db.searchHistory = db.searchHistory.slice(0, 30);

      await Promise.all([
        insertSearchHistoryToSupabase(newHistoryItem),
        logExternalApiTestToSupabase({
          providerName: telemetry.cacheHit
            ? "APIVIAGENS_CACHE_HIT_0_CREDITS"
            : "APIVIAGENS_SMART_ROUTER",
          endpoint: "/api/flights/search",
          requestPayload: {
            ...searchParams,
            strategy: telemetry.strategyApplied,
            queriedProviders: telemetry.queriedProviders,
          },
          responsePayload: {
            offersCount: offers.length,
            lowestSingPrice,
            lowestAirlineDirectPrice,
            cacheHit: telemetry.cacheHit,
            creditsConsumed: telemetry.creditsConsumedThisCall,
            creditsSaved: telemetry.creditsSavedThisCall,
          },
          httpStatus: 200,
          latencyMs: Date.now() - startMs,
          notes: `Busca ${searchParams.origin}->${searchParams.destination} | Cache:${
            telemetry.cacheHit ? "HIT" : "MISS"
          } | Créd. usados:${telemetry.creditsConsumedThisCall} / Poupados:${
            telemetry.creditsSavedThisCall
          }`,
        }),
      ]);

      writeDb(db);
    }

    return NextResponse.json({
      offers,
      pricingConfig: db.pricingConfig,
      searchParams,
      telemetry,
      preSearchCalendar,
    });
  } catch (err) {
    console.error("Error in /api/flights/search:", err);
    return NextResponse.json(
      { error: "Erro ao processar pesquisa de voos." },
      { status: 500 }
    );
  }
}
