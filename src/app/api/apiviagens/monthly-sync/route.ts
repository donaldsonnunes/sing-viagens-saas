import { NextResponse } from "next/server";
import {
  crawlAndPopulateMonthlyCalendar,
  getMonthlyCalendarFromSupabase,
} from "@/lib/monthlyCrawlerService";

/**
 * GET /api/apiviagens/monthly-sync?origin=GRU&destination=REC&yearMonth=2026-11
 * Consulta o calendário mensal já indexado no Supabase (0 créditos)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const origin = searchParams.get("origin") || "GRU";
    const destination = searchParams.get("destination") || "REC";
    const yearMonth = searchParams.get("yearMonth") || "2026-11";
    const cabinClass = searchParams.get("cabinClass") || "ECONOMY";

    const days = await getMonthlyCalendarFromSupabase({
      origin,
      destination,
      yearMonth,
      cabinClass,
    });

    return NextResponse.json({
      origin: origin.toUpperCase(),
      destination: destination.toUpperCase(),
      yearMonth,
      daysCount: days.length,
      days,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Erro ao ler calendário mensal." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/apiviagens/monthly-sync
 * Pré-aquece os 30/31 dias do mês de uma rota no Supabase (`monthly_fare_calendar`).
 * Por padrão usa matriz de custo fixo (0 créditos); com `useApiAnchors: true` usa
 * 1 chamada multitrecho com 6 âncoras (25 créditos = R$ 0,25 para o mês inteiro).
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const origin = body.origin || "GRU";
    const destination = body.destination || "REC";
    const yearMonth = body.yearMonth || "2026-11";
    const cabinClass = body.cabinClass || "ECONOMY";

    const result = await crawlAndPopulateMonthlyCalendar({
      origin,
      destination,
      yearMonth,
      cabinClass,
      useApiAnchors: Boolean(body.useApiAnchors),
      baseReferencePriceBRL: body.baseReferencePriceBRL
        ? Number(body.baseReferencePriceBRL)
        : undefined,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Erro ao sincronizar calendário mensal." },
      { status: 500 }
    );
  }
}
