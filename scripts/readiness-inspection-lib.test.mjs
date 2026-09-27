import assert from "node:assert/strict";
import test from "node:test";

import { validateAuthAppConfig, validateLocalE2EAppConfig, validateReadinessAppConfig, validateTelemetryAppConfig } from "./readiness-inspection-lib.mjs";

const sha = "a".repeat(40);
const options = {
  sha,
  apiUrl: "https://api-staging-3795.up.railway.app",
  supabaseUrl: "https://mrwdhdeubdiiydmmvlda.supabase.co",
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

test("auth inspection uses active structured values instead of decoy markers", () => {
  const auth = JSON.parse(valid);
  Object.assign(auth.extra, { readiness: false, authE2E: true, telemetryE2E: false });
  assert.equal(validateAuthAppConfig(JSON.stringify(auth), options).extra.authE2E, true);

  auth.extra.apiUrl = "https://attacker.example";
  auth.decoy = { apiUrl: options.apiUrl, authE2E: true };
  assert.throws(() => validateAuthAppConfig(JSON.stringify(auth), options), /exact reviewed/);
});

test("local E2E inspection requires active loopback and mutually exclusive controls", () => {
  const local = JSON.parse(valid);
  Object.assign(local.extra, {
    apiUrl: "http://127.0.0.1:8000",
    localE2E: true,
    demoMode: true,
    readiness: false,
    authE2E: false,
    telemetryE2E: false,
  });
  assert.equal(validateLocalE2EAppConfig(JSON.stringify(local), { sha }).extra.localE2E, true);
  local.extra.apiUrl = "https://attacker.example";
  local.decoy = "http://127.0.0.1:8000";
  assert.throws(() => validateLocalE2EAppConfig(JSON.stringify(local), { sha }), /loopback API/);
});

test("telemetry inspection requires only the staging telemetry control", () => {
  const telemetry = JSON.parse(valid);
  Object.assign(telemetry.extra, {
    readiness: false,
    authE2E: false,
    telemetryE2E: true,
    telemetryMode: "staging",
  });
  assert.equal(validateTelemetryAppConfig(JSON.stringify(telemetry), options).extra.telemetryE2E, true);
  telemetry.extra.authE2E = true;
  assert.throws(() => validateTelemetryAppConfig(JSON.stringify(telemetry), options), /unrelated test control/);
});
