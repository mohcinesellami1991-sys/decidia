import { describe, expect, it } from "vitest";
import { finalizeReport, FollowupSchema, ProblemInput, QuestionsSchema } from "../../src/lib/ai/schemas";
import { SAMPLE_REPORT, SAMPLE_REPORT_EN } from "../../src/lib/sample-report";

const clone = <T,>(x: T): T => JSON.parse(JSON.stringify(x));

describe("finalizeReport", () => {
  it("accepte les rapports d'exemple FR et EN", () => {
    expect(finalizeReport(SAMPLE_REPORT).options).toHaveLength(3);
    expect(finalizeReport(SAMPLE_REPORT_EN).models_used.length).toBeGreaterThanOrEqual(3);
  });

  it("borne les scores de confiance entre 0 et 100", () => {
    const r = clone(SAMPLE_REPORT);
    r.options[0].confidence = 140;
    r.options[1].confidence = -12.4;
    r.recommendation.confidence = 87.6;
    const out = finalizeReport(r);
    expect(out.options[0].confidence).toBe(100);
    expect(out.options[1].confidence).toBe(0);
    expect(out.recommendation.confidence).toBe(88);
  });

  it("limite à 4 options et 5 modèles", () => {
    const r = clone(SAMPLE_REPORT);
    r.options = [...r.options, ...r.options];
    r.models_used = [...r.models_used, ...r.models_used];
    const out = finalizeReport(r);
    expect(out.options).toHaveLength(4);
    expect(out.models_used).toHaveLength(5);
  });

  it("rejette un rapport avec moins de 2 options, moins de 3 modèles ou sans plan", () => {
    const a = clone(SAMPLE_REPORT); a.options = a.options.slice(0, 1);
    const b = clone(SAMPLE_REPORT); b.models_used = b.models_used.slice(0, 2);
    const c = clone(SAMPLE_REPORT); c.action_plan = [];
    expect(() => finalizeReport(a)).toThrow();
    expect(() => finalizeReport(b)).toThrow();
    expect(() => finalizeReport(c)).toThrow();
  });

  it("rejette un JSON qui ne respecte pas le schéma", () => {
    const r = clone(SAMPLE_REPORT) as unknown as Record<string, unknown>;
    delete r.devils_advocate;
    expect(() => finalizeReport(r)).toThrow();
    expect(() => finalizeReport({ summary: "x" })).toThrow();
    const bad = clone(SAMPLE_REPORT);
    (bad.risks[0] as { probability: string }).probability = "énorme";
    expect(() => finalizeReport(bad)).toThrow();
  });
});

describe("autres schémas", () => {
  it("valide la saisie du problème (20 à 4000 caractères)", () => {
    expect(ProblemInput.safeParse({ problem: "trop court" }).success).toBe(false);
    expect(ProblemInput.safeParse({ problem: "x".repeat(4001) }).success).toBe(false);
    const ok = ProblemInput.parse({ problem: "Je veux quitter mon CDI pour lancer mon activité." });
    expect(ok.persona).toBe("entrepreneur");
    expect(ok.locale).toBe("fr");
  });

  it("refuse un profil inconnu", () => {
    expect(ProblemInput.safeParse({ problem: "x".repeat(30), persona: "admin" }).success).toBe(false);
  });

  it("accepte une réponse hors périmètre sans question", () => {
    const q = QuestionsSchema.parse({ in_scope: false, redirect_message: "Vois un médecin.", questions: [] });
    expect(q.in_scope).toBe(false);
  });

  it("valide un ajustement de suivi", () => {
    const f = FollowupSchema.parse({ gap_analysis: "a", lesson: "b", adjusted_plan: [{ step: "s", deadline: "J+7", success_metric: "m" }] });
    expect(f.adjusted_plan).toHaveLength(1);
  });
});
