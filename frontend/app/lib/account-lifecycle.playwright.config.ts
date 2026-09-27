import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: ".",
  testMatch: "account-lifecycle.spec.ts",
  timeout: 30_000,
  use: { baseURL: "http://127.0.0.1:3400", channel: "chrome", headless: true },
  webServer: {
    command: "npm run dev -- --hostname 127.0.0.1 --port 3400",
    cwd: "../../",
    url: "http://127.0.0.1:3400/account",
    reuseExistingServer: false,
    timeout: 120_000,
  },
  outputDir: "/private/tmp/tableus-account-lifecycle-playwright",
});
