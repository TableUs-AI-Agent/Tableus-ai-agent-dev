#!/usr/bin/env node

import { randomUUID } from "node:crypto";
import { copyFileSync, cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn, spawnSync } from "node:child_process";

import { artifactChecksum } from "./evidence-utils.mjs";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const proxyUrl = "http://127.0.0.1:8000";
const upstreamUrl = "http://127.0.0.1:8001";
const controlUrl = "http://127.0.0.1:7999";
const appId = "com.tableus.app";
const flowSource = join(repoRoot, "mobile", ".maestro-offline");

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

function run(command, args, { cwd = repoRoot, env = {} } = {}) {
  const result = spawnSync(command, args, { cwd, env: { ...process.env, ...env }, encoding: "utf8", maxBuffer: 20 * 1024 * 1024 });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} exited with status ${result.status}`);
}

function runBestEffort(command, args, { cwd = repoRoot, env = {} } = {}) {
  spawnSync(command, args, { cwd, env: { ...process.env, ...env }, stdio: "ignore" });
}

function commandOutput(command, args) {
  const result = spawnSync(command, args, { cwd: repoRoot, encoding: "utf8" });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} exited with status ${result.status}`);
  return result.stdout.trim();
}

async function control(path, body) {
  const response = await fetch(`${controlUrl}${path}`, body === undefined ? undefined : {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`Fault proxy control failed (${response.status})`);
  return response.json();
}

async function stats(method, path) {
  return control(`/stats?method=${encodeURIComponent(method)}&path=${encodeURIComponent(path)}`);
}

async function api(path, { user = "demo-organizer", method = "GET", body } = {}) {
  const headers = { "X-Demo-User-ID": user };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (method !== "GET") headers["Idempotency-Key"] = `offline-fixture-${randomUUID()}`;
  const response = await fetch(`${upstreamUrl}${path}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  const payload = await response.json().catch(() => null);
  if (!response.ok) throw new Error(`Fixture API ${method} ${path} failed (${response.status})`);
  return payload.data;
}

async function waitFor(url, processes) {
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    if (processes.some((process) => process?.exitCode !== null)) throw new Error("A deterministic E2E service exited before readiness.");
    try {
      const response = await fetch(url);
      if (response.ok) return response.json();
    } catch {}
    await new Promise((resolvePromise) => setTimeout(resolvePromise, 250));
  }
  throw new Error(`Timed out waiting for ${url}`);
}

async function assertPortsAvailable() {
  for (const port of [7999, 8000, 8001]) {
    try {
      await fetch(`http://127.0.0.1:${port}/health/live`, { signal: AbortSignal.timeout(500) });
    } catch {
      continue;
    }
    throw new Error(`TCP ${port} is already in use.`);
  }
}

function collectScreenshots(root, evidenceDir, platform) {
  if (!evidenceDir) return [];
  mkdirSync(evidenceDir, { recursive: true });
  const wanted = new Set(["offline-retry.png", "recovered-finalized.png"]);
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
const buildId = args["build-id"];
const evidenceDir = args.evidence ? resolve(args.evidence) : "";
if (!new Set(["ios", "android"]).has(platform)) throw new Error("--platform must be ios or android");
if (!device) throw new Error("--device is required");
if (!appPath || !existsSync(appPath)) throw new Error("--app must point to an existing simulator app or APK");
if (!buildId) throw new Error("--build-id is required");
if (!evidenceDir) throw new Error("--evidence is required");
if (new URL(proxyUrl).hostname !== "127.0.0.1" || new URL(upstreamUrl).hostname !== "127.0.0.1") throw new Error("Offline E2E refuses non-loopback APIs");

await assertPortsAvailable();
const temporaryRoot = mkdtempSync(join(tmpdir(), "tableus-mobile-offline-e2e-"));
const flowDir = join(temporaryRoot, "flows");
cpSync(flowSource, flowDir, { recursive: true });
const maestroEnv = {
  MAESTRO_CLI_NO_ANALYTICS: "1",
  MAESTRO_CLI_ANALYSIS_NOTIFICATION_DISABLED: "true",
  MAESTRO_DISABLE_UPDATE_CHECK: "true",
  MAESTRO_DRIVER_STARTUP_TIMEOUT: process.env.MAESTRO_DRIVER_STARTUP_TIMEOUT || "300000",
};
const developerDir = process.env.DEVELOPER_DIR || "/Applications/Xcode.app/Contents/Developer";
const knownAdb = "/opt/homebrew/share/android-commandlinetools/platform-tools/adb";
const adb = process.env.ADB || (existsSync(knownAdb) ? knownAdb : "adb");
let backend;
let proxy;

function runFlow(name, variables = {}) {
  const flowArgs = ["--device", device, "test", "--test-output-dir=results"];
  for (const [key, value] of Object.entries(variables)) flowArgs.push("-e", `${key}=${value}`);
  flowArgs.push(join(flowDir, name));
  run("maestro", flowArgs, { cwd: temporaryRoot, env: platform === "ios" ? { ...maestroEnv, DEVELOPER_DIR: developerDir } : maestroEnv });
}

try {
  backend = spawn(join(repoRoot, "scripts", "mobile-e2e-backend.sh"), [], {
    cwd: repoRoot,
    env: { ...process.env, TABLEUS_E2E_PORT: "8001" },
    stdio: "ignore",
  });
  proxy = spawn(process.execPath, [join(repoRoot, "scripts", "mobile-fault-proxy.mjs")], { cwd: repoRoot, stdio: "ignore" });
  const readiness = await waitFor(`${upstreamUrl}/health/ready`, [backend, proxy]);
  if (readiness.places_provider_mode !== "deterministic" || readiness.ai_provider_mode !== "deterministic" || readiness.auth_mode !== "demo") throw new Error("Backend readiness is not deterministic/demo.");
  await waitFor(`${controlUrl}/health`, [backend, proxy]);

  if (platform === "ios") {
    runBestEffort("xcrun", ["simctl", "uninstall", device, appId], { env: { DEVELOPER_DIR: developerDir } });
    run("xcrun", ["simctl", "install", device, appPath], { env: { DEVELOPER_DIR: developerDir } });
  }
  else {
    runBestEffort(adb, ["-s", device, "uninstall", appId]);
    run(adb, ["-s", device, "install", "-r", appPath]);
    run(adb, ["-s", device, "reverse", "tcp:8000", "tcp:8000"]);
  }

  await control("/reset", {});
  await control("/configure", { mode: "forward-then-drop-response", method: "POST", path: "/api/v1/plans" });
  try {
    runFlow("create-failure.yml");
  } catch (error) {
    const safeStats = await stats("POST", "/api/v1/plans");
    throw new Error(
      `Create-failure UI phase failed after ${safeStats.request_count} proxy request(s), ${safeStats.upstream_request_count} upstream request(s), and ${safeStats.dropped_after_commit_count} dropped committed response(s).`,
      { cause: error },
    );
  }
  const createBeforeRetry = await stats("POST", "/api/v1/plans");
  if (createBeforeRetry.request_count !== 1 || createBeforeRetry.dropped_after_commit_count !== 1) throw new Error("Create fault did not commit exactly once before dropping the response.");
  await new Promise((resolvePromise) => setTimeout(resolvePromise, 1500));
  if ((await stats("POST", "/api/v1/plans")).request_count !== 1) throw new Error("Create was retried automatically.");
  runFlow("create-retry.yml");
  const createAfterRetry = await stats("POST", "/api/v1/plans");
  if (createAfterRetry.request_count !== 2 || !createAfterRetry.same_idempotency_key || createAfterRetry.idempotent_replay_count !== 1) throw new Error("Create retry was not a same-key idempotent replay.");

  const plans = await api("/api/v1/plans");
  const matchingPlans = plans.filter((plan) => plan.title === "Offline resilience dinner");
  if (matchingPlans.length !== 1) throw new Error("Expected exactly one offline resilience plan.");
  const planId = matchingPlans[0].id;

  await control("/reset", {});
  runFlow("constraints-offline.yml", { PLAN_ID: planId });
  const constraintsOffline = await stats("PATCH", `/api/v1/plans/${planId}/constraints`);
  if (constraintsOffline.request_count !== 0) throw new Error("Offline constraints were sent or queued.");
  runFlow("constraints-retry.yml", { PLAN_ID: planId });
  const constraintsOnline = await stats("PATCH", `/api/v1/plans/${planId}/constraints`);
  if (constraintsOnline.request_count !== 1 || constraintsOnline.upstream_request_count !== 1) throw new Error("Constraints retry did not execute exactly once.");

  const rotated = await api(`/api/v1/plans/${planId}/share-token/rotate`, { method: "POST", body: {} });
  await api(`/api/v1/plans/${planId}/join`, { user: "demo-guest", method: "POST", body: { share_token: rotated.share_token } });
  const generated = await api(`/api/v1/plans/${planId}/recommendations`, { method: "POST", body: { query: "group-friendly dinner" } });
  if (generated.candidates.length !== 4) throw new Error("Deterministic provider did not return exactly four candidates.");

  await control("/reset", {});
  await control("/configure", { mode: "forward-then-drop-response", method: "POST", path: `/api/v1/plans/${planId}/finalize` });
  runFlow("finalize-failure.yml", { PLAN_ID: planId });
  const committedPlan = await api(`/api/v1/plans/${planId}`);
  const exportBeforeRetry = await api("/api/v1/me/export");
  const finalEventsBeforeRetry = exportBeforeRetry.authored_plan_events.filter((event) => event.plan_id === planId && event.event_type === "plan.finalized");
  const finalizeBeforeRetry = await stats("POST", `/api/v1/plans/${planId}/finalize`);
  if (committedPlan.status !== "finalized" || finalEventsBeforeRetry.length !== 1 || finalizeBeforeRetry.request_count !== 1) throw new Error("Finalization did not commit exactly one transition/event before the response drop.");
  runFlow("finalize-retry.yml");
  const finalizeAfterRetry = await stats("POST", `/api/v1/plans/${planId}/finalize`);
  const exportAfterRetry = await api("/api/v1/me/export");
  const finalEventsAfterRetry = exportAfterRetry.authored_plan_events.filter((event) => event.plan_id === planId && event.event_type === "plan.finalized");
  if (finalizeAfterRetry.request_count !== 2 || !finalizeAfterRetry.same_idempotency_key || finalizeAfterRetry.idempotent_replay_count !== 1 || finalEventsAfterRetry.length !== 1) throw new Error("Finalization retry was not a single-event idempotent replay.");

  const screenshots = collectScreenshots(temporaryRoot, evidenceDir, platform);
  mkdirSync(evidenceDir, { recursive: true });
  writeFileSync(join(evidenceDir, `${platform}-offline-summary.json`), `${JSON.stringify({
    platform,
    device,
    build_id: buildId,
    git_sha: commandOutput("git", ["rev-parse", "HEAD"]),
    app: basename(appPath),
    artifact_sha256: artifactChecksum(appPath),
    app_id: appId,
    provider_mode: "deterministic",
    places_provider_mode: "deterministic",
    ai_provider_mode: "deterministic",
    auth_mode: "demo",
    create_request_count: createAfterRetry.request_count,
    create_same_key_replay: createAfterRetry.same_idempotency_key,
    plan_count: matchingPlans.length,
    offline_constraint_request_count: constraintsOffline.request_count,
    recovered_constraint_request_count: constraintsOnline.request_count,
    candidate_count: generated.candidates.length,
    finalize_request_count: finalizeAfterRetry.request_count,
    finalize_same_key_replay: finalizeAfterRetry.same_idempotency_key,
    finalized_event_count: finalEventsAfterRetry.length,
    screenshots,
  }, null, 2)}\n`);
  process.stdout.write(`TableUs ${platform} offline mutation journey passed.\n`);
} finally {
  if (platform === "android") spawnSync(adb, ["-s", device, "reverse", "--remove", "tcp:8000"], { stdio: "ignore" });
  for (const process of [proxy, backend]) {
    if (process?.exitCode === null) process.kill("SIGTERM");
  }
  await new Promise((resolvePromise) => setTimeout(resolvePromise, 250));
  rmSync(temporaryRoot, { recursive: true, force: true });
}
