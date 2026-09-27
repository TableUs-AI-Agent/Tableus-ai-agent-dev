import { RELEASE_ORIGINS, requireReleaseOrigin } from "./release-origins.mjs";

const TABLEUS_EAS_PROJECT_ID = "0601c3b9-0082-454c-b636-45a1fe377f7b";

function parseConfiguration(configuration) {
  let parsed;
  try {
    parsed = JSON.parse(configuration);
  } catch {
    throw new Error("Embedded Expo configuration is not valid JSON");
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Embedded Expo configuration must be one JSON object");
  }
  if (!parsed.extra || typeof parsed.extra !== "object" || Array.isArray(parsed.extra)) {
    throw new Error("Embedded Expo configuration has no structured extra object");
  }
  return parsed;
}

export function validateHostedAppConfig(
  configuration,
  { sha, apiUrl, supabaseUrl, linkHost, forbiddenOrigins = [] },
) {
  requireReleaseOrigin(apiUrl, RELEASE_ORIGINS.stagingApi, "Expected API origin");
  requireReleaseOrigin(supabaseUrl, RELEASE_ORIGINS.stagingSupabase, "Expected Supabase origin");
  if (`https://${linkHost}` !== RELEASE_ORIGINS.stagingLinks) throw new Error("Embedded link host is not the source-controlled host");
  const parsed = parseConfiguration(configuration);
  const extra = parsed.extra;
  if (extra.apiUrl !== apiUrl) throw new Error("Embedded API origin is not the exact reviewed value");
  if (extra.supabaseUrl !== supabaseUrl) {
    throw new Error("Embedded Supabase origin is not the exact reviewed value");
  }
  if (extra.linkHost !== linkHost) throw new Error("Embedded link host is not the exact reviewed value");
  if (extra.sourceSha !== sha || !/^[0-9a-f]{40}$/.test(extra.sourceSha)) {
    throw new Error("Embedded source SHA is not the exact reviewed commit");
  }
  if (extra.localE2E !== false || extra.demoMode !== false) {
    throw new Error("Hosted artifact enables a demo or local-E2E control");
  }
  if (extra.eas?.projectId !== TABLEUS_EAS_PROJECT_ID) {
    throw new Error("Embedded EAS project ID is not the source-controlled TableUs project");
  }
  if (parsed.updates?.enabled !== false || parsed.updates?.url) {
    throw new Error("Hosted artifact must keep unsigned Expo updates disabled");
  }
  const serialized = JSON.stringify(parsed);
  for (const forbidden of [
    "http://127.0.0.1",
    "http://localhost",
    "http://[::1]",
    ...forbiddenOrigins.filter(Boolean),
  ]) {
    if (serialized.includes(forbidden)) {
      throw new Error(`Embedded hosted configuration contains a forbidden origin: ${forbidden}`);
    }
  }
  return parsed;
}

export function validateReadinessAppConfig(configuration, options) {
  const parsed = validateHostedAppConfig(configuration, options);
  const extra = parsed.extra;
  for (const [name, expected] of Object.entries({
    readiness: true,
    authE2E: false,
    telemetryE2E: false,
  })) {
    if (extra[name] !== expected) {
      throw new Error(`Embedded readiness configuration must set ${name}=${expected}`);
    }
  }
  if (extra.telemetryMode !== "staging") {
    throw new Error("Embedded readiness configuration must use staging telemetry");
  }
  return true;
}

export function validateAuthAppConfig(configuration, options) {
  const parsed = validateHostedAppConfig(configuration, options);
  const extra = parsed.extra;
  if (extra.authE2E !== true || extra.localE2E !== false || extra.demoMode !== false) {
    throw new Error("Canonical auth artifact configuration is not fail-closed");
  }
  if (extra.readiness !== false || extra.telemetryE2E !== false) {
    throw new Error("Auth artifact enables an unrelated test control");
  }
  return parsed;
}

export function validateLocalE2EAppConfig(configuration, { sha, forbiddenOrigins = [] }) {
  const parsed = parseConfiguration(configuration);
  const extra = parsed.extra;
  if (extra.sourceSha !== sha || !/^[0-9a-f]{40}$/.test(extra.sourceSha)) throw new Error("Local-E2E source SHA is not exact");
  if (extra.apiUrl !== "http://127.0.0.1:8000" || extra.localE2E !== true || extra.demoMode !== true) {
    throw new Error("Canonical local-E2E controls or loopback API are not active");
  }
  if (extra.authE2E !== false || extra.telemetryE2E !== false || extra.readiness !== false) {
    throw new Error("Local-E2E artifact enables an unrelated hosted control");
  }
  if (extra.eas?.projectId !== TABLEUS_EAS_PROJECT_ID) throw new Error("Local-E2E artifact uses an unreviewed EAS project");
  if (parsed.updates?.enabled !== false || parsed.updates?.url) throw new Error("Local-E2E artifact must keep unsigned Expo updates disabled");
  const serialized = JSON.stringify(parsed);
  for (const forbidden of ["SUPABASE_SERVICE_ROLE", "service_role", ...forbiddenOrigins.filter(Boolean)]) {
    if (serialized.includes(forbidden)) throw new Error(`Canonical local-E2E configuration contains forbidden data: ${forbidden}`);
  }
  return parsed;
}

export function validateTelemetryAppConfig(configuration, options) {
  const parsed = validateHostedAppConfig(configuration, options);
  const extra = parsed.extra;
  if (extra.telemetryE2E !== true || extra.telemetryMode !== "staging") {
    throw new Error("Telemetry artifact does not enable only staging telemetry evidence");
  }
  if (extra.localE2E !== false || extra.authE2E !== false || extra.readiness !== false) {
    throw new Error("Telemetry artifact enables an unrelated test control");
  }
  return parsed;
}
