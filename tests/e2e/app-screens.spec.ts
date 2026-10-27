import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Les écrans connectés sont rendus avec des données fictives par le banc d'essai /preview (ENABLE_PREVIEW=1).
const SCREENS: [string, RegExp | string][] = [
  ["journal", "Journal de décisions"],
  ["journal-empty", "Aucune décision pour l'instant"],
  ["settings-free", "Plan gratuit"],
  ["settings-pro", "Tu es Pro"],
  ["followup", "Ta décision a-t-elle marché ?"],
  ["followup-done", "Leçon apprise"],
  ["questions", "Quel est ton objectif chiffré"],
  ["questions-2", "Quelles sont tes contraintes"],
  ["progress-early", "Analyse en cours"],
  ["progress-mid", "Déjà identifié"],
  ["report-anon", "Garde ce rapport."],
  ["report-free", "Ta décision suivante mérite la même rigueur."],
  ["report-pro", "Exporter en PDF"],
  ["walls", "Garde ce rapport."],
  ["login", "Continuer avec Google"],
  ["new", "Analyser ma décision"],
  ["states", "Quelque chose a coincé."],
];

test.describe("écrans de l'application (données fictives)", () => {
  for (const [screen, text] of SCREENS) {
    test(`${screen} : contenu, pas de débordement, accessibilité (sombre et clair)`, async ({ page }) => {
      await page.goto(`/preview/${screen}`);
      await expect(page.getByText(text).first()).toBeVisible();
      for (const theme of ["dark", "light"]) {
        await page.evaluate((t) => document.documentElement.setAttribute("data-theme", t), theme);
        await page.waitForTimeout(350);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
        expect(overflow, `${screen} ${theme}`).toBe(false);
        const results = await new AxeBuilder({ page: page as never }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
        expect(results.violations.map((v) => `${theme} ${v.id}: ${v.nodes.map((n) => n.target.join(" ")).slice(0, 2).join(" | ")}`)).toEqual([]);
      }
    });
  }

  test("les questions se parcourent au clavier et l'exemple remplit la réponse", async ({ page }) => {
    await page.goto("/preview/questions");
    await page.getByRole("button", { name: /Utiliser cet exemple/ }).click();
    await expect(page.getByLabel(/objectif chiffré/)).toHaveValue("30 clients payants");
    await page.getByLabel(/objectif chiffré/).press("Enter");
    await expect(page.getByText("Question 2 sur 3")).toBeVisible();
    await page.getByRole("button", { name: /Question précédente/ }).click();
    await expect(page.getByText("Question 1 sur 3")).toBeVisible();
  });

  test("le sommaire du rapport mène aux sections", async ({ page }) => {
    await page.goto("/preview/report-pro");
    await page.getByRole("navigation", { name: "Sommaire du rapport" }).getByRole("link", { name: "Risques" }).click();
    await expect(page.locator("#risks")).toBeInViewport();
  });

  test("les cases du plan d'action se cochent", async ({ page }) => {
    await page.goto("/preview/report-pro");
    const box = page.getByRole("checkbox").first();
    await box.check();
    await expect(box).toBeChecked();
  });
});
