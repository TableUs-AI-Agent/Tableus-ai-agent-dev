#!/usr/bin/env node

import {
  chmodSync,
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  statSync,
} from "node:fs";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

import { assertDurableOutputs, withDiagnosticAttempt } from "./local-mobile-diagnostics.mjs";
import { artifactChecksum } from "./evidence-utils.mjs";
import { assertLocalBuildPreflight } from "./local-mobile-build-preflight.mjs";

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
  if (result.status !== 0) throw new Error(`${command} failed with status ${result.status}; command failed before build execution`);
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

async function normalizeArtifact(platform, profile, rawArtifact, root, runLogged) {
  if (platform === "android" || !simulatorProfiles.has(profile)) return rawArtifact;
  if (statSync(rawArtifact).isDirectory() && extname(rawArtifact) === ".app") return rawArtifact;
  const extraction = join(root, "ios-simulator-artifact");
  mkdirSync(extraction, { mode: 0o700 });
  await runLogged("tar", ["-xzf", rawArtifact, "-C", extraction], { cwd: repoRoot });
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
if (args["preflight-only"] !== undefined && args["preflight-only"] !== "true") {
  throw new Error("--preflight-only accepts only true");
}
assertLocalBuildPreflight(args);
const diagnosticRoot = resolve(args.diagnostics ?? `${args.artifact}.diagnostics`);
assertDurableOutputs([args.artifact, args["inspection-report"], args.receipt, diagnosticRoot]);
run("git", ["cat-file", "-e", `${args.sha}^{commit}`]);
if (args["preflight-only"] === "true") {
  process.stdout.write(`Local ${args.profile} input preflight passed; no build started.\n`);
  process.exit(0);
}

// Operator must be committed independently of the requested application source.
const operatorSha = run("git", ["rev-parse", "HEAD"]);
if (run("git", ["status", "--porcelain=v1", "--untracked-files=all"])) {
  throw new Error("Operator worktree must be clean and committed before building");
}
process.umask(0o077);
mkdirSync(dirname(diagnosticRoot), { recursive: true, mode: 0o700 });
const retainedRoot = diagnosticRoot;
const workspace = join(retainedRoot, "workspace");
const rawArtifact = join(retainedRoot, args.platform === "android" ? "build.apk" : simulatorProfiles.has(args.profile) ? "build.tar.gz" : "build.ipa");
const inspection = join(retainedRoot, "inspection.json");
const receipt = join(retainedRoot, "receipt.json");
const identity = {
  application_sha: args.sha, operator_tooling_sha: operatorSha,
  application_tree_sha: run("git", ["rev-parse", `${args.sha}^{tree}`]),
  build_id: args["build-id"], platform: args.platform, profile: args.profile,
};
const result = await withDiagnosticAttempt({ root: diagnosticRoot, identity }, async ({ run: runLogged, inventory }) => {
  await runLogged("git", ["worktree", "add", "--detach", workspace, args.sha], { cwd: repoRoot });
  if (run("git", ["status", "--porcelain=v1", "--untracked-files=all"], { cwd: workspace })) {
    throw new Error("Fresh detached build worktree is not clean");
  }
  inventory.package_lock_sha256 = artifactChecksum(join(workspace, "package-lock.json"));
  {
    await runLogged("npm", ["ci"], { cwd: workspace });
    if (args.platform === "ios") {
      await runLogged(process.execPath, [join(repoRoot, "scripts", "ios-scene-build-preflight.mjs")], {
        cwd: workspace, env: { TABLEUS_BUILD_SOURCE_ROOT: workspace },
      });
    }
    await runLogged(join(workspace, "node_modules", ".bin", "eas"), [
      "build", "--local", "--non-interactive", "--platform", args.platform,
      "--profile", args.profile, "--output", rawArtifact,
    ], {
      cwd: join(workspace, "mobile"),
      env: {
        EAS_BUILD_GIT_COMMIT_HASH: args.sha,
        EXPO_PUBLIC_SOURCE_SHA: args.sha,
        NODE_OPTIONS: process.env.NODE_OPTIONS || "--max-old-space-size=4096",
        GRADLE_OPTS: process.env.GRADLE_OPTS || "-Dorg.gradle.jvmargs=-Xmx3072m -Dorg.gradle.workers.max=2",
        EAS_LOCAL_BUILD_SKIP_CLEANUP: "1",
        EAS_LOCAL_BUILD_WORKINGDIR: join(diagnosticRoot, "eas-work"),
        SOURCEMAP_FILE: join(diagnosticRoot, "application.js.map"),
        // Local evidence validates runtime telemetry separately. Sentry's
        // uploader requires cloud/build-only organization context and can fail
        // before Expo finishes the JavaScript bundle. Hosted production and
        // store builds must not inherit this local-only exception.
        SENTRY_DISABLE_AUTO_UPLOAD: "true",
      },
    });
  }

  const builtArtifact = await normalizeArtifact(args.platform, args.profile, rawArtifact, retainedRoot, runLogged);
  inventory.artifact_sha256 = artifactChecksum(builtArtifact);
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
  await runLogged(process.execPath, [join(workspace, "scripts", inspector), ...common], { cwd: workspace });

  await runLogged(process.execPath, [
    join(workspace, "scripts", "local-mobile-build-receipt.mjs"),
    "--platform", args.platform, "--profile", args.profile, "--artifact", builtArtifact,
    "--sha", args.sha, "--build-id", args["build-id"], "--inspection-report", inspection,
    "--output", receipt,
  ], { cwd: workspace, env: { TABLEUS_ISOLATED_BUILD: "1" } });

  inventory.inspection_report_sha256 = artifactChecksum(inspection);
  inventory.receipt_sha256 = artifactChecksum(receipt);
  for (const target of [args.artifact, args["inspection-report"], args.receipt]) mkdirSync(dirname(resolve(target)), { recursive: true });
  cpSync(builtArtifact, resolve(args.artifact), { recursive: statSync(builtArtifact).isDirectory(), errorOnExist: true, force: false });
  cpSync(inspection, resolve(args["inspection-report"]), { errorOnExist: true, force: false });
  cpSync(receipt, resolve(args.receipt), { errorOnExist: true, force: false });
  chmodSync(resolve(args.artifact), statSync(resolve(args.artifact)).isDirectory() ? 0o700 : 0o600);
  chmodSync(resolve(args["inspection-report"]), 0o600);
  chmodSync(resolve(args.receipt), 0o600);
  if (artifactChecksum(resolve(args.artifact)) !== artifactChecksum(builtArtifact)) throw new Error("Exported artifact differs from the inspected build");
  process.stdout.write(`Exact-SHA ${args.profile} artifact, inspection, and receipt exported.\n`);
});
process.stdout.write(`Private diagnostic inventory retained at ${join(diagnosticRoot, "inventory.json")}\n`);
if (result.diagnostics.missing.length || result.diagnostics.errors.length) {
  process.stderr.write(`Diagnostics incomplete: missing ${result.diagnostics.missing.join(", ") || "none"}; scan errors ${result.diagnostics.errors.length}. See inventory.\n`);
}
