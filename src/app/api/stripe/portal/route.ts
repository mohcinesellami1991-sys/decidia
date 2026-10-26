import { NextResponse } from "next/server";
import { createAdmin, hasSupabase } from "@/lib/supabase/server";
import { getViewer } from "@/lib/db";
import { appUrl, getStripe, stripeConfigured } from "@/lib/stripe";

export async function POST() {
  if (!hasSupabase() || !stripeConfigured()) return NextResponse.json({ error: "not_configured" }, { status: 503 });
  const viewer = await getViewer();
  if (!viewer.userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const admin = createAdmin();
  const { data } = await admin.from("profiles").select("stripe_customer_id").eq("id", viewer.userId).single();
  if (!data?.stripe_customer_id) return NextResponse.json({ error: "no_customer" }, { status: 404 });

  const session = await getStripe().billingPortal.sessions.create({
    customer: data.stripe_customer_id,
    return_url: `${appUrl()}/settings`,
  });
  return NextResponse.json({ url: session.url });
}
