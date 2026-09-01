import Image from "next/image";
import { Reveal, RevealItem } from "@/components/motion/Reveal";
import { SectionHeading } from "./SectionHeading";
import { ABOUT_PARAGRAPHS } from "@/lib/site";
import { hasPortrait, PORTRAIT_SRC } from "@/lib/portrait";

export function About() {
  return (
    <section
      id="about"
      aria-labelledby="about-title"
      className="mx-auto w-full max-w-[1120px] scroll-mt-24 px-5 sm:px-8"
    >
      <Reveal>
        <SectionHeading id="about" title="Who you're learning from" />

        <div className="mt-10 grid gap-8 md:grid-cols-[minmax(0,340px)_minmax(0,1fr)] md:gap-12">
          <RevealItem>
            {/* 4:5 portrait container. Dropping public/donald.jpg in place
                requires no layout change. */}
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-lg border border-border bg-panel">
              {hasPortrait ? (
                <Image
                  src={PORTRAIT_SRC}
                  alt="Donald Mackenzie"
                  fill
                  sizes="(min-width: 768px) 340px, 100vw"
                  className="object-cover saturate-[0.85]"
                  priority={false}
                />
              ) : null}
            </div>
          </RevealItem>

          <RevealItem className="space-y-5">
            {ABOUT_PARAGRAPHS.map((p) => (
              <p
                key={p.slice(0, 24)}
                className="text-pretty text-[0.9375rem] leading-relaxed text-muted sm:text-base"
              >
                {p}
              </p>
            ))}
          </RevealItem>
        </div>
      </Reveal>
    </section>
  );
}
