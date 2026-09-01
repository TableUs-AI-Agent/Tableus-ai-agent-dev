#!/usr/bin/env node

import { existsSync, mkdtempSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createInterface } from "node:readline/promises";
import { spawnSync } from "node:child_process";

import { assertSafeReadinessEvidence, validateStagingReadiness } from "./readiness-evidence-utils.mjs";
import { RELEASE_ORIGINS, requireReleaseOrigin } from "./release-origins.mjs";
import { assertArtifactUnchanged, stageVerifiedArtifact } from "./mobile-artifact-security.mjs";

const repoRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const appId = "com.tableus.app";
const canonicalOrigin = "https://links.table-us.com";

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

function run(command, commandArgs, options = {}) {
  const result = spawnSync(command, commandArgs, {
    cwd: repoRoot,
    env: { ...process.env, ...(options.env ?? {}) },
    encoding: "utf8",
    maxBuffer: 20 * 1024 * 1024,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} failed: ${(result.stderr || result.stdout).trim()}`);
  return `${result.stdout ?? ""}${result.stderr ?? ""}`;
}

function normalizeFingerprint(value) {
  return value.replace(/[^0-9a-f]/gi, "").toUpperCase();
}

function extractIosApp(artifact, root) {
  if (statSync(artifact).isDirectory()) return artifact;
  if (extname(artifact) !== ".ipa") throw new Error("iOS APP must be a signed .ipa or .app directory");
  run("unzip", ["-qq", artifact, "-d", root]);
  const app = readdirSync(join(root, "Payload")).find((entry) => entry.endsWith(".app"));
  if (!app) throw new Error("IPA contains no application bundle");
  return join(root, "Payload", app);
}

async function association(path) {
  const response = await fetch(`${canonicalOrigin}${path}`, { redirect: "manual", signal: AbortSignal.timeout(15_000) });
  if (response.status !== 200 || response.headers.get("location")) throw new Error(`${path} must return 200 without a redirect`);
  if (!response.headers.get("content-type")?.toLowerCase().includes("application/json")) throw new Error(`${path} must return JSON`);
  return response.json();
}

async function confirm(terminal, label) {
  const answer = (await terminal.question(`${label} Type yes: `)).trim().toLowerCase();
  if (answer !== "yes") throw new Error(`Readiness phase not confirmed: ${label}`);
  return true;
}

const args = parseArgs(process.argv.slice(2));
const platform = args.platform;
const device = args.device;
const artifact = resolve(args.app ?? "");
const apiUrl = args["api-url"];
const supabaseUrl = args["supabase-url"];
const sha = args.sha;
const buildId = args["build-id"];
const evidenceDir = resolve(args.evidence ?? "");
if (!["ios", "android"].includes(platform) || !device || !existsSync(artifact) || !apiUrl || !supabaseUrl || !sha || !buildId || !args.evidence || !args.receipt) {
  throw new Error("--platform, --device, --app, --api-url, --supabase-url, --sha, --build-id, --receipt, and --evidence are required");
}
requireReleaseOrigin(apiUrl, RELEASE_ORIGINS.stagingApi, "Readiness staging API");
requireReleaseOrigin(supabaseUrl, RELEASE_ORIGINS.stagingSupabase, "Readiness Supabase");
if (platform === "ios" && !args["apple-team-id"]) throw new Error("--apple-team-id is required for iOS readiness");
if (platform === "android" && !args["android-fingerprint"]) throw new Error("--android-fingerprint is required for Android readiness");

const readyResponse = await fetch(`${apiUrl.replace(/\/$/, "")}/health/ready`, { signal: AbortSignal.timeout(15_000) });
if (!readyResponse.ok) throw new Error(`Staging readiness failed (${readyResponse.status})`);
validateStagingReadiness(await readyResponse.json(), sha);

const verificationRoot = mkdtempSync(join(tmpdir(), "tableus-readiness-verified-"));
process.once("exit", () => rmSync(verificationRoot, { recursive: true, force: true }));
const verified = stageVerifiedArtifact({
  artifact,
  receiptPath: resolve(args.receipt),
  platform,
  profile: `readiness-${platform}`,
  candidateSha: sha,
  buildId,
  destination: join(verificationRoot, "install"),
  signerType: platform === "ios" ? "apple-team-id" : "android-sha256-cert",
  signerIdentity: platform === "ios" ? args["apple-team-id"] : args["android-fingerprint"],
});

const inspectorArgs = [
  "scripts/inspect-mobile-readiness-artifact.mjs",
  "--platform", platform,
  "--artifact", verified.path,
  "--sha", sha,
  "--api-url", apiUrl,
  "--supabase-url", supabaseUrl,
  "--link-host", "links.table-us.com",
];
if (args["apple-team-id"]) inspectorArgs.push("--apple-team-id", args["apple-team-id"]);
if (args["android-fingerprint"]) inspectorArgs.push("--android-fingerprint", args["android-fingerprint"]);
if (args["forbidden-origins"]) inspectorArgs.push("--forbidden-origins", args["forbidden-origins"]);
run(process.execPath, inspectorArgs);
assertArtifactUnchanged(verified.path, verified.digest);

const apple = await association("/.well-known/apple-app-site-association");
const android = await association("/.well-known/assetlinks.json");
const expectedPaths = JSON.stringify([{ "/": "/join/*" }, { "/": "/auth" }]);
if (JSON.stringify(apple?.applinks?.details?.[0]?.components) !== expectedPaths) throw new Error("Apple association paths do not match the allowlist");
if (JSON.stringify(apple).includes("/auth/confirm") || JSON.stringify(android).includes("/auth/confirm")) throw new Error("Association manifests must exclude /auth/confirm");
if (platform === "ios" && !apple.applinks.details[0].appIDs?.includes(`${args["apple-team-id"]}.${appId}`)) throw new Error("AASA does not contain the signed iOS app identifier");
if (platform === "android") {
  const statement = android.find((value) => value?.target?.package_name === appId);
  const expected = normalizeFingerprint(args["android-fingerprint"]);
  if (!statement?.target?.sha256_cert_fingerprints?.some((value) => normalizeFingerprint(value) === expected)) throw new Error("assetlinks.json does not contain the signed Android fingerprint");
}

const temporaryRoot = mkdtempSync(join(tmpdir(), "tableus-mobile-readiness-"));
const developerDir = process.env.DEVELOPER_DIR || "/Applications/Xcode.app/Contents/Developer";
const knownAdb = "/opt/homebrew/share/android-commandlinetools/platform-tools/adb";
const adb = process.env.ADB || (existsSync(knownAdb) ? knownAdb : "adb");
try {
  if (platform === "ios") {
    assertArtifactUnchanged(verified.path, verified.digest);
    const installApp = extractIosApp(verified.path, temporaryRoot);
    run("xcrun", ["devicectl", "device", "install", "app", "--device", device, installApp], { env: { DEVELOPER_DIR: developerDir } });
  } else {
    assertArtifactUnchanged(verified.path, verified.digest);
    run(adb, ["-s", device, "install", "-r", verified.path]);
    run(adb, ["-s", device, "shell", "pm", "verify-app-links", "--re-verify", appId]);
  }

  const terminal = createInterface({ input: process.stdin, output: process.stdout });
  try {
    const phases = {
      returning_authentication: await confirm(terminal, "Returning authentication completed without exposing the code"),
      session_persistence: await confirm(terminal, "Relaunch preserved the approved session"),
      foreground_refresh: await confirm(terminal, "Foreground refresh recovered current plan state"),
      verified_auth_link: await confirm(terminal, "The canonical /auth link opened TableUs"),
      verified_join_link: await confirm(terminal, "The canonical private /join link opened TableUs and retained join intent"),
      live_location_and_four_candidates: await confirm(terminal, "The shared plan resolved a US location and showed exactly four live recommendations"),
      cross_client_vote: await confirm(terminal, "This platform saved its ranked vote in the cross-client plan"),
      organizer_authorization: await confirm(terminal, "Guest finalization was absent and organizer finalization/reopening succeeded"),
      rotated_link_rejected: await confirm(terminal, "The rotated private link showed the invalid or rotated state"),
      account_controls_read_only: await confirm(terminal, "Export and deletion-readiness were checked without deleting the account"),
    };
    const summary = assertSafeReadinessEvidence({
      schema_version: 1,
      sha,
      passed: true,
      platform,
      build_id: buildId,
      artifact_name: basename(artifact),
      artifact_sha256: verified.digest,
      inspection_passed: true,
      association_passed: true,
      staging_readiness_passed: true,
      phases,
      raw_personal_data_retained: false,
      restricted_google_content_retained: false,
      screenshots_retained_by_runner: false,
    });
    mkdirSync(evidenceDir, { recursive: true });
    const target = join(evidenceDir, `${platform}-readiness-summary.json`);
    writeFileSync(target, `${JSON.stringify(summary, null, 2)}\n`, { mode: 0o600 });
    process.stdout.write(`Sanitized ${platform} readiness evidence written to ${target}\n`);
  } finally {
    terminal.close();
  }
} finally {
  rmSync(temporaryRoot, { recursive: true, force: true });
  rmSync(verificationRoot, { recursive: true, force: true });
}
