import { NextResponse } from "next/server";
import { createAdmin, createClient, hasSupabase } from "@/lib/supabase/server";
import { getViewer } from "@/lib/db";
import { getStripe, stripeConfigured } from "@/lib/stripe";

/** Suppression définitive du compte : abonnement résilié, données effacées en cascade. */
export async function POST() {
  if (!hasSupabase()) return NextResponse.json({ error: "not_configured" }, { status: 503 });
  const viewer = await getViewer();
  if (!viewer.userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const admin = createAdmin();
  const { data: profile } = await admin
    .from("profiles")
    .select("stripe_customer_id, stripe_subscription_id")
    .eq("id", viewer.userId)
    .single();

  if (stripeConfigured() && profile?.stripe_subscription_id) {
    try {
      await getStripe().subscriptions.cancel(profile.stripe_subscription_id);
    } catch (e) {
      console.error("[delete] stripe", e);
      return NextResponse.json({ error: "stripe_failed" }, { status: 502 });
    }
  }

  const { error } = await admin.auth.admin.deleteUser(viewer.userId);
  if (error) return NextResponse.json({ error: "delete_failed" }, { status: 500 });

  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.json({ ok: true });
}
