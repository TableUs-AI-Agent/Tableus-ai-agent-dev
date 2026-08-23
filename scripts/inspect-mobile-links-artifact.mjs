#!/usr/bin/env node

import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync } from "node:fs";
import { extname, join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";

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

function run(command, commandArgs, options = {}) {
  const result = spawnSync(command, commandArgs, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024, ...options });
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

function artifactBytes(path) {
  if (!statSync(path).isDirectory()) {
    if (extname(path) !== ".apk") return readFileSync(path);
    const result = spawnSync("unzip", ["-p", path], { encoding: null, maxBuffer: 512 * 1024 * 1024 });
    if (result.error) throw result.error;
    if (result.status !== 0) throw new Error("Could not inspect Android APK contents.");
    return result.stdout;
  }
  const chunks = [];
  visitFiles(path, (file) => chunks.push(readFileSync(file)));
  return Buffer.concat(chunks);
}

function findExecutable(name, candidates = []) {
  const discovered = spawnSync("which", [name], { encoding: "utf8" });
  if (discovered.status === 0 && discovered.stdout.trim()) return discovered.stdout.trim();
  for (const candidate of candidates) if (existsSync(candidate)) return candidate;
  throw new Error(`Required executable not found: ${name}`);
}

function latestBuildTool(tool) {
  const sdkRoots = [process.env.ANDROID_HOME, process.env.ANDROID_SDK_ROOT, "/opt/homebrew/share/android-commandlinetools"].filter(Boolean);
  for (const root of sdkRoots) {
    const directory = join(root, "build-tools");
    if (!existsSync(directory)) continue;
    const versions = readdirSync(directory).sort((left, right) => right.localeCompare(left, undefined, { numeric: true }));
    for (const version of versions) {
      const candidate = join(directory, version, tool);
      if (existsSync(candidate)) return candidate;
    }
  }
  return findExecutable(tool);
}

function normalizeFingerprint(value) {
  const hex = value.replace(/[^0-9a-f]/gi, "").toUpperCase();
  if (hex.length !== 64) throw new Error("Android SHA-256 fingerprint is invalid.");
  return hex.match(/.{2}/g).join(":");
}

function extractIosApp(artifact, temporaryRoot) {
  if (statSync(artifact).isDirectory()) return artifact;
  if (extname(artifact) !== ".ipa") throw new Error("iOS artifact must be an .ipa or .app directory.");
  run("unzip", ["-qq", artifact, "-d", temporaryRoot]);
  const payload = join(temporaryRoot, "Payload");
  const app = readdirSync(payload).find((entry) => entry.endsWith(".app"));
  if (!app) throw new Error("IPA contains no application bundle.");
  return join(payload, app);
}

const args = parseArgs(process.argv.slice(2));
const artifact = resolve(args.artifact ?? "");
const platform = args.platform;
const host = args["link-host"];
if (!existsSync(artifact) || !["ios", "android"].includes(platform) || !args.sha || !args["api-url"] || !args["supabase-url"] || !host) {
  throw new Error("--platform, --artifact, --sha, --api-url, --supabase-url, and --link-host are required");
}
if (!args["api-url"].startsWith("https://") || !args["supabase-url"].startsWith("https://") || host.includes(":")) {
  throw new Error("Verified-link artifacts require HTTPS services and a hostname without a port.");
}

const temporaryRoot = mkdtempSync(join(tmpdir(), "tableus-link-inspection-"));
try {
  const inspectionPath = platform === "ios" ? extractIosApp(artifact, temporaryRoot) : artifact;
  const content = artifactBytes(inspectionPath).toString("latin1");
  for (const required of [args.sha, args["api-url"], args["supabase-url"], host]) {
    if (!content.includes(required)) throw new Error(`Artifact is missing required marker: ${required}`);
  }
  for (const forbidden of [
    "demo-organizer",
    "demo-guest",
    "http://127.0.0.1",
    "http://localhost",
    "http://[::1]",
    "SUPABASE_SERVICE_ROLE",
    "service_role",
    ...(args["forbidden-origins"] ?? "").split(",").filter(Boolean),
  ]) {
    if (content.includes(forbidden)) throw new Error(`Artifact contains forbidden marker: ${forbidden}`);
  }
  if (!/localE2E.{0,24}(false|0)/s.test(content)) throw new Error("Artifact does not prove localE2E=false.");
  if (!/authE2E.{0,24}(false|0)/s.test(content)) throw new Error("Artifact does not prove authE2E=false.");

  if (platform === "ios") {
    run("codesign", ["--verify", "--deep", "--strict", inspectionPath]);
    const entitlements = run("codesign", ["-d", "--entitlements", ":-", inspectionPath]);
    if (!entitlements.includes(`applinks:${host}`)) throw new Error("iOS associated-domain entitlement is missing.");
    if (entitlements.includes("?mode=developer")) throw new Error("Development associated-domain mode is forbidden.");
    const teamMatch = entitlements.match(/<key>com\.apple\.developer\.team-identifier<\/key>\s*<string>([A-Z0-9]{10})<\/string>/);
    if (!teamMatch) throw new Error("Signed iOS artifact has no Apple Team ID entitlement.");
    if (args["apple-team-id"] && teamMatch[1] !== args["apple-team-id"]) throw new Error("Apple Team ID does not match the expected association.");
    process.stdout.write(`${JSON.stringify({ platform, apple_team_id: teamMatch[1], associated_domain: host, inspection_passed: true })}\n`);
  } else {
    const apksigner = latestBuildTool("apksigner");
    const signature = run(apksigner, ["verify", "--verbose", "--print-certs", artifact]);
    const digestMatch = signature.match(/Signer #1 certificate SHA-256 digest:\s*([0-9a-f]+)/i);
    if (!digestMatch) throw new Error("Could not read the APK signing fingerprint.");
    const fingerprint = normalizeFingerprint(digestMatch[1]);
    if (args["android-fingerprint"] && fingerprint !== normalizeFingerprint(args["android-fingerprint"])) {
      throw new Error("Android signing fingerprint does not match the expected association.");
    }
    const apkanalyzer = findExecutable("apkanalyzer", [
      "/opt/homebrew/share/android-commandlinetools/cmdline-tools/latest/bin/apkanalyzer",
      "/opt/homebrew/share/android-commandlinetools/tools/bin/apkanalyzer",
    ]);
    const manifest = run(apkanalyzer, ["manifest", "print", artifact]);
    for (const marker of ["android:autoVerify=\"true\"", host, "android:pathPrefix=\"/join/\"", "android:path=\"/auth\""]) {
      if (!manifest.includes(marker)) throw new Error(`Android manifest is missing verified-link marker: ${marker}`);
    }
    if (manifest.includes("/auth/confirm")) throw new Error("Android artifact must not intercept the web auth callback.");
    process.stdout.write(`${JSON.stringify({ platform, android_sha256_cert_fingerprint: fingerprint, verified_link_host: host, inspection_passed: true })}\n`);
  }
} finally {
  rmSync(temporaryRoot, { recursive: true, force: true });
}
