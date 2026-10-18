import { expect, test, type Page } from "@playwright/test";

import { apiOrigin } from "./stack";

async function signInAs(page: Page, name: "Demo Organizer" | "Demo Guest") {
  await page.goto("/signin");
  await page.getByRole("button", { name: `Continue as ${name}` }).click();
  await expect(page).toHaveURL(/\/plans$/);
}

/**
 * Finds the pick cards on the 3D table by hovering over the canvas and watching
 * for the pointer cursor, which the scene shows over a card. Once picks are in,
 * the four cards hold still side by side, evenly spaced, so the row they make is
 * split into four. Returns a point in the middle of each card, left to right.
 */
async function tableCardPoints(page: Page) {
  const canvas = page.locator('[aria-label^="Animated tabletop scene"] canvas');
  // The table only animates while it's on screen.
  await canvas.scrollIntoViewIfNeeded();
  const points = await canvas.evaluate((element: HTMLCanvasElement) => {
    const rect = element.getBoundingClientRect();
    const hits: { x: number; y: number }[] = [];
    for (let y = 4; y < rect.height; y += 8) {
      for (let x = 4; x < rect.width; x += 8) {
        element.dispatchEvent(new PointerEvent("pointermove", { clientX: rect.left + x, clientY: rect.top + y, pointerType: "mouse", bubbles: true }));
        if (element.style.cursor === "pointer") hits.push({ x, y });
      }
    }
    element.dispatchEvent(new PointerEvent("pointerleave", { bubbles: true }));
    if (!hits.length) return [];
    const y = hits.reduce((sum, hit) => sum + hit.y, 0) / hits.length;
    const left = Math.min(...hits.map((hit) => hit.x));
    const width = Math.max(...hits.map((hit) => hit.x)) - left;
    // Until all four cards are dealt the row is short, so report nothing and let the caller retry.
    if (width < rect.width * 0.3) return [];
    return [0, 1, 2, 3].map((index) => ({ x: left + ((index + 0.5) * width) / 4, y }));
  });
  return { canvas, points };
}

test("the landing page explains the product and starts a plan", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Dinner, decided." })).toBeVisible();
  await page.getByRole("link", { name: "Start a plan" }).first().click();
  await expect(page).toHaveURL(/\/signin\?next=%2Fplans/);
});

test("a group goes from invite link to a locked-in pick, voting on the 3D table", async ({ browser }) => {
  test.setTimeout(120_000);
  const organizerContext = await browser.newContext();
  const friendContext = await browser.newContext();
  const organizer = await organizerContext.newPage();
  const friend = await friendContext.newPage();

  await test.step("the organizer starts a plan", async () => {
    await signInAs(organizer, "Demo Organizer");
    await organizer.getByLabel("What's the occasion?").fill("Playwright dinner");
    await organizer.getByLabel("Where should we look?").fill("Boston, MA");
    await organizer.getByRole("button", { name: "Find this place" }).click();
    await organizer.getByRole("button", { name: "Start plan" }).click();
    await expect(organizer.getByRole("heading", { name: "Playwright dinner" })).toBeVisible();
    await expect(organizer.getByRole("heading", { name: "Send this link to the group" })).toBeVisible();
  });

  await test.step("a friend joins by the link and adds wishes", async () => {
    const link = await organizer.getByLabel("Plan link").inputValue();
    await friend.goto(link);
    await friend.getByRole("button", { name: "Continue as Demo Guest" }).click();
    await expect(friend.getByRole("heading", { name: "Playwright dinner" })).toBeVisible();
    await friend.getByLabel("In your own words").fill("Something vegetarian where we can talk");
    await friend.getByRole("button", { name: "Vegetarian" }).click();
    await friend.getByRole("button", { name: "Save my wishes" }).click();
    await expect(friend.getByText("Saved. Your standing tastes")).toBeVisible();
  });

  await test.step("the organizer adds wishes and gets picks", async () => {
    // The organizer's page notices the friend and their wishes on its own.
    const whosIn = organizer.getByRole("region", { name: "Who's in" });
    await expect(whosIn.getByRole("listitem")).toHaveCount(2, { timeout: 20_000 });
    await expect(whosIn).toContainText("added wishes", { timeout: 20_000 });
    await organizer.getByRole("button", { name: "Italian" }).click();
    await organizer.getByRole("button", { name: "Save my wishes" }).click();
    await expect(organizer.getByText("Saved. Your standing tastes")).toBeVisible();
    await organizer.getByRole("button", { name: "Get four picks" }).click();
    await expect(organizer.getByRole("heading", { name: "Rank your top three" })).toBeVisible();
    await expect(organizer.locator('[id^="pick-"]')).toHaveCount(4);
  });

  await test.step("the friend votes in the list", async () => {
    await expect(friend.getByRole("heading", { name: "Rank your top three" })).toBeVisible({ timeout: 20_000 });
    const picks = friend.locator('[id^="pick-"]');
    await expect(picks).toHaveCount(4);
    for (const index of [3, 2, 1]) await picks.nth(index).click();
    await expect(friend.getByText("Vote saved.")).toBeVisible();
  });

  await test.step("the organizer votes by tapping cards on the table", async () => {
    const pressed = organizer.locator('[id^="pick-"][aria-pressed="true"]');
    let found: Awaited<ReturnType<typeof tableCardPoints>>["points"] = [];
    await expect(async () => {
      found = (await tableCardPoints(organizer)).points;
      expect(found).toHaveLength(4);
    }).toPass({ timeout: 20_000 });
    const { canvas } = await tableCardPoints(organizer);
    for (const [index, point] of found.slice(0, 3).entries()) {
      await canvas.click({ position: point });
      await expect(pressed).toHaveCount(index + 1);
    }
    await expect(organizer.getByText("Vote saved.")).toBeVisible();
    await expect(organizer.getByText("2 of 2 voted.")).toBeVisible();
  });

  await test.step("the table taps reached the server", async () => {
    // Regression for Oct 16, 2026: taps on the table ranked picks but never saved the vote.
    const planId = new URL(organizer.url()).pathname.split("/").pop();
    const response = await organizer.request.get(`${apiOrigin}/api/v1/plans/${planId}`, { headers: { "X-Demo-User-ID": "demo-organizer" } });
    expect(response.ok()).toBeTruthy();
    const plan = await response.json();
    expect(plan.my_vote).toHaveLength(3);
    expect(plan.participants.every((person: { has_voted: boolean }) => person.has_voted)).toBe(true);
  });

  await test.step("the organizer locks it in and the friend sees it", async () => {
    const lockIn = organizer.getByRole("button", { name: /^Go with / });
    const winner = (await lockIn.textContent())!.replace(/^Go with /, "");
    await lockIn.click();
    await expect(organizer.getByRole("heading", { name: "You're going to" })).toBeVisible();
    await expect(organizer.getByRole("link", { name: "Open in Google Maps" })).toBeVisible();
    await expect(friend.getByRole("heading", { name: "You're going to" })).toBeVisible({ timeout: 20_000 });
    await expect(friend.locator('[id^="pick-"]')).toContainText(winner);
  });

  await organizerContext.close();
  await friendContext.close();
});

test("the mobile app's table reports taps on its cards", async ({ browser }) => {
  // The mobile app shows /embed/table in a web view and votes with the picks it posts back.
  const context = await browser.newContext();
  await context.addInitScript(() => {
    const sent: unknown[] = [];
    Object.assign(window, { sent, ReactNativeWebView: { postMessage: (message: string) => sent.push(JSON.parse(message)) } });
  });
  const page = await context.newPage();
  const sent = () => page.evaluate(() => (window as unknown as { sent: { type: string; id?: string }[] }).sent);
  await page.goto("/embed/table");
  await expect.poll(sent).toContainEqual({ type: "ready" });

  const ids = ["pick-a", "pick-b", "pick-c", "pick-d"];
  const state = {
    people: [{ id: "demo-organizer", name: "Demo Organizer" }, { id: "demo-guest", name: "Demo Guest" }],
    meId: "demo-organizer",
    picks: ids.map((id, index) => ({
      id,
      name: `Place ${index + 1}`,
      cuisine: "Italian",
      price_level: 2,
      reasoning: "Fits everyone.",
      photo: null,
      photo_credits: [],
    })),
    chosenId: null,
    selectedId: null,
    searching: false,
  };
  await page.evaluate((message) => window.postMessage(message, "*"), JSON.stringify({ type: "table-state", state }));

  let found: Awaited<ReturnType<typeof tableCardPoints>>["points"] = [];
  await expect(async () => {
    found = (await tableCardPoints(page)).points;
    expect(found).toHaveLength(4);
  }).toPass({ timeout: 20_000 });
  const { canvas } = await tableCardPoints(page);
  for (const point of found) await canvas.click({ position: point });
  const picked = (await sent()).filter((message) => message.type === "pick").map((message) => message.id);
  expect(new Set(picked)).toEqual(new Set(ids));
  await context.close();
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
