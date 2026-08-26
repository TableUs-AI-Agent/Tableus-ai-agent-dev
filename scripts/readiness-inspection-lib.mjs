export function validateReadinessAppConfig(configuration, { sha, apiUrl, supabaseUrl, linkHost, forbiddenOrigins = [] }) {
  const requiredText = [sha, apiUrl, supabaseUrl, linkHost];
  for (const marker of requiredText) {
    if (!configuration.includes(marker)) throw new Error(`Embedded readiness configuration is missing: ${marker}`);
  }
  for (const [name, expected] of Object.entries({
    readiness: true,
    localE2E: false,
    authE2E: false,
    telemetryE2E: false,
    demoMode: false,
  })) {
    const expression = new RegExp(`"${name}"\\s*:\\s*${expected}`);
    if (!expression.test(configuration)) throw new Error(`Embedded readiness configuration must set ${name}=${expected}`);
  }
  if (!/"telemetryMode"\s*:\s*"staging"/.test(configuration)) {
    throw new Error("Embedded readiness configuration must use staging telemetry");
  }
  for (const forbidden of ["http://127.0.0.1", "http://localhost", "http://[::1]", ...forbiddenOrigins.filter(Boolean)]) {
    if (configuration.includes(forbidden)) throw new Error(`Embedded readiness configuration contains a forbidden origin: ${forbidden}`);
  }
  return true;
}
