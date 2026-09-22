import { test, expect, type Page } from "@playwright/test";
// Actual app routes with HTTP auth, data and AI fixtures; no model or DB writes.
const traceId = "00000000-0000-4000-8000-000000000005";
const headers = { "x-ai-trace-id": traceId, "x-ai-feedback-token": "fixture-receipt" };
test.beforeEach(async ({ page }) => {
  const user = { id: "00000000-0000-4000-8000-000000000001", role: "authenticated", app_metadata: { role: "staff" }, user_metadata: { fullName: "Fixture Staff" }, email: "fixture@example.invalid" };
  await page.addInitScript(({ user }) => localStorage.setItem("sb-fixture-auth-token", JSON.stringify({ access_token: "fixture-token", refresh_token: "fixture-refresh", expires_at: 4_000_000_000, token_type: "bearer", user })), { user });
  await page.route("https://fixture.supabase.co/**", route => route.fulfill({ headers: { "content-range": "0-0/0" }, json: route.request().url().includes("/auth/v1/user") ? user : [] }));
});
async function ask(page: Page) { await page.goto("/bookings"); await page.getByRole("button", { name: /Operations Copilot/ }).click(); await page.getByLabel("Ask an operational question").fill("Show arrivals"); await page.getByRole("button", { name: "Ask Copilot" }).click(); }
test("successful answer, trace and feedback", async ({ page }) => {
  await page.route("**/api/ai/admin", route => route.fulfill({ headers, json: { text: "There are no arrivals today.", steps: [] } }));
  await page.route("**/api/ai/feedback", async route => { expect(route.request().postDataJSON().rating).toBe("helpful"); await route.fulfill({ json: { saved: true } }); });
  await ask(page); await expect(page.getByText("There are no arrivals today.")).toBeVisible(); await expect(page.getByText(traceId, { exact: true })).toBeVisible();
  await page.screenshot({ path: "output/playwright/feature05-success.png", fullPage: true });
  await page.getByRole("button", { name: "Helpful", exact: true }).click(); await expect(page.getByText("Feedback saved.")).toBeVisible();
});
test("empty result preserves ordinary booking filters", async ({ page }) => {
  await page.route("**/api/ai/admin", route => route.fulfill({ headers, json: { text: "", steps: [] } }));
  await ask(page); await expect(page.getByText("No operational data was returned.")).toBeVisible();
  await page.screenshot({ path: "output/playwright/feature05-empty.png", fullPage: true });
  await page.getByRole("link", { name: "Continue with Bookings" }).click(); await page.getByRole("button", { name: "Unconfirmed", exact: true }).click(); await expect(page).toHaveURL(/status=unconfirmed/);
});
for (const status of [504, 403]) test(`@security HTTP ${status}, trace, retry and booking navigation`, async ({ page }) => {
  let calls = 0;
  await page.route("**/api/ai/admin", route => { calls++; return calls === 1 ? route.fulfill({ status, headers: { "x-ai-trace-id": traceId }, json: { error: status === 403 ? "Access denied." : "Model timed out." } }) : route.fulfill({ headers, json: { text: "Retry completed.", steps: [] } }); });
  await ask(page); await expect(page.getByRole("alert").first()).toBeVisible(); await expect(page.getByText(traceId, { exact: true })).toBeVisible(); await expect(page.getByRole("button", { name: "Helpful", exact: true })).toHaveCount(0);
  await page.screenshot({ path: `output/playwright/feature05-${status === 504 ? "timeout" : "denied"}.png`, fullPage: true });
  await page.getByRole("button", { name: "Ask Copilot" }).click(); await expect(page.getByText("Retry completed.")).toBeVisible(); await page.getByRole("link", { name: "Continue with Bookings" }).click(); await expect(page.getByRole("heading", { name: "All bookings" })).toBeVisible();
});
test("stops a pending request and re-enables input", async ({ page }) => {
  let release!: () => void; const pending = new Promise<void>(resolve => { release = resolve; });
  await page.route("**/api/ai/admin", async route => { await pending; await route.abort().catch(() => {}); });
  await ask(page); await page.getByRole("button", { name: "Stop response" }).click(); await expect(page.getByLabel("Ask an operational question")).toBeEnabled(); release();
});
