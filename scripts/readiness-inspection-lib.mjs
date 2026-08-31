const TABLEUS_EAS_PROJECT_ID = "0601c3b9-0082-454c-b636-45a1fe377f7b";

function exactHttpsOrigin(value, expected, label) {
  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error(`${label} must be a valid HTTPS origin`);
  }
  if (
    parsed.protocol !== "https:"
    || parsed.username
    || parsed.password
    || parsed.port
    || parsed.pathname !== "/"
    || parsed.search
    || parsed.hash
    || parsed.origin !== expected
  ) {
    throw new Error(`${label} does not equal the reviewed origin`);
  }
  return parsed.origin;
}

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
  exactHttpsOrigin(apiUrl, apiUrl, "Expected API origin");
  exactHttpsOrigin(supabaseUrl, supabaseUrl, "Expected Supabase origin");
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
