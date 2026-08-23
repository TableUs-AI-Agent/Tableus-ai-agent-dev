import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import resolveExpoConfig from "../app.config.ts";

function configFor(profile: string, flag = "true", authFlag = "false", apiUrl = "http://127.0.0.1:8000", linkHost = "links.table-us.com") {
  const previousProfile = process.env.EAS_BUILD_PROFILE;
  const previousFlag = process.env.TABLEUS_LOCAL_E2E;
  const previousAuthFlag = process.env.TABLEUS_AUTH_E2E;
  const previousApiUrl = process.env.EXPO_PUBLIC_API_URL;
  const previousDemoMode = process.env.EXPO_PUBLIC_DEMO_MODE;
  const previousSourceSha = process.env.EAS_BUILD_GIT_COMMIT_HASH;
  const previousLinkHost = process.env.EXPO_PUBLIC_LINK_HOST;
  process.env.EAS_BUILD_PROFILE = profile;
  process.env.TABLEUS_LOCAL_E2E = flag;
  process.env.TABLEUS_AUTH_E2E = authFlag;
  process.env.EXPO_PUBLIC_API_URL = apiUrl;
  process.env.EXPO_PUBLIC_DEMO_MODE = "false";
  process.env.EAS_BUILD_GIT_COMMIT_HASH = "a".repeat(40);
  process.env.EXPO_PUBLIC_LINK_HOST = linkHost;
  try {
    return resolveExpoConfig({ config: {} } as Parameters<typeof resolveExpoConfig>[0]);
  } finally {
    if (previousProfile === undefined) delete process.env.EAS_BUILD_PROFILE;
    else process.env.EAS_BUILD_PROFILE = previousProfile;
    if (previousFlag === undefined) delete process.env.TABLEUS_LOCAL_E2E;
    else process.env.TABLEUS_LOCAL_E2E = previousFlag;
    if (previousAuthFlag === undefined) delete process.env.TABLEUS_AUTH_E2E;
    else process.env.TABLEUS_AUTH_E2E = previousAuthFlag;
    if (previousApiUrl === undefined) delete process.env.EXPO_PUBLIC_API_URL;
    else process.env.EXPO_PUBLIC_API_URL = previousApiUrl;
    if (previousDemoMode === undefined) delete process.env.EXPO_PUBLIC_DEMO_MODE;
    else process.env.EXPO_PUBLIC_DEMO_MODE = previousDemoMode;
    if (previousSourceSha === undefined) delete process.env.EAS_BUILD_GIT_COMMIT_HASH;
    else process.env.EAS_BUILD_GIT_COMMIT_HASH = previousSourceSha;
    if (previousLinkHost === undefined) delete process.env.EXPO_PUBLIC_LINK_HOST;
    else process.env.EXPO_PUBLIC_LINK_HOST = previousLinkHost;
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

test("verified links use one exact HTTPS host and exclude the web auth callback", () => {
  const config = configFor("links-test-android");
  assert.deepEqual(config.ios?.associatedDomains, ["applinks:links.table-us.com"]);
  assert.deepEqual(config.android?.intentFilters?.map((filter) => filter.data), [
    [{ scheme: "https", host: "links.table-us.com", pathPrefix: "/join/" }],
    [{ scheme: "https", host: "links.table-us.com", path: "/auth" }],
  ]);
  assert.equal(JSON.stringify(config.android?.intentFilters).includes("/auth/confirm"), false);
});

test("test profiles still require the explicit local E2E flag", () => {
  const config = configFor("test-ios", "false");
  assert.equal(config.extra?.localE2E, false);
  assert.equal(config.ios?.infoPlist, undefined);
  assert.equal(buildProperties(config)?.android.usesCleartextTraffic, false);
});

test("auth E2E is enabled only for auth test profiles with HTTPS staging", () => {
  for (const profile of ["auth-test-ios", "auth-test-android"]) {
    const config = configFor(profile, "false", "true", "https://tableus-api-staging.example");
    assert.equal(config.extra?.authE2E, true);
    assert.equal(config.extra?.sourceSha, "a".repeat(40));
    assert.equal(config.extra?.localE2E, false);
    assert.equal(config.ios?.infoPlist, undefined);
    assert.equal(buildProperties(config)?.android.usesCleartextTraffic, false);
  }
  for (const profile of ["development", "preview", "production", "test-ios", "test-android"]) {
    assert.equal(configFor(profile, "false", "true", "https://tableus-api-staging.example").extra?.authE2E, false);
  }
  assert.equal(configFor("auth-test-ios", "false", "true", "http://127.0.0.1:8000").extra?.authE2E, false);
});

test("auth test EAS profiles explicitly disable demo and local E2E configuration", () => {
  const eas = JSON.parse(readFileSync(new URL("../eas.json", import.meta.url), "utf8"));
  for (const profile of ["auth-test-ios", "auth-test-android"]) {
    const env = eas.build[profile].env;
    assert.equal(eas.build[profile].environment, "preview");
    assert.equal(env.EXPO_PUBLIC_DEMO_MODE, "false");
    assert.equal(env.EXPO_PUBLIC_DEMO_USER_ID, undefined);
    assert.equal(env.EXPO_PUBLIC_DEMO_IDENTITIES, undefined);
    assert.equal(env.TABLEUS_LOCAL_E2E, "false");
    assert.equal(env.TABLEUS_AUTH_E2E, "true");
    assert.equal(env.EXPO_PUBLIC_API_URL, undefined);
  }
});

test("link test profiles inherit preview without enabling test controls", () => {
  const eas = JSON.parse(readFileSync(new URL("../eas.json", import.meta.url), "utf8"));
  for (const profile of ["links-test-ios", "links-test-android"]) {
    const build = eas.build[profile];
    assert.equal(build.extends, "preview");
    assert.equal(build.env.EXPO_PUBLIC_LINK_HOST, "links.table-us.com");
    assert.equal(build.env.EXPO_PUBLIC_DEMO_MODE, "false");
    assert.equal(build.env.TABLEUS_LOCAL_E2E, "false");
    assert.equal(build.env.TABLEUS_AUTH_E2E, "false");
    assert.equal(build.env.EXPO_PUBLIC_DEMO_USER_ID, undefined);
    assert.equal(build.env.EXPO_PUBLIC_DEMO_IDENTITIES, undefined);
  }
});
