import { expect, test } from "@playwright/test";

const envelope = (data: unknown) => ({ data, meta: {} });

test("public deletion help and privacy route render without an account session", async ({ page }, testInfo) => {
  await page.route("**/api/users", (route) => route.fulfill({ json: [] }));
  let privateReads = 0;
  await page.route("**/api/v1/**", (route) => { privateReads++; return route.abort(); });
  await page.goto("/account-deletion");
  await expect(page.getByRole("heading", { name: "Request account deletion" })).toBeVisible();
  const email = page.getByRole("link", { name: "Email privacy@table-us.com" });
  await expect(email).toHaveAttribute("href", "mailto:privacy@table-us.com");
  await expect(page.getByText("If an email app does not open, copy this address:", { exact: false })).toBeVisible();
  await expect(page.getByText("We aim to acknowledge your email within two business days.", { exact: false })).toBeVisible();
  await expect(page.getByText("An email acknowledgment does not mean deletion is complete.", { exact: false })).toBeVisible();
  expect(new URL(page.url()).pathname).toBe("/account-deletion");
  await page.screenshot({ path: testInfo.outputPath("public-account-deletion-desktop.png"), fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: testInfo.outputPath("public-account-deletion-mobile.png"), fullPage: true });
  await page.getByRole("link", { name: "Read the privacy notice" }).click();
  await expect(page.getByRole("link", { name: "How to request account deletion without signing in" })).toBeVisible();
  expect(privateReads).toBe(0);
});

test("pending recovery can open deletion help and return to status", async ({ page }) => {
  const owner = "demo-organizer";
  await page.route("**/api/users", (route) => route.fulfill({ json: [{ id: owner, name: "Sam", avatar: "/icon.svg" }] }));
  await page.route("**/api/friends/**", (route) => route.fulfill({ json: [] }));
  await page.route("**/api/v1/**", (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    const json = (data: unknown) => route.fulfill({ json: envelope(data) });
    if (path === "/api/v1/me") return json({ id: owner, display_name: "Sam", share_taste: false });
    if (path === "/api/v1/me/account-control") return json({ can_delete: true, blockers: [], organized_plan_count: 0, full_deletion_available: true });
    if (path === "/api/v1/me/organized-plans") return json([]);
    if (path === "/api/v1/me/deletion") return json({ status: "pending", requested_at: "2026-09-24T12:00:00Z", completed_at: null, next_retry_at: null, last_error_code: null, needs_attention: false });
    return route.fulfill({ status: 404, json: { error: { code: "http_404", message: "Not found" }, request_id: "test" } });
  });
  await page.goto("/account");
  await expect(page.getByRole("button", { name: "Delete my account" })).toBeVisible();
  await page.getByLabel("Type DELETE to confirm account deletion").fill("DELETE");
  await page.getByRole("button", { name: "Delete my account" }).click();
  await expect(page.getByRole("heading", { name: "Account deletion in progress" })).toBeVisible();
  await page.getByRole("link", { name: "Account deletion help and privacy contact" }).click();
  await expect(page.getByRole("heading", { name: "Request account deletion" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Email privacy@table-us.com" })).toHaveAttribute("href", "mailto:privacy@table-us.com");
  await page.getByRole("link", { name: "Open Account and data" }).click();
  await expect(page.getByRole("heading", { name: "Account deletion in progress" })).toBeVisible();
});
