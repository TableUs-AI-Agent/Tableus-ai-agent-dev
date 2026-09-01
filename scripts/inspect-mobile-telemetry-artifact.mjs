#!/usr/bin/env node

import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

import {
  androidManifest,
  embeddedAppConfiguration,
  inspectionReport,
  iosAllowsLocalNetworking,
  verifyAndroidSigner,
  verifyIosSimulatorBundle,
} from "./mobile-artifact-security.mjs";
import { validateTelemetryAppConfig } from "./readiness-inspection-lib.mjs";

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
const profile = `telemetry-test-${platform}`;
if (!existsSync(artifact) || !["ios", "android"].includes(platform) || !args.sha || !args["api-url"] || !args["supabase-url"] || !args["link-host"]) {
  throw new Error("--platform, --artifact, --sha, --api-url, --supabase-url, and --link-host are required");
}
if (platform === "android" && !args["android-fingerprint"]) throw new Error("--android-fingerprint is required for Android telemetry inspection");

validateTelemetryAppConfig(embeddedAppConfiguration(platform, artifact, artifact), {
  sha: args.sha,
  apiUrl: args["api-url"],
  supabaseUrl: args["supabase-url"],
  linkHost: args["link-host"],
  forbiddenOrigins: (args["forbidden-origins"] ?? "").split(","),
});

let signerType;
let signerIdentity;
if (platform === "ios") {
  signerType = "ios-simulator";
  signerIdentity = verifyIosSimulatorBundle(artifact);
  if (iosAllowsLocalNetworking(artifact)) throw new Error("Telemetry iOS artifact permits local networking");
} else {
  signerType = "android-sha256-cert";
  signerIdentity = verifyAndroidSigner(artifact, args["android-fingerprint"]);
  if (androidManifest(artifact).includes('android:usesCleartextTraffic="true"')) throw new Error("Telemetry Android artifact permits cleartext traffic");
}
const report = inspectionReport({ platform, profile, candidateSha: args.sha, artifact, signerType, signerIdentity });
if (args.output) {
  mkdirSync(dirname(resolve(args.output)), { recursive: true });
  writeFileSync(resolve(args.output), `${JSON.stringify(report, null, 2)}\n`, { mode: 0o600 });
}
process.stdout.write(`${JSON.stringify(report)}\n`);
