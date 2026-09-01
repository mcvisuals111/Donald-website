"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { getCalApi } from "@calcom/embed-react";

// ~90kB of embed code that only matters once the booking section is close.
const Cal = dynamic(() => import("@calcom/embed-react"), { ssr: false });

const NAMESPACE = "lesson";

/**
 * Cal.com inline embed, dark theme. The wrapper reserves its height before the
 * iframe loads, so the booker does not shift the page when it arrives.
 */
export function CalEmbed({ calLink }: { calLink: string }) {
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const [stalled, setStalled] = React.useState(false);
  const [near, setNear] = React.useState(false);

  React.useEffect(() => {
    const node = wrapRef.current;
    if (!node) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: "600px" }
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  // If the embed script is blocked (ad blocker, strict network, script error)
  // the panel would otherwise sit empty. Fall back to a plain booking link.
  React.useEffect(() => {
    if (!near) return;
    const id = window.setTimeout(() => {
      if (!wrapRef.current?.querySelector("iframe")) setStalled(true);
    }, 6000);
    return () => window.clearTimeout(id);
  }, [near]);

  React.useEffect(() => {
    if (!near) return;
    let cancelled = false;
    (async () => {
      const cal = await getCalApi({ namespace: NAMESPACE });
      if (cancelled) return;
      cal("ui", {
        theme: "dark",
        cssVarsPerTheme: {
          light: {},
          dark: {
            "cal-brand": "#16C784",
            "cal-bg": "#111318",
            "cal-bg-emphasis": "#1E222A",
            "cal-border": "#1E222A",
            "cal-text": "#E6E8EB",
            "cal-text-emphasis": "#E6E8EB",
            "cal-text-subtle": "#8B929E",
          },
        },
        hideEventTypeDetails: false,
        layout: "month_view",
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [near]);

  return (
    <div
      ref={wrapRef}
      className="relative overflow-hidden rounded-lg border border-border bg-panel"
    >
      {stalled ? (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 px-6 text-center">
          <p className="max-w-sm text-[0.9375rem] leading-relaxed text-muted">
            The booking calendar didn&rsquo;t load. It opens fine in its own tab.
          </p>
          <a
            href={`https://cal.com/${calLink}`}
            target="_blank"
            rel="noreferrer"
            className="rounded-md bg-accent px-5 py-3 text-sm font-semibold text-bg transition-colors hover:bg-[#13b578]"
          >
            Open the booking page
          </a>
        </div>
      ) : null}
      <div className="min-h-[640px] w-full sm:min-h-[720px]">
        {near ? (
        <Cal
          namespace={NAMESPACE}
          calLink={calLink}
          className="h-full w-full"
          style={{ width: "100%", height: "100%", minHeight: "640px", overflow: "scroll" }}
          config={{ layout: "month_view", theme: "dark" }}
        />
        ) : null}
      </div>
    </div>
  );
}
