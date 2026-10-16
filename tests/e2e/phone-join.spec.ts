import { expect, test } from "@playwright/test";

// Runs as Android Chrome and iPhone Safari (see playwright.config.ts).
test("a friend opens the plan link signed out on their phone and lands in the plan", async ({ page, browser }) => {
  await page.goto("/signin");
  await page.getByRole("button", { name: "Continue as Demo Organizer" }).click();
  await page.getByLabel("What's the occasion?").fill("Phone join dinner");
  await page.getByLabel("Where should we look?").fill("Boston, MA");
  await page.getByRole("button", { name: "Find this place" }).click();
  await page.getByRole("button", { name: "Start plan" }).click();
  const link = new URL(await page.getByLabel("Plan link").inputValue());

  // A fresh browser, like a friend tapping the link in a group chat.
  const friend = await (await browser.newContext(test.info().project.use)).newPage();
  await friend.goto(link.pathname + link.search);
  await expect(friend).toHaveURL(/\/signin\?next=%2Fjoin%2F/);
  expect(friend.url()).not.toContain("token");
  await friend.getByRole("button", { name: "Continue as Demo Guest" }).click();
  await expect(friend).toHaveURL(new RegExp(`${link.pathname.replace("/join/", "/plans/")}$`));
  await expect(friend.getByRole("heading", { name: "Phone join dinner" })).toBeVisible();
  const overflow = await friend.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});
