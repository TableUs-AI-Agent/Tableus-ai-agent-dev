#!/usr/bin/env node
// Generate native sources only: no CocoaPods, compilation, devices, or providers.
import assert from "node:assert/strict";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import plistModule from "@expo/plist";
const plist = plistModule.default;
import lifecycle from "../mobile/plugins/ios-scene-lifecycle.cjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const evidence = process.argv[2] ? resolve(process.argv[2]) : undefined;
const temporaryRoot = mkdtempSync(join(tmpdir(), "tableus-scene-prebuild-"));
const scratch = join(temporaryRoot, "mobile");
const digest = (value) => createHash("sha256").update(value).digest("hex");
const pluginLine = '      "./plugins/with-ios-scene-lifecycle.cjs",\n';
const config = readFileSync(join(root, "mobile/app.config.ts"), "utf8");
assert.equal(config.split(pluginLine).length, 2, "Expected one scene plugin opt-in");
if (evidence) mkdirSync(evidence, { recursive: true });
const env = {
  ...process.env, CI: "1", EXPO_OFFLINE: "1", EAS_BUILD_PROFILE: "test-ios",
  TABLEUS_LOCAL_E2E: "true", EXPO_PUBLIC_DEMO_MODE: "true",
  EXPO_PUBLIC_API_URL: "http://127.0.0.1:8000", EXPO_PUBLIC_TELEMETRY_MODE: "off",
};
// Sentry assigns a fresh build-phase UUID on each clean generation. Normalize
// only that known identifier; preserve and compare every build setting/script.
function stableProject(contents) {
  const ids = [...contents.matchAll(/([A-F0-9]{24}) \/\* Upload Debug Symbols to Sentry \*\//g)].map((match) => match[1]);
  assert.equal(new Set(ids).size, 1, "Expected one Sentry symbol build phase");
  return contents.replaceAll(ids[0], "SENTRY_SYMBOL_PHASE_UUID");
}
function prebuild(label) {
  const result = spawnSync(process.execPath, [join(root, "node_modules/expo/bin/cli"),
    "prebuild", "--platform", "ios", "--no-install", "--template", join(root, "node_modules/expo/template.tgz")],
  { cwd: scratch, env, encoding: "utf8", maxBuffer: 8 * 1024 * 1024 });
  if (evidence) writeFileSync(join(evidence, `${label}.log`), `${result.stdout ?? ""}${result.stderr ?? ""}`, { mode: 0o600 });
  assert.equal(result.status, 0, `${label} prebuild failed: ${result.stderr}`);
  const ios = join(scratch, "ios/TableUs");
  return {
    appDelegate: readFileSync(join(ios, "AppDelegate.swift"), "utf8"),
    info: plist.parse(readFileSync(join(ios, "Info.plist"), "utf8")),
    project: stableProject(readFileSync(join(scratch, "ios/TableUs.xcodeproj/project.pbxproj"), "utf8")),
  };
}
try {
  mkdirSync(scratch);
  symlinkSync(join(root, "node_modules"), join(temporaryRoot, "node_modules"), "dir");
  cpSync(join(root, "mobile/package.json"), join(scratch, "package.json"));
  cpSync(join(root, "mobile/plugins"), join(scratch, "plugins"), { recursive: true });
  symlinkSync(join(root, "mobile/node_modules"), join(scratch, "node_modules"), "dir");
  writeFileSync(join(scratch, "app.config.ts"), config.replace(pluginLine, ""));
  const before = prebuild("before");
  assert.throws(() => lifecycle.assertIosSdkSceneCompatibility({ ...before.info, DTSDKName: "iphoneos27.0" }), /scene manifest/);
  writeFileSync(join(scratch, "app.config.ts"), config);
  const after = prebuild("after");
  lifecycle.assertSceneManifest(after.info.UIApplicationSceneManifest);
  assert.equal(after.appDelegate, lifecycle.updateAppDelegate(before.appDelegate));
  assert.equal(after.project, before.project, "Scene integration must not mutate the Xcode project");
  const { UIApplicationSceneManifest: _manifest, ...remainingInfo } = after.info;
  assert.deepEqual(remainingInfo, { ...before.info }, "Transport and every unrelated plist value must be preserved");
  const repeated = prebuild("repeated");
  assert.deepEqual(repeated, after, "Repeated prebuild must not duplicate or drift scene integration");
  const summary = {
    passed: true, native_compilation_performed: false, provider_calls: 0,
    expo_version: JSON.parse(readFileSync(join(root, "node_modules/expo/package.json"), "utf8")).version,
    missing_scene_rejected_before: true, scene_manifest_valid_after: true,
    app_delegate_matches_reviewed_migration: true, unrelated_plist_and_project_unchanged: true,
    repeated_prebuild_identical_except_sentry_uuid: true, generated_app_delegate_sha256: digest(after.appDelegate),
    generated_info_sha256: digest(JSON.stringify(after.info)),
  };
  if (evidence) writeFileSync(join(evidence, "summary.json"), `${JSON.stringify(summary, null, 2)}\n`);
  process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
} finally {
  rmSync(temporaryRoot, { recursive: true, force: true });
}
