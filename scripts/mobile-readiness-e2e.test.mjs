import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(new URL("./mobile-readiness-e2e.mjs", import.meta.url), "utf8");

test("readiness runner is exact-SHA, production-shaped, and sanitized", () => {
  assert.match(source, /validateStagingReadiness/);
  assert.match(source, /inspect-mobile-readiness-artifact/);
  assert.match(source, /links\.table-us\.com/);
  assert.match(source, /restricted_google_content_retained: false/);
  assert.match(source, /screenshots_retained_by_runner: false/);
  assert.doesNotMatch(source, /question\([^)]*(?:email|otp|code|token)/i);
});

test("readiness runner covers cross-client, link, failure, and account phases", () => {
  for (const marker of [
    "returning_authentication",
    "session_persistence",
    "foreground_refresh",
    "verified_auth_link",
    "verified_join_link",
    "live_location_and_four_candidates",
    "cross_client_vote",
    "organizer_authorization",
    "rotated_link_rejected",
    "account_controls_read_only",
  ]) assert.match(source, new RegExp(marker));
  assert.doesNotMatch(source, /telemetry_canary/);
});
