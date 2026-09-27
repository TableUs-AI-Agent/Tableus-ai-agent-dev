import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { spawnSync } from "node:child_process";
import { join, dirname } from "node:path";
import test from "node:test";
import plistModule from "@expo/plist";
import lifecycle from "../mobile/plugins/ios-scene-lifecycle.cjs";

const require = createRequire(import.meta.url);
const template = join(dirname(require.resolve("expo/package.json")), "template.tgz");
const result = spawnSync("tar", ["-xOf", template, "package/ios/HelloWorld/AppDelegate.swift"], { encoding: "utf8" });
assert.equal(result.status, 0, "Read the actual installed Expo template, not a mirrored fixture");
const original = result.stdout;

test("SDK 27 rejects the crashing runtime and missing scene opt-in before compilation", () => {
  const plugin = ["./plugins/with-ios-scene-lifecycle.cjs"];
  assert.throws(() => lifecycle.assertIosBuildCompatibility("27.0", "57.0.18", plugin), /57.0.23/);
  assert.throws(() => lifecycle.assertIosBuildCompatibility("27.0", "57.0.23", []), /plugin/);
  lifecycle.assertIosBuildCompatibility("27.0", "57.0.23", plugin);
  lifecycle.assertIosBuildCompatibility("26.6", "57.0.18", []);
  assert.throws(() => lifecycle.assertIosBuildCompatibility("", "57.0.23", plugin), /SDK version/);
});

test("installed-runtime guard rejects normalized, old, preview and next-major versions", () => {
  for (const v of [undefined, "57.0.0", "57.0.22", "57.0.23-canary.1", "58.0.0"]) {
    assert.throws(() => lifecycle.assertExpoSceneRuntime(v), /installed Expo/);
  }
  for (const v of ["57.0.23", "57.0.24"]) lifecycle.assertExpoSceneRuntime(v);
});

test("actual Expo template migrates once while preserving factory and link overrides", () => {
  const migrated = lifecycle.updateAppDelegate(original);
  assert.match(migrated, /AppDelegate: ExpoAppDelegate, ExpoReactNativeFactoryProvider/);
  assert.match(migrated, /reactNativeFactory = factory/);
  assert.doesNotMatch(migrated, /startReactNative\(|UIWindow\(frame:/);
  assert.equal(migrated.slice(migrated.indexOf("  // Linking API")), original.slice(original.indexOf("  // Linking API")));
  assert.equal(lifecycle.updateAppDelegate(migrated), migrated);
});

test("partial, duplicate and custom AppDelegate migrations fail closed", () => {
  for (const contents of [
    original.replace('withModuleName: "main"', 'withModuleName: "custom"'),
    original.replace("class AppDelegate: ExpoAppDelegate {", "class AppDelegate: CustomDelegate {"),
    original.replace("    reactNativeFactory = factory", ""),
    original + "\nfactory.startReactNative()",
    original.replace("class AppDelegate: ExpoAppDelegate {", "class AppDelegate: ExpoAppDelegate, ExpoReactNativeFactoryProvider {"),
    lifecycle.updateAppDelegate(original) + "\nfactory.startReactNative()",
  ]) assert.throws(() => lifecycle.updateAppDelegate(contents), /Unsupported AppDelegate/);
});

test("SDK 27 artifact manifest guard rejects the recorded crash and incomplete scene configurations", () => {
  assert.throws(() => lifecycle.assertIosSdkSceneCompatibility({ DTSDKName: "iphoneos27.0" }), /scene manifest/);
  for (const manifest of [{}, { UIApplicationSupportsMultipleScenes: false },
    { ...lifecycle.sceneManifest(), UIApplicationSupportsMultipleScenes: true },
    { ...lifecycle.sceneManifest(), extra: true }]) {
    assert.throws(() => lifecycle.assertIosSdkSceneCompatibility({ DTSDKName: "iphonesimulator27.0", UIApplicationSceneManifest: manifest }), /scene manifest/);
  }
  for (const sdk of ["iphoneos27.0", "iphonesimulator27.0", "iphoneos28.1"]) {
    lifecycle.assertIosSdkSceneCompatibility({ DTSDKName: sdk, UIApplicationSceneManifest: lifecycle.sceneManifest() });
  }
  lifecycle.assertIosSdkSceneCompatibility({ DTSDKName: "iphoneos26.6" });
  assert.throws(() => lifecycle.assertIosSdkSceneCompatibility({}), /DTSDKName/);
});

test("equivalent scene manifests do not depend on plist key order", () => {
  const manifest = lifecycle.sceneManifest();
  lifecycle.assertSceneManifest(plistModule.default.parse(plistModule.default.build(manifest)));
  lifecycle.assertSceneManifest({ UISceneConfigurations: manifest.UISceneConfigurations, UIApplicationSupportsMultipleScenes: false });
  manifest.UISceneConfigurations.UIWindowSceneSessionRoleApplication[0].UISceneDelegateClassName = "CustomScene";
  assert.throws(() => lifecycle.assertSceneManifest(manifest), /scene manifest/);
});
