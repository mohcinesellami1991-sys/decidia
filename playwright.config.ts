import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env.E2E_PORT ?? 3111);

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  fullyParallel: true,
  reporter: [["list"]],
  use: {
    baseURL: `http://localhost:${port}`,
    // Animations d'entrée désactivées : les mesures de contraste se font sur l'état final (et ce chemin « mouvement réduit » est ainsi testé).
    contextOptions: { reducedMotion: "reduce" },
    launchOptions: process.env.PW_CHROMIUM_PATH ? { executablePath: process.env.PW_CHROMIUM_PATH } : {},
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: `npx next start -p ${port}`,
    url: `http://localhost:${port}`,
    reuseExistingServer: false,
    env: { ENABLE_PREVIEW: "1" },
    timeout: 60_000,
  },
});
