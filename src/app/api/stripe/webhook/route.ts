import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { createAdmin } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

const ACTIVE = new Set(["active", "trialing", "past_due"]);

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = req.headers.get("stripe-signature");
  if (!secret || !signature) return NextResponse.json({ error: "bad_request" }, { status: 400 });

  const stripe = getStripe();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(await req.text(), signature, secret);
  } catch {
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
  }

  const admin = createAdmin();

  switch (event.type) {
    case "checkout.session.completed": {
      const s = event.data.object as Stripe.Checkout.Session;
      const userId = s.client_reference_id ?? s.metadata?.user_id;
      if (!userId || s.mode !== "subscription") break;
      await admin
        .from("profiles")
        .update({
          plan: "pro",
          stripe_customer_id: typeof s.customer === "string" ? s.customer : s.customer?.id,
          stripe_subscription_id: typeof s.subscription === "string" ? s.subscription : s.subscription?.id,
          ...(s.metadata?.founder === "true" ? { is_founder: true } : {}),
        })
        .eq("id", userId);
      break;
    }
    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const customer = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
      await admin
        .from("profiles")
        .update({ plan: ACTIVE.has(sub.status) ? "pro" : "free", stripe_subscription_id: sub.id })
        .eq("stripe_customer_id", customer);
      break;
    }
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const customer = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
      await admin.from("profiles").update({ plan: "free", stripe_subscription_id: null }).eq("stripe_customer_id", customer);
      break;
    }
    default:
      break;
  }
  return NextResponse.json({ received: true });
}
