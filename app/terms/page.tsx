import type { Metadata } from "next";
import Link from "next/link";
import { LegalHeading, PageShell } from "@/components/PageShell";
import { CONTACT_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms",
  description: "The terms that apply to booking and attending a lesson.",
};

export default function Terms() {
  return (
    <PageShell eyebrow="Legal" title="Terms">
      <p>
        These terms apply when you book a lesson through this site or attend one.
        Booking a session means you accept them.
      </p>

      <LegalHeading>What you are buying</LegalHeading>
      <p>
        A one-on-one, in-person trading lesson of the length you paid for — one
        hour or two hours. Lessons are educational. They do not include signals,
        alerts, ongoing mentorship, account management, or any service after the
        session ends.
      </p>

      <LegalHeading>Payment</LegalHeading>
      <p>
        Sessions are paid per session, in advance, through Stripe. Card details
        are handled by Stripe and are never received or stored by this site.
        Prices are in US dollars and are shown on the home page.
      </p>

      <LegalHeading>Rescheduling and refunds</LegalHeading>
      <p>
        You can reschedule or cancel a session up to 24 hours before its start
        time for a full refund. Inside 24 hours, the session is non-refundable,
        because the time has been held for you. If Donald cancels or cannot make
        the session, you get a full refund or a rescheduled session, whichever you
        prefer.
      </p>

      <LegalHeading>What you bring</LegalHeading>
      <p>
        A laptop. You are welcome to bring your own brokerage account, but you are
        not required to open one, and you will never be asked for account
        credentials, API keys, or access to your funds. Do not share them.
      </p>

      <LegalHeading>Your decisions are yours</LegalHeading>
      <p>
        Lessons are education, not financial advice, and nothing taught is a
        recommendation to trade anything. Every trading decision you make is
        yours alone, and you accept the full risk of it. See the{" "}
        <Link
          href="/risk-disclosure"
          className="text-text underline underline-offset-4 hover:text-accent"
        >
          risk disclosure
        </Link>
        .
      </p>

      <LegalHeading>Liability</LegalHeading>
      <p>
        To the fullest extent permitted by law, liability arising out of a lesson
        or this site is limited to the amount you paid for the session in
        question. Nothing in these terms limits liability that cannot lawfully be
        limited.
      </p>

      <LegalHeading>Conduct</LegalHeading>
      <p>
        Lessons may be ended without refund if a participant behaves abusively or
        unlawfully. Session material is for your own use and may not be recorded
        or resold without permission.
      </p>

      <LegalHeading>Changes</LegalHeading>
      <p>
        These terms may be updated. The version published here at the time you
        book is the version that applies to that booking.
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
