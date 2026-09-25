import { defineConfig, devices } from "@playwright/test";

/** Focused mocked join journeys against an explicitly started local web server. */
export default defineConfig({
  testDir: "./app/lib",
  testMatch: "private-link.spec.ts",
  timeout: 30_000,
  retries: 0,
  reporter: "list",
  use: {
    ...devices["Desktop Chrome"],
    channel: "chrome",
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3402",
  },
  projects: [{ name: "chromium" }],
});
