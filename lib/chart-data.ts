import raw from "@/data/es-daily.json";

export type Bar = {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type Daily = {
  symbol: string;
  description: string;
  interval: string;
  exchange: string;
  source: string;
  synthetic: boolean;
  fetchedAt: string | null;
  bars: Bar[];
};

export const daily = raw as Daily;

/** Bars rendered in the hero. ~150 in view, as specced. */
export const HERO_BARS = 150;

export const heroBars: Bar[] = daily.bars.slice(-HERO_BARS);

/**
 * Decorative sparkline shapes for the three market cards. These are normalised
 * 0..1 curves used purely as ornament — the cards show no prices, no axes and
 * no figures, and the SVGs are aria-hidden.
 */
export function sparklineShape(offset: number, length = 48): number[] {
  const source = daily.bars;
  const start = Math.max(0, source.length - length - offset * 26);
  const slice = source.slice(start, start + length).map((b) => b.close);
  const min = Math.min(...slice);
  const max = Math.max(...slice);
  const span = max - min || 1;
  return slice.map((v) => (v - min) / span);
}
