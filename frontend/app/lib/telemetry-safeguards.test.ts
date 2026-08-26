import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const providers = readFileSync(new URL("../providers.tsx", import.meta.url), "utf8");
const clientSentry = readFileSync(new URL("../../instrumentation-client.ts", import.meta.url), "utf8");
const privacy = readFileSync(new URL("../privacy/page.tsx", import.meta.url), "utf8");
const canary = readFileSync(new URL("../e2e/telemetry/telemetry-client.tsx", import.meta.url), "utf8");

test("web analytics are memory-only, anonymous, and non-automatic", () => {
  assert.match(providers, /persistence: "memory"/);
  assert.match(providers, /person_profiles: "never"/);
  assert.match(providers, /autocapture: false/);
  assert.match(providers, /capture_pageview: false/);
  assert.match(providers, /disable_session_recording: true/);
  assert.match(providers, /before_send/);
  assert.doesNotMatch(providers, /\.identify\(/);
  assert.match(canary, /analyticsAccepted/);
  assert.match(canary, /still starting/);
});

test("web Sentry is error-only and privacy copy is explicit", () => {
  assert.match(clientSentry, /tracesSampleRate: 0/);
  assert.match(clientSentry, /maxBreadcrumbs: 0/);
  assert.match(clientSentry, /sanitizeSentryEvent/);
  assert.match(privacy, /random in-memory session identifier/);
  assert.match(privacy, /performance traces, profiling, replay, and attachments are disabled/);
});
