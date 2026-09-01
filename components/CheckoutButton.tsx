"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import type { SessionId } from "@/lib/site";

/**
 * Starts a Stripe Checkout Session. The Checkout Session is created server-side
 * in app/api/checkout/route.ts — no Stripe key of any kind reaches the client.
 */
export function CheckoutButton({
  session,
  children,
  variant = "primary",
}: {
  session: SessionId;
  children: React.ReactNode;
  variant?: "primary" | "outline";
}) {
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function checkout() {
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        throw new Error(data.error || "Checkout is unavailable right now.");
      }
      window.location.assign(data.url);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Checkout is unavailable right now."
      );
      setPending(false);
    }
  }

  return (
    <div>
      <Button
        variant={variant}
        size="lg"
        className="w-full"
        onClick={checkout}
        disabled={pending}
        aria-busy={pending}
      >
        {pending ? "Opening checkout…" : children}
      </Button>
      <p
        role="status"
        aria-live="polite"
        className="mt-2 min-h-5 font-mono text-[11px] leading-5 text-down empty:mt-0 empty:min-h-0"
      >
        {error}
      </p>
    </div>
  );
}
