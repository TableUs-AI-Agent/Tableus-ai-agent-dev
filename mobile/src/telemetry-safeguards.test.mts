import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const providers = readFileSync(new URL("./providers/app-providers.tsx", import.meta.url), "utf8");
const layout = readFileSync(new URL("../app/_layout.tsx", import.meta.url), "utf8");
const privacy = readFileSync(new URL("../app/privacy.tsx", import.meta.url), "utf8");

test("mobile analytics are memory-only, anonymous, and non-automatic", () => {
  assert.match(providers, /autocapture=\{false\}/);
  assert.match(providers, /persistence: "memory"/);
  assert.match(providers, /personProfiles: "never"/);
  assert.match(providers, /disableGeoip: true/);
  assert.match(providers, /enableSessionReplay: false/);
  assert.match(providers, /before_send/);
  assert.doesNotMatch(providers, /\.identify\(/);
});

test("mobile Sentry is error-only and privacy copy is explicit", () => {
  assert.match(layout, /tracesSampleRate: 0/);
  assert.match(layout, /profilesSampleRate: 0/);
  assert.match(layout, /maxBreadcrumbs: 0/);
  assert.match(layout, /sanitizeSentryEvent/);
  assert.match(privacy, /random in-memory session identifier/);
  assert.match(privacy, /performance traces, profiling, replay, and attachments are excluded/);
});
