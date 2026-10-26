import { NextResponse } from "next/server";
import { createAdmin, hasSupabase } from "@/lib/supabase/server";
import { getViewer } from "@/lib/db";

/** Export RGPD : toutes les données de l'utilisateur dans un fichier JSON. */
export async function GET() {
  if (!hasSupabase()) return NextResponse.json({ error: "not_configured" }, { status: 503 });
  const viewer = await getViewer();
  if (!viewer.userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const admin = createAdmin();
  const { data: profile } = await admin
    .from("profiles")
    .select("email, full_name, persona, plan, is_founder, locale, created_at")
    .eq("id", viewer.userId)
    .single();
  const { data: decisions } = await admin.from("decisions").select("*").eq("user_id", viewer.userId);
  const ids = (decisions ?? []).map((d) => d.id);
  const [answers, reports, followups, usage] = await Promise.all([
    ids.length ? admin.from("context_answers").select("*").in("decision_id", ids) : { data: [] },
    ids.length ? admin.from("reports").select("*").in("decision_id", ids) : { data: [] },
    ids.length ? admin.from("followups").select("*").in("decision_id", ids) : { data: [] },
    admin.from("usage_events").select("type, model, tokens_in, tokens_out, cost_usd, created_at").eq("user_id", viewer.userId),
  ]);

  const body = JSON.stringify(
    { exported_at: new Date().toISOString(), profile, decisions, context_answers: answers.data, reports: reports.data, followups: followups.data, usage_events: usage.data },
    null,
    2,
  );
  return new NextResponse(body, {
    headers: { "content-type": "application/json", "content-disposition": 'attachment; filename="decidia-export.json"', "cache-control": "private, no-store" },
  });
}
