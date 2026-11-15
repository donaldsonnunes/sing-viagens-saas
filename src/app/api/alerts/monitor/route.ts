import { NextResponse } from "next/server";
import { SUPABASE_KEY, SUPABASE_URL, fetchDatabaseFromSupabase } from "@/lib/db";

function supabaseHeaders(extra?: Record<string, string>): Record<string, string> {
  return {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    "Content-Type": "application/json",
    ...extra,
  };
}

interface MonitorTarget {
  key: string;
  originIata: string;
  destinationIata: string;
  targetDepartureDate: string;
  targetMonthOrDate: string;
  alertIds: string[];
  alertsCount: number;
}

interface CrawlerObservationInput {
  originIata: string;
  destinationIata: string;
  targetDepartureDate?: string;
  lowestPrice: number;
  source?: string;
}

async function runAlertSweep(
  mode: "CACHE_SWEEP" | "CRAWLER_REPORT",
  crawlerResults: CrawlerObservationInput[] = []
) {
  const todayIso = new Date().toISOString().slice(0, 10);
  const nowIso = new Date().toISOString();

  const alertsRes = await fetch(
    `${SUPABASE_URL}/rest/v1/price_alerts?select=*&status=neq.CONVERTIDO&limit=200`,
    {
      headers: supabaseHeaders(),
      cache: "no-store",
    }
  );
  const alertRows: any[] = alertsRes.ok ? await alertsRes.json() : [];
  const activeAlerts = Array.isArray(alertRows)
    ? alertRows.filter((r) => {
        const dep = String(r.target_departure_date || "").trim();
        return !dep || dep >= todayIso;
      })
    : [];

  const observations: Array<{
    originIata: string;
    destinationIata: string;
    targetDepartureDate: string;
    lowestPrice: number;
    source: string;
  }> = [];

  if (mode === "CACHE_SWEEP") {
    const db = await fetchDatabaseFromSupabase();
    for (const h of db.searchHistory || []) {
      const price = Number(h.lowestSingPrice || 0);
      if (price > 0) {
        observations.push({
          originIata: String(h.origin || "").toUpperCase(),
          destinationIata: String(h.destination || "").toUpperCase(),
          targetDepartureDate: String(h.departureDate || "").trim(),
          lowestPrice: price,
          source: "PORTAL_CACHE",
        });
      }
    }
  } else {
    for (const item of crawlerResults) {
      const price = Number(item.lowestPrice || 0);
      if (price > 0 && item.originIata && item.destinationIata) {
        observations.push({
          originIata: String(item.originIata).toUpperCase(),
          destinationIata: String(item.destinationIata).toUpperCase(),
          targetDepartureDate: String(item.targetDepartureDate || "").trim(),
          lowestPrice: price,
          source: String(item.source || "CRAWLER").toUpperCase(),
        });
      }
    }
  }

  let updatedCount = 0;
  const triggeredAlerts: Array<{
    id: string;
    customerName: string;
    customerWhatsapp: string;
    customerEmail: string;
    originIata: string;
    destinationIata: string;
    previousLowestPrice: number | null;
    newLowestPrice: number;
  }> = [];

  for (const alert of activeAlerts) {
    const aOrigin = String(alert.origin_iata || "").toUpperCase();
    const aDest = String(alert.destination_iata || "").toUpperCase();
    const aDate = String(alert.target_departure_date || "").trim();

    const matching = observations.filter(
      (obs) =>
        obs.originIata === aOrigin &&
        obs.destinationIata === aDest &&
        (!aDate || !obs.targetDepartureDate || obs.targetDepartureDate === aDate)
    );
    if (matching.length === 0) continue;

    const bestObserved = matching.reduce((min, cur) =>
      cur.lowestPrice < min.lowestPrice ? cur : min
    );

    const prevLowest =
      alert.lowest_seen_price !== null && alert.lowest_seen_price !== undefined
        ? Number(alert.lowest_seen_price)
        : null;
    const prevBaseline =
      alert.baseline_price !== null && alert.baseline_price !== undefined
        ? Number(alert.baseline_price)
        : null;

    const nextBaseline = prevBaseline ?? bestObserved.lowestPrice;
    const nextLowest =
      prevLowest !== null
        ? Math.min(prevLowest, bestObserved.lowestPrice)
        : bestObserved.lowestPrice;

    const dropped =
      (prevLowest !== null && bestObserved.lowestPrice < prevLowest) ||
      (prevBaseline !== null && bestObserved.lowestPrice <= prevBaseline * 0.92);

    await fetch(
      `${SUPABASE_URL}/rest/v1/price_alerts?id=eq.${encodeURIComponent(alert.id)}`,
      {
        method: "PATCH",
        headers: supabaseHeaders({ Prefer: "return=minimal" }),
        body: JSON.stringify({
          last_checked_at: nowIso,
          baseline_price: nextBaseline,
          lowest_seen_price: nextLowest,
          last_check_source: bestObserved.source,
          ...(dropped
            ? {
                alert_triggered: true,
                triggered_at: nowIso,
              }
            : {}),
        }),
      }
    );

    updatedCount += 1;
    if (dropped) {
      triggeredAlerts.push({
        id: alert.id,
        customerName: alert.customer_name,
        customerWhatsapp: alert.customer_whatsapp,
        customerEmail: alert.customer_email || "",
        originIata: aOrigin,
        destinationIata: aDest,
        previousLowestPrice: prevLowest,
        newLowestPrice: bestObserved.lowestPrice,
      });
    }
  }

  return {
    success: true,
    mode,
    checkedAt: nowIso,
    activeAlertsCount: activeAlerts.length,
    updatedCount,
    triggeredAlerts,
  };
}

/**
 * GET /api/alerts/monitor
 * - Sem ?run=cache_sweep: lista os alertas ativos deduplicados por rota + data para o crawler diário.
 * - Com ?run=cache_sweep (Vercel Cron): executa a varredura gratuita com base no cache do portal.
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    if (url.searchParams.get("run") === "cache_sweep") {
      const result = await runAlertSweep("CACHE_SWEEP");
      return NextResponse.json(result);
    }

    const todayIso = new Date().toISOString().slice(0, 10);
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/price_alerts?select=*&status=neq.CONVERTIDO&order=created_at.desc&limit=200`,
      {
        headers: supabaseHeaders(),
        cache: "no-store",
      }
    );

    const rows = res.ok ? await res.json() : [];
    const activeRows = Array.isArray(rows)
      ? rows.filter((r: any) => {
          const dep = String(r.target_departure_date || "").trim();
          if (!dep) return true;
          return dep >= todayIso;
        })
      : [];

    const grouped = new Map<string, MonitorTarget>();
    for (const row of activeRows) {
      const originIata = String(row.origin_iata || "GRU").toUpperCase();
      const destinationIata = String(row.destination_iata || "GIG").toUpperCase();
      const targetDepartureDate = String(row.target_departure_date || "").trim();
      const targetMonthOrDate = String(row.target_month_or_date || "").trim();
      const key = `${originIata}|${destinationIata}|${
        targetDepartureDate || targetMonthOrDate
      }`;

      const existing = grouped.get(key);
      if (existing) {
        existing.alertIds.push(row.id);
        existing.alertsCount += 1;
      } else {
        grouped.set(key, {
          key,
          originIata,
          destinationIata,
          targetDepartureDate,
          targetMonthOrDate,
          alertIds: [row.id],
          alertsCount: 1,
        });
      }
    }

    const targets = Array.from(grouped.values());
    return NextResponse.json({
      today: todayIso,
      activeAlertsCount: activeRows.length,
      uniqueTargetsCount: targets.length,
      targets,
    });
  } catch (err) {
    console.error("Failed to list monitorable alerts:", err);
    return NextResponse.json(
      { error: "Falha ao listar alertas para monitoramento." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/alerts/monitor
 * - mode: "CACHE_SWEEP" -> cruza alertas ativos com buscas já cacheadas no portal (custo zero de API).
 * - mode: "CRAWLER_REPORT" -> recebe resultados do crawler diário e marca alertas com queda de tarifa.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const mode = body.mode === "CRAWLER_REPORT" ? "CRAWLER_REPORT" : "CACHE_SWEEP";
    const results = Array.isArray(body.results) ? body.results : [];
    const summary = await runAlertSweep(mode, results);
    return NextResponse.json(summary);
  } catch (err) {
    console.error("Failed to run alert monitor:", err);
    return NextResponse.json(
      { error: "Erro ao processar monitoramento de alertas." },
      { status: 500 }
    );
  }
}
