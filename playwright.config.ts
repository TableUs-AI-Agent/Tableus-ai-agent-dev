import { defineConfig, devices } from "@playwright/test";

const externalBaseUrl = process.env.PLAYWRIGHT_BASE_URL;
const localFingerprint = Array.from({ length: 32 }, (_, index) =>
  index.toString(16).padStart(2, "0"),
).join(":");

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: externalBaseUrl ?? "http://localhost:3000",
    trace: "retain-on-failure",
    storageState: process.env.PLAYWRIGHT_AUTH_STORAGE || undefined,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: externalBaseUrl ? undefined : [
    {
      command: "backend/.venv/bin/uvicorn main:app --app-dir backend --host 127.0.0.1 --port 8000",
      url: "http://127.0.0.1:8000/health/ready",
      reuseExistingServer: !process.env.CI,
    },
    {
      command: "npm run dev:web",
      url: "http://127.0.0.1:3000/plans",
      reuseExistingServer: !process.env.CI,
      env: {
        ...process.env,
        TABLEUS_API_ORIGIN: "http://127.0.0.1:8000",
        APPLE_TEAM_ID: "ABCDE12345",
        IOS_BUNDLE_IDENTIFIER: "com.tableus.app",
        ANDROID_PACKAGE_NAME: "com.tableus.app",
        ANDROID_SHA256_CERT_FINGERPRINTS: localFingerprint,
      },
    },
  ],
});
