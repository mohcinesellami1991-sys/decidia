import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdmin, hasSupabase } from "@/lib/supabase/server";
import { ipHash } from "@/lib/anon";
import { getLatestReport, getOwnedDecision, getViewer, logUsage } from "@/lib/db";
import { rateLimit } from "@/lib/limits";
import { runFollowup } from "@/lib/ai";

export const maxDuration = 120;

const Input = z.object({
  decisionId: z.string().uuid(),
  outcome: z.enum(["success", "partial", "failed"]),
  notes: z.string().trim().max(2000).default(""),
});

export async function POST(req: Request) {
  if (!hasSupabase()) return NextResponse.json({ error: "not_configured" }, { status: 503 });
  const parsed = Input.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid_input" }, { status: 400 });

  const viewer = await getViewer();
  if (!viewer.userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const decision = await getOwnedDecision(parsed.data.decisionId, viewer);
  if (!decision) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const ip = await ipHash();
  if (!(await rateLimit(viewer, ip))) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  const latest = await getLatestReport(decision.id);
  if (!latest) return NextResponse.json({ error: "no_report" }, { status: 409 });

  let result;
  try {
    result = await runFollowup({ report: latest.report, outcome: parsed.data.outcome, notes: parsed.data.notes, locale: decision.locale });
  } catch (e) {
    console.error("[followup]", e);
    return NextResponse.json({ error: "ai_failed" }, { status: 502 });
  }

  const admin = createAdmin();
  const now = new Date().toISOString();
  // On rattache la réponse au suivi dû le plus proche (ou crée l'entrée si le cron n'est pas encore passé).
  const { data: pending } = await admin
    .from("followups")
    .select("id")
    .eq("decision_id", decision.id)
    .is("answered_at", null)
    .order("due_at")
    .limit(1)
    .maybeSingle();
  const patch = {
    outcome: parsed.data.outcome,
    user_notes: parsed.data.notes,
    ai_adjustment_json: result.data,
    answered_at: now,
  };
  if (pending) await admin.from("followups").update(patch).eq("id", pending.id);
  else await admin.from("followups").insert({ decision_id: decision.id, kind: "d30", due_at: now, ...patch });

  await admin.from("decisions").update({ status: parsed.data.outcome, decided_at: now }).eq("id", decision.id);
  await logUsage({ userId: viewer.userId, anonId: null, ipHash: ip, type: "followup", ...result.usage });
  return NextResponse.json({ adjustment: result.data });
}
