import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: ".",
  testMatch: "deletion-content.spec.ts",
  timeout: 30_000,
  use: { baseURL: "http://127.0.0.1:3404", channel: "chrome", headless: true },
  webServer: {
    command: "npm run dev -- --hostname 127.0.0.1 --port 3404",
    cwd: "../../",
    url: "http://127.0.0.1:3404/plans",
    reuseExistingServer: false,
    timeout: 120_000,
  },
  outputDir: "/private/tmp/tableus-deletion-content-playwright",
});
