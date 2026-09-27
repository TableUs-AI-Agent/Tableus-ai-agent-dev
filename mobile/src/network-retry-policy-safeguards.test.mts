import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const mobileRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const moduleConfig = JSON.parse(readFileSync(new URL("../modules/network-retry-policy/expo-module.config.json", import.meta.url), "utf8"));
const androidPackage = readFileSync(
  new URL("../modules/network-retry-policy/android/src/main/java/expo/modules/tableusnetworkretrypolicy/NetworkRetryPolicyPackage.kt", import.meta.url),
  "utf8",
);

test("the Android transport disables transparent connection retries at application startup", () => {
  assert.deepEqual(moduleConfig.platforms, ["android"]);
  assert.match(androidPackage, /createApplicationLifecycleListeners/);
  assert.match(androidPackage, /OkHttpClientProvider\.setOkHttpClientFactory/);
  assert.match(androidPackage, /retryOnConnectionFailure\(false\)/);
});

test("Expo autolinking resolves the Android application lifecycle package", () => {
  const resolver = resolve(mobileRoot, "../node_modules/expo-modules-autolinking/bin/expo-modules-autolinking.js");
  const result = spawnSync(
    process.execPath,
    [resolver, "resolve", "--platform", "android", "--json"],
    { cwd: mobileRoot, encoding: "utf8" },
  );

  assert.equal(result.status, 0, result.stderr);
  const resolved = JSON.parse(result.stdout);
  const retryPolicy = resolved.modules.find((candidate) => candidate.packageName === "network-retry-policy");
  assert.deepEqual(
    retryPolicy?.projects?.[0]?.packages,
    ["expo.modules.tableusnetworkretrypolicy.NetworkRetryPolicyPackage"],
  );
});
