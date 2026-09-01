#!/usr/bin/env node

import {
  closeSync,
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  openSync,
  readdirSync,
  rmSync,
  statSync,
} from "node:fs";
import { dirname, extname, join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

import { artifactChecksum } from "./evidence-utils.mjs";

const repoRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const simulatorProfiles = new Set(["test-ios", "auth-test-ios", "telemetry-test-ios"]);
const supportedProfiles = new Set([
  "test-ios", "test-android", "auth-test-ios", "auth-test-android",
  "links-test-ios", "links-test-android", "telemetry-test-ios", "telemetry-test-android",
  "readiness-ios", "readiness-android",
]);

function parseArgs(argv) {
  const values = {};
  for (let index = 0; index < argv.length; index += 2) {
    const key = argv[index]?.replace(/^--/, "");
    const value = argv[index + 1];
    if (!key || !value) throw new Error("Arguments must be --name value pairs");
    values[key] = value;
  }
  return values;
}

function run(command, commandArgs, { cwd = repoRoot, env = {}, logFd } = {}) {
  const result = spawnSync(command, commandArgs, {
    cwd,
    env: { ...process.env, ...env },
    encoding: logFd === undefined ? "utf8" : undefined,
    stdio: logFd === undefined ? undefined : ["ignore", logFd, logFd],
    maxBuffer: 32 * 1024 * 1024,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} failed with status ${result.status}; raw build logs were deleted`);
  return String(result.stdout ?? "").trim();
}

function visit(directory, matches) {
  for (const entry of readdirSync(directory)) {
    const current = join(directory, entry);
    if (statSync(current).isDirectory()) {
      if (extname(current) === ".app") matches.push(current);
      else visit(current, matches);
    }
  }
}

function normalizeArtifact(platform, profile, rawArtifact, root) {
  if (platform === "android" || !simulatorProfiles.has(profile)) return rawArtifact;
  if (statSync(rawArtifact).isDirectory() && extname(rawArtifact) === ".app") return rawArtifact;
  const extraction = join(root, "ios-simulator-artifact");
  mkdirSync(extraction, { mode: 0o700 });
  run("tar", ["-xzf", rawArtifact, "-C", extraction]);
  const apps = [];
  visit(extraction, apps);
  if (apps.length !== 1) throw new Error("iOS simulator build must contain exactly one .app bundle");
  return apps[0];
}

const args = parseArgs(process.argv.slice(2));
for (const name of ["platform", "profile", "sha", "build-id", "artifact", "inspection-report", "receipt"]) {
  if (!args[name]) throw new Error(`--${name} is required`);
}
if (!["ios", "android"].includes(args.platform) || !supportedProfiles.has(args.profile) || !args.profile.endsWith(`-${args.platform}`)) {
  throw new Error("Platform/profile combination is not an approved TableUs local build profile");
}
if (!/^[0-9a-f]{40}$/.test(args.sha)) throw new Error("--sha must be an exact lowercase commit SHA");
for (const target of [args.artifact, args["inspection-report"], args.receipt]) {
  if (existsSync(resolve(target))) throw new Error(`Refusing to overwrite existing output: ${target}`);
}
if (["links-test-ios", "readiness-ios"].includes(args.profile) && !args["apple-team-id"]) {
  throw new Error("--apple-team-id is required for physical iOS builds");
}
if (args.platform === "android" && !args["android-fingerprint"]) {
  throw new Error("--android-fingerprint is required for Android builds");
}
if (!args.profile.startsWith("test-") && (!args["api-url"] || !args["supabase-url"] || !args["link-host"])) {
  throw new Error("Hosted profiles require --api-url, --supabase-url, and --link-host");
}

const temporaryRoot = mkdtempSync(join(tmpdir(), "tableus-exact-sha-build-"));
const workspace = join(temporaryRoot, "workspace");
const rawArtifact = join(temporaryRoot, args.platform === "android" ? "build.apk" : simulatorProfiles.has(args.profile) ? "build.tar.gz" : "build.ipa");
const inspection = join(temporaryRoot, "inspection.json");
const receipt = join(temporaryRoot, "receipt.json");
const logPath = join(temporaryRoot, "build.log");
let worktreeAdded = false;

try {
  run("git", ["cat-file", "-e", `${args.sha}^{commit}`]);
  run("git", ["worktree", "add", "--detach", workspace, args.sha]);
  worktreeAdded = true;
  if (run("git", ["status", "--porcelain=v1", "--untracked-files=all"], { cwd: workspace })) {
    throw new Error("Fresh detached build worktree is not clean");
  }
  const logFd = openSync(logPath, "wx", 0o600);
  try {
    run("npm", ["ci"], { cwd: workspace, logFd });
    run(join(workspace, "node_modules", ".bin", "eas"), [
      "build", "--local", "--non-interactive", "--platform", args.platform,
      "--profile", args.profile, "--output", rawArtifact,
    ], {
      cwd: join(workspace, "mobile"),
      logFd,
      env: {
        EAS_BUILD_GIT_COMMIT_HASH: args.sha,
        EXPO_PUBLIC_SOURCE_SHA: args.sha,
        NODE_OPTIONS: process.env.NODE_OPTIONS || "--max-old-space-size=4096",
        GRADLE_OPTS: process.env.GRADLE_OPTS || "-Dorg.gradle.jvmargs=-Xmx3072m -Dorg.gradle.workers.max=2",
        EAS_LOCAL_BUILD_SKIP_CLEANUP: "0",
      },
    });
  } finally {
    closeSync(logFd);
  }

  const builtArtifact = normalizeArtifact(args.platform, args.profile, rawArtifact, temporaryRoot);
  const common = ["--platform", args.platform, "--artifact", builtArtifact, "--sha", args.sha, "--output", inspection];
  let inspector;
  if (args.profile.startsWith("test-")) {
    inspector = "inspect-mobile-local-e2e-artifact.mjs";
  } else if (args.profile.startsWith("auth-test-")) {
    inspector = "inspect-mobile-auth-artifact.mjs";
  } else if (args.profile.startsWith("links-test-")) {
    inspector = "inspect-mobile-links-artifact.mjs";
    common.push("--profile", args.profile);
  } else if (args.profile.startsWith("telemetry-test-")) {
    inspector = "inspect-mobile-telemetry-artifact.mjs";
  } else {
    inspector = "inspect-mobile-readiness-artifact.mjs";
  }
  if (!args.profile.startsWith("test-")) {
    common.push("--api-url", args["api-url"], "--supabase-url", args["supabase-url"], "--link-host", args["link-host"]);
  }
  if (args["apple-team-id"]) common.push("--apple-team-id", args["apple-team-id"]);
  if (args["android-fingerprint"]) common.push("--android-fingerprint", args["android-fingerprint"]);
  if (args["forbidden-origins"]) common.push("--forbidden-origins", args["forbidden-origins"]);
  run(process.execPath, [join(workspace, "scripts", inspector), ...common], { cwd: workspace });

  run(process.execPath, [
    join(workspace, "scripts", "local-mobile-build-receipt.mjs"),
    "--platform", args.platform, "--profile", args.profile, "--artifact", builtArtifact,
    "--sha", args.sha, "--build-id", args["build-id"], "--inspection-report", inspection,
    "--output", receipt,
  ], { cwd: workspace, env: { TABLEUS_ISOLATED_BUILD: "1" } });

  for (const target of [args.artifact, args["inspection-report"], args.receipt]) mkdirSync(dirname(resolve(target)), { recursive: true });
  cpSync(builtArtifact, resolve(args.artifact), { recursive: statSync(builtArtifact).isDirectory(), errorOnExist: true });
  cpSync(inspection, resolve(args["inspection-report"]), { errorOnExist: true });
  cpSync(receipt, resolve(args.receipt), { errorOnExist: true });
  if (artifactChecksum(resolve(args.artifact)) !== artifactChecksum(builtArtifact)) throw new Error("Exported artifact differs from the inspected build");
  process.stdout.write(`Exact-SHA ${args.profile} artifact, inspection, and receipt exported.\n`);
} finally {
  if (worktreeAdded) spawnSync("git", ["worktree", "remove", "--force", workspace], { cwd: repoRoot, stdio: "ignore" });
  rmSync(temporaryRoot, { recursive: true, force: true });
}
