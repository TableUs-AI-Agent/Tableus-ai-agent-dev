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
  updates: { enabled: false, checkAutomatically: "NEVER" },
  extra: {
    apiUrl: options.apiUrl,
    supabaseUrl: options.supabaseUrl,
    linkHost: options.linkHost,
    readiness: true,
    localE2E: false,
    authE2E: false,
    telemetryE2E: false,
    telemetryMode: "staging",
    demoMode: false,
    sourceSha: sha,
    eas: { projectId: "0601c3b9-0082-454c-b636-45a1fe377f7b" },
  },
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
  const parsed = JSON.parse(valid);
  parsed.decoy = options.forbiddenOrigins[0];
  assert.throws(() => validateReadinessAppConfig(JSON.stringify(parsed), options), /forbidden origin/);
});

test("readiness inspection rejects decoys and mutable update authority", () => {
  const wrongApi = JSON.parse(valid);
  wrongApi.extra.apiUrl = "https://attacker.example";
  wrongApi.decoyApiUrl = options.apiUrl;
  assert.throws(() => validateReadinessAppConfig(JSON.stringify(wrongApi), options), /exact reviewed/);

  const wrongProject = JSON.parse(valid);
  wrongProject.extra.eas.projectId = "389cad4e-f9b9-45f4-8621-462d47fa6301";
  assert.throws(() => validateReadinessAppConfig(JSON.stringify(wrongProject), options), /EAS project/);

  const updatesEnabled = JSON.parse(valid);
  updatesEnabled.updates = { enabled: true, url: "https://u.expo.dev/attacker" };
  assert.throws(() => validateReadinessAppConfig(JSON.stringify(updatesEnabled), options), /updates disabled/);
});
