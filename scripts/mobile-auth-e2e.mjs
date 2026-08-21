#!/usr/bin/env node

import { createHash, randomBytes } from "node:crypto";
import { copyFileSync, cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createInterface } from "node:readline/promises";
import { spawnSync } from "node:child_process";

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

function checksum(path) {
  const hash = createHash("sha256");
  const visit = (current, relative = "") => {
    const stat = statSync(current);
    if (stat.isDirectory()) {
      for (const entry of readdirSync(current).sort()) visit(join(current, entry), join(relative, entry));
    } else {
      hash.update(relative);
      hash.update("\0");
      hash.update(readFileSync(current));
    }
  };
  visit(path);
  return hash.digest("hex");
}

async function preflight(apiUrl) {
  const url = new URL(apiUrl);
  if (url.protocol !== "https:") throw new Error("Mobile auth E2E requires an HTTPS staging API.");
  const response = await fetch(`${apiUrl.replace(/\/$/, "")}/health/ready`, { signal: AbortSignal.timeout(15_000) });
  if (!response.ok) throw new Error(`Staging readiness failed with ${response.status}.`);
  const payload = await response.json();
  if (payload.auth_mode !== "supabase" || payload.provider_mode !== "deterministic") {
    throw new Error("Staging must report Supabase authentication and deterministic providers.");
  }
}

function collectScreenshot(root, evidenceDir, platform) {
  const matches = [];
  const visit = (directory) => {
    for (const entry of readdirSync(directory)) {
      const path = join(directory, entry);
      if (statSync(path).isDirectory()) visit(path);
      else if (entry === "returning-session.png") matches.push(path);
    }
  };
  visit(root);
  return matches.map((source) => {
    const destination = join(evidenceDir, `${platform}-returning-session.png`);
    copyFileSync(source, destination);
    return basename(destination);
  });
}

const args = parseArgs(process.argv.slice(2));
const platform = args.platform;
const device = args.device;
const appPath = resolve(args.app ?? "");
const apiUrl = args["api-url"] ?? process.env.EXPO_PUBLIC_API_URL ?? "";
const buildId = args["build-id"];
const evidenceDir = resolve(args.evidence ?? "");
if (!new Set(["ios", "android"]).has(platform)) throw new Error("--platform must be ios or android");
if (!device || !existsSync(appPath) || !buildId || !args.evidence) throw new Error("--device, --app, --build-id, and --evidence are required");
await preflight(apiUrl);

const terminal = createInterface({ input: process.stdin, output: process.stdout });
const email = (await terminal.question("Test account email: ")).trim().toLowerCase();
const displayName = (await terminal.question("Display name: ")).trim();
const invite = (await terminal.question("One-use invite code: ")).trim();
if (!email || !displayName || !invite) throw new Error("Email, display name, and invite are required.");

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

function flow(name, variables = {}) {
  const maestroArgs = ["--device", device, "test", "--test-output-dir=results"];
  for (const [key, value] of Object.entries(variables)) maestroArgs.push("-e", `${key}=${value}`);
  maestroArgs.push(join(flows, name));
  run("maestro", maestroArgs, {
    cwd: temporaryRoot,
    env: platform === "ios" ? { ...maestroEnvironment, DEVELOPER_DIR: developerDir } : maestroEnvironment,
    secrets: [...secrets, ...Object.values(variables)],
  });
}

try {
  if (platform === "ios") run("xcrun", ["simctl", "install", device, appPath], { env: { DEVELOPER_DIR: developerDir } });
  else run(adb, ["-s", device, "install", "-r", appPath]);

  flow("invalid-invite.yml", { INVALID_INVITE: invalidInvite, DISPLAY_NAME: displayName, EMAIL: email });
  flow("signup-send.yml", { INVITE: invite, DISPLAY_NAME: displayName, EMAIL: email, JOIN_TOKEN: joinToken });
  const signupOtp = (await terminal.question("Signup OTP from the newest email: ")).trim();
  if (!signupOtp) throw new Error("Signup OTP is required.");
  secrets.push(signupOtp);
  flow("verify-signup.yml", { OTP: signupOtp });
  flow("persistence.yml");
  flow("refresh.yml");
  flow("foreground.yml");
  flow("sign-out.yml");
  flow("returning-send.yml", { EMAIL: email });
  const returningOtp = (await terminal.question("Returning sign-in OTP from the newest email: ")).trim();
  if (!returningOtp) throw new Error("Returning sign-in OTP is required.");
  secrets.push(returningOtp);
  flow("returning-verify.yml", { OTP: returningOtp });

  const screenshots = collectScreenshot(temporaryRoot, evidenceDir, platform);
  const gitResult = spawnSync("git", ["rev-parse", "HEAD"], { cwd: repoRoot, encoding: "utf8" });
  if (gitResult.status !== 0) throw new Error("Could not resolve the candidate SHA.");
  const summary = {
    platform,
    device,
    build_id: buildId,
    git_sha: gitResult.stdout.trim(),
    artifact: basename(appPath),
    artifact_sha256: checksum(appPath),
    api_origin: new URL(apiUrl).origin,
    app_id: appId,
    provider_mode: "deterministic",
    auth_mode: "supabase",
    invalid_invite_rejected: true,
    signup_approved: true,
    join_intent_restored: true,
    relaunch_persistence: true,
    explicit_refresh: true,
    foreground_recovery: true,
    sign_out: true,
    returning_sign_in: true,
    screenshots,
  };
  writeFileSync(join(evidenceDir, `${platform}-auth-summary.json`), `${JSON.stringify(summary, null, 2)}\n`);
  process.stdout.write(`TableUs ${platform} staging authentication lifecycle passed.\n`);
} finally {
  terminal.close();
  rmSync(temporaryRoot, { recursive: true, force: true });
}
