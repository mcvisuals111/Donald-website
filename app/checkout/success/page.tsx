import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { buttonVariants } from "@/components/ui/button";
import { CONTACT_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Session paid",
  robots: { index: false, follow: false },
};

export default function CheckoutSuccess() {
  return (
    <PageShell eyebrow="Payment received" title="You're paid up for the session.">
      <p>
        The next step is picking a time. Use the booking calendar and you&rsquo;ll
        get a confirmation with the location.
      </p>
      <p>
        If anything looks wrong with the payment, email{" "}
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="text-text underline underline-offset-4 hover:text-accent"
        >
          {CONTACT_EMAIL}
        </a>
        .
      </p>
      <p className="pt-2">
        <Link href="/#book" className={buttonVariants({ variant: "primary", size: "md" })}>
          Pick a time
        </Link>
      </p>
    </PageShell>
  );
}
