import { NextResponse } from "next/server";
import { createAdmin, hasSupabase } from "@/lib/supabase/server";
import { ensureAnonId, ipHash } from "@/lib/anon";
import { getViewer, logUsage } from "@/lib/db";
import { canStartAnalysis, rateLimit } from "@/lib/limits";
import { generateQuestions } from "@/lib/ai";
import { ProblemInput } from "@/lib/ai/schemas";

export const maxDuration = 30;

export async function POST(req: Request) {
  if (!hasSupabase()) return NextResponse.json({ error: "not_configured" }, { status: 503 });

  const parsed = ProblemInput.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  const { problem, persona, locale } = parsed.data;

  const viewer = await getViewer();
  const ip = await ipHash();
  if (!(await rateLimit(viewer, ip))) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  const gate = await canStartAnalysis(viewer, ip);
  if (!gate.ok) return NextResponse.json({ error: gate.reason }, { status: 402 });

  const anonId = viewer.userId ? null : await ensureAnonId();

  let result;
  try {
    result = await generateQuestions({ problem, persona, locale });
  } catch (e) {
    console.error("[questions]", e);
    return NextResponse.json({ error: "ai_failed" }, { status: 502 });
  }
  const { data, usage } = result;
  await logUsage({ userId: viewer.userId, anonId, ipHash: ip, type: "questions", ...usage });

  if (!data.in_scope) {
    return NextResponse.json({ inScope: false, message: data.redirect_message });
  }

  const admin = createAdmin();
  const title = problem.length > 90 ? `${problem.slice(0, 87).trimEnd()}…` : problem;
  const { data: decision, error } = await admin
    .from("decisions")
    .insert({ user_id: viewer.userId, anon_id: anonId, title, problem_text: problem, persona, locale })
    .select("id")
    .single();
  if (error || !decision) return NextResponse.json({ error: "db_failed" }, { status: 500 });

  if (data.questions.length) {
    await admin.from("context_answers").insert(
      data.questions.map((q, i) => ({ decision_id: decision.id, question: q.question, example: q.example, answer: "", position: i })),
    );
  }
  return NextResponse.json({ inScope: true, decisionId: decision.id, questions: data.questions });
}
