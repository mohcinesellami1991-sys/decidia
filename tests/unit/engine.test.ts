import { describe, expect, it } from "vitest";
import { computeUsage } from "../../src/lib/ai/engine";

describe("computeUsage", () => {
  it("calcule le coût d'une analyse typique sous 0,10 $", () => {
    // ~3 000 tokens en entrée et ~4 000 en sortie sur le modèle d'analyse (3 $ / 15 $ par million)
    const u = computeUsage("analysis", 3000, 4000);
    expect(u.costUsd).toBeCloseTo(0.069, 5);
    const q = computeUsage("light", 600, 300);
    expect(u.costUsd + q.costUsd).toBeLessThan(0.1);
  });

  it("renvoie 0 sans tokens", () => {
    expect(computeUsage("light").costUsd).toBe(0);
  });
});
