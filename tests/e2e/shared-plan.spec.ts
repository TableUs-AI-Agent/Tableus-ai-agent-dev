import { expect, test, type Page } from "@playwright/test";

const api = "http://127.0.0.1:8000";

async function signInAs(page: Page, name: "Demo Organizer" | "Demo Guest") {
  await page.goto("/signin");
  await page.getByRole("button", { name: `Continue as ${name}` }).click();
  await expect(page).toHaveURL(/\/plans$/);
}

test("the landing page explains the product and starts a plan", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Dinner, decided." })).toBeVisible();
  await page.getByRole("link", { name: "Start a plan" }).first().click();
  await expect(page).toHaveURL(/\/signin\?next=%2Fplans/);
});

test("two people pick a restaurant together", async ({ page }) => {
  await signInAs(page, "Demo Organizer");
  await page.getByLabel("What's the occasion?").fill("Playwright dinner");
  await page.getByLabel("Where should we look?").fill("Boston, MA");
  await page.getByRole("button", { name: "Find this place" }).click();
  await page.getByRole("button", { name: "Start plan" }).click();
  await expect(page.getByRole("heading", { name: "Playwright dinner" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Send this link to the group" })).toBeVisible();

  const planId = page.url().split("/plans/")[1];
  const link = await page.getByLabel("Plan link").inputValue();
  const token = new URL(link).searchParams.get("token");
  expect(token).toBeTruthy();

  // The guest joins and adds wishes through the API to keep this test to one browser.
  const asGuest = { headers: { "X-Demo-User-ID": "demo-guest" } };
  expect((await page.request.post(`${api}/api/v1/plans/${planId}/join`, { ...asGuest, data: { share_token: token } })).ok()).toBeTruthy();
  expect((await page.request.patch(`${api}/api/v1/plans/${planId}/constraints`, { ...asGuest, data: { dietary_notes: ["Vegetarian"] } })).ok()).toBeTruthy();

  await page.reload();
  await page.getByRole("button", { name: "Italian" }).click();
  await page.getByRole("button", { name: "Save my wishes" }).click();
  await expect(page.getByText("Saved.")).toBeVisible();
  await page.getByRole("button", { name: "Get four picks" }).click();
  await expect(page.getByRole("heading", { name: "Rank your top three" })).toBeVisible();

  const picks = page.locator("button[aria-pressed]").filter({ hasText: "stars" });
  await expect(picks).toHaveCount(4);
  for (const index of [0, 1, 2]) await picks.nth(index).click();
  await page.getByRole("button", { name: "Save my vote" }).click();
  await expect(page.getByText("Vote saved.")).toBeVisible();

  await page.getByRole("button", { name: /^Go with / }).click();
  await expect(page.getByRole("heading", { name: "You're going to" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Open in Google Maps" })).toBeVisible();
});

test("publishes legal pages and verified-link manifests", async ({ page }) => {
  await page.goto("/privacy");
  await expect(page.getByRole("heading", { name: "Privacy" })).toBeVisible();

  const apple = await page.request.get("/.well-known/apple-app-site-association");
  expect(apple.status()).toBe(200);
  expect((await apple.json()).applinks.details[0].appIDs).toContain("ABCDE12345.com.tableus.app");
  const android = await page.request.get("/.well-known/assetlinks.json");
  expect((await android.json())[0].target.package_name).toBe("com.tableus.app");
});
