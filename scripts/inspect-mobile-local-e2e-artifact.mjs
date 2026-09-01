#!/usr/bin/env node

import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

import {
  embeddedAppConfiguration,
  androidManifest,
  inspectionReport,
  iosAllowsLocalNetworking,
  verifyAndroidSigner,
  verifyIosSimulatorBundle,
} from "./mobile-artifact-security.mjs";
import { validateLocalE2EAppConfig } from "./readiness-inspection-lib.mjs";

function parseArgs(argv) {
  const result = {};
  for (let index = 0; index < argv.length; index += 2) {
    const key = argv[index]?.replace(/^--/, "");
    const value = argv[index + 1];
    if (!key || !value) throw new Error(`Invalid argument near ${argv[index] ?? "end"}`);
    result[key] = value;
  }
  return result;
}

const args = parseArgs(process.argv.slice(2));
const artifact = resolve(args.artifact ?? "");
const platform = args.platform;
const profile = `test-${platform}`;
if (!existsSync(artifact) || !["ios", "android"].includes(platform) || !args.sha) {
  throw new Error("--platform, --artifact, and --sha are required");
}
if (platform === "android" && !args["android-fingerprint"]) throw new Error("--android-fingerprint is required for Android local-E2E inspection");

validateLocalE2EAppConfig(embeddedAppConfiguration(platform, artifact, artifact), {
  sha: args.sha,
  forbiddenOrigins: (args["forbidden-origins"] ?? "").split(","),
});

let signerType;
let signerIdentity;
if (platform === "ios") {
  signerType = "ios-simulator";
  signerIdentity = verifyIosSimulatorBundle(artifact);
  if (!iosAllowsLocalNetworking(artifact)) throw new Error("Local-E2E iOS artifact lacks its required local-network exception");
} else {
  signerType = "android-sha256-cert";
  signerIdentity = verifyAndroidSigner(artifact, args["android-fingerprint"]);
  if (!androidManifest(artifact).includes('android:usesCleartextTraffic="true"')) throw new Error("Local-E2E Android artifact lacks its required cleartext loopback transport");
}
const report = inspectionReport({ platform, profile, candidateSha: args.sha, artifact, signerType, signerIdentity });
if (args.output) {
  mkdirSync(dirname(resolve(args.output)), { recursive: true });
  writeFileSync(resolve(args.output), `${JSON.stringify(report, null, 2)}\n`, { mode: 0o600 });
}
process.stdout.write(`${JSON.stringify(report)}\n`);
