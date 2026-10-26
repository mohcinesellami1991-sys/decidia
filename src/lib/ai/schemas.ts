import { z } from "zod";

export const PERSONAS = ["entrepreneur", "individual", "manager"] as const;
export type Persona = (typeof PERSONAS)[number];

export const MENTAL_MODELS = [
  "Premiers principes",
  "Inversion",
  "Pensée de second ordre",
  "Coût d'opportunité",
  "Cercle de compétence",
  "Paris asymétriques",
  "Minimisation du regret",
  "Pareto",
  "Effet de levier",
  "La carte n'est pas le territoire",
  "Biais de confirmation",
  "Biais du survivant",
  "Rasoir de Hanlon",
] as const;

/* ---------- Étape A : questions de contexte ---------- */
export const QuestionsSchema = z.object({
  in_scope: z.boolean().describe("false si la demande relève d'un professionnel (médical, juridique grave…)"),
  redirect_message: z.string().describe("Si hors périmètre : renvoi bienveillant vers un professionnel. Sinon chaîne vide."),
  questions: z
    .array(z.object({ question: z.string(), example: z.string().describe("Exemple de réponse courte") }))
    .describe("2 à 3 questions ciblées maximum (contexte, contraintes, objectif)"),
});
export type Questions = z.infer<typeof QuestionsSchema>;

/* ---------- Étape B : rapport ---------- */
const level = z.enum(["low", "medium", "high"]);

export const ReportSchema = z.object({
  summary: z.string(),
  diagnosis: z.string(),
  models_used: z.array(z.object({ name: z.string(), insight: z.string() })),
  options: z.array(
    z.object({
      title: z.string(),
      pros: z.array(z.string()),
      cons: z.array(z.string()),
      confidence: z.number().describe("Score de confiance entre 0 et 100"),
      risks: z.array(z.string()),
    }),
  ),
  errc: z.object({
    eliminate: z.array(z.string()),
    reduce: z.array(z.string()),
    raise: z.array(z.string()),
    create: z.array(z.string()),
  }),
  devils_advocate: z.object({
    strongest_objection: z.string(),
    blind_spots: z.array(z.string()),
    verdict_change: z.string().describe("Ce qui changerait la recommandation"),
  }),
  recommendation: z.object({
    choice: z.string(),
    confidence: z.number().describe("0 à 100"),
    why: z.string(),
  }),
  action_plan: z.array(z.object({ step: z.string(), deadline: z.string(), success_metric: z.string() })),
  risks: z.array(
    z.object({ risk: z.string(), probability: level, impact: level, mitigation: z.string() }),
  ),
  followup_questions: z.array(z.string()),
});
export type Report = z.infer<typeof ReportSchema>;

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

/** Validation stricte après génération : bornes, nombres d'éléments. Lève une erreur si le rapport est inutilisable. */
export function finalizeReport(raw: unknown): Report {
  const r = ReportSchema.parse(raw);
  if (r.options.length < 2) throw new Error("Moins de 2 options");
  if (r.models_used.length < 3) throw new Error("Moins de 3 modèles mentaux");
  if (r.action_plan.length < 1) throw new Error("Plan d'action vide");
  return {
    ...r,
    options: r.options.slice(0, 4).map((o) => ({ ...o, confidence: clamp(o.confidence) })),
    models_used: r.models_used.slice(0, 5),
    recommendation: { ...r.recommendation, confidence: clamp(r.recommendation.confidence) },
  };
}

/* ---------- Étape C : suivi ---------- */
export const FollowupSchema = z.object({
  gap_analysis: z.string(),
  lesson: z.string(),
  adjusted_plan: z.array(z.object({ step: z.string(), deadline: z.string(), success_metric: z.string() })),
});
export type FollowupAdjustment = z.infer<typeof FollowupSchema>;

/* ---------- Entrées HTTP ---------- */
export const ProblemInput = z.object({
  problem: z.string().trim().min(20).max(4000),
  persona: z.enum(PERSONAS).default("entrepreneur"),
  locale: z.enum(["fr", "en"]).default("fr"),
});

export const AnswersInput = z.object({
  decisionId: z.string().uuid(),
  answers: z
    .array(z.object({ question: z.string().max(500), answer: z.string().max(1000) }))
    .max(3),
});
