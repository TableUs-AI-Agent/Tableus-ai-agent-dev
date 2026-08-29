import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import {
  assertSafeReadinessEvidence,
  validateCumulativeReadinessInput,
  validateStagingReadiness,
  writeCumulativeReadinessEvidence,
} from "./readiness-evidence-utils.mjs";

const sha = "a".repeat(40);
const source = (extra = {}) => ({ sha, passed: true, ...extra });
const valid = () => ({
  schema_version: 1,
  sha,
  deployments: { railway_id: "railway-deployment", vercel_id: "vercel-deployment" },
  web: source(),
  ios: source({ build_id: "local-ios", artifact_sha256: "b".repeat(64), inspection_passed: true }),
  android: source({ build_id: "local-android", artifact_sha256: "c".repeat(64), inspection_passed: true }),
  associations: source(),
  security: source({ critical_findings: 0, high_runtime_findings: 0 }),
  deterministic: source(),
  telemetry: source({ sentry_project_count: 3, posthog_platform_count: 4 }),
  release_checks: {
    owner_legal_reviewed: true,
    google_attribution_reviewed: true,
    support_delivery_confirmed: true,
    privacy_delivery_confirmed: true,
    otp_template_updated: true,
    rollback_owner_recorded: true,
    residual_risks_recorded: true,
  },
});

test("cumulative evidence requires one exact SHA and every release gate", () => {
  assert.deepEqual(validateCumulativeReadinessInput(valid(), sha), valid());
  const mismatched = valid();
  mismatched.android.sha = "d".repeat(40);
  assert.throws(() => validateCumulativeReadinessInput(mismatched, sha), /android does not match/);
  const unsigned = valid();
  unsigned.release_checks.owner_legal_reviewed = false;
  assert.throws(() => validateCumulativeReadinessInput(unsigned, sha), /owner_legal_reviewed/);
  const missingTelemetry = valid();
  delete missingTelemetry.telemetry;
  assert.throws(() => validateCumulativeReadinessInput(missingTelemetry, sha), /telemetry does not match/);
});

test("critical or high runtime findings block readiness", () => {
  const high = valid();
  high.security.high_runtime_findings = 1;
  assert.throws(() => validateCumulativeReadinessInput(high, sha), /block readiness/);
});

test("staging readiness is exact-SHA, Supabase, live-provider, and privacy safe", () => {
  const ready = {
    build_sha: sha,
    auth_mode: "supabase",
    places_provider_mode: "live",
    ai_provider_mode: "live",
    provider_mode: "live",
    telemetry_mode: "staging",
    analytics_mode: "anonymous",
    error_reporting_mode: "errors_only",
  };
  assert.equal(validateStagingReadiness(ready, sha).live_ai, true);
  assert.throws(() => validateStagingReadiness({ ...ready, ai_provider_mode: "deterministic" }, sha), /does not match/);
});

test("evidence rejects personal, credential, token, provider-content, and location fields", () => {
  for (const unsafe of [
    { email: "person@example.com" },
    { share_token: "private" },
    { place_id: "provider-id" },
    { restaurant_name: "private provider content" },
    { latitude: 1 },
    { prompt: "private" },
    { authorization: "Bearer private" },
    { value: "99211925" },
    { value: "https://links.table-us.com/join/plan?token=private" },
    { value: "ChIJ1234567890abcdefghij" },
  ]) assert.throws(() => assertSafeReadinessEvidence(unsafe), /prohibited/);
});

test("writer retains only validated sanitized JSON", () => {
  const directory = mkdtempSync(join(tmpdir(), "tableus-readiness-evidence-"));
  try {
    const target = writeCumulativeReadinessEvidence(directory, valid());
    assert.equal(JSON.parse(readFileSync(target, "utf8")).sha, sha);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
