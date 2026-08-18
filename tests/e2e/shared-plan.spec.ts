import { expect, test } from "@playwright/test";

test("organizer creates a persistent plan", async ({ page }) => {
  await page.goto("/plans");
  await page.getByPlaceholder("Friday dinner").fill("Playwright dinner");
  await page.getByRole("button", { name: "Create plan" }).click();
  await expect(page.getByText("Playwright dinner")).toBeVisible();
  await expect(page.getByText("Private join link")).toBeVisible();
});

test("publishes release disclosures and verified-link manifests", async ({ page }) => {
  await page.goto("/privacy");
  await expect(page.getByRole("heading", { name: "TableUs closed-beta privacy notice" })).toBeVisible();
  await expect(page.getByText("Effective August 17, 2026.")).toBeVisible();

  const apple = await page.request.get("/.well-known/apple-app-site-association");
  expect(apple.status()).toBe(200);
  expect((await apple.json()).applinks.details[0].appIDs).toContain(
    "ABCDE12345.com.tableus.app",
  );

  const android = await page.request.get("/.well-known/assetlinks.json");
  expect(android.status()).toBe(200);
  expect((await android.json())[0].target.package_name).toBe("com.tableus.app");
});

test("completes the deterministic two-person voting lifecycle", async ({ page }) => {
  test.skip(Boolean(process.env.PLAYWRIGHT_BASE_URL), "Local deterministic evidence only");
  const api = "http://127.0.0.1:8000";
  const organizer = { "X-Demo-User-ID": "demo-organizer" };
  const guest = { "X-Demo-User-ID": "demo-guest" };

  const createdResponse = await page.request.post(`${api}/api/v1/plans`, {
    headers: organizer,
    data: {
      title: "Release evidence dinner",
      location_label: "Boston, MA",
      latitude: 42.3601,
      longitude: -71.0589,
    },
  });
  expect(createdResponse.ok()).toBeTruthy();
  const created = (await createdResponse.json()).data;
  const planId = created.plan.id as string;
  const oldToken = created.share_token as string;

  expect((await page.request.post(`${api}/api/v1/plans/${planId}/join`, {
    headers: guest,
    data: { share_token: oldToken },
  })).ok()).toBeTruthy();

  const recommendations = await page.request.post(
    `${api}/api/v1/plans/${planId}/recommendations`,
    { headers: organizer, data: { query: "group-friendly dinner" } },
  );
  const candidates = (await recommendations.json()).data.candidates as Array<{ id: string }>;
  expect(candidates).toHaveLength(4);
  const ranking = candidates.slice(0, 3).map((candidate) => candidate.id);

  for (const headers of [organizer, guest]) {
    expect((await page.request.put(`${api}/api/v1/plans/${planId}/vote`, {
      headers,
      data: { ranking },
    })).ok()).toBeTruthy();
  }

  const forbidden = await page.request.post(`${api}/api/v1/plans/${planId}/finalize`, {
    headers: guest,
    data: {},
  });
  expect(forbidden.status()).toBe(403);
  expect((await page.request.post(`${api}/api/v1/plans/${planId}/finalize`, {
    headers: organizer,
    data: {},
  })).ok()).toBeTruthy();

  await page.goto(`/plans/${planId}`);
  await expect(page.getByText("finalized", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Reopen voting" }).click();
  await expect(page.getByText("voting", { exact: true })).toBeVisible();

  expect((await page.request.post(`${api}/api/v1/plans/${planId}/share-token/rotate`, {
    headers: organizer,
    data: {},
  })).ok()).toBeTruthy();
  const expiredLink = await page.request.post(`${api}/api/v1/plans/${planId}/join`, {
    headers: guest,
    data: { share_token: oldToken },
  });
  expect(expiredLink.status()).toBe(404);
});
