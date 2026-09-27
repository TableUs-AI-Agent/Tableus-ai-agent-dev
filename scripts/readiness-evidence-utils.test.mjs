import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { evidenceDigest, SOURCE_REVIEW_AREAS, SOURCE_REVIEW_POLICY, validateSourceReviewReport } from "./source-review-evidence.mjs";

import {
  assertSafeReadinessEvidence,
  validateCumulativeReadinessInput,
  validateStagingReadiness,
  writeCumulativeReadinessEvidence,
} from "./readiness-evidence-utils.mjs";

const sourceRoot = fileURLToPath(new URL("..", import.meta.url));
const sha = execFileSync("git", ["rev-parse", "HEAD"], { cwd: sourceRoot, encoding: "utf8" }).trim();
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


function reviewed() {
  const value = valid();
  const file = "scripts/release-origins.mjs";
  const bytes = execFileSync("git", ["cat-file", "blob", `${sha}:${file}`], { cwd: sourceRoot });
  const report = {
    schema_version: 1, kind: "source_review", sha, environment: "staging",
    reviewer: "fixture-reviewer", reviewed_at: "2026-09-14T00:00:00.000Z",
    files: [{ path: file, sha256: createHash("sha256").update(bytes).digest("hex") }],
    coverage: SOURCE_REVIEW_AREAS.map((area) => ({ area, files: [file], assessment: "Synthetic validation fixture only." })),
    checks: [{ name: "Synthetic regression result", passed: true, evidence_sha256: checksum("6") }],
    findings: [], limitations: ["Synthetic evidence for validator behavior only."],
  };
  value.schema_version = 2;
  value.environment = "staging";
  value.security = { kind: "source_review", sha, report, report_sha256: evidenceDigest(report),
    owner_acceptance: { policy: SOURCE_REVIEW_POLICY, approved: true, sha, report_sha256: evidenceDigest(report), reference: "fixture-approval" } };
  return value;
}
function rebind(value) {
  value.security.report_sha256 = evidenceDigest(value.security.report);
  value.security.owner_acceptance.report_sha256 = value.security.report_sha256;
  return value;
}
function verifyReview(value) { return validateCumulativeReadinessInput(value, sha, { sourceRoot }); }

test("staging source review verifies immutable source and preserves distinct provenance", () => {
  const value = reviewed();
  assert.deepEqual(verifyReview(value), value);
  assert.equal(value.security.scan_id, undefined);
  assert.throws(() => validateCumulativeReadinessInput(value, sha), /Git source root/);
});

test("staging source review cannot replace a scan in version one or authorize production", () => {
  const legacy = reviewed(); legacy.schema_version = 1; delete legacy.environment;
  assert.throws(() => verifyReview(legacy), /security contains/);
  const production = reviewed(); production.environment = "production";
  assert.throws(() => verifyReview(production), /staging-only/);
  const reportScope = reviewed(); reportScope.security.report.environment = "production";
  assert.throws(() => verifyReview(rebind(reportScope)), /staging environment/);
});

test("owner acceptance is required and binds policy, source, and exact reviewed report", () => {
  for (const [key, value] of [["approved", false], ["policy", "production"], ["sha", "f".repeat(40)], ["report_sha256", checksum("0")], ["reference", ""]]) {
    const input = reviewed(); input.security.owner_acceptance[key] = value;
    assert.throws(() => verifyReview(input), /Explicit owner acceptance/);
  }
  const missing = reviewed(); delete missing.security.owner_acceptance;
  assert.throws(() => verifyReview(missing), /missing or unknown/);
  const reportChanged = reviewed(); reportChanged.security.report.limitations.push("Another unresolved limit.");
  assert.throws(() => verifyReview(reportChanged), /report hash mismatch/);
  reportChanged.security.report_sha256 = evidenceDigest(reportChanged.security.report);
  assert.throws(() => verifyReview(reportChanged), /Explicit owner acceptance/);
});

test("source review rejects forged file hashes, absent paths and traversal", () => {
  const wrong = reviewed(); wrong.security.report.files[0].sha256 = checksum("0");
  assert.throws(() => verifyReview(rebind(wrong)), /file hash mismatch/);
  for (const path of ["../package.json", "/etc/hosts", ".git/config", "scripts/../../package.json", "scripts/absent.mjs"]) {
    const input = reviewed(); input.security.report.files[0].path = path;
    assert.throws(() => verifyReview(rebind(input)));
  }
});

test("source review rejects missing or fabricated coverage and missing check evidence", () => {
  const missing = reviewed(); missing.security.report.coverage.pop();
  assert.throws(() => verifyReview(rebind(missing)), /missing required coverage/);
  const unbound = reviewed(); unbound.security.report.coverage[0].files = ["unreviewed.ts"];
  assert.throws(() => verifyReview(rebind(unbound)), /verified files/);
  const duplicate = reviewed(); duplicate.security.report.coverage[1].area = duplicate.security.report.coverage[0].area;
  assert.throws(() => verifyReview(rebind(duplicate)), /duplicate review area/);
  const checks = reviewed(); checks.security.report.checks = [];
  assert.throws(() => verifyReview(rebind(checks)), /Deterministic checks/);
  const failed = reviewed(); failed.security.report.checks[0].passed = false;
  assert.throws(() => verifyReview(rebind(failed)), /checks must pass/);
  const unknown = reviewed(); unknown.security.report.scan_id = "misleading-scan";
  assert.throws(() => verifyReview(rebind(unknown)), /unknown fields/);
});

test("unresolved critical/high runtime findings block review acceptance even when deferred", () => {
  for (const [severity, runtime] of [["critical", false], ["critical", true], ["high", true]]) {
    for (const status of ["open", "deferred"]) {
      const value = reviewed();
      value.security.report.findings = [{ id: "finding-1", severity, runtime, status, disposition: "Needs resolution." }];
      assert.throws(() => verifyReview(rebind(value)), /block readiness/);
    }
  }
  const lower = reviewed();
  lower.security.report.findings = [{ id: "finding-1", severity: "medium", runtime: true, status: "open", disposition: "Isolated staging boundary recorded for owner review." }];
  assert.equal(verifyReview(rebind(lower)).security.report.findings.length, 1);
  const missing = reviewed(); missing.security.report.findings = [{ id: "finding-1", severity: "high" }];
  assert.throws(() => verifyReview(rebind(missing)), /missing or unknown/);
});

test("source review retains all other cumulative gates and evidence privacy", () => {
  const noDevice = reviewed(); noDevice.ios.passed = false;
  assert.throws(() => verifyReview(noDevice), /ios.passed/);
  const noTelemetry = reviewed(); noTelemetry.telemetry.passed = false;
  assert.throws(() => verifyReview(noTelemetry), /telemetry.passed/);
  const unsafe = reviewed(); unsafe.security.report.limitations.push("person@example.test");
  assert.throws(() => verifyReview(rebind(unsafe)), /prohibited/);
});

test("a review can be checked before acceptance without producing a passing release", () => {
  const value = reviewed();
  assert.equal(validateSourceReviewReport(value.security.report, sha, sourceRoot), value.security.report);
  value.security.owner_acceptance.approved = false;
  assert.throws(() => verifyReview(value), /Explicit owner acceptance/);
});
