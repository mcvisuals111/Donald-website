/**
 * Fetches recent daily OHLC bars for the E-mini S&P 500 (ES) once, at build
 * time, into data/es-daily.json. The hero chart imports that file statically —
 * there is no client-side market data API, no key, and no polling.
 *
 * If every source fails (offline build, blocked egress, provider outage) the
 * script leaves the committed data/es-daily.json in place and exits 0, so the
 * build never breaks and the hero never renders empty.
 */
import { writeFile, readFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = resolve(ROOT, "data/es-daily.json");
const QUOTES_OUT = resolve(ROOT, "data/reference-quotes.json");
const BARS = 220;
const TIMEOUT_MS = 15000;

/** @typedef {{time:string,open:number,high:number,low:number,close:number,volume:number}} Bar */

const round2 = (n) => Math.round(n * 100) / 100;

async function get(url) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; site-build/1.0)" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}

/** Stooq continuous front-month E-mini S&P 500 daily CSV. */
async function fromStooq() {
  const csv = await get("https://stooq.com/q/d/l/?s=es.f&i=d");
  const lines = csv.trim().split("\n");
  if (lines.length < 30 || !/^Date,/i.test(lines[0])) throw new Error("unexpected CSV shape");
  /** @type {Bar[]} */
  const bars = [];
  for (const line of lines.slice(1)) {
    const [time, o, h, l, c, v] = line.split(",");
    const bar = {
      time,
      open: Number(o),
      high: Number(h),
      low: Number(l),
      close: Number(c),
      volume: Math.round(Number(v) || 0),
    };
    if (!/^\d{4}-\d{2}-\d{2}$/.test(time)) continue;
    if ([bar.open, bar.high, bar.low, bar.close].some((n) => !Number.isFinite(n) || n <= 0)) continue;
    bars.push(bar);
  }
  return { bars, source: "stooq.com (es.f daily)" };
}

/** Yahoo Finance chart API, ES=F continuous front month. */
async function fromYahoo() {
  const json = JSON.parse(
    await get("https://query1.finance.yahoo.com/v8/finance/chart/ES=F?range=2y&interval=1d")
  );
  const r = json?.chart?.result?.[0];
  const q = r?.indicators?.quote?.[0];
  if (!r?.timestamp || !q) throw new Error("unexpected JSON shape");
  /** @type {Bar[]} */
  const bars = [];
  for (let i = 0; i < r.timestamp.length; i++) {
    const o = q.open?.[i], h = q.high?.[i], l = q.low?.[i], c = q.close?.[i];
    if ([o, h, l, c].some((n) => typeof n !== "number" || !Number.isFinite(n))) continue;
    bars.push({
      time: new Date(r.timestamp[i] * 1000).toISOString().slice(0, 10),
      open: round2(o),
      high: round2(h),
      low: round2(l),
      close: round2(c),
      volume: Math.round(q.volume?.[i] || 0),
    });
  }
  return { bars, source: "query1.finance.yahoo.com (ES=F daily)" };
}


/**
 * Reference quotes for the ticker strip. Static, fetched once at build time,
 * displayed as reference levels only — the strip is aria-hidden decoration.
 */
const TICKER = [
  { symbol: "ES", yahoo: "ES=F" },
  { symbol: "NQ", yahoo: "NQ=F" },
  { symbol: "YM", yahoo: "YM=F" },
  { symbol: "RTY", yahoo: "RTY=F" },
  { symbol: "SPX", yahoo: "^GSPC" },
];

async function fetchQuotes() {
  const quotes = [];
  for (const { symbol, yahoo } of TICKER) {
    const json = JSON.parse(
      await get(
        `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahoo)}?range=5d&interval=1d`
      )
    );
    const r = json?.chart?.result?.[0];
    const closes = (r?.indicators?.quote?.[0]?.close || []).filter(
      (n) => typeof n === "number" && Number.isFinite(n)
    );
    if (closes.length < 2) throw new Error(`no usable closes for ${yahoo}`);
    const last = closes[closes.length - 1];
    const prev = closes[closes.length - 2];
    quotes.push({
      symbol,
      price: round2(last),
      change: round2(last - prev),
      changePercent: round2(((last - prev) / prev) * 100),
    });
  }
  return quotes;
}

async function writeQuotes() {
  try {
    const quotes = await fetchQuotes();
    await writeFile(
      QUOTES_OUT,
      JSON.stringify(
        {
          source: "query1.finance.yahoo.com (daily closes)",
          synthetic: false,
          fetchedAt: new Date().toISOString(),
          quotes,
        },
        null,
        2
      ) + "\n"
    );
    console.log(`[quotes] wrote ${quotes.length} reference quotes`);
  } catch (err) {
    console.warn(
      `[quotes] fetch failed (${err.message}); keeping committed data/reference-quotes.json`
    );
  }
}

async function main() {
  const sources = [fromStooq, fromYahoo];
  for (const source of sources) {
    try {
      const { bars, source: label } = await source();
      if (bars.length < 60) throw new Error(`only ${bars.length} usable bars`);
      const payload = {
        symbol: "ES",
        description: "E-mini S&P 500 Futures",
        interval: "1D",
        exchange: "CME",
        source: label,
        synthetic: false,
        fetchedAt: new Date().toISOString(),
        bars: bars.slice(-BARS),
      };
      await mkdir(dirname(OUT), { recursive: true });
      await writeFile(OUT, JSON.stringify(payload, null, 2) + "\n");
      console.log(`[es-daily] wrote ${payload.bars.length} bars from ${label}`);
      return;
    } catch (err) {
      console.warn(`[es-daily] ${source.name} failed: ${err.message}`);
    }
  }

  try {
    const existing = JSON.parse(await readFile(OUT, "utf8"));
    console.warn(
      `[es-daily] all sources failed; keeping committed data/es-daily.json ` +
        `(${existing.bars.length} bars, source: ${existing.source}).`
    );
  } catch {
    console.error("[es-daily] all sources failed and no committed data file exists.");
    process.exitCode = 1;
  }
}

await main();
await writeQuotes();
