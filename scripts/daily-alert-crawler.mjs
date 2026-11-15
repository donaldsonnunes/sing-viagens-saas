/**
 * Worker diário externo (custo zero de API paga) para varrer alertas de tarifa ativos.
 *
 * Como executar (em VPS, Railway, GitHub Actions ou agendador local com Playwright instalado):
 *   SING_BASE_URL=https://www.singviagens.com.br node scripts/daily-alert-crawler.mjs
 *
 * Fluxo:
 * 1. Busca os trechos ativos e deduplicados em GET /api/alerts/monitor (somente voos futuros).
 * 2. Para cada trecho único (originIata -> destinationIata na targetDepartureDate), coleta a menor tarifa pública.
 * 3. Envia o lote para POST /api/alerts/monitor (mode: "CRAWLER_REPORT") e lista os clientes com queda de tarifa.
 */

const BASE_URL = process.env.SING_BASE_URL || "https://www.singviagens.com.br";

async function crawlPublicLowestPrice(target) {
  // Integre aqui seu scraper Playwright/Puppeteer ou fonte pública de tarifas.
  // Caso o portal já tenha buscas recentes em cache, o modo CACHE_SWEEP cobre sem scraping.
  if (!target.targetDepartureDate) return null;
  return null;
}

async function main() {
  const listRes = await fetch(`${BASE_URL}/api/alerts/monitor`);
  if (!listRes.ok) {
    throw new Error(`Falha ao consultar /api/alerts/monitor: HTTP ${listRes.status}`);
  }
  const { targets = [], activeAlertsCount = 0 } = await listRes.json();
  console.log(
    `[Sing Crawler] ${activeAlertsCount} alertas ativos agrupados em ${targets.length} trechos únicos.`
  );

  // 1. Sempre executa primeiro a varredura gratuita no cache do portal
  const cacheSweepRes = await fetch(`${BASE_URL}/api/alerts/monitor`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mode: "CACHE_SWEEP" }),
  });
  const cacheData = await cacheSweepRes.json();
  console.log("[Sing Crawler] CACHE_SWEEP:", {
    updatedCount: cacheData.updatedCount,
    triggered: cacheData.triggeredAlerts?.length || 0,
  });

  // 2. Opcional: coleta pública para os trechos restantes
  const scrapedResults = [];
  for (const target of targets) {
    const lowestPrice = await crawlPublicLowestPrice(target);
    if (lowestPrice && lowestPrice > 0) {
      scrapedResults.push({
        originIata: target.originIata,
        destinationIata: target.destinationIata,
        targetDepartureDate: target.targetDepartureDate,
        lowestPrice,
        source: "CRAWLER",
      });
    }
  }

  if (scrapedResults.length > 0) {
    const reportRes = await fetch(`${BASE_URL}/api/alerts/monitor`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: "CRAWLER_REPORT",
        results: scrapedResults,
      }),
    });
    const reportData = await reportRes.json();
    console.log("[Sing Crawler] CRAWLER_REPORT:", reportData);
  }
}

main().catch((err) => {
  console.error("[Sing Crawler] Erro:", err);
  process.exit(1);
});
