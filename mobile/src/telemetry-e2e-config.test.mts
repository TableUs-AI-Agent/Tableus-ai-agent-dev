import assert from "node:assert/strict";
import test from "node:test";

import { isTelemetryE2EEnabled } from "./lib/telemetry-e2e-config.ts";

const valid = { configFlag: true, apiUrl: "https://api.example.test", demoMode: false, telemetryMode: "staging", supabaseConfigured: true };

test("telemetry E2E requires staging Supabase configuration", () => {
  assert.equal(isTelemetryE2EEnabled(valid), true);
  assert.equal(isTelemetryE2EEnabled({ ...valid, configFlag: false }), false);
  assert.equal(isTelemetryE2EEnabled({ ...valid, apiUrl: "http://127.0.0.1:8000" }), false);
  assert.equal(isTelemetryE2EEnabled({ ...valid, demoMode: true }), false);
  assert.equal(isTelemetryE2EEnabled({ ...valid, telemetryMode: "production" }), false);
  assert.equal(isTelemetryE2EEnabled({ ...valid, supabaseConfigured: false }), false);
});
