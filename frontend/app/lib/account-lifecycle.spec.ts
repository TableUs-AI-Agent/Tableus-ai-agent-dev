import { expect, test } from "@playwright/test";

const owner = "demo-organizer";
const recipient = "demo-recipient";
const plan = {
  id: "11111111-1111-4111-8111-111111111111",
  title: "Shared dinner",
  organizer_id: owner,
  viewer_is_organizer: true,
  updated_at: "2026-09-24T12:00:00Z",
  participants: [
    { profile_id: owner, display_name: "Sam", is_organizer: true },
    { profile_id: recipient, display_name: "Maya", is_organizer: false },
  ],
};
const envelope = (data: unknown) => ({ data, meta: {} });

test("organizer transfers a shared plan and sees pending deletion recovery", async ({ page }) => {
  let organized = [plan];
  let deletion: "none" | "pending" = "none";
  await page.route("**/api/users", (route) => route.fulfill({ json: [{ id: owner, name: "Sam", avatar: "/icon.svg" }] }));
  await page.route("**/api/friends/**", (route) => route.fulfill({ json: [] }));
  await page.route("**/api/v1/**", async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    const json = (data: unknown, status = 200) => route.fulfill({ status, json: envelope(data) });
    if (path === "/api/v1/me" && request.method() === "GET") return json({ id: owner, display_name: "Sam", share_taste: false });
    if (path === "/api/v1/me/account-control") return json({ can_delete: organized.length === 0, blockers: organized.length ? ["organized_plans"] : [], organized_plan_count: organized.length, deletion_scope: "application_profile", supabase_auth_removal: "operator_required", full_deletion_available: true });
    if (path === "/api/v1/me/organized-plans") return json(organized);
    if (path.endsWith("/transfer-ownership")) {
      expect(JSON.parse(request.postData() ?? "{}")).toEqual({ recipient_profile_id: recipient });
      organized = [];
      return json({ ...plan, organizer_id: recipient, viewer_is_organizer: false });
    }
    if (path === "/api/v1/me/deletion" && request.method() === "POST") {
      expect(JSON.parse(request.postData() ?? "{}")).toEqual({ confirmation: "DELETE" });
      deletion = "pending";
    }
    if (path === "/api/v1/me/deletion") return json({ status: deletion, requested_at: "2026-09-24T12:00:00Z", completed_at: null, next_retry_at: null, last_error_code: null, needs_attention: false });
    if (path === "/api/v1/me/export") return json({ schema_version: "1" });
    return route.fulfill({ status: 404, json: { error: { code: "http_404", message: "Not found" }, request_id: "test" } });
  });
  await page.goto("/account");
  await expect(page.getByRole("heading", { name: "Plans you organize" })).toBeVisible();
  await expect(page.getByText("Shared plans remain, but your plan details and any recommendations based on your input are removed.", { exact: false })).toBeVisible();
  await expect(page.getByRole("button", { name: "Delete my account" })).toBeDisabled();
  await page.locator("body > main").evaluate((element) => { element.scrollTop = 0; });
  await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
  await page.screenshot({ path: "/private/tmp/tableus-account-overview.png" });
  await page.getByRole("heading", { name: "Shared dinner" }).scrollIntoViewIfNeeded();
  await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
  await page.screenshot({ path: "/private/tmp/tableus-account-plan-control.png" });
  await page.getByLabel("New organizer").selectOption(recipient);
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Transfer ownership" }).click();
  await expect(page.getByText("You do not organize any plans.")).toBeVisible({ timeout: 20_000 });
  await page.locator("body > main").evaluate((element) => { element.scrollTop = 0; });
  await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
  await page.screenshot({ path: "/private/tmp/tableus-account-managed.png", fullPage: true });
  await page.getByLabel("Type DELETE to confirm account deletion").fill("DELETE");
  await page.getByRole("button", { name: "Delete my account" }).click();
  await expect(page.getByRole("heading", { name: "Account deletion in progress" })).toBeVisible();
  await expect(page.getByText("Your TableUs profile has been removed.")).toBeVisible();
  await page.screenshot({ path: "/private/tmp/tableus-account-pending.png", fullPage: true });
});

test("unavailable full deletion stays disabled", async ({ page }) => {
  await page.route("**/api/users", (route) => route.fulfill({ json: [{ id: owner, name: "Sam", avatar: "/icon.svg" }] }));
  await page.route("**/api/friends/**", (route) => route.fulfill({ json: [] }));
  await page.route("**/api/v1/**", (route) => {
    const path = new URL(route.request().url()).pathname;
    const data = path === "/api/v1/me" ? { id: owner, display_name: "Sam", share_taste: false }
      : path === "/api/v1/me/account-control" ? { can_delete: true, blockers: [], organized_plan_count: 0, full_deletion_available: false }
      : [];
    return route.fulfill({ json: envelope(data) });
  });
  await page.goto("/account");
  await expect(page.getByText("Account deletion is not available in this beta environment.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Delete my account" })).toBeDisabled();
});

test("sole plan removal and lost deletion response restore pending status", async ({ page }) => {
  let organized = [{ ...plan, title: "Solo dinner", participants: [plan.participants[0]] }];
  let requestKey: string | null = null;
  await page.route("**/api/users", (route) => route.fulfill({ json: [{ id: owner, name: "Sam", avatar: "/icon.svg" }] }));
  await page.route("**/api/friends/**", (route) => route.fulfill({ json: [] }));
  await page.route("**/api/v1/**", (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    const json = (data: unknown) => route.fulfill({ json: envelope(data) });
    if (path === "/api/v1/me") return json({ id: owner, display_name: "Sam", share_taste: false });
    if (path === "/api/v1/me/account-control") return json({ can_delete: organized.length === 0, blockers: organized.length ? ["organized_plans"] : [], organized_plan_count: organized.length, full_deletion_available: true });
    if (path === "/api/v1/me/organized-plans") return json(organized);
    if (path === `/api/v1/plans/${plan.id}` && request.method() === "DELETE") {
      expect(JSON.parse(request.postData() ?? "{}")).toEqual({ confirmation: "DELETE" });
      organized = [];
      return json({ deleted: true });
    }
    if (path === "/api/v1/me/deletion" && request.method() === "POST") {
      requestKey = request.headers()["idempotency-key"];
      return route.abort("failed");
    }
    if (path === "/api/v1/me/deletion") return json({ status: "pending", requested_at: "2026-09-24T12:00:00Z", completed_at: null, next_retry_at: null, last_error_code: "retryable", needs_attention: false });
    return route.fulfill({ status: 404, json: { error: { code: "http_404", message: "Not found" }, request_id: "test" } });
  });
  await page.goto("/account");
  await page.getByLabel("Type DELETE to remove this plan").fill("DELETE");
  await page.getByRole("button", { name: "Remove sole plan" }).click();
  await expect(page.getByText("You do not organize any plans.")).toBeVisible();
  await page.getByLabel("Type DELETE to confirm account deletion").fill("DELETE");
  await page.getByRole("button", { name: "Delete my account" }).click();
  await expect(page.getByRole("heading", { name: "Account deletion in progress" })).toBeVisible();
  expect(requestKey).toBeTruthy();
  await expect(page.getByRole("button", { name: "Retry original request" })).toHaveCount(0);
});
