import { NextResponse } from "next/server";
import Stripe from "stripe";
import { SESSIONS, type SessionId } from "@/lib/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PRICE_ENV: Record<SessionId, string | undefined> = {
  "one-hour": process.env.STRIPE_PRICE_ONE_HOUR,
  "two-hours": process.env.STRIPE_PRICE_TWO_HOURS,
};

function origin(req: Request): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) return configured.replace(/\/$/, "");
  return new URL(req.url).origin;
}

export async function POST(req: Request) {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    return NextResponse.json(
      { error: "Card payment isn't set up yet — book a time below instead." },
      { status: 503 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const requested = (body as { session?: string } | null)?.session;
  const session = SESSIONS.find((s) => s.id === requested);
  if (!session) {
    return NextResponse.json({ error: "Unknown session type." }, { status: 400 });
  }

  const stripe = new Stripe(secret);
  const base = origin(req);
  const priceId = PRICE_ENV[session.id];

  try {
    const checkout = await stripe.checkout.sessions.create({
      mode: "payment",
      // A pre-created Price is used when one is configured; otherwise the
      // amount is set inline, so checkout works with only a secret key.
      line_items: [
        priceId
          ? { price: priceId, quantity: 1 }
          : {
              quantity: 1,
              price_data: {
                currency: "usd",
                unit_amount: session.price * 100,
                product_data: {
                  name: `${session.name} trading lesson`,
                  description: `One-on-one, in person. ${session.minutes} minutes.`,
                },
              },
            },
      ],
      success_url: `${base}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/checkout/cancelled`,
      metadata: { lesson: session.id },
    });

    if (!checkout.url) {
      return NextResponse.json(
        { error: "Checkout is unavailable right now." },
        { status: 502 }
      );
    }

    return NextResponse.json({ url: checkout.url });
  } catch {
    // Stripe's internal error text never reaches the browser.
    return NextResponse.json(
      { error: "Checkout is unavailable right now." },
      { status: 502 }
    );
  }
}
