import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { createHash } from "node:crypto";

import {
  assertSafeReadinessEvidence,
  validateCumulativeReadinessInput,
  validateStagingReadiness,
  writeCumulativeReadinessEvidence,
} from "./readiness-evidence-utils.mjs";

const sha = "a".repeat(40);
const checksum = (character) => character.repeat(64);
const mobileEvidence = (platform, artifactCharacter) => {
  const profile = `readiness-${platform}`;
  const buildId = `local-${platform}`;
  const artifactSha256 = checksum(artifactCharacter);
  const receipt = {
    schema_version: 2,
    build_runner: "eas-local-build-plugin",
    platform,
    profile,
    candidate_sha: sha,
    source_tree_sha: "d".repeat(40),
    build_id: buildId,
    artifact_sha256: artifactSha256,
    eas_cli_version: "23.2.0",
    package_lock_sha256: checksum("e"),
    host: { os: "darwin", architecture: "arm64" },
    inspection_report_sha256: checksum("f"),
    signer_type: platform === "ios" ? "apple-team-id" : "android-sha256-cert",
    signer_identity: platform === "ios" ? "6MHJN5V9UJ" : "AA:BB:CC",
    artifact_inspection_passed: true,
  };
  return {
    sha,
    passed: true,
    platform,
    profile,
    build_id: buildId,
    artifact_sha256: artifactSha256,
    inspection_passed: true,
    receipt_sha256: createHash("sha256").update(JSON.stringify(receipt)).digest("hex"),
    receipt,
  };
};
const valid = () => ({
  schema_version: 1,
  sha,
  deployments: { railway_id: "railway-deployment", vercel_id: "vercel-deployment" },
  web: { sha, passed: true, deployment_id: "vercel-deployment" },
  ios: mobileEvidence("ios", "b"),
  android: mobileEvidence("android", "c"),
  associations: { sha, passed: true, manifest_sha256: checksum("3") },
  security: { sha, passed: true, scan_id: "scan-id", report_sha256: checksum("4"), critical_findings: 0, high_runtime_findings: 0 },
  deterministic: { sha, passed: true, ios_summary_sha256: checksum("5"), android_summary_sha256: checksum("6") },
  telemetry: { sha, passed: true, summary_sha256: checksum("7"), sentry_project_count: 3, posthog_platform_count: 4 },
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
  assert.throws(() => validateCumulativeReadinessInput(missingTelemetry, sha), /missing or unknown fields/);
});

test("cumulative input rejects unknown fields and mismatched deployment provenance", () => {
  const unknown = valid();
  unknown.web.email = "hidden@example.test";
  assert.throws(() => validateCumulativeReadinessInput(unknown, sha), /unknown fields/);
  const mismatched = valid();
  mismatched.web.deployment_id = "other-deployment";
  assert.throws(() => validateCumulativeReadinessInput(mismatched, sha), /does not match/);
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
