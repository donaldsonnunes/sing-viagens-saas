/**
 * Worker parametrizável (custo zero de API paga) para varrer alertas de tarifa ativos.
 *
 * Parâmetros via variáveis de ambiente (ou flags CLI):
 *   SING_BASE_URL           URL do portal (default: https://www.singviagens.com.br)
 *   CRAWLER_ENABLED         "true" | "false" (default: "true")
 *   CRAWLER_ONLY_CACHE_SWEEP "true" | "false" (default: "false")
 *   CRAWLER_MAX_TARGETS     Máximo de trechos por execução (default: 15)
 *   CRAWLER_DELAY_MS        Intervalo entre consultas em ms (default: 4500)
 *   CRAWLER_HEADLESS        "true" | "false" (default: "true")
 *
 * Exemplo de uso local:
 *   CRAWLER_MAX_TARGETS=10 CRAWLER_DELAY_MS=5000 node scripts/daily-alert-crawler.mjs
 */

const BASE_URL = (
  process.env.SING_BASE_URL || "https://www.singviagens.com.br"
).replace(/\/$/, "");
const ENABLED = String(process.env.CRAWLER_ENABLED || "true").toLowerCase() !== "false";
const ONLY_CACHE_SWEEP =
  String(process.env.CRAWLER_ONLY_CACHE_SWEEP || "false").toLowerCase() === "true";
const MAX_TARGETS = Math.max(
  1,
  Number.parseInt(process.env.CRAWLER_MAX_TARGETS || "15", 10) || 15
);
const DELAY_MS = Math.max(
  1000,
  Number.parseInt(process.env.CRAWLER_DELAY_MS || "4500", 10) || 4500
);
const HEADLESS = String(process.env.CRAWLER_HEADLESS || "true").toLowerCase() !== "false";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseBrlPricesFromText(text) {
  const matches = String(text || "").match(/R\$\s*([\d.]+(?:,\d{2})?)/g) || [];
  const values = [];
  for (const raw of matches) {
    const numeric = raw
      .replace(/R\$\s*/g, "")
      .replace(/\./g, "")
      .replace(",", ".");
    const parsed = Number.parseFloat(numeric);
    if (Number.isFinite(parsed) && parsed >= 150 && parsed <= 45000) {
      values.push(Math.round(parsed));
    }
  }
  return values;
}

async function crawlGoogleFlightsLowestPrice(browser, target) {
  if (!target.targetDepartureDate) return null;

  const origin = encodeURIComponent(target.originIata);
  const dest = encodeURIComponent(target.destinationIata);
  const date = encodeURIComponent(target.targetDepartureDate);
  const url = `https://www.google.com/travel/flights?hl=pt-BR&curr=BRL&q=Flights%20from%20${origin}%20to%20${dest}%20on%20${date}%20oneway`;

  const context = await browser.newContext({
    locale: "pt-BR",
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  });
  const page = await context.newPage();

  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 35000 });

    // Aceita banner de consentimento caso apareça
    const consentBtn = page
      .locator('button:has-text("Aceitar tudo"), button:has-text("Accept all")')
      .first();
    if (await consentBtn.isVisible({ timeout: 2500 }).catch(() => false)) {
      await consentBtn.click().catch(() => {});
    }

    await page.waitForTimeout(4500);

    const bodyText = await page.evaluate(() => document.body?.innerText || "");
    const prices = parseBrlPricesFromText(bodyText);
    if (prices.length === 0) return null;

    return Math.min(...prices);
  } catch (err) {
    console.warn(
      `[Sing Crawler] Falha ao consultar ${target.originIata}->${target.destinationIata} (${target.targetDepartureDate}):`,
      err instanceof Error ? err.message : err
    );
    return null;
  } finally {
    await context.close();
  }
}

async function main() {
  if (!ENABLED) {
    console.log("[Sing Crawler] Execução desativada via CRAWLER_ENABLED=false.");
    return;
  }

  console.log("[Sing Crawler] Configuração:", {
    BASE_URL,
    ONLY_CACHE_SWEEP,
    MAX_TARGETS,
    DELAY_MS,
    HEADLESS,
  });

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

  if (ONLY_CACHE_SWEEP) {
    console.log("[Sing Crawler] Modo CRAWLER_ONLY_CACHE_SWEEP ativo. Encerrando.");
    return;
  }

  // 2. Lista trechos ativos deduplicados (já ordenados por maior demanda)
  const listRes = await fetch(`${BASE_URL}/api/alerts/monitor`);
  if (!listRes.ok) {
    throw new Error(`Falha ao consultar /api/alerts/monitor: HTTP ${listRes.status}`);
  }
  const { targets = [], activeAlertsCount = 0 } = await listRes.json();
  const queue = targets
    .filter((t) => Boolean(t.targetDepartureDate))
    .slice(0, MAX_TARGETS);

  console.log(
    `[Sing Crawler] ${activeAlertsCount} alertas ativos -> ${targets.length} trechos únicos -> processando até ${queue.length} nesta execução.`
  );

  if (queue.length === 0) return;

  let playwrightMod;
  try {
    playwrightMod = await import("playwright");
  } catch {
    console.warn(
      "[Sing Crawler] Pacote 'playwright' não encontrado neste ambiente. Instale com `npm install --no-save playwright && npx playwright install chromium` para habilitar o scraping público."
    );
    return;
  }

  const browser = await playwrightMod.chromium.launch({ headless: HEADLESS });
  const scrapedResults = [];

  try {
    for (let i = 0; i < queue.length; i++) {
      const target = queue[i];
      const lowestPrice = await crawlGoogleFlightsLowestPrice(browser, target);
      if (lowestPrice && lowestPrice > 0) {
        console.log(
          `[Sing Crawler] ${target.originIata}->${target.destinationIata} (${target.targetDepartureDate}): R$ ${lowestPrice}`
        );
        scrapedResults.push({
          originIata: target.originIata,
          destinationIata: target.destinationIata,
          targetDepartureDate: target.targetDepartureDate,
          lowestPrice,
          source: "GOOGLE_FLIGHTS_CRAWLER",
        });
      }
      if (i < queue.length - 1) {
        await sleep(DELAY_MS);
      }
    }
  } finally {
    await browser.close();
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
    console.log("[Sing Crawler] CRAWLER_REPORT:", {
      updatedCount: reportData.updatedCount,
      triggered: reportData.triggeredAlerts?.length || 0,
    });
  } else {
    console.log("[Sing Crawler] Nenhuma tarifa pública extraída nesta rodada.");
  }
}

main().catch((err) => {
  console.error("[Sing Crawler] Erro:", err);
  process.exit(1);
});
