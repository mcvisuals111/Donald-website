import { Reveal, RevealItem } from "@/components/motion/Reveal";
import { WHAT_THIS_ISNT } from "@/lib/site";

export function WhatThisIsnt() {
  return (
    <section
      id="what-this-isnt"
      aria-labelledby="what-this-isnt-title"
      className="mx-auto w-full max-w-[1120px] scroll-mt-24 px-5 sm:px-8"
    >
      <Reveal>
        <RevealItem>
          <div className="rounded-lg border border-border bg-panel p-6 sm:p-10">
            <h2
              id="what-this-isnt-title"
              className="font-mono text-xs uppercase tracking-[0.22em] text-accent"
            >
              What this isn&rsquo;t
            </h2>
            <div className="mt-7 space-y-5">
              {WHAT_THIS_ISNT.map((line) => {
                // Lead the three "No ..." lines with a brighter opening clause.
                const lead = line.match(/^(No [^.]+\.)\s/);
                return (
                  <p
                    key={line.slice(0, 24)}
                    className="text-pretty font-mono text-[0.8125rem] leading-[1.75] text-muted sm:text-sm"
                  >
                    {lead ? (
                      <>
                        <span className="text-text">{lead[1]}</span>{" "}
                        {line.slice(lead[0].length)}
                      </>
                    ) : (
                      line
                    )}
                  </p>
                );
              })}
            </div>
          </div>
        </RevealItem>
      </Reveal>
    </section>
  );
}
