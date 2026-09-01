import type { Metadata } from "next";
import { LegalHeading, PageShell } from "@/components/PageShell";
import { CONTACT_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy",
  description: "What this site collects, who processes it, and how to get it deleted.",
};

export default function Privacy() {
  return (
    <PageShell eyebrow="Legal" title="Privacy">
      <p>
        This site collects as little as it can get away with. There is no
        analytics script, no advertising pixel, and no tracking cookie set by this
        site.
      </p>

      <LegalHeading>What is collected</LegalHeading>
      <p>
        When you book a lesson, Cal.com collects your name, email address, and the
        time you picked, so the session can be scheduled and confirmed. When you
        pay, Stripe collects your payment details and billing information. This
        site receives a confirmation that a payment succeeded — it never receives
        or stores your card number. If you email, that email is kept so it can be
        replied to.
      </p>

      <LegalHeading>Who processes it</LegalHeading>
      <p>
        Scheduling is handled by Cal.com, payment by Stripe, and hosting by
        Vercel, each under its own privacy policy. They process this data to
        provide those services. It is not sold, and it is not shared with anyone
        else for marketing.
      </p>

      <LegalHeading>How long it is kept</LegalHeading>
      <p>
        Booking and payment records are kept while they are needed to run and
        account for the business, including for tax and accounting obligations.
        Correspondence is kept until it is no longer useful to keep.
      </p>

      <LegalHeading>Your rights</LegalHeading>
      <p>
        You can ask what is held about you, ask for it to be corrected, or ask for
        it to be deleted, subject to records that must be retained by law. Email
        the address below and it will be handled.
      </p>

      <LegalHeading>Contact</LegalHeading>
      <p>
        Email{" "}
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="text-text underline underline-offset-4 hover:text-accent"
        >
          {CONTACT_EMAIL}
        </a>
        .
      </p>
    </PageShell>
  );
}
