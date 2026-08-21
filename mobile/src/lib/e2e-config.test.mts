import assert from "node:assert/strict";
import test from "node:test";

import { canUseLocalE2E, isLocalE2EIdentity, isLoopbackApiUrl } from "./e2e-config.ts";

test("local E2E identities are restricted to seeded demo profiles", () => {
  assert.equal(isLocalE2EIdentity("demo-organizer"), true);
  assert.equal(isLocalE2EIdentity("demo-guest"), true);
  assert.equal(isLocalE2EIdentity("arbitrary-user"), false);
});

test("local E2E accepts only loopback API URLs", () => {
  assert.equal(isLoopbackApiUrl("http://127.0.0.1:8000"), true);
  assert.equal(isLoopbackApiUrl("http://localhost:8000"), true);
  assert.equal(isLoopbackApiUrl("http://[::1]:8000"), true);
  assert.equal(isLoopbackApiUrl("https://api-staging.example.com"), false);
  assert.equal(isLoopbackApiUrl("not-a-url"), false);
});

test("local E2E requires config, demo mode, and loopback together", () => {
  const enabled = { configEnabled: true, demoMode: true, apiUrl: "http://127.0.0.1:8000" };
  assert.equal(canUseLocalE2E(enabled), true);
  assert.equal(canUseLocalE2E({ ...enabled, configEnabled: false }), false);
  assert.equal(canUseLocalE2E({ ...enabled, demoMode: false }), false);
  assert.equal(canUseLocalE2E({ ...enabled, apiUrl: "https://api.example.com" }), false);
});
