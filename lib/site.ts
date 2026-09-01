export const WORDMARK = "DONALD MACKENZIE";

export const CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL || "donald@donaldmackenzie.trade";

export const CAL_LINK = process.env.NEXT_PUBLIC_CAL_LINK || "donaldmackenzie/lesson";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const NAV_LINKS = [
  { href: "#what-we-trade", label: "What we trade" },
  { href: "#lessons", label: "Lessons" },
  { href: "#book", label: "Book" },
] as const;

export const LEGAL_LINKS = [
  { href: "/risk-disclosure", label: "Risk disclosure" },
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
] as const;

export const FOOTER_DISCLOSURE =
  "Educational content only. Nothing on this site is financial, investment, or trading advice. Trading futures and other leveraged products carries a substantial risk of loss.";

export type SessionId = "one-hour" | "two-hours";

export const SESSIONS = [
  {
    id: "one-hour" as const,
    name: "One hour",
    price: 100,
    priceLabel: "$100",
    minutes: 60,
    label: null,
    bullets: [
      "One-on-one, in person",
      "Bring your own laptop",
      "Pick the topic or start at the beginning",
      "Pay per session, no package required",
    ],
    cta: "Book one hour",
  },
  {
    id: "two-hours" as const,
    name: "Two hours",
    price: 200,
    priceLabel: "$200",
    minutes: 120,
    label: "Most useful",
    bullets: [
      "Everything in the one-hour session",
      "Enough time to actually watch a live session together",
      "Chart setup, sizing, and a full walkthrough of one setup",
      "Better for a first lesson if you've never traded",
    ],
    cta: "Book two hours",
  },
];

export const MARKETS = [
  {
    name: "S&P 500",
    body: "The most-watched index in the world, and the most liquid. Deep enough that your order doesn't move the market and slow enough that you can actually think.",
  },
  {
    name: "Nasdaq",
    body: "Faster, heavier, and less forgiving than the S&P. Same setups, bigger range. We get here once the basics hold up.",
  },
  {
    name: "Futures",
    body: "How the index is actually traded — contracts, tick values, margin, and why the session opens at 6:00pm the night before.",
  },
];

export const STEPS = [
  {
    title: "Book an hour",
    body: "Pick a time, pay for the session, done. No subscription, no application, no call before the call.",
  },
  {
    title: "Sit down together",
    body: "In person, side by side, your laptop open. You are looking at your own screen the entire time — that's the point of doing it this way.",
  },
  {
    title: "Trade your own account",
    body: "You leave with a setup you can run yourself. There's nothing to log into afterwards and nobody to ask for permission.",
  },
];

export const WHAT_THIS_ISNT = [
  "No signals. You will not get alerts telling you what to buy.",
  "No account management. Donald does not trade anyone else's money and will not offer to.",
  "No income promises. Nobody here is going to tell you what you'll make, because nobody knows, and anyone who tells you otherwise is selling something worse than a lesson.",
  "Trading futures involves substantial risk of loss and is not suitable for every investor. You can lose more than you deposit. Past performance does not indicate future results. These lessons are education, not financial advice.",
];

export const ABOUT_PARAGRAPHS = [
  "Donald Mackenzie has spent the last few years trading the S&P 500 and the Nasdaq, mostly through futures.",
  "He's not a fund manager and he doesn't want your money to trade. What he does is sit down with one person at a time and teach them how the index actually moves — what a candle is telling you, where the risk is, how much to size, and what to do when the trade goes against you.",
  "He's taught before, and the one-on-one format is deliberate. Most trading education is a video course you buy at midnight and never finish. This is an hour, in person, on your own screen, where you can stop him and ask why.",
];
