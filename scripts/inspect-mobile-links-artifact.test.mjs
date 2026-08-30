import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(new URL("./inspect-mobile-links-artifact.mjs", import.meta.url), "utf8");

test("verified-link inspection requires exact signed native associations", () => {
  for (const marker of [
    "applinks:${host}",
    "android:autoVerify=\\\"true\\\"",
    "android:pathPrefix=\\\"/join/\\\"",
    "android:path=\\\"/auth\\\"",
    "/auth/confirm",
  ]) assert.equal(source.includes(marker), true);
});

test("verified-link inspection rejects private test and credential markers from active configuration", () => {
  for (const marker of [
    "appConfigurationBytes",
    "/assets/app.config",
    "/EXConstants.bundle/app.config",
    "embedded.mobileprovision",
    '"cms", "-inform", "der", "-verify"',
    '"-signer", profileSignerPath',
    "ProvisionedDevices",
    "demo-organizer",
    "http://127.0.0.1",
    "NSAppTransportSecurity.NSAllowsLocalNetworking",
    'android:usesCleartextTraffic=\"true\"',
    "SUPABASE_SERVICE_ROLE",
    '"localE2E":false',
    '"authE2E":false',
  ]) {
    assert.equal(source.includes(marker), true);
  }
});
