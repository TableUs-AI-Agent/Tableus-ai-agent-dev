import assert from "node:assert/strict";
import test from "node:test";

import { isAuthE2EEnabled } from "./auth-e2e-config.ts";

const valid = { configFlag: true, apiUrl: "https://staging.example", demoMode: false, supabaseConfigured: true };

test("auth E2E requires the build gate, HTTPS, Supabase, and non-demo auth", () => {
  assert.equal(isAuthE2EEnabled(valid), true);
  assert.equal(isAuthE2EEnabled({ ...valid, configFlag: false }), false);
  assert.equal(isAuthE2EEnabled({ ...valid, apiUrl: "http://127.0.0.1:8000" }), false);
  assert.equal(isAuthE2EEnabled({ ...valid, demoMode: true }), false);
  assert.equal(isAuthE2EEnabled({ ...valid, supabaseConfigured: false }), false);
});
