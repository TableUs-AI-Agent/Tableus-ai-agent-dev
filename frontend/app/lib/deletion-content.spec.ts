import { expect, test, type Page } from "@playwright/test";

const planId = "123e4567-e89b-42d3-a456-426614174000";
const owner = "demo-organizer";
const revision = "2026-09-25T12:00:00Z";
const envelope = (data: unknown) => ({ data, meta: {} });

async function demoIdentity(page: Page) {
  await page.route("**/api/users", (route) => route.fulfill({ json: [{ id: owner, name: "Sam", avatar: "/icon.svg" }] }));
  await page.route("**/api/friends/**", (route) => route.fulfill({ json: [] }));
}

test("organizer replaces removed details before finding options", async ({ page }) => {
  let repaired = false;
  let providerCalls = 0;
  const plan = () => ({
    id: planId, title: repaired ? "Fresh dinner" : "Plan details needed",
    organizer_id: owner, viewer_is_organizer: true, status: "collecting",
    metadata_needs_replacement: !repaired,
    location_label: repaired ? "Chicago" : "Location needed",
    latitude: null, longitude: null,
    participants: [
      { profile_id: owner, display_name: "Sam", constraints: { notes: "Quiet" }, is_organizer: true },
      { profile_id: "demo-recipient", display_name: "Maya", constraints: { notes: "Patio" }, is_organizer: false },
    ],
    candidates: [], my_vote: null, finalized_candidate_id: null,
    created_at: revision, updated_at: repaired ? "2026-09-25T12:01:00Z" : revision,
  });
  await demoIdentity(page);
  await page.route("**/api/v1/**", (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    const json = (data: unknown) => route.fulfill({ json: envelope(data) });
    if (path === "/api/v1/me") return json({ id: owner, display_name: "Sam", share_taste: false });
    if (path === `/api/v1/plans/${planId}/revision`) return json({ updated_at: plan().updated_at });
    if (path === `/api/v1/plans/${planId}`) return json(plan());
    if (path === "/api/v1/locations/resolve") {
      expect(JSON.parse(request.postData() ?? "{}")).toEqual({ query: "Chicago" });
      return json({ place_id: "replacement-place", label: "Chicago", data_provider: "fixture" });
    }
    if (path === `/api/v1/plans/${planId}/metadata`) {
      expect(request.method()).toBe("PATCH");
      expect(JSON.parse(request.postData() ?? "{}")).toEqual({ title: "Fresh dinner", location_label: "Chicago", location_place_id: "replacement-place" });
      repaired = true;
      return json(plan());
    }
    if (path.endsWith("/recommendations")) providerCalls += 1;
    return route.fulfill({ status: 404, json: { error: { code: "http_404", message: "Not found" }, request_id: "test" } });
  });
  await page.goto(`/plans/${planId}`);
  await expect(page.getByRole("heading", { name: "Plan details changed" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Find four options" })).toHaveCount(0);
  await page.getByLabel("Replacement plan title").fill("Fresh dinner");
  await page.getByLabel("Replacement city, neighborhood, or ZIP code").fill("Chicago");
  await page.getByRole("button", { name: "Find location" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Chicago" })).toBeVisible();
  await page.getByRole("button", { name: "Save new plan details" }).click();
  await expect(page.getByRole("heading", { name: "Plan details changed" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Find four options" })).toBeVisible();
  expect(providerCalls).toBe(0);
});

test("stale metadata response blocks another write until a fresh plan read", async ({ page }) => {
  await demoIdentity(page);
  let repaired = false;
  let patches = 0;
  const plan = () => ({
    id: planId, title: repaired ? "Fresh dinner" : "Plan details needed",
    organizer_id: owner, viewer_is_organizer: true, status: "collecting",
    metadata_needs_replacement: !repaired, location_label: repaired ? "Chicago" : "Location needed",
    latitude: null, longitude: null,
    participants: [{ profile_id: owner, display_name: "Sam", constraints: {}, is_organizer: true }, { profile_id: "other", display_name: "Maya", constraints: {}, is_organizer: false }],
    candidates: [], my_vote: null, finalized_candidate_id: null,
    created_at: revision, updated_at: repaired ? "2026-09-25T12:01:00Z" : revision,
  });
  await page.route("**/api/v1/**", (route) => {
    const path = new URL(route.request().url()).pathname;
    const json = (data: unknown) => route.fulfill({ json: envelope(data) });
    if (path === "/api/v1/me") return json({ id: owner, display_name: "Sam", share_taste: false });
    if (path === `/api/v1/plans/${planId}/revision`) return json({ updated_at: plan().updated_at });
    if (path === `/api/v1/plans/${planId}`) return json(plan());
    if (path === "/api/v1/locations/resolve") return json({ place_id: "replacement-place", label: "Chicago", data_provider: "fixture" });
    if (path === `/api/v1/plans/${planId}/metadata`) {
      patches += 1;
      return route.fulfill({ status: 409, json: { error: { code: "idempotency_content_changed", message: "Plan content changed" }, request_id: "test" } });
    }
    return route.fulfill({ status: 404, json: { error: { code: "http_404", message: "Not found" }, request_id: "test" } });
  });
  await page.goto(`/plans/${planId}`);
  await page.getByLabel("Replacement plan title").fill("Fresh dinner");
  await page.getByLabel("Replacement city, neighborhood, or ZIP code").fill("Chicago");
  await page.getByRole("button", { name: "Find location" }).click();
  await expect(page.getByRole("button", { name: "Save new plan details" })).toBeEnabled();
  await page.getByRole("button", { name: "Save new plan details" }).click();
  await expect(page.getByText("Plan details changed. Refresh the plan before making another change.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Save new plan details" })).toBeDisabled();
  expect(patches).toBe(1);
  repaired = true;
  await page.getByRole("button", { name: "Refresh plan" }).click();
  await expect(page.getByRole("heading", { name: "Plan details changed" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Find four options" })).toBeVisible();
  expect(patches).toBe(1);
});

test("editing location while lookup is pending ignores its old result", async ({ page }) => {
  await demoIdentity(page);
  let lookupStarted!: () => void;
  let releaseLookup!: () => void;
  const started = new Promise<void>((resolve) => { lookupStarted = resolve; });
  const release = new Promise<void>((resolve) => { releaseLookup = resolve; });
  await page.route("**/api/v1/**", async (route) => {
    const path = new URL(route.request().url()).pathname;
    const json = (data: unknown) => route.fulfill({ json: envelope(data) });
    if (path === "/api/v1/me") return json({ id: owner, display_name: "Sam", share_taste: false });
    if (path === `/api/v1/plans/${planId}/revision`) return json({ updated_at: revision });
    if (path === `/api/v1/plans/${planId}`) return json({
      id: planId, title: "Plan details needed", organizer_id: owner, viewer_is_organizer: true,
      status: "collecting", metadata_needs_replacement: true, location_label: "Location needed",
      latitude: null, longitude: null, participants: [], candidates: [], my_vote: null,
      finalized_candidate_id: null, created_at: revision, updated_at: revision,
    });
    if (path === "/api/v1/locations/resolve") {
      expect(JSON.parse(route.request().postData() ?? "{}")).toEqual({ query: "Chicago" });
      lookupStarted();
      await release;
      return json({ place_id: "old-place", label: "Chicago", data_provider: "fixture" });
    }
    return route.fulfill({ status: 404, json: { error: { code: "http_404", message: "Not found" }, request_id: "test" } });
  });
  await page.goto(`/plans/${planId}`);
  await page.getByLabel("Replacement plan title").fill("Fresh dinner");
  await page.getByLabel("Replacement city, neighborhood, or ZIP code").fill("Chicago");
  await page.getByRole("button", { name: "Find location" }).click();
  await started;
  await page.getByLabel("Replacement city, neighborhood, or ZIP code").fill("New York");
  releaseLookup();
  await expect(page.getByRole("status").filter({ hasText: "Chicago" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Save new plan details" })).toBeDisabled();
});
