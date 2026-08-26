import assert from "node:assert/strict";
import test from "node:test";

import {
  createTelemetrySessionId,
  isTelemetrySessionId,
  sanitizeSentryEvent,
  sanitizePostHogPayload,
  sanitizeTelemetryEvent,
  sanitizeTelemetryUrl,
} from "./telemetry.ts";

test("telemetry allowlist rejects unknown events, properties, and invalid values", () => {
  assert.equal(sanitizeTelemetryEvent("unknown", { platform: "web" }), null);
  assert.equal(sanitizeTelemetryEvent("plan_created", { platform: "web", email: "person@example.com" }), null);
  assert.equal(sanitizeTelemetryEvent("vote_submitted", { platform: "ios", ranking_count: 4 }), null);
  assert.deepEqual(
    sanitizeTelemetryEvent("vote_submitted", { platform: "android", ranking_count: 3 }),
    { event: "vote_submitted", properties: { platform: "android", ranking_count: 3 } },
  );
});

test("PostHog payloads discard automatic and sensitive properties", () => {
  const result = sanitizePostHogPayload({
    event: "plan_created",
    properties: { platform: "web", email: "person@example.test", $current_url: "https://secret" },
  }, "abc123");
  assert.deepEqual(result, {
    event: "plan_created",
    properties: {
      platform: "web",
      $process_person_profile: false,
      $geoip_disable: true,
      release: "abc123",
    },
  });
});

test("telemetry session identifiers are random UUIDs", () => {
  const first = createTelemetrySessionId();
  const second = createTelemetrySessionId();
  assert.equal(isTelemetrySessionId(first), true);
  assert.equal(isTelemetrySessionId(second), true);
  assert.notEqual(first, second);
});

test("telemetry URLs remove query, fragments, plan IDs, and token-like segments", () => {
  assert.equal(
    sanitizeTelemetryUrl("https://links.table-us.com/join/123e4567-e89b-42d3-a456-426614174000?token=secret#part"),
    "https://links.table-us.com/join/:id",
  );
  assert.equal(sanitizeTelemetryUrl("/auth?code=12345678"), "/auth");
});

test("Sentry events retain stacks but drop messages, user data, headers, extras, and breadcrumbs", () => {
  const result = sanitizeSentryEvent({
    event_id: "evt",
    message: "person@example.com token=secret",
    user: { email: "person@example.com" },
    request: { method: "POST", url: "https://table-us.com/join/123e4567-e89b-42d3-a456-426614174000?token=secret", headers: { authorization: "secret" }, data: "review" },
    exception: { values: [{ type: "ApiError", value: "private response", stacktrace: { frames: [{ filename: "app.ts?token=secret", lineno: 3, vars: { email: "person@example.com" }, context_line: "private" }] } }] },
    breadcrumbs: [{ message: "private" }],
    extra: { prompt: "private" },
    tags: { request_id: "123e4567-e89b-42d3-a456-426614174000", unsafe: "private" },
  });
  assert.equal(result.message, undefined);
  assert.equal(result.user, undefined);
  assert.equal(result.extra, undefined);
  assert.deepEqual(result.breadcrumbs, []);
  assert.equal(result.exception.values[0].value, "[redacted]");
  assert.equal(result.exception.values[0].stacktrace.frames[0].filename, "app.ts");
  assert.equal(result.exception.values[0].stacktrace.frames[0].vars, undefined);
  assert.equal(result.request.url, "https://table-us.com/join/:id");
  assert.equal(result.request.headers, undefined);
  assert.deepEqual(result.tags, { request_id: "123e4567-e89b-42d3-a456-426614174000" });
});
