import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/e2e", fullyParallel: false, workers: 1, timeout: 40_000,
  outputDir: "test-results/e2e", reporter: [["list"], ["json", { outputFile: "test-results/e2e-results.json" }]],
  use: { baseURL: "http://127.0.0.1:5174", channel: process.env.E2E_BROWSER_CHANNEL || "msedge", trace: "retain-on-failure", screenshot: "only-on-failure" },
  webServer: { command: "npm run dev -- --host 127.0.0.1 --port 5174 --strictPort", url: "http://127.0.0.1:5174", reuseExistingServer: false, env: { VITE_SUPABASE_URL: "https://fixture.supabase.co", VITE_SUPABASE_PUBLISHABLE_KEY: "fixture-public-key", VITE_AI_BFF_URL: "http://127.0.0.1:5174" } },
});
