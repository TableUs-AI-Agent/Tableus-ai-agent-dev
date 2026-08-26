#!/usr/bin/env node

import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync } from "node:fs";
import { extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";

import { validateReadinessAppConfig } from "./readiness-inspection-lib.mjs";

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

function visitFiles(directory, callback) {
  for (const entry of readdirSync(directory)) {
    const current = join(directory, entry);
    if (statSync(current).isDirectory()) visitFiles(current, callback);
    else callback(current);
  }
}

function extractIosApp(artifact, temporaryRoot) {
  if (statSync(artifact).isDirectory()) return artifact;
  if (extname(artifact) !== ".ipa") throw new Error("iOS artifact must be an .ipa or .app directory");
  run("unzip", ["-qq", artifact, "-d", temporaryRoot]);
  const payload = join(temporaryRoot, "Payload");
  const app = readdirSync(payload).find((entry) => entry.endsWith(".app"));
  if (!app) throw new Error("IPA contains no application bundle");
  return join(payload, app);
}

function appConfiguration(platform, artifact, temporaryRoot) {
  if (platform === "android") {
    const result = spawnSync("unzip", ["-p", artifact, "assets/app.config"], { encoding: "utf8", maxBuffer: 8 * 1024 * 1024 });
    if (result.error) throw result.error;
    if (result.status !== 0 || !result.stdout) throw new Error("Android artifact has no embedded Expo app configuration");
    return result.stdout;
  }
  const app = extractIosApp(artifact, temporaryRoot);
  let configuration;
  visitFiles(app, (file) => {
    if (!configuration && (file.endsWith("/assets/app.config") || file.endsWith("/EXConstants.bundle/app.config"))) {
      configuration = readFileSync(file, "utf8");
    }
  });
  if (!configuration) throw new Error("iOS artifact has no embedded Expo app configuration");
  return configuration;
}

const args = parseArgs(process.argv.slice(2));
const artifact = resolve(args.artifact ?? "");
const platform = args.platform;
if (!existsSync(artifact) || !["ios", "android"].includes(platform) || !args.sha || !args["api-url"] || !args["supabase-url"] || !args["link-host"]) {
  throw new Error("--platform, --artifact, --sha, --api-url, --supabase-url, and --link-host are required");
}
const scriptRoot = resolve(fileURLToPath(new URL(".", import.meta.url)));
const linkArgs = [
  join(scriptRoot, "inspect-mobile-links-artifact.mjs"),
  "--platform", platform,
  "--artifact", artifact,
  "--sha", args.sha,
  "--api-url", args["api-url"],
  "--supabase-url", args["supabase-url"],
  "--link-host", args["link-host"],
];
if (args["apple-team-id"]) linkArgs.push("--apple-team-id", args["apple-team-id"]);
if (args["android-fingerprint"]) linkArgs.push("--android-fingerprint", args["android-fingerprint"]);
if (args["forbidden-origins"]) linkArgs.push("--forbidden-origins", args["forbidden-origins"]);

const linkInspection = run(process.execPath, linkArgs);
const temporaryRoot = mkdtempSync(join(tmpdir(), "tableus-readiness-inspection-"));
try {
  validateReadinessAppConfig(appConfiguration(platform, artifact, temporaryRoot), {
    sha: args.sha,
    apiUrl: args["api-url"],
    supabaseUrl: args["supabase-url"],
    linkHost: args["link-host"],
    forbiddenOrigins: (args["forbidden-origins"] ?? "").split(","),
  });
  process.stdout.write(linkInspection);
  process.stdout.write(`${JSON.stringify({ platform, profile: `readiness-${platform}`, readiness_configuration: true, inspection_passed: true })}\n`);
} finally {
  rmSync(temporaryRoot, { recursive: true, force: true });
}
