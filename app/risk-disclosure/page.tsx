import type { Metadata } from "next";
import { LegalHeading, PageShell } from "@/components/PageShell";
import { CONTACT_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Risk disclosure",
  description:
    "Trading futures involves substantial risk of loss and is not suitable for every investor.",
};

export default function RiskDisclosure() {
  return (
    <PageShell eyebrow="Legal" title="Risk disclosure">
      <p className="text-text">
        Trading futures involves substantial risk of loss and is not suitable for
        every investor. You can lose more than you deposit. Past performance does
        not indicate future results. These lessons are education, not financial
        advice.
      </p>

      <LegalHeading>Leverage works in both directions</LegalHeading>
      <p>
        Futures contracts are leveraged. A margin deposit controls a position
        worth many times that deposit, so a small move in the underlying index
        produces a large move in your account. The same leverage that makes a
        winning position profitable makes a losing one expensive, and a losing
        position can exceed the money you put up. You may be required to deposit
        additional funds on short notice, and positions may be liquidated at a
        loss without your consent.
      </p>

      <LegalHeading>No performance is promised or implied</LegalHeading>
      <p>
        Nothing on this site is a projection, a guarantee, or a representation of
        results you should expect. No win rate, return figure, or profit and loss
        record is presented anywhere on this site, and none should be inferred
        from any chart, illustration, or example used during a lesson. Charts
        shown on this site are illustrative.
      </p>

      <LegalHeading>Education, not advice</LegalHeading>
      <p>
        Donald Mackenzie is not a registered investment adviser, broker-dealer,
        commodity trading advisor, or commodity pool operator, and does not hold
        himself out as any of those. Lessons are general education about how index
        and futures markets work. Nothing said during a lesson or published on
        this site is a recommendation to buy or sell any security, contract, or
        instrument, and it is not tailored to your financial situation, objectives,
        or risk tolerance.
      </p>

      <LegalHeading>No account management</LegalHeading>
      <p>
        Donald does not accept, hold, manage, or trade client funds, and does not
        take discretion over anyone else&rsquo;s account. Every trade you place is
        placed by you, in your own account, on your own judgement, at your own
        risk.
      </p>

      <LegalHeading>Get independent advice</LegalHeading>
      <p>
        Before trading futures or any other leveraged product, consider whether it
        is appropriate for you given your circumstances and resources, and seek
        independent financial, tax, and legal advice if you are unsure. Only risk
        capital you can afford to lose entirely.
      </p>

      <LegalHeading>Questions</LegalHeading>
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
