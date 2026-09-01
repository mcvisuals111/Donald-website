"use client";

import * as React from "react";
import { useInView, useReducedMotion } from "framer-motion";

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * Counts a number up from zero the first time it enters the viewport, then
 * stops for good. Static under prefers-reduced-motion.
 */
export function CountUp({
  value,
  duration = 500,
  prefix = "",
  className,
}: {
  value: number;
  duration?: number;
  prefix?: string;
  className?: string;
}) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const reduced = useReducedMotion();
  const [display, setDisplay] = React.useState(reduced ? value : 0);

  React.useEffect(() => {
    if (reduced) {
      setDisplay(value);
      return;
    }
    if (!inView) return;

    let frame = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      setDisplay(Math.round(easeOutCubic(t) * value));
      if (t < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, reduced, value, duration]);

  return (
    <span ref={ref} className={className}>
      {/* The real figure is always in the accessibility tree, mid-count or not. */}
      <span aria-hidden="true">
        {prefix}
        {display}
      </span>
      <span className="sr-only">
        {prefix}
        {value}
      </span>
    </span>
  );
}
