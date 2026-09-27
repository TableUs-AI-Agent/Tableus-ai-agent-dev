#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { getConfig } from "@expo/config";
import lifecycle from "../mobile/plugins/ios-scene-lifecycle.cjs";

// Inspect the detached candidate, even when the operator is a newer checkout.
const mobileRoot = process.env.TABLEUS_BUILD_SOURCE_ROOT
  ? join(resolve(process.env.TABLEUS_BUILD_SOURCE_ROOT), "mobile")
  : fileURLToPath(new URL("../mobile/", import.meta.url));
const require = createRequire(join(mobileRoot, "package.json"));
const expoVersion = JSON.parse(readFileSync(require.resolve("expo/package.json"), "utf8")).version;
const result = spawnSync("xcrun", ["--sdk", "iphoneos", "--show-sdk-version"], { encoding: "utf8" });
if (result.error || result.status !== 0) throw new Error("Cannot read the selected iOS SDK; complete Xcode setup before building");
const config = getConfig(mobileRoot).exp;
lifecycle.assertIosBuildCompatibility(result.stdout.trim(), expoVersion,
  config.plugins?.map((plugin) => Array.isArray(plugin) ? plugin[0] : plugin));
process.stdout.write(`iOS SDK ${result.stdout.trim()} / Expo ${expoVersion} scene build preflight passed.\n`);
