import { Card } from "@/components/ui/card";
import { Reveal, RevealItem } from "@/components/motion/Reveal";
import { CountUp } from "@/components/motion/CountUp";
import { CheckoutButton } from "@/components/CheckoutButton";
import { SectionHeading } from "./SectionHeading";
import { SESSIONS } from "@/lib/site";

export function Pricing() {
  return (
    <section
      id="lessons"
      aria-labelledby="lessons-title"
      className="relative scroll-mt-24"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 grid-dots opacity-[0.03]"
      />
      <div className="relative mx-auto w-full max-w-[1120px] px-5 sm:px-8">
        <Reveal>
          <SectionHeading
            id="lessons"
            title="Lessons"
            sub="Pay per session. Nothing recurring."
          />

          <ul className="mt-10 grid gap-4 md:grid-cols-2">
            {SESSIONS.map((s, i) => (
              <RevealItem key={s.id} as="li" className="h-full">
                <Card tickHover className="flex h-full flex-col p-6 sm:p-7">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-lg font-semibold tracking-tight text-text">
                      {s.name}
                    </h3>
                    {s.label ? (
                      <span className="rounded-full border border-accent/40 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-accent">
                        {s.label}
                      </span>
                    ) : null}
                  </div>

                  <p className="mt-4 font-mono text-4xl font-medium tracking-tight text-text">
                    <CountUp value={s.price} prefix="$" duration={500} />
                  </p>

                  <ul className="mt-6 flex-1 space-y-3">
                    {s.bullets.map((b) => (
                      <li
                        key={b}
                        className="flex gap-3 text-[0.9375rem] leading-relaxed text-muted"
                      >
                        <span aria-hidden="true" className="mt-2 h-px w-3 shrink-0 bg-accent" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8">
                    <CheckoutButton
                      session={s.id}
                      variant={i === 1 ? "primary" : "outline"}
                    >
                      {s.cta}
                    </CheckoutButton>
                  </div>
                </Card>
              </RevealItem>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
