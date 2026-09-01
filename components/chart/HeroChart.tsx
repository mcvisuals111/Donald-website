"use client";

import * as React from "react";
import {
  CandlestickSeries,
  ColorType,
  CrosshairMode,
  HistogramSeries,
  LineSeries,
  LineStyle,
  createChart,
  type IChartApi,
  type ISeriesApi,
  type Time,
} from "lightweight-charts";
import { useReducedMotion } from "framer-motion";
import type { Bar } from "@/lib/chart-data";

const UP = "#16C784";
const DOWN = "#EA3943";
const GRID = "#1E222A";
const MUTED = "#8B929E";
const PRICE_LINE = "#B36AC7"; // muted magenta

// Phase timings, in ms from the start of the draw-in.
const CANDLE_STAGGER = 8;
const CANDLE_GROW = 260;
const VOLUME_TRAIL = 150;
const PHASE_1_END = 1400;
const SWEEP_START = PHASE_1_END;
const SWEEP_DURATION = 350;
const COUNT_DURATION = 600;
const PHASE_2_END = 2000;
const JITTER_EVERY = 2000;
const DRIFT_EVERY = 8000;

/**
 * Bottom-to-top gradient mask. Full weight through the middle of the pane where
 * the headline sits (the copy stays readable because the whole layer is at 30%),
 * easing off at the very bottom so the volume band reads as a footnote rather
 * than a second chart, and off entirely at the top edge.
 */
const HERO_MASK =
  "linear-gradient(to top, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.86) 11%, #000 30%, #000 84%, transparent 100%)";

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : t);

const fmt = (n: number) =>
  n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** Next weekday after a YYYY-MM-DD date string. */
function nextSession(date: string): string {
  const d = new Date(`${date}T00:00:00Z`);
  do {
    d.setUTCDate(d.getUTCDate() + 1);
  } while (d.getUTCDay() === 0 || d.getUTCDay() === 6);
  return d.toISOString().slice(0, 10);
}

type Ohlc = { o: number; h: number; l: number; c: number };

export function HeroChart({ bars }: { bars: Bar[] }) {
  const hostRef = React.useRef<HTMLDivElement>(null);
  const dotRef = React.useRef<HTMLDivElement>(null);
  const oRef = React.useRef<HTMLSpanElement>(null);
  const hRef = React.useRef<HTMLSpanElement>(null);
  const lRef = React.useRef<HTMLSpanElement>(null);
  const cRef = React.useRef<HTMLSpanElement>(null);
  const chgRef = React.useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();

  const [instrumentsIn, setInstrumentsIn] = React.useState(false);

  // The final bar's real values, used for the static/reduced-motion render and
  // as the count-up targets.
  const target = React.useMemo<Ohlc>(() => {
    const last = bars[bars.length - 1];
    return { o: last.open, h: last.high, l: last.low, c: last.close };
  }, [bars]);

  const prevClose = bars[bars.length - 2]?.close ?? bars[bars.length - 1].open;

  React.useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    // --- chart -------------------------------------------------------------
    const chart: IChartApi = createChart(host, {
      autoSize: true,
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: MUTED,
        fontFamily:
          'var(--font-jetbrains-mono), ui-monospace, SFMono-Regular, Menlo, monospace',
        fontSize: 12,
        attributionLogo: false,
      },
      grid: {
        vertLines: { color: reduced ? GRID : "rgba(30,34,42,0)", style: LineStyle.Dotted },
        horzLines: { color: reduced ? GRID : "rgba(30,34,42,0)", style: LineStyle.Dotted },
      },
      // A static dashed crosshair is drawn as an overlay; the interactive one
      // is off so nothing follows the pointer.
      crosshair: { mode: CrosshairMode.Hidden },
      handleScroll: false,
      handleScale: false,
      rightPriceScale: {
        visible: window.innerWidth >= 640,
        borderVisible: false,
        scaleMargins: { top: 0.06, bottom: 0.26 },
        ticksVisible: false,
      },
      timeScale: { visible: false, borderVisible: false },
    });

    const lows = bars.map((b) => b.low);
    const highs = bars.map((b) => b.high);
    const minValue = Math.min(...lows);
    const maxValue = Math.max(...highs);
    const pad = (maxValue - minValue) * 0.04;

    const candles: ISeriesApi<"Candlestick"> = chart.addSeries(CandlestickSeries, {
      upColor: UP,
      downColor: DOWN,
      wickUpColor: UP,
      wickDownColor: DOWN,
      borderVisible: false,
      priceLineVisible: false,
      lastValueVisible: false,
      // Fixed scale, so growing candles never make the axis jump.
      autoscaleInfoProvider: () => ({
        priceRange: { minValue: minValue - pad, maxValue: maxValue + pad },
      }),
    });

    const volume: ISeriesApi<"Histogram"> = chart.addSeries(HistogramSeries, {
      priceFormat: { type: "volume" },
      priceScaleId: "", // overlay, so volume never shares the price axis
      priceLineVisible: false,
      lastValueVisible: false,
    });
    // Volume occupies the bottom ~15% of the pane.
    volume.priceScale().applyOptions({
      scaleMargins: { top: 0.85, bottom: 0 },
    });

    const maxVolume = Math.max(...bars.map((b) => b.volume));
    const level: ISeriesApi<"Line"> = chart.addSeries(LineSeries, {
      color: "rgba(179,106,199,0.5)",
      lineWidth: 1,
      lineStyle: LineStyle.Dotted,
      priceLineVisible: false,
      lastValueVisible: false,
      crosshairMarkerVisible: false,
      pointMarkersVisible: false,
      autoscaleInfoProvider: () => null,
    });

    // A round-number reference level inside the visible range.
    const levelPrice =
      Math.round(((minValue + maxValue) / 2 / 25)) * 25;

    // --- working copy of the series ---------------------------------------
    let live: Bar[] = bars.map((b) => ({ ...b }));

    const paint = (progressAt: (i: number) => { body: number; vol: number }) => {
      candles.setData(
        live.map((b, i) => {
          const t = progressAt(i).body;
          return {
            time: b.time as Time,
            open: b.open,
            high: lerp(b.open, b.high, t),
            low: lerp(b.open, b.low, t),
            close: lerp(b.open, b.close, t),
          };
        })
      );
      volume.setData(
        live.map((b, i) => ({
          time: b.time as Time,
          value: b.volume * progressAt(i).vol,
          color: b.close >= b.open ? "rgba(22,199,132,0.35)" : "rgba(234,57,67,0.35)",
        }))
      );
    };

    const paintFull = () => paint(() => ({ body: 1, vol: 1 }));

    /** ~150 bars, edge to edge, at every container width. */
    const fit = () => chart.timeScale().fitContent();

    const setLevel = (revealed: number) => {
      level.setData(
        live.slice(0, revealed).map((b) => ({ time: b.time as Time, value: levelPrice }))
      );
    };

    const writeHeader = (v: Ohlc) => {
      if (oRef.current) oRef.current.textContent = fmt(v.o);
      if (hRef.current) hRef.current.textContent = fmt(v.h);
      if (lRef.current) lRef.current.textContent = fmt(v.l);
      if (cRef.current) cRef.current.textContent = fmt(v.c);
      if (chgRef.current) {
        if (v.c === 0) {
          // Mid count-up there is no meaningful change figure to show yet.
          chgRef.current.textContent = "";
          return;
        }
        const diff = v.c - prevClose;
        const pct = (diff / prevClose) * 100;
        chgRef.current.textContent = `${diff >= 0 ? "+" : "−"}${fmt(
          Math.abs(diff)
        )} (${diff >= 0 ? "+" : "−"}${Math.abs(pct).toFixed(2)}%)`;
        chgRef.current.style.color = diff >= 0 ? UP : DOWN;
      }
    };

    const placeDot = () => {
      const dot = dotRef.current;
      if (!dot) return;
      const last = live[live.length - 1];
      const y = candles.priceToCoordinate(last.close);
      const x = chart.timeScale().timeToCoordinate(last.time as Time);
      if (x == null || y == null) {
        dot.style.opacity = "0";
        return;
      }
      dot.style.opacity = "1";
      dot.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    };

    // --- reduced motion: fully drawn, static, no loop ----------------------
    if (reduced) {
      paintFull();
      fit();
      setLevel(live.length);
      writeHeader(target);
      setInstrumentsIn(true);
      requestAnimationFrame(placeDot);
      const onResize = () =>
        requestAnimationFrame(() => {
          chart.applyOptions({
            rightPriceScale: { visible: window.innerWidth >= 640 },
          });
          fit();
          placeDot();
        });
      window.addEventListener("resize", onResize);
      return () => {
        window.removeEventListener("resize", onResize);
        chart.remove();
      };
    }

    // --- animated: one rAF loop, paused when off screen --------------------
    let frame = 0;
    let running = false;
    let startedAt = 0;
    let elapsed = 0; // animation clock, frozen while paused
    let lastFrameAt = 0;
    let phase: 1 | 2 | 3 = 1;
    let lastJitter = 0;
    let lastDrift = 0;
    let jitterOffset = 0;
    const baseLast = { ...live[live.length - 1] };

    setLevel(0);
    paint(() => ({ body: 0, vol: 0 }));
    fit();
    writeHeader({ o: 0, h: 0, l: 0, c: 0 });

    const drawInFrame = (t: number) => {
      // Grid dots fade in first.
      const gridAlpha = clamp01(t / 350) * 1;
      const gridColor = `rgba(30,34,42,${gridAlpha.toFixed(3)})`;
      chart.applyOptions({
        grid: {
          vertLines: { color: gridColor, style: LineStyle.Dotted },
          horzLines: { color: gridColor, style: LineStyle.Dotted },
        },
      });

      paint((i) => {
        const body = clamp01((t - i * CANDLE_STAGGER) / CANDLE_GROW);
        const vol = clamp01((t - i * CANDLE_STAGGER - VOLUME_TRAIL) / CANDLE_GROW);
        return { body: easeOutCubic(body), vol: easeOutCubic(vol) };
      });
    };

    const instrumentsFrame = (t: number) => {
      const sweep = clamp01((t - SWEEP_START) / SWEEP_DURATION);
      setLevel(Math.round(easeOutCubic(sweep) * live.length));

      const count = easeOutCubic(clamp01((t - SWEEP_START) / COUNT_DURATION));
      writeHeader({
        o: target.o * count,
        h: target.h * count,
        l: target.l * count,
        c: target.c * count,
      });
    };

    const ambientFrame = (t: number) => {
      // Every ~2s the live candle's body height shifts a little.
      if (t - lastJitter > JITTER_EVERY) {
        lastJitter = t;
        const range = (baseLast.high - baseLast.low) * 0.22;
        jitterOffset = (Math.random() - 0.5) * range;
        const close = Math.min(
          baseLast.high,
          Math.max(baseLast.low, baseLast.close + jitterOffset)
        );
        live[live.length - 1] = { ...baseLast, close };
        candles.update({
          time: baseLast.time as Time,
          open: baseLast.open,
          high: baseLast.high,
          low: baseLast.low,
          close,
        });
        writeHeader({ o: baseLast.open, h: baseLast.high, l: baseLast.low, c: close });
        placeDot();
      }

      // Every ~8s the series drifts left by one candle and a new bar opens.
      if (t - lastDrift > DRIFT_EVERY) {
        lastDrift = t;
        const last = live[live.length - 1];
        const step = last.close * (Math.random() - 0.48) * 0.008;
        const open = last.close;
        const close = Math.min(
          maxValue + pad,
          Math.max(minValue - pad, open + step)
        );
        const wick = Math.abs(close - open) * (0.4 + Math.random());
        const bar: Bar = {
          time: nextSession(last.time),
          open,
          close,
          high: Math.max(open, close) + wick,
          low: Math.min(open, close) - wick,
          volume: maxVolume * (0.35 + Math.random() * 0.4),
        };
        live = [...live.slice(1), bar];
        Object.assign(baseLast, bar);
        paintFull();
        fit();
        setLevel(live.length);
        writeHeader({ o: bar.open, h: bar.high, l: bar.low, c: bar.close });
        placeDot();
      }
    };

    const loop = (now: number) => {
      if (!running) return;
      if (!startedAt) startedAt = now;
      if (lastFrameAt) elapsed += now - lastFrameAt;
      lastFrameAt = now;

      const t = elapsed;

      if (phase === 1) {
        drawInFrame(t);
        if (t >= PHASE_1_END) {
          phase = 2;
          paintFull();
          setInstrumentsIn(true);
        }
      } else if (phase === 2) {
        instrumentsFrame(t);
        if (t >= PHASE_2_END) {
          phase = 3;
          writeHeader(target);
          setLevel(live.length);
          lastJitter = t;
          lastDrift = t;
          placeDot();
        }
      } else {
        ambientFrame(t);
      }

      frame = requestAnimationFrame(loop);
    };

    const start = () => {
      if (running) return;
      running = true;
      lastFrameAt = 0;
      frame = requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(frame);
    };

    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? start() : stop()),
      { threshold: 0 }
    );
    io.observe(host);

    const onResize = () =>
      requestAnimationFrame(() => {
        chart.applyOptions({
          rightPriceScale: { visible: window.innerWidth >= 640 },
        });
        fit();
        placeDot();
      });
    window.addEventListener("resize", onResize);

    return () => {
      io.disconnect();
      stop();
      window.removeEventListener("resize", onResize);
      chart.remove();
    };
  }, [bars, prevClose, reduced, target]);

  return (
    <div className="relative h-full w-full" aria-hidden="true">
      {/* Quote header — the row that makes this read as a real chart. */}
      <div className="pointer-events-none absolute inset-x-0 top-[4.5rem] z-10 px-5 sm:px-8">
        <div className="mx-auto flex max-w-[1120px] flex-wrap items-baseline gap-x-4 gap-y-1 font-mono text-[10px] tracking-wide text-muted/90 sm:text-[11px]">
          <span className="text-text/80">ES</span>
          <span aria-hidden>·</span>
          <span>1D</span>
          <span aria-hidden>·</span>
          <span>CME</span>
          <span className="ml-1 flex flex-wrap gap-x-3 gap-y-1">
            <span>
              <span className="text-muted/70">O</span>{" "}
              <span ref={oRef} className="text-text/80">
                {fmt(target.o)}
              </span>
            </span>
            <span>
              <span className="text-muted/70">H</span>{" "}
              <span ref={hRef} className="text-text/80">
                {fmt(target.h)}
              </span>
            </span>
            <span>
              <span className="text-muted/70">L</span>{" "}
              <span ref={lRef} className="text-text/80">
                {fmt(target.l)}
              </span>
            </span>
            <span>
              <span className="text-muted/70">C</span>{" "}
              <span ref={cRef} className="text-text/80">
                {fmt(target.c)}
              </span>
            </span>
            <span ref={chgRef} style={{ color: UP }} />
          </span>
        </div>
      </div>

      {/* Chart canvas */}
      <div
        ref={hostRef}
        className="absolute inset-0"
        style={{
          // Bottom-to-top gradient mask, so the headline stays readable at every
          // breakpoint. Applied to the canvas only — the quote header and the
          // crosshair keep their own weight.
          maskImage: HERO_MASK,
          WebkitMaskImage: HERO_MASK,
        }}
      />

      {/* Static dashed crosshair — no pointer tracking. */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-500"
        style={{ opacity: instrumentsIn ? 1 : 0 }}
      >
        <div
          className="absolute left-0 right-14 top-[38%] border-t border-dashed"
          style={{ borderColor: "rgba(139,146,158,0.35)" }}
        />
        <div
          className="absolute bottom-[26%] top-0 left-[68%] border-l border-dashed"
          style={{ borderColor: "rgba(139,146,158,0.35)" }}
        />
      </div>

      {/* Pulsing last-price dot */}
      <div
        ref={dotRef}
        className="pointer-events-none absolute left-0 top-0 -ml-[3px] -mt-[3px] h-1.5 w-1.5 rounded-full opacity-0 motion-safe:animate-[price-pulse_2.4s_ease-in-out_infinite]"
        style={{ backgroundColor: UP }}
      />
    </div>
  );
}
