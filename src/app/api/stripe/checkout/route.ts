import { NextResponse } from "next/server";
import { createAdmin, hasSupabase } from "@/lib/supabase/server";
import { getViewer } from "@/lib/db";
import { appUrl, getStripe, PLANS, priceFor, stripeConfigured } from "@/lib/stripe";

export async function POST() {
  if (!hasSupabase() || !stripeConfigured()) return NextResponse.json({ error: "not_configured" }, { status: 503 });
  const viewer = await getViewer();
  if (!viewer.userId || !viewer.email) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (viewer.plan !== "free") return NextResponse.json({ error: "already_subscribed" }, { status: 409 });

  const admin = createAdmin();
  const { count } = await admin.from("profiles").select("id", { count: "exact", head: true }).eq("is_founder", true);
  const founderOpen = (count ?? 0) < PLANS.founder.seats && Boolean(priceFor("founder"));
  const plan = founderOpen ? "founder" : "pro";
  const price = priceFor(plan);
  if (!price) return NextResponse.json({ error: "not_configured" }, { status: 503 });

  const stripe = getStripe();
  const { data: profile } = await admin.from("profiles").select("stripe_customer_id").eq("id", viewer.userId).single();
  let customer = profile?.stripe_customer_id as string | undefined;
  if (!customer) {
    const c = await stripe.customers.create({ email: viewer.email, metadata: { user_id: viewer.userId } });
    customer = c.id;
    await admin.from("profiles").update({ stripe_customer_id: customer }).eq("id", viewer.userId);
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer,
    line_items: [{ price, quantity: 1 }],
    allow_promotion_codes: true,
    success_url: `${appUrl()}/settings?checkout=success`,
    cancel_url: `${appUrl()}/settings?checkout=cancel`,
    client_reference_id: viewer.userId,
    metadata: { user_id: viewer.userId, founder: String(plan === "founder") },
    subscription_data: { metadata: { user_id: viewer.userId, founder: String(plan === "founder") } },
  });
  return NextResponse.json({ url: session.url });
}
