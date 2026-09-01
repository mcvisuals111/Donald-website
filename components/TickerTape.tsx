import quotes from "@/data/reference-quotes.json";
import { cn } from "@/lib/utils";

const fmt = (n: number) =>
  n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/**
 * Reference levels fetched once at build time. Decorative: aria-hidden, no
 * polling, and nothing on the page depends on these numbers.
 */
export function TickerTape() {
  const items = quotes.quotes;

  const strip = (
    <ul className="flex shrink-0 items-center">
      {items.map((q) => {
        const up = q.change >= 0;
        return (
          <li
            key={q.symbol}
            className="flex items-center gap-2.5 whitespace-nowrap px-6 font-mono text-[11px] tracking-wide"
          >
            <span className="text-muted">{q.symbol}</span>
            <span className="text-text/90">{fmt(q.price)}</span>
            <span className={cn(up ? "text-up" : "text-down")}>
              {up ? "+" : "−"}
              {fmt(Math.abs(q.change))} ({up ? "+" : "−"}
              {Math.abs(q.changePercent).toFixed(2)}%)
            </span>
          </li>
        );
      })}
    </ul>
  );

  return (
    <div
      aria-hidden="true"
      className="group relative overflow-hidden border-y border-border bg-panel/40 py-2.5"
    >
      <div className="flex w-max motion-safe:marquee-track group-hover:[animation-play-state:paused]">
        {strip}
        {strip}
        {strip}
        {strip}
      </div>
      {/* Feather the strip into the page at both edges. */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-bg to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-bg to-transparent" />
    </div>
  );
}
