import { expect, test, type Page } from "@playwright/test";

const planId = "123e4567-e89b-42d3-a456-426614174000";
const token = "private-share-token-with-enough-length";
const envelope = (data: unknown) => ({ data, meta: {} });
const failure = (status: number) => ({ status, json: {
  error: { code: `http_${status}`, message: "Synthetic failure" }, request_id: "local-test",
} });

async function localOnly(page: Page) {
  await page.route("**/*", (route) => {
    const url = new URL(route.request().url());
    if (url.hostname === "127.0.0.1" && (url.port === "3402" || url.port === "3403")) {
      return route.continue();
    }
    return route.abort();
  });
  await page.route("http://127.0.0.1:3403/**", (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path === "/api/users") return route.fulfill({ json: [{ id: "demo-organizer", name: "Sam", avatar: "/icon.svg" }] });
    if (path.startsWith("/api/friends/")) return route.fulfill({ json: [] });
    if (path === `/api/v1/plans/${planId}`) return route.fulfill({ json: envelope({
      id: planId, title: "Shared dinner", organizer_id: "demo-organizer", status: "collecting",
      location_label: "Chicago", latitude: null, longitude: null,
      participants: [], candidates: [], my_vote: null, finalized_candidate_id: null,
      viewer_is_organizer: false,
      created_at: "2026-09-25T12:00:00Z", updated_at: "2026-09-25T12:00:00Z",
    }) });
    return route.fulfill(failure(404));
  });
}

test("fragment is scrubbed before an explicit join", async ({ page }) => {
  await localOnly(page);
  let posts = 0;
  await page.route(`http://127.0.0.1:3403/api/v1/plans/${planId}/join`, (route) => {
    posts += 1;
    expect(JSON.parse(route.request().postData() ?? "{}")).toEqual({ share_token: token });
    return route.fulfill({ json: envelope({ id: planId }) });
  });
  const response = await page.goto(`/join/${planId}#token=${token}`);
  expect(response?.headers()["referrer-policy"]).toBe("no-referrer");
  expect(response?.headers()["content-security-policy"]).toContain("frame-ancestors 'none'");
  expect(response?.headers()["x-frame-options"]).toBe("DENY");
  // Next dev overrides configured Cache-Control; production is checked after build.
  expect(response?.headers()["cache-control"]).toBe("no-cache, must-revalidate");
  await expect(page).toHaveURL(new RegExp(`/join/${planId}$`));
  await expect(page.getByRole("button", { name: "Join plan" })).toBeVisible();
  const browserState = await page.evaluate(() => ({
    history: JSON.stringify(window.history.state),
    local: JSON.stringify(window.localStorage),
    session: JSON.stringify(window.sessionStorage),
  }));
  expect(JSON.stringify(browserState)).not.toContain(token);
  expect(posts).toBe(0);
  await page.getByRole("button", { name: "Join plan" }).click();
  await expect(page).toHaveURL(new RegExp(`/plans/${planId}$`));
  expect(posts).toBe(1);
});

test("cancel clears the pending flow across client history", async ({ page }) => {
  await localOnly(page);
  await page.goto(`/join/${planId}`);
  await expect(page.getByText("Reopen your private link.", { exact: false })).toBeVisible();
  await page.evaluate((secret) => { window.location.hash = `token=${secret}`; }, token);
  await expect(page.getByRole("button", { name: "Join plan" })).toBeVisible();
  await page.getByRole("button", { name: "Cancel" }).click();
  await expect(page).toHaveURL(/\/plans$/);
  await page.goBack();
  await expect(page.getByText("Reopen your private link.", { exact: false })).toBeVisible();
  await expect(page.getByRole("button", { name: "Join plan" })).toHaveCount(0);
});

test("unknown join result checks membership before explicit retry with the same key", async ({ page }) => {
  await localOnly(page);
  let posts = 0;
  let revisionReads = 0;
  let approvalReads = 0;
  const keys: string[] = [];
  await page.route(`http://127.0.0.1:3403/api/v1/plans/${planId}/join`, (route) => {
    posts += 1;
    keys.push(route.request().headers()["idempotency-key"] ?? "");
    expect(JSON.parse(route.request().postData() ?? "{}")).toEqual({ share_token: token });
    return posts === 1 ? route.fulfill(failure(503)) : route.fulfill({ json: envelope({ id: planId }) });
  });
  await page.route(`http://127.0.0.1:3403/api/v1/plans/${planId}/revision`, (route) => {
    revisionReads += 1;
    return route.fulfill(failure(403));
  });
  await page.route("http://127.0.0.1:3403/api/v1/me", (route) => {
    approvalReads += 1;
    return route.fulfill({ json: envelope({ id: "demo-organizer", display_name: "Sam" }) });
  });
  await page.goto(`/join/${planId}#token=${token}`);
  await page.getByRole("button", { name: "Join plan" }).click();
  await expect(page.getByRole("button", { name: "Check whether I joined" })).toBeVisible();
  expect(posts).toBe(1);
  await page.getByRole("button", { name: "Check whether I joined" }).click();
  await expect(page.getByRole("button", { name: "Join plan" })).toBeVisible();
  expect({ posts, revisionReads, approvalReads }).toEqual({ posts: 1, revisionReads: 1, approvalReads: 1 });
  await page.getByRole("button", { name: "Join plan" }).click();
  await expect(page).toHaveURL(new RegExp(`/plans/${planId}$`));
  expect(posts).toBe(2);
  expect(keys[0]).toBeTruthy();
  expect(keys[1]).toBe(keys[0]);
});

test("same-page replacement and malformed arrival cannot reuse the old link", async ({ page }) => {
  await localOnly(page);
  await page.goto(`/join/${planId}#token=${token}`);
  await expect(page.getByRole("button", { name: "Join plan" })).toBeVisible();
  await page.evaluate(() => { window.location.hash = "token=another-private-token-with-enough-length"; });
  await expect(page).toHaveURL(new RegExp(`/join/${planId}$`));
  await expect(page.getByRole("button", { name: "Join plan" })).toBeVisible();
  await page.evaluate(() => { window.location.hash = "token=short"; });
  await expect(page.getByText("This private link is invalid.", { exact: false })).toBeVisible();
  await expect(page.getByRole("button", { name: "Join plan" })).toHaveCount(0);
});
