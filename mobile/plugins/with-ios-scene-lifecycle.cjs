// Adapted from Expo's MIT-licensed SDK 57 scene plugin; see NOTICE.md.
const { readFileSync } = require("node:fs");
const { withAppDelegate, withInfoPlist } = require("expo/config-plugins");
const { assertExpoSceneRuntime, assertSceneManifest, sceneManifest, updateAppDelegate } = require("./ios-scene-lifecycle.cjs");

module.exports = function withIosSceneLifecycle(config) {
  config = withAppDelegate(config, (mod) => {
    const packagePath = require.resolve("expo/package.json", { paths: [mod.modRequest.projectRoot] });
    // Expo normalizes config.sdkVersion to 57.0.0; it is not the installed patch.
    assertExpoSceneRuntime(JSON.parse(readFileSync(packagePath, "utf8")).version);
    if (mod.modResults.language !== "swift") throw new Error("TableUs scene lifecycle requires a Swift AppDelegate");
    mod.modResults.contents = updateAppDelegate(mod.modResults.contents);
    return mod;
  });
  return withInfoPlist(config, (mod) => {
    const existing = mod.modResults.UIApplicationSceneManifest;
    if (existing !== undefined) assertSceneManifest(existing);
    mod.modResults.UIApplicationSceneManifest = sceneManifest();
    return mod;
  });
};
