#!/usr/bin/env node

import { randomBytes } from "node:crypto";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

import { artifactChecksum } from "./evidence-utils.mjs";
import { promptSecret } from "./prompt-utils.mjs";
import { RELEASE_ORIGINS, requireReleaseOrigin } from "./release-origins.mjs";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const flowSource = join(repoRoot, "mobile", ".maestro-auth");
const appId = "com.tableus.app";

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
  for (const secret of secrets.filter(Boolean).sort((a, b) => b.length - a.length)) safe = safe.split(secret).join("[redacted]");
  return safe.replace(/([?&]token=)[^\s&"']+/g, "$1[redacted]");
}

function run(command, args, { cwd = repoRoot, env = {}, secrets = [] } = {}) {
  const result = spawnSync(command, args, { cwd, env: { ...process.env, ...env }, encoding: "utf8", maxBuffer: 20 * 1024 * 1024 });
  const output = redact(`${result.stdout ?? ""}${result.stderr ?? ""}`, secrets);
  if (output.trim()) process.stdout.write(output);
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} exited with status ${result.status}`);
}

async function preflight(apiUrl) {
  requireReleaseOrigin(apiUrl, RELEASE_ORIGINS.stagingApi, "Mobile auth staging API");
  const response = await fetch(`${apiUrl.replace(/\/$/, "")}/health/ready`, { redirect: "error", signal: AbortSignal.timeout(15_000) });
  if (!response.ok) throw new Error(`Staging readiness failed with ${response.status}.`);
  const payload = await response.json();
  if (payload.auth_mode !== "supabase" || payload.ai_provider_mode !== "deterministic" || !["deterministic", "live"].includes(payload.places_provider_mode)) {
    throw new Error("Staging must report Supabase authentication, deterministic AI, and an explicit Places mode.");
  }
  return payload;
}

function snapshot(directory) {
  return existsSync(directory) ? new Set(readdirSync(directory)) : new Set();
}

function removeNewEntries(directory, before) {
  if (!existsSync(directory)) return;
  for (const entry of readdirSync(directory)) {
    if (!before.has(entry)) rmSync(join(directory, entry), { recursive: true, force: true });
  }
}

const args = parseArgs(process.argv.slice(2));
const platform = args.platform;
const device = args.device;
const appPath = resolve(args.app ?? "");
const apiUrl = args["api-url"] ?? process.env.EXPO_PUBLIC_API_URL ?? "";
const buildId = args["build-id"];
const evidenceDir = resolve(args.evidence ?? "");
const phases = ["invalid-invite", "signup-send", "verify-signup", "persistence", "refresh", "foreground", "sign-out", "returning-send", "returning-verify", "account-controls"];
const startPhase = args["start-phase"] ?? phases[0];
if (!new Set(["ios", "android"]).has(platform)) throw new Error("--platform must be ios or android");
if (!device || !existsSync(appPath) || !buildId || !args.evidence) throw new Error("--device, --app, --build-id, and --evidence are required");
const startPhaseIndex = phases.indexOf(startPhase);
if (startPhaseIndex < 0) throw new Error(`--start-phase must be one of: ${phases.join(", ")}`);
const readiness = await preflight(apiUrl);

const email = (await promptSecret("Test account email: ")).trim().toLowerCase();
const signupWillRun = startPhaseIndex <= phases.indexOf("signup-send");
const displayName = signupWillRun ? (await promptSecret("Display name: ")).trim() : "";
const invite = signupWillRun ? (await promptSecret("One-use invite code: ")).trim() : "";
if (!email || (signupWillRun && (!displayName || !invite))) {
  throw new Error("Email is required, and signup runs also require display name and invite.");
}

const temporaryRoot = mkdtempSync(join(tmpdir(), "tableus-mobile-auth-e2e-"));
const flows = join(temporaryRoot, "flows");
cpSync(flowSource, flows, { recursive: true });
mkdirSync(evidenceDir, { recursive: true });
const joinToken = randomBytes(24).toString("base64url");
const invalidInvite = `invalid-${randomBytes(12).toString("hex")}`;
const secrets = [email, displayName, invite, joinToken, invalidInvite];
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
  const maestroArgs = ["--device", device, "test", "--test-output-dir=results"];
  maestroArgs.push(join(flows, name));
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

function shouldRun(phase) {
  return phases.indexOf(phase) >= startPhaseIndex;
}

try {
  if (platform === "ios") run("xcrun", ["simctl", "install", device, appPath], { env: { DEVELOPER_DIR: developerDir } });
  else run(adb, ["-s", device, "install", "-r", appPath]);

  if (shouldRun("invalid-invite")) flow("invalid-invite.yml", { INVALID_INVITE: invalidInvite, DISPLAY_NAME: displayName, EMAIL: email });
  if (shouldRun("signup-send")) flow("signup-send.yml", { INVITE: invite, DISPLAY_NAME: displayName, EMAIL: email, JOIN_TOKEN: joinToken });
  if (shouldRun("verify-signup")) {
    const signupOtp = (await promptSecret("Signup OTP from the newest email: ")).trim();
    if (!signupOtp) throw new Error("Signup OTP is required.");
    secrets.push(signupOtp);
    flow("verify-signup.yml", { OTP: signupOtp });
  }
  if (shouldRun("persistence")) flow("persistence.yml");
  if (shouldRun("refresh")) flow("refresh.yml");
  if (shouldRun("foreground")) flow("foreground.yml");
  if (shouldRun("sign-out")) flow("sign-out.yml");
  if (shouldRun("returning-send")) {
    flow("returning-prepare.yml");
    flow("returning-send.yml", { EMAIL: email });
  }
  if (shouldRun("returning-verify")) {
    const returningOtp = (await promptSecret("Returning sign-in OTP from the newest email: ")).trim();
    if (!returningOtp) throw new Error("Returning sign-in OTP is required.");
    secrets.push(returningOtp);
    flow("returning-verify.yml", { OTP: returningOtp });
  }
  if (shouldRun("account-controls")) flow("account-controls.yml");

  const gitResult = spawnSync("git", ["rev-parse", "HEAD"], { cwd: repoRoot, encoding: "utf8" });
  if (gitResult.status !== 0) throw new Error("Could not resolve the candidate SHA.");
  const summary = {
    platform,
    device,
    build_id: buildId,
    git_sha: gitResult.stdout.trim(),
    artifact: basename(appPath),
    artifact_sha256: artifactChecksum(appPath),
    api_origin: new URL(apiUrl).origin,
    app_id: appId,
    provider_mode: readiness.provider_mode,
    places_provider_mode: readiness.places_provider_mode,
    ai_provider_mode: readiness.ai_provider_mode,
    auth_mode: "supabase",
    invalid_invite_rejected: shouldRun("invalid-invite"),
    signup_approved: shouldRun("verify-signup"),
    join_intent_restored: shouldRun("verify-signup"),
    relaunch_persistence: shouldRun("persistence"),
    explicit_refresh: shouldRun("refresh"),
    foreground_recovery: shouldRun("foreground"),
    sign_out: shouldRun("sign-out"),
    returning_sign_in: shouldRun("returning-verify"),
    account_controls_validated: shouldRun("account-controls"),
    screenshots_retained_by_runner: false,
    started_at_phase: startPhase,
  };
  const summaryKind = startPhase === "returning-send" ? "account" : "auth";
  writeFileSync(join(evidenceDir, `${platform}-${summaryKind}-summary.json`), `${JSON.stringify(summary, null, 2)}\n`);
  process.stdout.write(startPhaseIndex === 0
    ? `TableUs ${platform} staging authentication lifecycle passed.\n`
    : `TableUs ${platform} staging authentication segment from ${startPhase} passed.\n`);
} finally {
  rmSync(temporaryRoot, { recursive: true, force: true });
  removeNewEntries(maestroTests, testsBefore);
  removeNewEntries(maestroLogs, logsBefore);
}
