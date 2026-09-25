import { defineConfig } from "@playwright/test";

const production = process.env.TABLEUS_BROWSER_SERVER_MODE === "production";

export default defineConfig({
  testDir: ".",
  testMatch: "deletion-support.spec.ts",
  timeout: 30_000,
  use: { baseURL: "http://127.0.0.1:3405", channel: "chrome", headless: true },
  webServer: {
    command: `npm run ${production ? "start" : "dev"} -- --hostname 127.0.0.1 --port 3405`,
    cwd: "../../",
    url: "http://127.0.0.1:3405/account-deletion",
    reuseExistingServer: false,
    timeout: 120_000,
  },
  outputDir: "../../../.artifacts/deletion-support/playwright",
});
