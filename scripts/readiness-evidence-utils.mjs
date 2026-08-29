import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const SHA_PATTERN = /^[0-9a-f]{40}$/;
const CHECKSUM_PATTERN = /^[0-9a-f]{64}$/;
const PROHIBITED_KEY = /^(?:email|otp|password|secret|credential|authorization|access_token|refresh_token|share_token|invite_code|verification_code|idempotency_key|place_id|restaurant(?:_name|_address)?|address|latitude|longitude|coordinates?|provider_response|review_text|prompt|query|photo(?:_bytes|_url)?)$/i;
const PROHIBITED_VALUE = /(?:[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}|bearer\s+|[?&](?:token|code|key)=|\/join\/[^\s?]+\?|\b(?:otp|password|secret|credential)\b|ChI[0-9A-Za-z_-]{15,}|AIza[0-9A-Za-z_-]{20,}|sb_(?:secret|publishable)_[0-9A-Za-z_-]+|^[0-9]{6,10}$)/i;

function requireBoolean(value, label) {
  if (value !== true) throw new Error(`${label} must be true`);
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
  for (const [label, source] of Object.entries({
    web: value.web,
    ios: value.ios,
    android: value.android,
    associations: value.associations,
    security: value.security,
    deterministic: value.deterministic,
    telemetry: value.telemetry,
  })) requireSource(source, label, expectedSha);

  for (const [label, mobile] of Object.entries({ ios: value.ios, android: value.android })) {
    if (!mobile.build_id || !CHECKSUM_PATTERN.test(mobile.artifact_sha256 ?? "")) throw new Error(`${label} artifact receipt is incomplete`);
    requireBoolean(mobile.inspection_passed, `${label}.inspection_passed`);
  }
  if (!value.deployments?.railway_id || !value.deployments?.vercel_id) throw new Error("Railway and Vercel deployment IDs are required");
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
  return assertSafeReadinessEvidence(value);
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
