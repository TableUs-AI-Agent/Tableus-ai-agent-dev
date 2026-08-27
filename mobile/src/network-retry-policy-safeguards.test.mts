import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

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
