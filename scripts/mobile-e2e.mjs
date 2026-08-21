#!/usr/bin/env node

import { createHash, randomUUID } from "node:crypto";
import { copyFileSync, cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn, spawnSync } from "node:child_process";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const apiUrl = "http://127.0.0.1:8000";
const appId = "com.tableus.app";
const flowDir = join(repoRoot, "mobile", ".maestro");
const allowedPlatforms = new Set(["ios", "android"]);

function parseArgs(argv) {
  const values = {};
  for (let index = 0; index < argv.length; index += 2) {
    const key = argv[index];
    const value = argv[index + 1];
    if (!key?.startsWith("--") || !value) throw new Error(`Invalid argument near ${key ?? "end of command"}`);
    values[key.slice(2)] = value;
  }
  return values;
}

function redact(value, tokens = []) {
  let result = String(value ?? "");
  for (const token of tokens) result = result.split(token).join("[redacted-share-token]");
  return result.replace(/([?&]token=)[^\s&"']+/g, "$1[redacted-share-token]");
}

function run(command, args, { cwd = repoRoot, env = {}, tokens = [] } = {}) {
  const result = spawnSync(command, args, {
    cwd,
    env: { ...process.env, ...env },
    encoding: "utf8",
    maxBuffer: 20 * 1024 * 1024,
  });
  const output = redact(`${result.stdout ?? ""}${result.stderr ?? ""}`, tokens);
  if (output.trim()) process.stdout.write(output);
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} exited with status ${result.status}`);
}

function commandOutput(command, args) {
  const result = spawnSync(command, args, { cwd: repoRoot, encoding: "utf8" });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} exited with status ${result.status}`);
  return result.stdout.trim();
}

function artifactChecksum(path) {
  const hash = createHash("sha256");
  const visit = (current, relative = "") => {
    const stat = statSync(current);
    if (stat.isDirectory()) {
      for (const entry of readdirSync(current).sort()) visit(join(current, entry), join(relative, entry));
      return;
    }
    hash.update(relative);
    hash.update("\0");
    hash.update(readFileSync(current));
  };
  visit(path);
  return hash.digest("hex");
}

async function api(path, { user = "demo-organizer", method = "GET", body } = {}) {
  const headers = { "X-Demo-User-ID": user };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (method !== "GET") headers["Idempotency-Key"] = `mobile-e2e-${randomUUID()}`;
  const response = await fetch(`${apiUrl}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) throw new Error(`Local API ${method} ${path} failed (${response.status}): ${payload?.error?.message ?? "unknown error"}`);
  return payload.data;
}

async function waitForReady(backend) {
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    if (backend.exitCode !== null) throw new Error("The deterministic backend exited before becoming ready.");
    let response;
    try {
      response = await fetch(`${apiUrl}/health/ready`);
    } catch {
      // The server is still starting.
    }
    if (response?.ok) {
      const payload = await response.json();
      if (payload.provider_mode !== "deterministic" || payload.auth_mode !== "demo") {
        throw new Error("The local backend is not in deterministic demo mode.");
      }
      return;
    }
    await new Promise((resolvePromise) => setTimeout(resolvePromise, 250));
  }
  throw new Error("Timed out waiting for the deterministic backend.");
}

async function assertPortAvailable() {
  try {
    await fetch(`${apiUrl}/health/live`, { signal: AbortSignal.timeout(750) });
  } catch {
    return;
  }
  throw new Error("TCP 8000 is already in use. Stop the existing service before mobile E2E.");
}

function collectNamedScreenshots(root, evidenceDir, platform) {
  if (!evidenceDir) return [];
  mkdirSync(evidenceDir, { recursive: true });
  const wanted = new Set(["finalized-plan.png", "rotated-link.png"]);
  const found = [];
  const visit = (directory) => {
    for (const entry of readdirSync(directory)) {
      const path = join(directory, entry);
      if (statSync(path).isDirectory()) visit(path);
      else if (wanted.has(entry)) found.push(path);
    }
  };
  visit(root);
  return found.map((source) => {
    const destination = join(evidenceDir, `${platform}-${basename(source)}`);
    copyFileSync(source, destination);
    return basename(destination);
  });
}

const args = parseArgs(process.argv.slice(2));
const platform = args.platform;
const device = args.device;
const appPath = args.app ? resolve(args.app) : "";
const evidenceDir = args.evidence ? resolve(args.evidence) : undefined;
const buildId = args["build-id"];

if (!allowedPlatforms.has(platform)) throw new Error("--platform must be ios or android");
if (!device) throw new Error("--device is required");
if (!appPath || !existsSync(appPath)) throw new Error("--app must point to an existing simulator app or APK");
if (new URL(apiUrl).hostname !== "127.0.0.1") throw new Error("Mobile E2E refuses non-loopback API URLs");

await assertPortAvailable();
const temporaryRoot = mkdtempSync(join(tmpdir(), "tableus-mobile-e2e-"));
const temporaryFlowDir = join(temporaryRoot, "flows");
cpSync(flowDir, temporaryFlowDir, { recursive: true });
const maestroEnv = {
  MAESTRO_CLI_NO_ANALYTICS: "1",
  MAESTRO_CLI_ANALYSIS_NOTIFICATION_DISABLED: "true",
  MAESTRO_DISABLE_UPDATE_CHECK: "true",
  MAESTRO_DRIVER_STARTUP_TIMEOUT: process.env.MAESTRO_DRIVER_STARTUP_TIMEOUT || "300000",
};
const developerDir = process.env.DEVELOPER_DIR || "/Applications/Xcode.app/Contents/Developer";
const knownAdb = "/opt/homebrew/share/android-commandlinetools/platform-tools/adb";
const adb = process.env.ADB || (existsSync(knownAdb) ? knownAdb : "adb");
const backendLog = [];
let backend;
let shareToken = "";

function runFlow(name, variables = {}) {
  const flowPath = join(temporaryFlowDir, name);
  const flowArgs = ["--device", device, "test", "--test-output-dir=results"];
  for (const [key, value] of Object.entries(variables)) flowArgs.push("-e", `${key}=${value}`);
  flowArgs.push(flowPath);
  run("maestro", flowArgs, {
    cwd: temporaryRoot,
    env: platform === "ios" ? { ...maestroEnv, DEVELOPER_DIR: developerDir } : maestroEnv,
    tokens: shareToken ? [shareToken] : [],
  });
}

try {
  backend = spawn(join(repoRoot, "scripts", "mobile-e2e-backend.sh"), [], {
    cwd: repoRoot,
    env: process.env,
    stdio: ["ignore", "pipe", "pipe"],
  });
  for (const stream of [backend.stdout, backend.stderr]) {
    stream.on("data", (chunk) => {
      backendLog.push(String(chunk));
      if (backendLog.length > 200) backendLog.shift();
    });
  }
  await waitForReady(backend);

  if (platform === "ios") {
    run("xcrun", ["simctl", "install", device, appPath], { env: { DEVELOPER_DIR: developerDir } });
  } else {
    run(adb, ["-s", device, "install", "-r", appPath]);
    run(adb, ["-s", device, "reverse", "tcp:8000", "tcp:8000"]);
  }

  runFlow("lifecycle-create.yml");
  const plans = await api("/api/v1/plans");
  const created = plans.find((plan) => plan.title === "Mobile lifecycle dinner");
  if (!created) throw new Error("The UI-created lifecycle plan was not returned by the local API.");
  const planId = created.id;
  const rotated = await api(`/api/v1/plans/${planId}/share-token/rotate`, { method: "POST", body: {} });
  shareToken = rotated.share_token;

  runFlow("lifecycle-guest-join.yml", { PLAN_ID: planId, SHARE_TOKEN: shareToken });
  runFlow("lifecycle-organizer-vote.yml", { PLAN_ID: planId });
  runFlow("lifecycle-guest-vote.yml", { PLAN_ID: planId });

  runFlow("lifecycle-organizer-finalize.yml", { PLAN_ID: planId });
  await api(`/api/v1/plans/${planId}/share-token/rotate`, { method: "POST", body: {} });
  runFlow("lifecycle-rotated-link.yml", { PLAN_ID: planId, SHARE_TOKEN: shareToken });
  runFlow("lifecycle-stale-run.yml", { PLAN_ID: planId });

  const screenshots = collectNamedScreenshots(temporaryRoot, evidenceDir, platform);
  if (evidenceDir) {
    const gitSha = commandOutput("git", ["rev-parse", "HEAD"]);
    writeFileSync(join(evidenceDir, `${platform}-summary.json`), `${JSON.stringify({
      platform,
      device,
      build_id: buildId ?? null,
      git_sha: gitSha,
      app: basename(appPath),
      artifact_sha256: artifactChecksum(appPath),
      app_id: appId,
      provider_mode: "deterministic",
      auth_mode: "demo",
      participants: 2,
      candidate_count: 4,
      scores: { "Sakura Table": 5, "Garden Mezze": 5, "Noodle Assembly": 2 },
      finalized_winner: "Sakura Table",
      reopened: true,
      rotated_link_rejected: true,
      stale_run_cleared: true,
      screenshots,
    }, null, 2)}\n`);
  }
  process.stdout.write(`TableUs ${platform} two-user mobile lifecycle passed.\n`);
} catch (error) {
  const recentBackendLog = redact(backendLog.join(""), shareToken ? [shareToken] : []);
  if (recentBackendLog.trim()) process.stderr.write(`Recent deterministic backend log:\n${recentBackendLog}`);
  throw error;
} finally {
  if (platform === "android") spawnSync(adb, ["-s", device, "reverse", "--remove", "tcp:8000"], { stdio: "ignore" });
  if (backend && backend.exitCode === null) {
    backend.kill("SIGINT");
    await new Promise((resolvePromise) => {
      const timeout = setTimeout(resolvePromise, 3000);
      backend.once("exit", () => { clearTimeout(timeout); resolvePromise(); });
    });
    if (backend.exitCode === null) backend.kill("SIGTERM");
  }
  rmSync(temporaryRoot, { recursive: true, force: true });
}
