import { Card, CardBody, CardTitle } from "@/components/ui/card";
import { Reveal, RevealItem } from "@/components/motion/Reveal";
import { Sparkline } from "@/components/chart/Sparkline";
import { SectionHeading } from "./SectionHeading";
import { MARKETS } from "@/lib/site";
import { sparklineShape } from "@/lib/chart-data";

export function WhatWeTrade() {
  const shapes = MARKETS.map((_, i) => sparklineShape(i));

  return (
    <section
      id="what-we-trade"
      aria-labelledby="what-we-trade-title"
      className="mx-auto w-full max-w-[1120px] scroll-mt-24 px-5 sm:px-8"
    >
      <Reveal>
        <SectionHeading
          id="what-we-trade"
          title="What we trade"
          sub="Three markets. Not forty tickers, not a Discord full of arrows."
        />

        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 [&>li:last-child]:sm:col-span-2 [&>li:last-child]:lg:col-span-1">
          {MARKETS.map((market, i) => (
            <RevealItem key={market.name} as="li" className="h-full">
              <Card
                tickHover
                className="group flex h-full flex-col justify-between overflow-hidden p-6"
              >
                <div>
                  <CardTitle>{market.name}</CardTitle>
                  <CardBody className="mt-3">{market.body}</CardBody>
                </div>
                <Sparkline
                  shape={shapes[i]}
                  delay={i * 120}
                  className="mt-7 h-12 w-full text-border transition-colors duration-200 group-hover:text-accent"
                />
              </Card>
            </RevealItem>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}
