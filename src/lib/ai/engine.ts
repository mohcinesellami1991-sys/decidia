import { anthropic } from "@ai-sdk/anthropic";
import { generateText, streamText, Output } from "ai";
import {
  QuestionsSchema,
  ReportSchema,
  FollowupSchema,
  finalizeReport,
  type Persona,
  type Report,
  type Questions,
  type FollowupAdjustment,
} from "./schemas";
import { ANALYSIS_SYSTEM, FOLLOWUP_SYSTEM, QUESTIONS_SYSTEM } from "./prompts";

export const MODELS = {
  light: process.env.ANTHROPIC_MODEL_LIGHT ?? "claude-haiku-5-5",
  analysis: process.env.ANTHROPIC_MODEL_ANALYSIS ?? "claude-sonnet-5-5",
};

/** Tarifs en $ par million de tokens, surchargeables par variables d'environnement. */
const PRICE = {
  light: { in: Number(process.env.PRICE_LIGHT_IN ?? 1), out: Number(process.env.PRICE_LIGHT_OUT ?? 5) },
  analysis: { in: Number(process.env.PRICE_ANALYSIS_IN ?? 3), out: Number(process.env.PRICE_ANALYSIS_OUT ?? 15) },
};

export interface Usage {
  model: string;
  tokensIn: number;
  tokensOut: number;
  costUsd: number;
}

export function computeUsage(kind: keyof typeof PRICE, inTok = 0, outTok = 0): Usage {
  const p = PRICE[kind];
  return {
    model: MODELS[kind],
    tokensIn: inTok,
    tokensOut: outTok,
    costUsd: Number(((inTok * p.in + outTok * p.out) / 1_000_000).toFixed(6)),
  };
}

// Marge large : un rapport complet en français peut dépasser 4 500 tokens ; une coupure rendrait le JSON invalide.
const MAX_TOKENS = { questions: 800, analysis: 8000, followup: 2200 };
const wrap = (label: string, text: string) => `<${label}>\n${text}\n</${label}>`;

function sum(a: Usage, b: Usage): Usage {
  return { ...a, tokensIn: a.tokensIn + b.tokensIn, tokensOut: a.tokensOut + b.tokensOut, costUsd: Number((a.costUsd + b.costUsd).toFixed(6)) };
}

/** Exécute `fn` jusqu'à 2 fois (nouvelle tentative automatique si JSON invalide) en cumulant le coût. */
async function withRetry<T>(fn: () => Promise<{ data: T; usage: Usage }>, kind: keyof typeof PRICE) {
  let total = computeUsage(kind);
  let lastErr: unknown;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const r = await fn();
      return { data: r.data, usage: sum(total, r.usage) };
    } catch (e) {
      lastErr = e;
      // Une tentative invalide a quand même consommé des tokens : on les comptabilise.
      const spent = (e as { usage?: Usage }).usage;
      if (spent) total = sum(total, spent);
    }
  }
  throw Object.assign(new Error("AI_INVALID_OUTPUT"), { cause: lastErr, usage: total });
}

/* ---------- Étape A ---------- */
export async function generateQuestions(input: { problem: string; persona: Persona; locale: string }) {
  return withRetry<Questions>(async () => {
    const res = await generateText({
      model: anthropic(MODELS.light),
      system: QUESTIONS_SYSTEM(input.locale),
      prompt: `${wrap("profil", input.persona)}\n${wrap("probleme", input.problem)}`,
      output: Output.object({ schema: QuestionsSchema }),
      maxOutputTokens: MAX_TOKENS.questions,
    });
    const usage = computeUsage("light", res.usage.inputTokens, res.usage.outputTokens);
    try {
      const q = QuestionsSchema.parse(res.output);
      return { data: { ...q, questions: q.in_scope ? q.questions.slice(0, 3) : [] }, usage };
    } catch (e) {
      throw Object.assign(e as Error, { usage });
    }
  }, "light");
}

/* ---------- Étape B ---------- */
export interface AnalysisInput {
  problem: string;
  persona: Persona;
  locale: string;
  answers: { question: string; answer: string }[];
}

function analysisPrompt(i: AnalysisInput) {
  const ctx = i.answers.filter((a) => a.answer.trim()).map((a) => `- ${a.question}\n  → ${a.answer}`).join("\n");
  return `${wrap("profil", i.persona)}\n${wrap("probleme", i.problem)}\n${wrap("contexte", ctx || "(non précisé)")}`;
}

/**
 * Stream l'analyse : appelle `onPartial` à chaque état partiel, puis renvoie le rapport validé.
 * Une seconde tentative non streamée est faite si la sortie est invalide.
 */
export async function runAnalysis(input: AnalysisInput, onPartial: (partial: unknown) => void) {
  const attempt = async () => {
    const result = streamText({
      model: anthropic(MODELS.analysis),
      system: ANALYSIS_SYSTEM(input.persona, input.locale),
      prompt: analysisPrompt(input),
      output: Output.object({ schema: ReportSchema }),
      maxOutputTokens: MAX_TOKENS.analysis,
      onError: ({ error }) => console.error("[analysis] stream error", error),
    });
    for await (const partial of result.partialOutputStream) onPartial(partial);
    const [final, tokens] = await Promise.all([result.output, result.usage]);
    const usage = computeUsage("analysis", tokens.inputTokens, tokens.outputTokens);
    try {
      return { data: finalizeReport(final) as Report, usage };
    } catch (e) {
      throw Object.assign(e as Error, { usage });
    }
  };
  return withRetry<Report>(attempt, "analysis");
}

/* ---------- Étape C ---------- */
export async function runFollowup(input: {
  report: Report;
  outcome: "success" | "partial" | "failed";
  notes: string;
  locale: string;
}) {
  return withRetry<FollowupAdjustment>(async () => {
    const res = await generateText({
      model: anthropic(MODELS.analysis),
      system: FOLLOWUP_SYSTEM(input.locale),
      prompt: `${wrap("rapport_initial", JSON.stringify(input.report))}\n${wrap("resultat", input.outcome)}\n${wrap("notes", input.notes || "(aucune)")}`,
      output: Output.object({ schema: FollowupSchema }),
      maxOutputTokens: MAX_TOKENS.followup,
    });
    const usage = computeUsage("analysis", res.usage.inputTokens, res.usage.outputTokens);
    try {
      return { data: FollowupSchema.parse(res.output), usage };
    } catch (e) {
      throw Object.assign(e as Error, { usage });
    }
  }, "analysis");
}
