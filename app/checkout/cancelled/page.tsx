import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Checkout cancelled",
  robots: { index: false, follow: false },
};

export default function CheckoutCancelled() {
  return (
    <PageShell eyebrow="Checkout cancelled" title="Nothing was charged.">
      <p>
        You closed the payment page before it completed, so no card was charged
        and no session is booked.
      </p>
      <p>The pricing is on the home page whenever you want to come back to it.</p>
      <p className="pt-2">
        <Link href="/#lessons" className={buttonVariants({ variant: "outline", size: "md" })}>
          Back to lessons
        </Link>
      </p>
    </PageShell>
  );
}
