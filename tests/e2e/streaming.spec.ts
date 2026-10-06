import { test, expect, type Page } from "@playwright/test";
import { createStreamFixture } from "./stream-server";

let stream: Awaited<ReturnType<typeof createStreamFixture>>;
test.beforeEach(async ({ page }) => {
  stream = await createStreamFixture();
  const user = { id: "00000000-0000-4000-8000-000000000001", role: "authenticated", app_metadata: { role: "staff" }, user_metadata: { fullName: "Fixture Staff" }, email: "fixture@example.invalid" };
  await page.addInitScript(({ user }) => localStorage.setItem("sb-fixture-auth-token", JSON.stringify({ access_token: "fixture-token", refresh_token: "fixture-refresh", expires_at: 4_000_000_000, token_type: "bearer", user })), { user });
  await page.route("https://fixture.supabase.co/**", (route) => route.fulfill({ headers: { "content-range": "0-0/0" }, json: route.request().url().includes("/auth/v1/user") ? user : [] }));
  await page.route("**/api/ai/admin", (route) => {
    expect(route.request().headers().accept).toBe("text/event-stream");
    return route.continue({ url: stream.url });
  });
});
test.afterEach(async () => { await stream.close(); });

async function ask(page: Page) {
  await page.goto("/bookings");
  await page.getByRole("button", { name: /Operations Copilot/ }).click();
  await page.getByLabel("Ask an operational question").fill("Show arrivals");
  await page.getByRole("button", { name: "Ask Copilot" }).click();
}
async function partial() {
  await stream.write({ type: "start", messageId: "fixture-answer" }, { type: "start-step" }, { type: "tool-input-start", toolCallId: "arrivals", toolName: "getArrivals" });
}
async function cardAndText() {
  await stream.write({ type: "tool-input-available", toolCallId: "arrivals", toolName: "getArrivals", input: {} }, { type: "tool-output-available", toolCallId: "arrivals", output: { kind: "arrivals", arrivals: [], facts: [], sourceIds: [], truncated: false } }, { type: "finish-step" }, { type: "start-step" }, { type: "text-start", id: "text" }, { type: "text-delta", id: "text", delta: "Arrivals checked. Reviewing booking risks." }, { type: "tool-input-start", toolCallId: "risks", toolName: "getBookingRisks" });
}

for (const viewport of [{ name: "desktop", width: 1280, height: 900 }, { name: "mobile", width: 390, height: 844 }]) {
  test(`real streaming cards and text survive Stop on ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await ask(page); await partial();
    await expect(page.getByText("Arrival lookup · running")).toBeVisible();
    await cardAndText();
    await expect(page.getByText("No matching arrivals were found.")).toBeVisible();
    await expect(page.getByText("Arrivals checked. Reviewing booking risks.")).toBeVisible();
    await expect(page.getByText("Booking risk review · running")).toBeVisible();
    await page.screenshot({ path: `output/playwright/dual-streaming-${viewport.name}.png`, fullPage: true });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
    await page.getByRole("button", { name: "Stop response" }).click();
    await expect(page.getByText("Booking risk review · interrupted")).toBeVisible();
    await expect(page.getByText("Arrivals checked. Reviewing booking risks.")).toBeVisible();
    await expect(page.getByLabel("Ask an operational question")).toBeEnabled();
    await stream.disconnected;
  });
}

test("network loss preserves cards and text and reports incomplete results", async ({ page }) => {
  await ask(page); await partial(); await cardAndText();
  await expect(page.getByText("Arrivals checked. Reviewing booking risks.")).toBeVisible();
  await stream.disconnect();
  await expect(page.getByRole("alert").first()).toContainText("Received results are kept");
  await expect(page.getByText("No matching arrivals were found.")).toBeVisible();
  await expect(page.getByText("Arrivals checked. Reviewing booking risks.")).toBeVisible();
  await expect(page.getByText("Booking risk review · failed")).toBeVisible();
});

test("a streamed note needs explicit approval after generation finishes", async ({ page }) => {
  let decisions = 0;
  let release!: () => void;
  const pending = new Promise<void>((resolve) => { release = resolve; });
  await page.route("**/api/ai/admin/approval", async (route) => { decisions += 1; await pending; return route.fulfill({ json: { approval: { id: "00000000-0000-4000-8000-000000000699", bookingId: 699, status: "executed", repeated: false } } }); });
  await ask(page);
  await stream.write({ type: "start-step" }, { type: "tool-input-available", toolCallId: "note", toolName: "addBookingInternalNote", input: { bookingId: 699 } }, { type: "tool-output-available", toolCallId: "note", output: { kind: "internal-note-approval", approvalId: "00000000-0000-4000-8000-000000000699", bookingId: 699, note: "Follow up on payment.", status: "pending", facts: [], sourceIds: [], truncated: false } });
  await expect(page.getByText("Follow up on payment.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Approve note" })).toBeDisabled();
  expect(decisions).toBe(0);
  await stream.write({ type: "finish-step" }, { type: "finish", finishReason: "tool-calls" });
  await stream.finish();
  await expect(page.getByRole("button", { name: "Approve note" })).toBeEnabled();
  await page.getByRole("button", { name: "Approve note" }).click();
  await expect(page.getByRole("button", { name: "Recording decision…" })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Approving…" })).toBeDisabled();
  await expect(page.getByLabel("Ask an operational question")).toBeDisabled();
  release();
  await expect(page.getByText("Decision: executed.")).toBeVisible();
  await expect(page.getByLabel("Ask an operational question")).toBeEnabled();
  expect(decisions).toBe(1);
});

test("streaming does not pull a reader down and Jump to latest resumes following", async ({ page }) => {
  await ask(page);
  await stream.write({ type: "start-step" }, { type: "text-start", id: "text" }, { type: "text-delta", id: "text", delta: Array.from({ length: 65 }, (_, index) => `Operational finding ${index}.`).join("\n\n") });
  const content = page.getByLabel("Operations response");
  await expect.poll(() => content.evaluate((element) => element.scrollHeight)).toBeGreaterThan(1500);
  await content.evaluate((element) => { element.scrollTop = 40; element.dispatchEvent(new Event("scroll")); });
  await stream.write({ type: "text-delta", id: "text", delta: "\n\nLatest streamed finding." });
  await expect(page.getByRole("button", { name: "Jump to latest" })).toBeVisible();
  expect(await content.evaluate((element) => element.scrollTop)).toBe(40);
  await page.getByRole("button", { name: "Jump to latest" }).click();
  await expect.poll(() => content.evaluate((element) => element.scrollHeight - element.scrollTop - element.clientHeight)).toBeLessThanOrEqual(80);
  await stream.write({ type: "text-end", id: "text" }, { type: "finish-step" }, { type: "finish", finishReason: "stop" });
  await stream.finish();
  await expect(page.getByLabel("Ask an operational question")).toBeEnabled();
});
