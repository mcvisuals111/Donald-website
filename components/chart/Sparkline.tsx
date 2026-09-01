"use client";

import * as React from "react";
import { useInView, useReducedMotion } from "framer-motion";

const W = 260;
const H = 56;

/**
 * Decorative sparkline. Draws left to right once when the card enters view.
 * No axes, no values — it is ornament, and it is hidden from assistive tech.
 */
export function Sparkline({
  shape,
  delay = 0,
  className,
}: {
  shape: number[];
  delay?: number;
  className?: string;
}) {
  const ref = React.useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const reduced = useReducedMotion();
  const [drawn, setDrawn] = React.useState(false);

  React.useEffect(() => {
    if (reduced) {
      setDrawn(true);
      return;
    }
    if (!inView) return;
    const id = window.setTimeout(() => setDrawn(true), delay);
    return () => window.clearTimeout(id);
  }, [inView, reduced, delay]);

  const d = React.useMemo(() => {
    const step = W / Math.max(1, shape.length - 1);
    return shape
      .map((v, i) => {
        const x = i * step;
        const y = H - 4 - v * (H - 8);
        return `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
      })
      .join(" ");
  }, [shape]);

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      role="presentation"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path
        d={d}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        pathLength={1}
        style={{
          strokeDasharray: 1,
          strokeDashoffset: drawn ? 0 : 1,
          transition: reduced ? undefined : "stroke-dashoffset 800ms cubic-bezier(0.16,1,0.3,1)",
        }}
      />
    </svg>
  );
}
