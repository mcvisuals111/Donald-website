/**
 * Regenerates the committed seed bars in data/es-daily.json.
 *
 * These bars are SYNTHETIC and deterministic. They exist so the hero chart is
 * never empty when a build cannot reach a market data provider. On any build
 * with network access, scripts/fetch-es-daily.mjs runs first (npm prebuild) and
 * overwrites this file with real ES daily bars.
 *
 * Nothing on the site presents these numbers as a track record: the chart is
 * decorative, it is aria-hidden, and no performance figure is derived from it.
 */
import { writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = resolve(ROOT, "data/es-daily.json");
const BARS = 220;
const END = "2026-08-31";
const SEED = 0x5e5100;

function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(SEED);
const gauss = () => {
  const u = Math.max(rand(), 1e-9);
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rand());
};
const round2 = (n) => Math.round(n * 100) / 100;

/** Trading days (Mon–Fri) ending at END, most recent last. */
function sessionDates(count, endISO) {
  const dates = [];
  const d = new Date(`${endISO}T00:00:00Z`);
  while (dates.length < count) {
    const day = d.getUTCDay();
    if (day !== 0 && day !== 6) dates.push(d.toISOString().slice(0, 10));
    d.setUTCDate(d.getUTCDate() - 1);
  }
  return dates.reverse();
}

const dates = sessionDates(BARS, END);
const bars = [];
let price = 5720;
let vol = 0.0072;

for (let i = 0; i < dates.length; i++) {
  // Slow-moving volatility regime, so the series has calm and choppy stretches.
  vol = Math.min(0.019, Math.max(0.0042, vol + gauss() * 0.00055));

  const drift = 0.00042;
  const open = round2(price);
  const close = round2(open * (1 + drift + gauss() * vol));
  const body = Math.abs(close - open);
  const wickUp = body * (0.25 + rand() * 1.5) + open * vol * 0.28 * rand();
  const wickDn = body * (0.25 + rand() * 1.5) + open * vol * 0.28 * rand();
  const high = round2(Math.max(open, close) + wickUp);
  const low = round2(Math.min(open, close) - wickDn);

  // Volume leans heavier on wide-range and down sessions, as it does live.
  const range = (high - low) / open;
  const base = 1_150_000 * (0.72 + range / 0.011) * (close < open ? 1.14 : 1);
  const volume = Math.round(base * (0.82 + rand() * 0.42));

  bars.push({ time: dates[i], open, high, low, close, volume });
  price = close;
}

const payload = {
  symbol: "ES",
  description: "E-mini S&P 500 Futures",
  interval: "1D",
  exchange: "CME",
  source: "synthetic seed (scripts/make-seed.mjs) — replaced at build time by scripts/fetch-es-daily.mjs",
  synthetic: true,
  fetchedAt: null,
  bars,
};

await mkdir(dirname(OUT), { recursive: true });
await writeFile(OUT, JSON.stringify(payload, null, 2) + "\n");
console.log(`[es-daily] wrote ${bars.length} synthetic seed bars ending ${END}`);

// --- reference quotes for the ticker strip (synthetic seed) -----------------
const QUOTES_OUT = resolve(ROOT, "data/reference-quotes.json");
const last = bars[bars.length - 1];
const prev = bars[bars.length - 2];
const esChangePct = ((last.close - prev.close) / prev.close) * 100;

// Index levels are derived from the seeded ES path using long-run ratios, so
// the strip is internally consistent. Replaced at build time with real quotes.
const RATIOS = [
  { symbol: "ES", ratio: 1, beta: 1 },
  { symbol: "NQ", ratio: 3.63, beta: 1.28 },
  { symbol: "YM", ratio: 7.32, beta: 0.82 },
  { symbol: "RTY", ratio: 0.382, beta: 1.19 },
  { symbol: "SPX", ratio: 0.9966, beta: 1 },
];

const quotes = RATIOS.map(({ symbol, ratio, beta }) => {
  const price = round2(last.close * ratio);
  const changePercent = round2(esChangePct * beta);
  return {
    symbol,
    price,
    change: round2((price * changePercent) / 100),
    changePercent,
  };
});

await writeFile(
  QUOTES_OUT,
  JSON.stringify(
    {
      source: "synthetic seed (scripts/make-seed.mjs) — replaced at build time by scripts/fetch-es-daily.mjs",
      synthetic: true,
      fetchedAt: null,
      quotes,
    },
    null,
    2
  ) + "\n"
);
console.log(`[quotes] wrote ${quotes.length} synthetic seed quotes`);
