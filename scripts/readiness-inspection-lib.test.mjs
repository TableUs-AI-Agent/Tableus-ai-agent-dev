import assert from "node:assert/strict";
import test from "node:test";

import { validateReadinessAppConfig } from "./readiness-inspection-lib.mjs";

const sha = "a".repeat(40);
const options = {
  sha,
  apiUrl: "https://api.staging.example",
  supabaseUrl: "https://project.supabase.co",
  linkHost: "links.table-us.com",
  forbiddenOrigins: ["https://api.table-us.com"],
};
const valid = JSON.stringify({
  apiUrl: options.apiUrl,
  supabaseUrl: options.supabaseUrl,
  linkHost: options.linkHost,
  extra: { readiness: true, localE2E: false, authE2E: false, telemetryE2E: false, telemetryMode: "staging", demoMode: false, sourceSha: sha },
});

test("readiness inspection accepts only production-shaped staging configuration", () => {
  assert.equal(validateReadinessAppConfig(valid, options), true);
  for (const changed of [
    valid.replace('"readiness":true', '"readiness":false'),
    valid.replace('"localE2E":false', '"localE2E":true'),
    valid.replace('"telemetryMode":"staging"', '"telemetryMode":"off"'),
    valid.replace(options.apiUrl, "http://127.0.0.1:8000"),
  ]) assert.throws(() => validateReadinessAppConfig(changed, options));
});

test("readiness inspection rejects configured production origins", () => {
  assert.throws(() => validateReadinessAppConfig(`${valid}${options.forbiddenOrigins[0]}`, options), /forbidden origin/);
});
