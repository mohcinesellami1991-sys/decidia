import * as real from "./engine";
import { SAMPLE_REPORT } from "@/lib/sample-report";
import type { AnalysisInput } from "./engine";
import type { FollowupAdjustment, Questions, Report } from "./schemas";

/** DECIDIA_MOCK_AI=1 : réponses fixes sans appel à Anthropic (démo, tests de parcours). */
const mock = process.env.DECIDIA_MOCK_AI === "1";

const zero = { model: "mock", tokensIn: 0, tokensOut: 0, costUsd: 0 };
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function generateQuestions(
  input: Parameters<typeof real.generateQuestions>[0],
): Promise<{ data: Questions; usage: real.Usage }> {
  if (!mock) return real.generateQuestions(input);
  await sleep(300);
  return {
    usage: zero,
    data: {
      in_scope: true,
      redirect_message: "",
      questions: [
        { question: "Quel est ton objectif chiffré à 6 mois ?", example: "Ex. : 30 clients payants" },
        { question: "Quelles sont tes contraintes principales (argent, temps) ?", example: "Ex. : 12 000 € d'économies, 10 h par semaine" },
        { question: "Qu'as-tu déjà testé auprès de vrais clients ?", example: "Ex. : rien encore, ou 3 entretiens" },
      ],
    },
  };
}

export async function runAnalysis(
  input: AnalysisInput,
  onPartial: (partial: unknown) => void,
): Promise<{ data: Report; usage: real.Usage }> {
  if (!mock) return real.runAnalysis(input, onPartial);
  const keys = Object.keys(SAMPLE_REPORT) as (keyof Report)[];
  const partial: Partial<Report> = {};
  for (const k of keys) {
    await sleep(350);
    (partial as Record<string, unknown>)[k] = SAMPLE_REPORT[k];
    onPartial({ ...partial });
  }
  return { data: SAMPLE_REPORT, usage: zero };
}

export async function runFollowup(
  input: Parameters<typeof real.runFollowup>[0],
): Promise<{ data: FollowupAdjustment; usage: real.Usage }> {
  if (!mock) return real.runFollowup(input);
  await sleep(300);
  return {
    usage: zero,
    data: {
      gap_analysis: "Ma prévision supposait des précommandes hors cercle proche. Le résultat montre que cette hypothèse était trop optimiste.",
      lesson: "Une demande validée par des inconnus vaut dix fois une demande validée par des proches.",
      adjusted_plan: [{ step: "Refaire un test auprès de 100 inconnus ciblés", deadline: "J+14", success_metric: "10 précommandes" }],
    },
  };
}

export type { Usage } from "./engine";
