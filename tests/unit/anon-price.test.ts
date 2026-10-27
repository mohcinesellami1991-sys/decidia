import { describe, expect, it, vi, afterEach } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("tarifs de suivi de coût", () => {
  it("retombent sur les valeurs par défaut si la variable n'est pas numérique", async () => {
    vi.stubEnv("PRICE_ANALYSIS_IN", "abc");
    vi.stubEnv("PRICE_ANALYSIS_OUT", "");
    vi.stubEnv("PRICE_LIGHT_IN", "-4");
    const { computeUsage } = await import("../../src/lib/ai/engine");
    const u = computeUsage("analysis", 1_000_000, 1_000_000);
    expect(u.costUsd).toBe(18); // 3 $ + 15 $ par défaut
    expect(Number.isNaN(computeUsage("light", 10, 10).costUsd)).toBe(false);
  });

  it("acceptent des valeurs valides", async () => {
    vi.stubEnv("PRICE_ANALYSIS_IN", "2");
    vi.stubEnv("PRICE_ANALYSIS_OUT", "10");
    const { computeUsage } = await import("../../src/lib/ai/engine");
    expect(computeUsage("analysis", 1_000_000, 1_000_000).costUsd).toBe(12);
  });
});
