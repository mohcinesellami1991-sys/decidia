import { createAdmin, hasSupabase } from "@/lib/supabase/server";
import { ipHash } from "@/lib/anon";
import { getOwnedDecision, getViewer, logUsage, scheduleFollowups } from "@/lib/db";
import { canStartAnalysis, rateLimit } from "@/lib/limits";
import { runAnalysis } from "@/lib/ai";
import { AnswersInput } from "@/lib/ai/schemas";

export const maxDuration = 120;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

/** Flux NDJSON : {type:"partial",data} … puis {type:"done"} ou {type:"error",code}. */
export async function POST(req: Request) {
  if (!hasSupabase()) return json({ error: "not_configured" }, 503);

  const parsed = AnswersInput.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return json({ error: "invalid_input" }, 400);

  const viewer = await getViewer();
  const decision = await getOwnedDecision(parsed.data.decisionId, viewer);
  if (!decision) return json({ error: "not_found" }, 404);
  if (decision.status !== "draft") return json({ error: "already_analyzed" }, 409);

  const ip = await ipHash();
  if (!(await rateLimit(viewer, ip))) return json({ error: "rate_limited" }, 429);
  const gate = await canStartAnalysis(viewer, ip);
  if (!gate.ok) return json({ error: gate.reason }, 402);

  const admin = createAdmin();
  const answers = parsed.data.answers;
  await Promise.all(
    answers.map((a, i) =>
      admin.from("context_answers").update({ answer: a.answer }).eq("decision_id", decision.id).eq("position", i),
    ),
  );

  const enc = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (o: unknown) => controller.enqueue(enc.encode(`${JSON.stringify(o)}\n`));
      let last = 0;
      try {
        const { data: report, usage } = await runAnalysis(
          { problem: decision.problem_text, persona: decision.persona, locale: decision.locale, answers },
          (partial) => {
            const now = Date.now();
            if (now - last > 250) {
              last = now;
              send({ type: "partial", data: partial });
            }
          },
        );

        await admin.from("reports").insert({
          decision_id: decision.id,
          report_json: report,
          model_version: usage.model,
          tokens_in: usage.tokensIn,
          tokens_out: usage.tokensOut,
          cost_usd: usage.costUsd,
        });
        await admin
          .from("decisions")
          .update({ status: "analyzed", confidence_score: report.recommendation.confidence })
          .eq("id", decision.id);
        await logUsage({ userId: viewer.userId, anonId: decision.anon_id, ipHash: ip, type: "analysis", ...usage });
        if (decision.user_id) await scheduleFollowups(decision.id, new Date());

        send({ type: "done", data: report });
      } catch (e) {
        console.error("[analyze]", e);
        send({ type: "error", code: "ai_failed" });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "content-type": "application/x-ndjson; charset=utf-8", "cache-control": "no-store", "x-accel-buffering": "no" },
  });
}
