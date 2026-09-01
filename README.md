# Donald Mackenzie — trading lessons

One-page marketing site for one-on-one, in-person index and futures trading
lessons. Next.js 15 (App Router), TypeScript, Tailwind v4, Framer Motion,
`lightweight-charts`, Stripe Checkout, Cal.com. Deploys to Vercel.

## Run it

```bash
npm install
cp .env.example .env.local   # fill in the values below
npm run dev                  # http://localhost:3000
```

`npm run build` runs `scripts/fetch-es-daily.mjs` first (see **Market data**).

## Environment

Copy `.env.example` to `.env.local`. `.env.local` is gitignored; `.env.example`
is committed and holds no real values.

| Variable | Required | What it does |
| --- | --- | --- |
| `STRIPE_SECRET_KEY` | for payments | Server-only. Used solely in `app/api/checkout/route.ts`. Without it the Checkout buttons return a 503 and tell the visitor to book below. |
| `STRIPE_PRICE_ONE_HOUR` / `STRIPE_PRICE_TWO_HOURS` | no | Pre-created Stripe Price IDs. If unset, Checkout Sessions are created with inline `price_data` at $100 / $200 USD, so only the secret key is needed. |
| `NEXT_PUBLIC_SITE_URL` | yes in prod | Absolute origin. Builds the Stripe success/cancel URLs and `metadataBase`. |
| `NEXT_PUBLIC_CAL_LINK` | yes | Cal.com event slug, e.g. `donaldmackenzie/lesson`. |
| `NEXT_PUBLIC_CONTACT_EMAIL` | yes | Address shown in the footer. |

No Stripe secret or webhook secret is referenced from any client component. The
`stripe` package is imported only in the route handler, which is `runtime: "nodejs"`.

## Stripe

Two prices, $100 and $200, paid per session. `POST /api/checkout` with
`{"session":"one-hour"}` or `{"session":"two-hours"}` returns `{ url }` for a
Checkout Session. Returns are handled at `/checkout/success` and
`/checkout/cancelled`.

To test: put a `sk_test_…` key in `.env.local`, `npm run dev`, click either
button, and pay with card `4242 4242 4242 4242`, any future expiry, any CVC.

There is no webhook handler, because nothing on the site depends on payment
state — scheduling happens in Cal.com. If you later want to reconcile payments
against bookings, add a webhook route and keep `STRIPE_WEBHOOK_SECRET`
server-side.

## Cal.com

`NEXT_PUBLIC_CAL_LINK` points at the event type. The embed is dark-themed,
mounted lazily 600px before it scrolls into view, and its container reserves its
height up front so nothing shifts when the iframe arrives. If the embed script is
blocked, the panel falls back to a link to the booking page after 6 seconds.

## Market data

The hero chart uses real daily ES bars imported statically — no client-side
market data API, no key, no polling.

- `npm run build` runs `scripts/fetch-es-daily.mjs`, which fetches recent daily
  OHLC for the E-mini S&P 500 (Stooq, falling back to Yahoo Finance) into
  `data/es-daily.json`, plus reference quotes for the ticker strip into
  `data/reference-quotes.json`.
- If every source fails, the script keeps the committed files and exits 0, so a
  build never breaks and the hero never renders empty.
- The committed files are a **synthetic, deterministic seed** produced by
  `scripts/make-seed.mjs`, generated because the machine this was built on could
  not reach a market data provider. Both files carry `"synthetic": true`. The
  first build with network access replaces them with real data.

No performance figure, win rate, or P&L appears anywhere on the site, and none
is derived from this data. The chart is decorative and `aria-hidden`.

## The portrait

The About section renders a 4:5 `next/image` fill container. Drop the real photo
at `public/donald.jpg` and it appears with no layout change — `lib/portrait.ts`
checks for the file at build time. Until then the section shows an empty
`#111318` panel at the same ratio.

## Motion

Every animation is off under `prefers-reduced-motion: reduce` — the three-phase
hero chart, the ticker, sparklines, price counters, hover flashes and section
reveals. Each component checks `useReducedMotion()` and renders its static form,
and `app/globals.css` neutralises CSS animations and transitions as a backstop.
Content revealed on scroll is forced visible when JavaScript is unavailable.

## Deploy

Push to GitHub, import the repo in Vercel, set the environment variables above in
the Vercel project, and deploy. No other configuration is needed.
