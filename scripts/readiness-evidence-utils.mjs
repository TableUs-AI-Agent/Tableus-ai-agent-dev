import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { createHash } from "node:crypto";

import { validateBuildReceipt } from "./mobile-artifact-security.mjs";

const SHA_PATTERN = /^[0-9a-f]{40}$/;
const CHECKSUM_PATTERN = /^[0-9a-f]{64}$/;
const PROHIBITED_KEY = /^(?:email|otp|password|secret|credential|authorization|access_token|refresh_token|share_token|invite_code|verification_code|idempotency_key|place_id|restaurant(?:_name|_address)?|address|latitude|longitude|coordinates?|provider_response|review_text|prompt|query|photo(?:_bytes|_url)?)$/i;
const PROHIBITED_VALUE = /(?:[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}|bearer\s+|[?&](?:token|code|key)=|\/join\/[^\s?]+\?|\b(?:otp|password|secret|credential)\b|ChI[0-9A-Za-z_-]{15,}|AIza[0-9A-Za-z_-]{20,}|sb_(?:secret|publishable)_[0-9A-Za-z_-]+|^[0-9]{6,10}$)/i;

function requireBoolean(value, label) {
  if (value !== true) throw new Error(`${label} must be true`);
}

function requireExactKeys(value, keys, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${label} must be an object`);
  const actual = Object.keys(value).sort();
  const expected = [...keys].sort();
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${label} contains missing or unknown fields`);
  }
}

function requireChecksum(value, label) {
  if (!CHECKSUM_PATTERN.test(value ?? "")) throw new Error(`${label} must be a SHA-256 checksum`);
}

function requireSafeId(value, label) {
  if (typeof value !== "string" || !/^[A-Za-z0-9._:-]{1,200}$/.test(value)) {
    throw new Error(`${label} must be a sanitized identifier`);
  }
}

function requireSource(value, label, sha) {
  if (!value || value.sha !== sha) throw new Error(`${label} does not match the exact source SHA`);
  requireBoolean(value.passed, `${label}.passed`);
}

export function assertSafeReadinessEvidence(value) {
  const visit = (current) => {
    if (typeof current === "string" && PROHIBITED_VALUE.test(current)) {
      throw new Error("Readiness evidence contains a prohibited field or value");
    }
    if (Array.isArray(current)) {
      for (const item of current) visit(item);
      return;
    }
    if (current && typeof current === "object") {
      for (const [key, nested] of Object.entries(current)) {
        if (PROHIBITED_KEY.test(key)) throw new Error("Readiness evidence contains a prohibited field or value");
        visit(nested);
      }
    }
  };
  visit(value);
  return value;
}

export function validateCumulativeReadinessInput(value, expectedSha) {
  if (!SHA_PATTERN.test(expectedSha) || value?.schema_version !== 1 || value.sha !== expectedSha) {
    throw new Error("Cumulative evidence must use schema version 1 and the exact lowercase source SHA");
  }
  requireExactKeys(value, [
    "schema_version", "sha", "deployments", "web", "ios", "android", "associations",
    "security", "deterministic", "telemetry", "release_checks",
  ], "cumulative input");
  requireExactKeys(value.deployments, ["railway_id", "vercel_id"], "deployments");
  requireSafeId(value.deployments.railway_id, "deployments.railway_id");
  requireSafeId(value.deployments.vercel_id, "deployments.vercel_id");

  requireExactKeys(value.web, ["sha", "passed", "deployment_id"], "web");
  requireSource(value.web, "web", expectedSha);
  requireSafeId(value.web.deployment_id, "web.deployment_id");
  if (value.web.deployment_id !== value.deployments.vercel_id) throw new Error("web deployment does not match deployments.vercel_id");

  for (const [label, platform, profile] of [
    ["ios", "ios", "readiness-ios"],
    ["android", "android", "readiness-android"],
  ]) {
    const mobile = value[label];
    requireExactKeys(mobile, [
      "sha", "passed", "platform", "profile", "build_id", "artifact_sha256",
      "inspection_passed", "receipt_sha256", "receipt",
    ], label);
    requireSource(mobile, label, expectedSha);
    if (mobile.platform !== platform || mobile.profile !== profile) throw new Error(`${label} platform or profile is invalid`);
    requireSafeId(mobile.build_id, `${label}.build_id`);
    requireChecksum(mobile.artifact_sha256, `${label}.artifact_sha256`);
    requireChecksum(mobile.receipt_sha256, `${label}.receipt_sha256`);
    requireBoolean(mobile.inspection_passed, `${label}.inspection_passed`);
    validateBuildReceipt(mobile.receipt, {
      platform,
      profile,
      candidate_sha: expectedSha,
      build_id: mobile.build_id,
      artifact_sha256: mobile.artifact_sha256,
    });
    const canonicalReceiptSha256 = createHash("sha256").update(JSON.stringify(mobile.receipt)).digest("hex");
    if (canonicalReceiptSha256 !== mobile.receipt_sha256) {
      throw new Error(`${label} receipt checksum does not authenticate the parsed receipt`);
    }
  }

  requireExactKeys(value.associations, ["sha", "passed", "manifest_sha256"], "associations");
  requireSource(value.associations, "associations", expectedSha);
  requireChecksum(value.associations.manifest_sha256, "associations.manifest_sha256");

  requireExactKeys(value.security, [
    "sha", "passed", "scan_id", "report_sha256", "critical_findings", "high_runtime_findings",
  ], "security");
  requireSource(value.security, "security", expectedSha);
  requireSafeId(value.security.scan_id, "security.scan_id");
  requireChecksum(value.security.report_sha256, "security.report_sha256");

  requireExactKeys(value.deterministic, [
    "sha", "passed", "ios_summary_sha256", "android_summary_sha256",
  ], "deterministic");
  requireSource(value.deterministic, "deterministic", expectedSha);
  requireChecksum(value.deterministic.ios_summary_sha256, "deterministic.ios_summary_sha256");
  requireChecksum(value.deterministic.android_summary_sha256, "deterministic.android_summary_sha256");

  requireExactKeys(value.telemetry, [
    "sha", "passed", "summary_sha256", "sentry_project_count", "posthog_platform_count",
  ], "telemetry");
  requireSource(value.telemetry, "telemetry", expectedSha);
  requireChecksum(value.telemetry.summary_sha256, "telemetry.summary_sha256");

  requireExactKeys(value.release_checks, [
    "owner_legal_reviewed", "google_attribution_reviewed", "support_delivery_confirmed",
    "privacy_delivery_confirmed", "otp_template_updated", "rollback_owner_recorded",
    "residual_risks_recorded",
  ], "release_checks");
  for (const flag of [
    "owner_legal_reviewed",
    "google_attribution_reviewed",
    "support_delivery_confirmed",
    "privacy_delivery_confirmed",
    "otp_template_updated",
    "rollback_owner_recorded",
    "residual_risks_recorded",
  ]) requireBoolean(value.release_checks?.[flag], `release_checks.${flag}`);
  if ((value.security.critical_findings ?? -1) !== 0 || (value.security.high_runtime_findings ?? -1) !== 0) {
    throw new Error("Critical or high runtime security findings block readiness");
  }
  return assertSafeReadinessEvidence(structuredClone(value));
}

export function validateStagingReadiness(value, expectedSha) {
  if (
    value?.build_sha !== expectedSha
    || value.auth_mode !== "supabase"
    || value.places_provider_mode !== "live"
    || value.ai_provider_mode !== "live"
    || value.provider_mode !== "live"
    || value.telemetry_mode !== "staging"
    || value.analytics_mode !== "anonymous"
    || value.error_reporting_mode !== "errors_only"
  ) throw new Error("Staging readiness does not match the exact cumulative candidate");
  return {
    exact_sha: true,
    supabase_auth: true,
    live_places: true,
    live_ai: true,
    anonymous_analytics: true,
    error_only_reporting: true,
  };
}

export function writeCumulativeReadinessEvidence(directory, summary) {
  mkdirSync(directory, { recursive: true });
  const safe = assertSafeReadinessEvidence(summary);
  const target = join(directory, "closed-beta-readiness-summary.json");
  writeFileSync(target, `${JSON.stringify(safe, null, 2)}\n`, { mode: 0o600 });
  return target;
}
