"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { HeroChart } from "@/components/chart/HeroChart";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Bar } from "@/lib/chart-data";

export function Hero({ bars }: { bars: Bar[] }) {
  const ref = React.useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // Parallax at ~85% of page scroll speed; 30% → 0% opacity across the hero.
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);
  const opacity = useTransform(scrollYProgress, [0, 1], [0.3, 0]);

  return (
    <section
      ref={ref}
      className="relative flex min-h-svh flex-col justify-center overflow-hidden"
    >
      <motion.div
        aria-hidden="true"
        className="absolute inset-0"
        style={
          reduced
            ? { opacity: 0.3 }
            : { y, opacity, willChange: "transform, opacity" }
        }
      >
        <HeroChart bars={bars} />
      </motion.div>

      {/* Scrim under the copy: vertical on mobile where the copy is full width,
          horizontal on desktop where it sits on the left. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(10,11,13,0.45),rgba(10,11,13,0.82)_48%,rgba(10,11,13,0.6))] sm:bg-[linear-gradient(to_right,rgba(10,11,13,0.88),rgba(10,11,13,0.5)_52%,rgba(10,11,13,0)_78%)]"
      />

      <div className="relative mx-auto w-full max-w-[1120px] px-5 pb-20 pt-32 sm:px-8 sm:pb-24 sm:pt-36">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted sm:text-xs">
          ES · NQ · SPX
        </p>
        <h1 className="mt-6 max-w-3xl text-balance text-[2.125rem] font-semibold leading-[1.08] tracking-[-0.02em] text-text sm:text-5xl lg:text-[3.75rem]">
          Learn to trade the indices. One student at a time.
        </h1>
        <p className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-muted sm:text-lg">
          One-on-one lessons on the S&amp;P 500, the Nasdaq, and futures. In
          person, one hour at a time. Bring a laptop — that&rsquo;s the whole
          list of requirements.
        </p>
        <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            href="#book"
            className={cn(buttonVariants({ variant: "primary", size: "lg" }), "sm:w-auto")}
          >
            Book a lesson
          </Link>
          <Link
            href="#what-we-trade"
            className={cn(buttonVariants({ variant: "outline", size: "lg" }), "sm:w-auto")}
          >
            See what we cover
          </Link>
        </div>
      </div>
    </section>
  );
}
