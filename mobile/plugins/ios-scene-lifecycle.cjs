// Adapted from Expo's MIT-licensed SDK 57 scene plugin; see NOTICE.md.
const { isDeepStrictEqual } = require("node:util");

const LEGACY_DELEGATE = "class AppDelegate: ExpoAppDelegate {";
const SCENE_DELEGATE = "class AppDelegate: ExpoAppDelegate, ExpoReactNativeFactoryProvider {";
const LEGACY_STARTUP = `    window = UIWindow(frame: UIScreen.main.bounds)
    factory.startReactNative(
      withModuleName: "main",
      in: window,
      launchOptions: launchOptions)
`;

function sceneManifest() {
  return {
    UIApplicationSupportsMultipleScenes: false,
    UISceneConfigurations: {
      UIWindowSceneSessionRoleApplication: [{
        UISceneConfigurationName: "Default Configuration",
        UISceneDelegateClassName: "EXExpoAppSceneDelegate",
      }],
    },
  };
}

function assertExpoSceneRuntime(version) {
  const match = /^57\.0\.(\d+)$/.exec(version ?? "");
  if (!match || Number(match[1]) < 23) {
    throw new Error("TableUs scene lifecycle requires installed Expo 57.0.23 or a later stable 57.0 patch");
  }
}

// Expo parses plist dictionaries with null prototypes; compare their data.
function plistData(value) {
  if (Array.isArray(value)) return value.map(plistData);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, plistData(item)]));
  }
  return value;
}

function assertSceneManifest(manifest) {
  if (!isDeepStrictEqual(plistData(manifest), sceneManifest())) {
    throw new Error("TableUs requires its single-scene Expo scene manifest; custom or incomplete manifests are unsupported");
  }
}

function updateAppDelegate(contents) {
  const count = (text) => contents.split(text).length - 1;
  if (count("    reactNativeFactory = factory") !== 1
    || count("var reactNativeFactory: RCTReactNativeFactory?") !== 1
    || count("var window: UIWindow?") !== 1) {
    throw new Error("Unsupported AppDelegate factory/window shape for the Expo scene lifecycle");
  }
  if (count(SCENE_DELEGATE) === 1 && count(LEGACY_DELEGATE) === 0
    && count("startReactNative(") === 0 && count("UIWindow(frame:") === 0) return contents;
  if (count(LEGACY_DELEGATE) !== 1 || count(SCENE_DELEGATE) !== 0
    || count(LEGACY_STARTUP) !== 1 || count("startReactNative(") !== 1
    || count("UIWindow(frame:") !== 1) {
    throw new Error("Unsupported AppDelegate startup shape; expected the standard Expo SDK 57 template");
  }
  return contents.replace(LEGACY_DELEGATE, SCENE_DELEGATE).replace(LEGACY_STARTUP, "");
}

function assertIosSdkSceneCompatibility(info) {
  const sdk = /^iphone(?:os|simulator)(\d+)(?:\.\d+)*$/.exec(info.DTSDKName ?? "");
  if (!sdk) throw new Error("iOS artifact lacks valid DTSDKName provenance");
  if (Number(sdk[1]) >= 27) assertSceneManifest(info.UIApplicationSceneManifest);
}

function assertIosBuildCompatibility(sdkVersion, expoVersion, plugins) {
  if (!/^\d+\.\d+(?:\.\d+)?$/.test(sdkVersion)) throw new Error("Cannot determine the iOS build SDK version");
  if (Number(sdkVersion.split(".")[0]) < 27) return;
  assertExpoSceneRuntime(expoVersion);
  if (!plugins?.includes("./plugins/with-ios-scene-lifecycle.cjs")) {
    throw new Error("iOS SDK 27 builds require the TableUs scene-lifecycle config plugin before compilation");
  }
}

module.exports = { assertExpoSceneRuntime, assertSceneManifest, assertIosSdkSceneCompatibility, assertIosBuildCompatibility, sceneManifest, updateAppDelegate };
