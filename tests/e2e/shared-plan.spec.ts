import { expect, test, type Page } from "@playwright/test";

import { apiOrigin } from "./stack";

async function signInAs(page: Page, name: "Demo Organizer" | "Demo Guest") {
  await page.goto("/signin");
  await page.getByRole("button", { name: `Continue as ${name}` }).click();
  await expect(page).toHaveURL(/\/plans$/);
}

/**
 * Finds the pick cards on the 3D table by hovering a grid over the canvas and
 * watching for the pointer cursor, which the scene shows over a card. Returns
 * one point near the middle of each card. Once picks are in, the cards hold
 * still in a row, so the points stay good for tapping.
 */
async function tableCardPoints(page: Page) {
  const canvas = page.locator('[aria-label^="Animated tabletop scene"] canvas');
  await expect(canvas).toBeVisible();
  const points = await canvas.evaluate((element: HTMLCanvasElement) => {
    const rect = element.getBoundingClientRect();
    const step = 8;
    const columns = Math.floor(rect.width / step);
    const rows = Math.floor(rect.height / step);
    const hits = new Set<number>();
    for (let row = 0; row < rows; row += 1) {
      for (let column = 0; column < columns; column += 1) {
        const clientX = rect.left + column * step + step / 2;
        const clientY = rect.top + row * step + step / 2;
        element.dispatchEvent(new PointerEvent("pointermove", { clientX, clientY, pointerType: "mouse", bubbles: true }));
        if (element.style.cursor === "pointer") hits.add(row * columns + column);
      }
    }
    element.dispatchEvent(new PointerEvent("pointerleave", { bubbles: true }));
    // Group touching grid cells into cards and take each card's middle cell.
    const cards: { x: number; y: number }[] = [];
    const seen = new Set<number>();
    for (const start of hits) {
      if (seen.has(start)) continue;
      const cells: number[] = [];
      const queue = [start];
      seen.add(start);
      while (queue.length) {
        const cell = queue.pop()!;
        cells.push(cell);
        const row = Math.floor(cell / columns);
        const column = cell % columns;
        for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const next = (row + dr) * columns + column + dc;
          if (row + dr >= 0 && row + dr < rows && column + dc >= 0 && column + dc < columns && hits.has(next) && !seen.has(next)) {
            seen.add(next);
            queue.push(next);
          }
        }
      }
      if (cells.length < 4) continue;
      const middle = cells.reduce((sum, cell) => ({ row: sum.row + Math.floor(cell / columns), column: sum.column + (cell % columns) }), { row: 0, column: 0 });
      const row = Math.round(middle.row / cells.length);
      const column = Math.round(middle.column / cells.length);
      // A card seen at an angle can bend around its middle, so use the closest cell that's on it.
      const best = cells.reduce((a, b) => {
        const distance = (cell: number) => (Math.floor(cell / columns) - row) ** 2 + ((cell % columns) - column) ** 2;
        return distance(a) <= distance(b) ? a : b;
      });
      cards.push({ x: (best % columns) * step + step / 2, y: Math.floor(best / columns) * step + step / 2 });
    }
    return cards;
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
    // The organizer's page notices the friend on its own.
    await expect(organizer.getByText("Demo Guest")).toBeVisible({ timeout: 15_000 });
    await organizer.getByRole("button", { name: "Italian" }).click();
    await organizer.getByRole("button", { name: "Save my wishes" }).click();
    await expect(organizer.getByText("Saved. Your standing tastes")).toBeVisible();
    await organizer.getByRole("button", { name: "Get four picks" }).click();
    await expect(organizer.getByRole("heading", { name: "Rank your top three" })).toBeVisible();
    await expect(organizer.locator('[id^="pick-"]')).toHaveCount(4);
  });

  await test.step("the friend votes in the list", async () => {
    await expect(friend.getByRole("heading", { name: "Rank your top three" })).toBeVisible({ timeout: 15_000 });
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
    await expect(friend.getByRole("heading", { name: "You're going to" })).toBeVisible({ timeout: 15_000 });
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
