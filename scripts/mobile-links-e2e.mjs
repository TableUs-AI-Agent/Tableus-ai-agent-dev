#!/usr/bin/env node

import { cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

import { promptSecret, promptVisible } from "./prompt-utils.mjs";
import { assertArtifactUnchanged, stageVerifiedArtifact } from "./mobile-artifact-security.mjs";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const flowSource = join(repoRoot, "mobile", ".maestro-links");
const appId = "com.tableus.app";
const expectedOrigin = "https://links.table-us.com";

function parseArgs(argv) {
  const values = {};
  for (let index = 0; index < argv.length; index += 2) {
    const key = argv[index];
    const value = argv[index + 1];
    if (!key?.startsWith("--") || !value) throw new Error(`Invalid argument near ${key ?? "end"}`);
    values[key.slice(2)] = value;
  }
  return values;
}

function redact(output, secrets) {
  let safe = String(output ?? "");
  for (const secret of secrets.filter(Boolean).sort((left, right) => right.length - left.length)) safe = safe.split(secret).join("[redacted]");
  return safe.replace(/([?&]token=)[^\s&"']+/g, "$1[redacted]");
}

function run(command, commandArgs, { cwd = repoRoot, env = {}, secrets = [] } = {}) {
  const result = spawnSync(command, commandArgs, { cwd, env: { ...process.env, ...env }, encoding: "utf8", maxBuffer: 20 * 1024 * 1024 });
  const output = redact(`${result.stdout ?? ""}${result.stderr ?? ""}`, secrets);
  if (output.trim()) process.stdout.write(output);
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} exited with status ${result.status}`);
  return output;
}

async function association(path) {
  const response = await fetch(`${expectedOrigin}${path}`, { redirect: "manual", signal: AbortSignal.timeout(15_000) });
  if (response.status !== 200 || response.headers.get("location")) throw new Error(`${path} must return 200 without a redirect.`);
  if (!response.headers.get("content-type")?.toLowerCase().includes("application/json")) throw new Error(`${path} must be JSON.`);
  return response.json();
}

async function preflight(platform) {
  const apple = await association("/.well-known/apple-app-site-association");
  const android = await association("/.well-known/assetlinks.json");
  const components = apple?.applinks?.details?.[0]?.components;
  if (JSON.stringify(components) !== JSON.stringify([{ "/": "/join/*" }, { "/": "/auth" }])) {
    throw new Error("Apple association paths do not match the TableUs allowlist.");
  }
  if (!Array.isArray(android) || android[0]?.target?.package_name !== appId) throw new Error("Android association package is invalid.");
  if (platform === "ios" && !apple.applinks.details[0].appIDs?.some((value) => value.endsWith(`.${appId}`))) throw new Error("Apple association app ID is invalid.");
}

async function verifyWebFallback(joinUrl) {
  const authResponse = await fetch(`${expectedOrigin}/auth?mode=sign-in`, { redirect: "follow", signal: AbortSignal.timeout(15_000) });
  if (authResponse.status !== 200 || new URL(authResponse.url).pathname !== "/invite") throw new Error("Web auth fallback did not reach the invite screen.");
  const joinResponse = await fetch(joinUrl, { redirect: "follow", signal: AbortSignal.timeout(15_000) });
  if (joinResponse.status !== 200 || new URL(joinResponse.url).pathname !== new URL(joinUrl).pathname) throw new Error("Web join fallback is unavailable.");
}

function snapshot(directory) {
  return existsSync(directory) ? new Set(readdirSync(directory)) : new Set();
}

function removeNewEntries(directory, before) {
  if (!existsSync(directory)) return;
  for (const entry of readdirSync(directory)) if (!before.has(entry)) rmSync(join(directory, entry), { recursive: true, force: true });
}

function extractIosApp(artifact, root) {
  if (statSync(artifact).isDirectory()) return artifact;
  if (extname(artifact) !== ".ipa") throw new Error("iOS APP must be a signed .ipa or .app directory.");
  run("unzip", ["-qq", artifact, "-d", root]);
  const payload = join(root, "Payload");
  const app = readdirSync(payload).find((entry) => entry.endsWith(".app"));
  if (!app) throw new Error("IPA contains no application bundle.");
  return join(payload, app);
}

const args = parseArgs(process.argv.slice(2));
const platform = args.platform;
const device = args.device;
const appPath = resolve(args.app ?? "");
const buildId = args["build-id"];
const origin = new URL(args.origin ?? "").origin;
const evidenceDir = resolve(args.evidence ?? "");
if (!new Set(["ios", "android"]).has(platform)) throw new Error("--platform must be ios or android");
if (!device || !existsSync(appPath) || !buildId || !args.evidence || !args.sha || !args.receipt || !args["api-url"] || !args["supabase-url"]) {
  throw new Error("--device, --app, --build-id, --evidence, --sha, --receipt, --api-url, and --supabase-url are required");
}
if (platform === "ios" && !args["apple-team-id"]) throw new Error("--apple-team-id is required for iOS link evidence");
if (platform === "android" && !args["android-fingerprint"]) throw new Error("--android-fingerprint is required for Android link evidence");
if (origin !== expectedOrigin || args.origin !== expectedOrigin) throw new Error(`Verified-link evidence requires ${expectedOrigin}.`);
await preflight(platform);

const verificationRoot = mkdtempSync(join(tmpdir(), "tableus-mobile-links-verified-"));
process.once("exit", () => rmSync(verificationRoot, { recursive: true, force: true }));
const verified = stageVerifiedArtifact({
  artifact: appPath,
  receiptPath: resolve(args.receipt),
  platform,
  profile: `links-test-${platform}`,
  candidateSha: args.sha,
  buildId,
  destination: join(verificationRoot, "install"),
  signerType: platform === "ios" ? "apple-team-id" : "android-sha256-cert",
  signerIdentity: platform === "ios" ? args["apple-team-id"] : args["android-fingerprint"],
});
const inspectorArgs = [
  "scripts/inspect-mobile-links-artifact.mjs", "--platform", platform, "--artifact", verified.path,
  "--sha", args.sha, "--api-url", args["api-url"], "--supabase-url", args["supabase-url"],
  "--link-host", "links.table-us.com", "--profile", `links-test-${platform}`,
];
if (args["apple-team-id"]) inspectorArgs.push("--apple-team-id", args["apple-team-id"]);
if (args["android-fingerprint"]) inspectorArgs.push("--android-fingerprint", args["android-fingerprint"]);
if (args["forbidden-origins"]) inspectorArgs.push("--forbidden-origins", args["forbidden-origins"]);
run(process.execPath, inspectorArgs);
assertArtifactUnchanged(verified.path, verified.digest);

const email = (await promptSecret("Returning approved account email: ")).trim().toLowerCase();
const joinUrl = (await promptSecret("Freshly rotated old private join URL (not retained): ")).trim();
const parsedJoin = new URL(joinUrl);
if (!email || parsedJoin.origin !== expectedOrigin || !parsedJoin.pathname.startsWith("/join/") || !parsedJoin.searchParams.get("token")) {
  throw new Error("An approved email and canonical private join URL are required.");
}
const authUrl = `${expectedOrigin}/auth?mode=sign-in`;
const secrets = [email, joinUrl, parsedJoin.searchParams.get("token")];
await verifyWebFallback(joinUrl);
const temporaryRoot = mkdtempSync(join(tmpdir(), "tableus-mobile-links-e2e-"));
const flows = join(temporaryRoot, "flows");
const installRoot = join(temporaryRoot, "install");
cpSync(flowSource, flows, { recursive: true });
mkdirSync(evidenceDir, { recursive: true });
mkdirSync(installRoot, { recursive: true });
const maestroEnvironment = {
  MAESTRO_CLI_NO_ANALYTICS: "1",
  MAESTRO_CLI_ANALYSIS_NOTIFICATION_DISABLED: "true",
  MAESTRO_DISABLE_UPDATE_CHECK: "true",
  MAESTRO_DRIVER_STARTUP_TIMEOUT: process.env.MAESTRO_DRIVER_STARTUP_TIMEOUT || "300000",
};
const developerDir = process.env.DEVELOPER_DIR || "/Applications/Xcode.app/Contents/Developer";
const knownAdb = "/opt/homebrew/share/android-commandlinetools/platform-tools/adb";
const adb = process.env.ADB || (existsSync(knownAdb) ? knownAdb : "adb");
const maestroTests = join(process.env.HOME ?? "", ".maestro", "tests");
const maestroLogs = join(process.env.HOME ?? "", "Library", "Logs", "maestro");
const testsBefore = snapshot(maestroTests);
const logsBefore = snapshot(maestroLogs);

function flow(name, variables = {}) {
  const maestroArgs = ["--device", device, "test", "--test-output-dir=results", join(flows, name)];
  run("maestro", maestroArgs, {
    cwd: temporaryRoot,
    env: {
      ...maestroEnvironment,
      ...(platform === "ios" ? { DEVELOPER_DIR: developerDir } : {}),
      ...Object.fromEntries(Object.entries(variables).map(([key, value]) => [`MAESTRO_${key}`, value])),
    },
    secrets: [...secrets, ...Object.values(variables)],
  });
}

let domainVerified = false;
let appleDiagnosticsApproved = false;
let notesTapConfirmed = false;
try {
  if (platform === "ios") {
    assertArtifactUnchanged(verified.path, verified.digest);
    const installApp = extractIosApp(verified.path, installRoot);
    run("xcrun", ["devicectl", "device", "install", "app", "--device", device, installApp], { env: { DEVELOPER_DIR: developerDir }, secrets });
    appleDiagnosticsApproved = (await promptVisible(`Did Apple Associated Domains Diagnostics approve ${expectedOrigin}? Type yes: `)).trim().toLowerCase() === "yes";
    if (!appleDiagnosticsApproved) throw new Error("Apple Associated Domains Diagnostics approval is required.");
  } else {
    assertArtifactUnchanged(verified.path, verified.digest);
    run(adb, ["-s", device, "install", "-r", verified.path], { secrets });
    run(adb, ["-s", device, "shell", "pm", "set-app-links", "--package", appId, "0", "all"], { secrets });
    run(adb, ["-s", device, "shell", "pm", "verify-app-links", "--re-verify", appId], { secrets });
    await new Promise((resolveWait) => setTimeout(resolveWait, 20_000));
    const policies = run(adb, ["-s", device, "shell", "pm", "get-app-links", appId], { secrets });
    domainVerified = new RegExp(`${expectedOrigin.replace("https://", "")}[^\\n]*verified`, "i").test(policies);
    if (!domainVerified) throw new Error("Android did not report the canonical host as verified.");
  }

  flow("routes-and-send.yml", { AUTH_URL: authUrl, JOIN_URL: joinUrl, EMAIL: email });
  const otp = (await promptSecret("Returning sign-in OTP from the newest email: ")).trim();
  if (!otp) throw new Error("Returning sign-in OTP is required.");
  secrets.push(otp);
  flow("verify-rotated.yml", { OTP: otp });

  if (platform === "ios") {
    notesTapConfirmed = (await promptVisible("After tapping the same private link in Notes or Messages, did TableUs open the join screen? Type yes: ")).trim().toLowerCase() === "yes";
    if (!notesTapConfirmed) throw new Error("A Notes or Messages Universal Link tap is required.");
  }

  const summary = {
    platform,
    device,
    build_id: buildId,
    git_sha: args.sha,
    artifact: basename(appPath),
    artifact_sha256: verified.digest,
    app_id: appId,
    link_origin: expectedOrigin,
    association_files_valid: true,
    web_auth_fallback: true,
    web_join_fallback: true,
    native_auth_route_opened: true,
    native_join_route_opened: true,
    join_intent_restored: true,
    rotated_link_rejected: true,
    android_domain_verified: platform === "android" ? domainVerified : null,
    apple_diagnostics_approved: platform === "ios" ? appleDiagnosticsApproved : null,
    ios_notes_or_messages_tap: platform === "ios" ? notesTapConfirmed : null,
    screenshots_retained_by_runner: false,
  };
  writeFileSync(join(evidenceDir, `${platform}-verified-links-summary.json`), `${JSON.stringify(summary, null, 2)}\n`);
  process.stdout.write(`TableUs ${platform} verified-link journey passed.\n`);
} finally {
  rmSync(temporaryRoot, { recursive: true, force: true });
  rmSync(verificationRoot, { recursive: true, force: true });
  removeNewEntries(maestroTests, testsBefore);
  removeNewEntries(maestroLogs, logsBefore);
}
