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
  await ask(page); await expect(page.getByText("There are no arrivals today.")).toBeVisible();
  await expect(page.getByText(traceId, { exact: true })).not.toBeVisible();
  await page.getByText("Response details").click();
  await expect(page.getByText(traceId, { exact: true })).toBeVisible();
  await page.screenshot({ path: "output/playwright/feature05-success.png", fullPage: true });
  await page.getByRole("button", { name: "Helpful", exact: true }).click(); await expect(page.getByText("Feedback saved.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Helpful", exact: true })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Not helpful", exact: true })).toBeDisabled();
});
test("empty result preserves ordinary booking filters", async ({ page }) => {
  await page.route("**/api/ai/admin", route => route.fulfill({ headers, json: { text: "", steps: [] } }));
  await ask(page); await expect(page.getByText("No AI explanation was provided.")).toBeVisible();
  await page.screenshot({ path: "output/playwright/feature05-empty.png", fullPage: true });
  await page.getByRole("link", { name: "Continue with Bookings" }).click(); await page.getByRole("button", { name: "Unconfirmed", exact: true }).click(); await expect(page).toHaveURL(/status=unconfirmed/);
});
for (const status of [504, 403]) test(`@security HTTP ${status}, trace, retry and booking navigation`, async ({ page }) => {
  let calls = 0;
  await page.route("**/api/ai/admin", route => { calls++; return calls === 1 ? route.fulfill({ status, headers: { "x-ai-trace-id": traceId }, json: { error: status === 403 ? "Access denied." : "Model timed out." } }) : route.fulfill({ headers, json: { text: "Retry completed.", steps: [] } }); });
  await ask(page); await expect(page.getByRole("alert").first()).toBeVisible();
  await page.getByText("Response details").click();
  await expect(page.getByText(traceId, { exact: true })).toBeVisible(); await expect(page.getByRole("button", { name: "Helpful", exact: true })).toHaveCount(0);
  await page.screenshot({ path: `output/playwright/feature05-${status === 504 ? "timeout" : "denied"}.png`, fullPage: true });
  await page.getByRole("button", { name: "Ask Copilot" }).click(); await expect(page.getByText("Retry completed.")).toBeVisible(); await page.getByRole("link", { name: "Continue with Bookings" }).click(); await expect(page.getByRole("heading", { name: "All bookings" })).toBeVisible();
});
test("stops a pending request and re-enables input", async ({ page }) => {
  let release!: () => void; const pending = new Promise<void>(resolve => { release = resolve; });
  await page.route("**/api/ai/admin", async route => { await pending; await route.abort().catch(() => {}); });
  await ask(page); await page.getByRole("button", { name: "Stop response" }).click(); await expect(page.getByLabel("Ask an operational question")).toBeEnabled(); release();
});

function structuredResponse(status: "completed" | "failed" = "completed") {
  return {
    text: "## Monthly summary\n\n**Review the pending note.**",
    steps: [{
      stepNumber: 0,
      status,
      text: "",
      toolCalls: [
        { toolName: "getBookingMetrics", input: {} },
        { toolName: "addBookingInternalNote", input: { bookingId: 699, note: "[redacted]" } },
      ],
      toolResults: [
        { toolName: "getBookingMetrics", output: { kind: "booking-metrics", metrics: { totalBookings: 0, totalRevenue: 0, extrasRevenue: 0, paidBookings: 0, unpaidBookings: 0, byStatus: {}, currency: "USD", dateBasis: "created_at", revenueBasis: "totalPrice", includesCancelled: true }, facts: [], sourceIds: ["metrics:month"], truncated: false } },
        { toolName: "addBookingInternalNote", output: { kind: "internal-note-approval", approvalId: "00000000-0000-4000-8000-000000000699", bookingId: 699, note: "Follow up on payment before check-in.", status: "pending", facts: [], sourceIds: ["booking:699"], truncated: false } },
      ],
    }],
  };
}

for (const viewport of [{ name: "desktop", width: 1280, height: 900 }, { name: "mobile", width: 390, height: 844 }]) {
  test(`structured drawer is ordered, accessible, and overflow-free on ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.route("**/api/ai/admin", route => route.fulfill({ headers, json: structuredResponse(viewport.name === "mobile" ? "failed" : "completed") }));
    await ask(page);

    const dialog = page.getByRole("dialog", { name: "Operations Copilot" });
    const approval = page.getByText("Internal note · Booking #699");
    const metrics = page.getByRole("heading", { name: "Summary metrics" });
    const explanation = page.getByText("AI explanation");
    const activity = page.getByText("Data activity · 2 tools");
    await expect(approval).toBeVisible();
    await expect(metrics).toBeVisible();
    await expect(page.getByText("Follow up on payment before check-in.")).toBeVisible();
    await expect(page.getByText("Monthly summary")).not.toBeVisible();

    const ordered = await page.evaluate(() => {
      const labels = ["Internal note · Booking #699", "Summary metrics", "AI explanation", "Data activity · 2 tools", "Continue with Bookings"];
      const nodes = labels.map(label => Array.from(document.querySelectorAll("body *")).find(node => node.textContent?.trim() === label));
      if (nodes.some((node) => !node)) return false;
      return nodes.slice(1).every((node, index) => Boolean(nodes[index]!.compareDocumentPosition(node!) & Node.DOCUMENT_POSITION_FOLLOWING));
    });
    expect(ordered).toBe(true);

    const activityDetails = activity.locator("xpath=ancestor::details");
    if (viewport.name === "mobile") await expect(activityDetails).toHaveAttribute("open", "");
    else await expect(activityDetails).not.toHaveAttribute("open", "");

    const noHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);
    expect(noHorizontalOverflow).toBe(true);
    const drawerNoHorizontalOverflow = await dialog.evaluate(element => element.scrollWidth <= element.clientWidth);
    expect(drawerNoHorizontalOverflow).toBe(true);

    const close = page.getByRole("button", { name: "Close operations copilot" });
    const closeBox = await close.boundingBox();
    expect(closeBox?.width).toBeGreaterThanOrEqual(44);
    expect(closeBox?.height).toBeGreaterThanOrEqual(44);
    await page.getByLabel("Ask an operational question").focus();
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(page.getByRole("button", { name: /Operations Copilot/ })).toBeFocused();
  });
}
