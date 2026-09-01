#!/usr/bin/env node

import { existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";

import { validateReadinessAppConfig } from "./readiness-inspection-lib.mjs";
import { embeddedAppConfiguration, inspectionReport } from "./mobile-artifact-security.mjs";

function parseArgs(argv) {
  const values = {};
  for (let index = 0; index < argv.length; index += 2) {
    const key = argv[index];
    const value = argv[index + 1];
    if (!key?.startsWith("--") || !value) throw new Error("Arguments must be --name value pairs");
    values[key.slice(2)] = value;
  }
  return values;
}

function run(command, args) {
  const result = spawnSync(command, args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} failed: ${(result.stderr || result.stdout).trim()}`);
  return `${result.stdout ?? ""}${result.stderr ?? ""}`;
}

function extractIosApp(artifact, temporaryRoot) {
  if (statSync(artifact).isDirectory()) return artifact;
  if (extname(artifact) !== ".ipa") throw new Error("iOS artifact must be an .ipa or .app directory");
  run("unzip", ["-qq", artifact, "-d", temporaryRoot]);
  const payload = join(temporaryRoot, "Payload");
  const apps = readdirSync(payload).filter((entry) => entry.endsWith(".app"));
  if (apps.length !== 1) throw new Error("IPA must contain exactly one application bundle");
  return join(payload, apps[0]);
}

const args = parseArgs(process.argv.slice(2));
const artifact = resolve(args.artifact ?? "");
const platform = args.platform;
if (!existsSync(artifact) || !["ios", "android"].includes(platform) || !args.sha || !args["api-url"] || !args["supabase-url"] || !args["link-host"]) {
  throw new Error("--platform, --artifact, --sha, --api-url, --supabase-url, and --link-host are required");
}
if (platform === "ios" && !args["apple-team-id"]) throw new Error("--apple-team-id is required for iOS readiness inspection");
if (platform === "android" && !args["android-fingerprint"]) throw new Error("--android-fingerprint is required for Android readiness inspection");
const scriptRoot = resolve(fileURLToPath(new URL(".", import.meta.url)));
const linkArgs = [
  join(scriptRoot, "inspect-mobile-links-artifact.mjs"),
  "--platform", platform,
  "--artifact", artifact,
  "--sha", args.sha,
  "--api-url", args["api-url"],
  "--supabase-url", args["supabase-url"],
  "--link-host", args["link-host"],
  "--profile", `readiness-${platform}`,
];
if (args["apple-team-id"]) linkArgs.push("--apple-team-id", args["apple-team-id"]);
if (args["android-fingerprint"]) linkArgs.push("--android-fingerprint", args["android-fingerprint"]);
if (args["forbidden-origins"]) linkArgs.push("--forbidden-origins", args["forbidden-origins"]);

const linkInspection = run(process.execPath, linkArgs);
const temporaryRoot = mkdtempSync(join(tmpdir(), "tableus-readiness-inspection-"));
try {
  const extractedIosApp = platform === "ios" ? extractIosApp(artifact, temporaryRoot) : artifact;
  validateReadinessAppConfig(embeddedAppConfiguration(platform, artifact, extractedIosApp), {
    sha: args.sha,
    apiUrl: args["api-url"],
    supabaseUrl: args["supabase-url"],
    linkHost: args["link-host"],
    forbiddenOrigins: (args["forbidden-origins"] ?? "").split(","),
  });
  const signedReport = JSON.parse(linkInspection.trim());
  const report = inspectionReport({
    platform,
    profile: `readiness-${platform}`,
    candidateSha: args.sha,
    artifact,
    signerType: signedReport.signer_type,
    signerIdentity: signedReport.signer_identity,
  });
  if (args.output) {
    mkdirSync(dirname(resolve(args.output)), { recursive: true });
    writeFileSync(resolve(args.output), `${JSON.stringify(report, null, 2)}\n`, { mode: 0o600 });
  }
  process.stdout.write(`${JSON.stringify(report)}\n`);
} finally {
  rmSync(temporaryRoot, { recursive: true, force: true });
}
