import { tmpdir } from "node:os";
import { join } from "node:path";

import { defineConfig, devices } from "@playwright/test";

import { apiOrigin, apiPort, webPort } from "./tests/e2e/stack";

const externalBaseUrl = process.env.PLAYWRIGHT_BASE_URL;
const localFingerprint = Array.from({ length: 32 }, (_, index) =>
  index.toString(16).padStart(2, "0"),
).join(":");
// A fresh SQLite file per run keeps rate limits and old plans out of the tests. CI passes Postgres.
const localDb = join(tmpdir(), `tableus-e2e-${apiPort}.db`);

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 60_000,
  // The dev server compiles each page on its first visit, which can take several seconds.
  expect: { timeout: 15_000 },
  retries: process.env.CI ? 1 : 0,
  // One at a time on CI: parallel first visits make the dev server recompile under a test mid-navigation.
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: externalBaseUrl ?? `http://localhost:${webPort}`,
    trace: "retain-on-failure",
    storageState: process.env.PLAYWRIGHT_AUTH_STORAGE || undefined,
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] }, testIgnore: /phone-/ },
    { name: "android-chrome", use: { ...devices["Pixel 7"] }, testMatch: /phone-/ },
    { name: "iphone-safari", use: { ...devices["iPhone 15"] }, testMatch: /phone-/ },
  ],
  // Own ports and no server reuse, so a dev server from another checkout is never tested by mistake.
  webServer: externalBaseUrl ? undefined : [
    {
      command: `rm -f ${localDb} && backend/.venv/bin/uvicorn main:app --app-dir backend --host 127.0.0.1 --port ${apiPort}`,
      url: `${apiOrigin}/health/ready`,
      reuseExistingServer: false,
      env: {
        ...process.env,
        DATABASE_URL: process.env.DATABASE_URL ?? `sqlite+aiosqlite:///${localDb}`,
        ENVIRONMENT: process.env.ENVIRONMENT ?? "test",
        TABLEUS_AUTH_MODE: "demo",
        // Fixture restaurants and picks: no Google Places or Gemini calls, whatever backend/.env says.
        TABLEUS_PROVIDER_MODE: "deterministic",
        TABLEUS_PLACES_PROVIDER_MODE: "deterministic",
        TABLEUS_AI_PROVIDER_MODE: "deterministic",
      },
    },
    {
      command: `npm run dev --workspace @tableus/web -- --port ${webPort}`,
      url: `http://127.0.0.1:${webPort}/`,
      reuseExistingServer: false,
      env: {
        ...process.env,
        TABLEUS_API_ORIGIN: apiOrigin,
        NEXT_PUBLIC_API_URL: "",
        NEXT_PUBLIC_SUPABASE_URL: "",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "",
        APPLE_TEAM_ID: "ABCDE12345",
        IOS_BUNDLE_IDENTIFIER: "com.tableus.app",
        ANDROID_PACKAGE_NAME: "com.tableus.app",
        ANDROID_SHA256_CERT_FINGERPRINTS: localFingerprint,
      },
    },
  ],
});
