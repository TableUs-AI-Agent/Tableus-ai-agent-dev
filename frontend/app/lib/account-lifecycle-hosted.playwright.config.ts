import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: ".",
  testMatch: "account-lifecycle-hosted.spec.ts",
  timeout: 35_000,
  use: { baseURL: "http://127.0.0.1:3401", channel: "chrome", headless: true },
  webServer: {
    command: "npm run dev -- --hostname 127.0.0.1 --port 3401",
    cwd: "../../",
    env: {
      NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:8401",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "local-test-only",
      NEXT_PUBLIC_API_URL: "",
    },
    url: "http://127.0.0.1:3401/account",
    reuseExistingServer: false,
    timeout: 120_000,
  },
  outputDir: "/private/tmp/tableus-account-hosted-playwright",
});
