import "server-only";
import { createAdmin, createClient, hasSupabase } from "@/lib/supabase/server";
import { readAnonId } from "@/lib/anon";
import type { Persona, Report } from "@/lib/ai/schemas";

export interface Viewer {
  userId: string | null;
  email: string | null;
  anonId: string | null;
  plan: "free" | "pro" | "team";
  isFounder: boolean;
}

export interface DecisionRow {
  id: string;
  user_id: string | null;
  anon_id: string | null;
  title: string;
  problem_text: string;
  persona: Persona;
  locale: string;
  status: "draft" | "analyzed" | "decided" | "success" | "partial" | "failed";
  confidence_score: number | null;
  created_at: string;
  decided_at: string | null;
}

export async function getViewer(): Promise<Viewer> {
  const anonId = await readAnonId().catch(() => null);
  if (!hasSupabase()) return { userId: null, email: null, anonId, plan: "free", isFounder: false };
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return { userId: null, email: null, anonId, plan: "free", isFounder: false };
  const { data: profile } = await supabase.from("profiles").select("plan,is_founder").eq("id", data.user.id).single();
  return {
    userId: data.user.id,
    email: data.user.email ?? null,
    anonId,
    plan: (profile?.plan as Viewer["plan"]) ?? "free",
    isFounder: Boolean(profile?.is_founder),
  };
}

export const isPaid = (v: Viewer) => v.plan === "pro" || v.plan === "team";

/** Renvoie la décision si le visiteur en est propriétaire (compte, ou cookie anonyme pour une analyse non rattachée). */
export async function getOwnedDecision(id: string, viewer: Viewer): Promise<DecisionRow | null> {
  const admin = createAdmin();
  const { data } = await admin.from("decisions").select("*").eq("id", id).maybeSingle();
  if (!data) return null;
  const d = data as DecisionRow;
  if (viewer.userId && d.user_id === viewer.userId) return d;
  if (!d.user_id && viewer.anonId && d.anon_id === viewer.anonId) return d;
  return null;
}

export async function getLatestReport(decisionId: string) {
  const admin = createAdmin();
  const { data } = await admin
    .from("reports")
    .select("id, report_json, created_at, cost_usd")
    .eq("decision_id", decisionId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data ? { id: data.id as string, report: data.report_json as Report, createdAt: data.created_at as string } : null;
}

export async function getAnswers(decisionId: string) {
  const admin = createAdmin();
  const { data } = await admin
    .from("context_answers")
    .select("question, answer, position")
    .eq("decision_id", decisionId)
    .order("position");
  return (data ?? []) as { question: string; answer: string; position: number }[];
}

/** Rattache les analyses anonymes au compte fraîchement créé et planifie leurs suivis. */
export async function claimAnonDecisions(userId: string, anonId: string) {
  const admin = createAdmin();
  const { data } = await admin
    .from("decisions")
    .update({ user_id: userId })
    .eq("anon_id", anonId)
    .is("user_id", null)
    .select("id, created_at, status");
  for (const d of data ?? []) {
    if (d.status !== "draft") await scheduleFollowups(d.id, new Date());
  }
}

export async function scheduleFollowups(decisionId: string, from: Date) {
  const admin = createAdmin();
  const add = (days: number) => new Date(from.getTime() + days * 86_400_000).toISOString();
  await admin.from("followups").upsert(
    [
      { decision_id: decisionId, kind: "d14", due_at: add(14) },
      { decision_id: decisionId, kind: "d30", due_at: add(30) },
    ],
    { onConflict: "decision_id,kind", ignoreDuplicates: true },
  );
}

export async function logUsage(e: {
  userId: string | null;
  anonId: string | null;
  ipHash: string;
  type: "questions" | "analysis" | "followup";
  model: string;
  tokensIn: number;
  tokensOut: number;
  costUsd: number;
}) {
  const admin = createAdmin();
  await admin.from("usage_events").insert({
    user_id: e.userId,
    anon_id: e.anonId,
    ip_hash: e.ipHash,
    type: e.type,
    model: e.model,
    tokens_in: e.tokensIn,
    tokens_out: e.tokensOut,
    cost_usd: e.costUsd,
  });
}
