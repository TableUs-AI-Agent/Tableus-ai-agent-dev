import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { findIosSimulator, validateAndroidDevice, validateArtifact } from "./mobile-device-preflight.mjs";

test("iOS preflight selects a simulator without retaining its identifier", () => {
  const simulator = findIosSimulator({
    devices: {
      "com.apple.CoreSimulator.SimRuntime.iOS-26-5": [
        { name: "TableUsLifecycle-iPhone17Pro", udid: "private-udid", state: "Booted", isAvailable: true },
      ],
    },
  }, "TableUsLifecycle-iPhone17Pro");
  assert.equal(simulator?.state, "Booted");
  assert.equal(simulator?.runtime.endsWith("iOS-26-5"), true);
});

test("Android preflight requires an online API 36 ARM64 emulator", () => {
  assert.deepEqual(validateAndroidDevice({
    state: "device",
    bootCompleted: "1",
    apiLevel: "36",
    abi: "arm64-v8a",
    emulator: "1",
  }), { api_level: 36, architecture: "arm64-v8a" });
  assert.throws(() => validateAndroidDevice({ state: "device", bootCompleted: "1", apiLevel: "35", abi: "arm64-v8a", emulator: "1" }), /API 36/);
  assert.throws(() => validateAndroidDevice({ state: "device", bootCompleted: "1", apiLevel: "36", abi: "x86_64", emulator: "1" }), /ARM64/);
  assert.throws(() => validateAndroidDevice({ state: "device", bootCompleted: "1", apiLevel: "36", abi: "arm64-v8a", emulator: "0" }), /emulator/);
});

test("preflight accepts only platform-appropriate local artifacts", () => {
  const root = mkdtempSync(join(tmpdir(), "tableus-device-preflight-test-"));
  try {
    const app = join(root, "TableUs.app");
    const apk = join(root, "tableus.apk");
    mkdirSync(app);
    writeFileSync(apk, "apk");
    assert.equal(validateArtifact("ios", app), "app");
    assert.equal(validateArtifact("android", apk), "apk");
    assert.throws(() => validateArtifact("ios", apk), /\.app/);
    assert.throws(() => validateArtifact("android", app), /APK/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
