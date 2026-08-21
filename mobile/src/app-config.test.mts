import assert from "node:assert/strict";
import test from "node:test";

import resolveExpoConfig from "../app.config.ts";

function configFor(profile: string, flag = "true") {
  const previousProfile = process.env.EAS_BUILD_PROFILE;
  const previousFlag = process.env.TABLEUS_LOCAL_E2E;
  process.env.EAS_BUILD_PROFILE = profile;
  process.env.TABLEUS_LOCAL_E2E = flag;
  try {
    return resolveExpoConfig({ config: {} } as Parameters<typeof resolveExpoConfig>[0]);
  } finally {
    if (previousProfile === undefined) delete process.env.EAS_BUILD_PROFILE;
    else process.env.EAS_BUILD_PROFILE = previousProfile;
    if (previousFlag === undefined) delete process.env.TABLEUS_LOCAL_E2E;
    else process.env.TABLEUS_LOCAL_E2E = previousFlag;
  }
}

function buildProperties(config: ReturnType<typeof resolveExpoConfig>) {
  return config.plugins?.find(
    (plugin): plugin is [string, { android: { usesCleartextTraffic: boolean } }] =>
      Array.isArray(plugin) && plugin[0] === "expo-build-properties",
  )?.[1];
}

test("local E2E configuration is enabled only for test artifacts", () => {
  for (const profile of ["test-ios", "test-android"]) {
    const config = configFor(profile);
    assert.equal(config.extra?.localE2E, true);
    assert.equal(config.ios?.infoPlist?.NSAppTransportSecurity.NSAllowsLocalNetworking, true);
    assert.equal(buildProperties(config)?.android.usesCleartextTraffic, true);
  }

  for (const profile of ["development", "preview", "production"]) {
    const config = configFor(profile);
    assert.equal(config.extra?.localE2E, false);
    assert.equal(config.ios?.infoPlist, undefined);
    assert.equal(buildProperties(config)?.android.usesCleartextTraffic, false);
  }
});

test("test profiles still require the explicit local E2E flag", () => {
  const config = configFor("test-ios", "false");
  assert.equal(config.extra?.localE2E, false);
  assert.equal(config.ios?.infoPlist, undefined);
  assert.equal(buildProperties(config)?.android.usesCleartextTraffic, false);
});
