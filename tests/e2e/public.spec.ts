import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("pages publiques", () => {
  test("la landing présente la promesse et mène à /new", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("L'IA qui ose");
    await page.getByRole("link", { name: /Analyser ma décision gratuitement/ }).click();
    await expect(page).toHaveURL(/\/new$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Quelle décision");
  });

  test("pas de défilement horizontal", async ({ page }) => {
    for (const path of ["/", "/exemple", "/new", "/login"]) {
      await page.goto(path);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
      expect(overflow, path).toBe(false);
    }
  });

  test("l'exemple de rapport affiche tous les blocs clés", async ({ page }) => {
    await page.goto("/exemple");
    await expect(page.getByRole("img", { name: /confiance 64/i })).toBeVisible();
    await expect(page.getByText("Avocat du diable").first()).toBeVisible();
    await expect(page.getByRole("heading", { name: "Grille Océan Bleu" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Plan d'action" })).toBeVisible();
    await expect(page.getByRole("table")).toBeVisible();
    // un modèle mental est cliquable et change le texte
    await page.getByRole("tab", { name: "Inversion" }).click();
    await expect(page.getByRole("tabpanel")).toContainText("échoue");
  });

  test("le plan d'action se coche", async ({ page }) => {
    await page.goto("/exemple");
    const box = page.getByRole("checkbox").first();
    await box.check();
    await expect(box).toBeChecked();
  });

  test("la FAQ s'ouvre et le thème bascule", async ({ page }) => {
    await page.goto("/");
    await page.getByText("Decidia remplace-t-il un expert ?").click();
    await expect(page.getByText("pas un conseil juridique, financier ou médical.").first()).toBeVisible();
    await page.getByRole("button", { name: "Changer de thème" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  });

  test("l'anglais est disponible", async ({ page }) => {
    await page.goto("/en");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("The AI that dares");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
  });

  test("/new exige 20 caractères et propose des exemples", async ({ page }) => {
    await page.goto("/new");
    const submit = page.getByRole("button", { name: "Analyser ma décision" });
    await expect(submit).toBeDisabled();
    await page.getByRole("button", { name: /recruter mon premier salarié/ }).click();
    await expect(submit).toBeEnabled();
  });

  test("les routes protégées affichent la page 404 sans configuration Supabase", async ({ page }) => {
    await page.goto("/journal");
    await expect(page.getByRole("heading", { name: "Cette page n'existe pas." })).toBeVisible();
  });
});

test.describe("accessibilité (axe, WCAG AA)", () => {
  for (const path of ["/", "/exemple", "/new", "/login"]) {
    for (const scheme of ["dark", "light"] as const) {
      test(`${path} (${scheme})`, async ({ page }) => {
        await page.goto(path);
        await page.evaluate((s) => document.documentElement.setAttribute("data-theme", s), scheme);
        await page.waitForTimeout(400);
        const results = await new AxeBuilder({ page: page as never }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
        expect(results.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
      });
    }
  }
});

test("l'exemple de rapport existe aussi en anglais", async ({ page }) => {
  await page.goto("/en/exemple");
  await expect(page.getByRole("heading", { name: "Blue Ocean grid" })).toBeVisible();
  await expect(page.getByText("Devil's advocate").first()).toBeVisible();
  await expect(page.getByRole("img", { name: /confidence 64/i })).toBeVisible();
});
