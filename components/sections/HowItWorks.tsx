import { Reveal, RevealItem } from "@/components/motion/Reveal";
import { SectionHeading } from "./SectionHeading";
import { STEPS } from "@/lib/site";

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-it-works-title"
      className="relative scroll-mt-24"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 grid-dots opacity-[0.03]"
      />
      <div className="relative mx-auto w-full max-w-[1120px] px-5 sm:px-8">
        <Reveal>
          <SectionHeading id="how-it-works" title="How it works" />

          <ol className="mt-10 grid gap-8 md:grid-cols-3 md:gap-6">
            {STEPS.map((step, i) => (
              <RevealItem key={step.title} as="li" className="border-t border-border pt-5">
                  <span className="font-mono text-xs tracking-[0.2em] text-accent">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-3 text-lg font-semibold tracking-tight text-text">
                    {step.title}
                  </h3>
                  <p className="mt-2.5 text-[0.9375rem] leading-relaxed text-muted">
                    {step.body}
                  </p>
              </RevealItem>
            ))}
          </ol>
        </Reveal>
      </div>
    </section>
  );
}
