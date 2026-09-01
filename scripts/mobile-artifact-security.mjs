import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync } from "node:fs";
import { basename, extname, join } from "node:path";
import { spawnSync } from "node:child_process";

import { artifactChecksum } from "./evidence-utils.mjs";

export const INSPECTION_SCHEMA_VERSION = 1;
export const RECEIPT_SCHEMA_VERSION = 2;

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { encoding: "utf8", maxBuffer: 16 * 1024 * 1024, ...options });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} failed: ${(result.stderr || result.stdout).trim()}`);
  return result.stdout.trim();
}

function visitFiles(directory, callback) {
  for (const entry of readdirSync(directory)) {
    const current = join(directory, entry);
    if (statSync(current).isDirectory()) visitFiles(current, callback);
    else callback(current);
  }
}

export function embeddedAppConfiguration(platform, artifact, extractedIosApp = artifact) {
  if (platform === "android") {
    const configurationEntries = run("unzip", ["-Z1", artifact]).split("\n").filter((entry) => entry.endsWith("app.config"));
    if (configurationEntries.length !== 1 || configurationEntries[0] !== "assets/app.config") {
      throw new Error("Android artifact must contain exactly one canonical Expo app configuration");
    }
    const result = spawnSync("unzip", ["-p", artifact, configurationEntries[0]], { encoding: "utf8", maxBuffer: 8 * 1024 * 1024 });
    if (result.error) throw result.error;
    if (result.status !== 0 || !result.stdout) throw new Error("Could not extract the canonical Android Expo configuration");
    return result.stdout;
  }
  const matches = [];
  visitFiles(extractedIosApp, (file) => {
    if (file.endsWith("/app.config")) matches.push(file);
  });
  if (matches.length !== 1 || !(matches[0].endsWith("/assets/app.config") || matches[0].endsWith("/EXConstants.bundle/app.config"))) {
    throw new Error("iOS artifact must contain exactly one canonical Expo app configuration");
  }
  return readFileSync(matches[0], "utf8");
}

export function assertExactCleanGitTree(repoRoot, expectedSha) {
  const head = run("git", ["rev-parse", "HEAD"], { cwd: repoRoot });
  if (head !== expectedSha) throw new Error("Checkout is not at the exact candidate SHA");
  const status = run("git", ["status", "--porcelain=v1", "--untracked-files=all"], { cwd: repoRoot });
  if (status) throw new Error("Local artifact receipts require no staged, unstaged, or untracked source changes");
  return run("git", ["rev-parse", "HEAD^{tree}"], { cwd: repoRoot });
}

export function readStrictJson(path, label) {
  let value;
  try {
    value = JSON.parse(readFileSync(path, "utf8"));
  } catch {
    throw new Error(`${label} is not valid JSON`);
  }
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${label} must be one JSON object`);
  return value;
}

export function validateInspectionReport(report, expected) {
  const required = [
    "schema_version", "platform", "profile", "candidate_sha", "artifact_sha256",
    "inspection_passed", "signer_type", "signer_identity",
  ];
  if (Object.keys(report).sort().join("\0") !== required.sort().join("\0")) {
    throw new Error("Inspection report has unexpected or missing fields");
  }
  if (report.schema_version !== INSPECTION_SCHEMA_VERSION || report.inspection_passed !== true) {
    throw new Error("Artifact inspection did not pass");
  }
  for (const key of ["platform", "profile", "candidate_sha", "artifact_sha256"]) {
    if (report[key] !== expected[key]) throw new Error(`Inspection report ${key} does not match the artifact`);
  }
  if (!report.signer_type || !report.signer_identity) throw new Error("Inspection report lacks a mandatory signer identity");
  return report;
}

export function inspectionReport({ platform, profile, candidateSha, artifact, signerType, signerIdentity }) {
  if (!signerType || !signerIdentity) throw new Error("Artifact inspection requires a signer identity");
  return {
    schema_version: INSPECTION_SCHEMA_VERSION,
    platform,
    profile,
    candidate_sha: candidateSha,
    artifact_sha256: artifactChecksum(artifact),
    inspection_passed: true,
    signer_type: signerType,
    signer_identity: signerIdentity,
  };
}

export function validateBuildReceipt(receipt, expected) {
  const required = [
    "schema_version", "build_runner", "platform", "profile", "candidate_sha", "source_tree_sha",
    "build_id", "artifact_sha256", "eas_cli_version", "package_lock_sha256", "host",
    "inspection_report_sha256", "signer_type", "signer_identity", "artifact_inspection_passed",
  ];
  if (Object.keys(receipt).sort().join("\0") !== required.sort().join("\0")) {
    throw new Error("Build receipt has unexpected or missing fields");
  }
  if (receipt.schema_version !== RECEIPT_SCHEMA_VERSION || receipt.artifact_inspection_passed !== true) {
    throw new Error("Build receipt does not attest a passed inspection");
  }
  for (const key of ["platform", "profile", "candidate_sha", "build_id", "artifact_sha256"]) {
    if (receipt[key] !== expected[key]) throw new Error(`Build receipt ${key} does not match the requested artifact`);
  }
  if (!/^[0-9a-f]{40}$/.test(receipt.source_tree_sha) || !/^[0-9a-f]{64}$/.test(receipt.package_lock_sha256)
    || !/^[0-9a-f]{64}$/.test(receipt.inspection_report_sha256) || receipt.eas_cli_version !== "23.2.0") {
    throw new Error("Build receipt contains invalid source, lockfile, inspection, or toolchain provenance");
  }
  if (!receipt.signer_type || !receipt.signer_identity) throw new Error("Build receipt lacks a mandatory signer identity");
  if (expected.signer_type && receipt.signer_type !== expected.signer_type) throw new Error("Build receipt signer type does not match");
  if (expected.signer_identity) {
    const actual = receipt.signer_type === "android-sha256-cert" ? normalizeFingerprint(receipt.signer_identity) : receipt.signer_identity;
    const wanted = receipt.signer_type === "android-sha256-cert" ? normalizeFingerprint(expected.signer_identity) : expected.signer_identity;
    if (actual !== wanted) throw new Error("Build receipt signer identity does not match");
  }
  return receipt;
}

export function stageVerifiedArtifact({ artifact, receiptPath, platform, profile, candidateSha, buildId, destination, signerType, signerIdentity }) {
  if (!existsSync(receiptPath)) throw new Error("A verified local build receipt is required before installation");
  const digest = artifactChecksum(artifact);
  const receipt = validateBuildReceipt(readStrictJson(receiptPath, "Build receipt"), {
    platform,
    profile,
    candidate_sha: candidateSha,
    build_id: buildId,
    artifact_sha256: digest,
    signer_type: signerType,
    signer_identity: signerIdentity,
  });
  mkdirSync(destination, { recursive: true, mode: 0o700 });
  const staged = join(destination, basename(artifact));
  cpSync(artifact, staged, { recursive: statSync(artifact).isDirectory(), force: false, errorOnExist: true });
  if (artifactChecksum(staged) !== digest) throw new Error("Private artifact copy differs from the receipted bytes");
  return { path: staged, digest, receipt };
}

export function assertArtifactUnchanged(path, expectedDigest) {
  if (artifactChecksum(path) !== expectedDigest) throw new Error("Artifact changed after inspection and before installation");
}

export function inferredSimulatorSigner(platform, profile, artifact) {
  if (platform === "ios" && extname(artifact) === ".app" && ["test-ios", "auth-test-ios"].includes(profile)) {
    return { signer_type: "ios-simulator", signer_identity: "com.tableus.app" };
  }
  return null;
}

function normalizeFingerprint(value) {
  const hex = value.replace(/[^0-9a-f]/gi, "").toUpperCase();
  if (hex.length !== 64) throw new Error("Android SHA-256 fingerprint is invalid");
  return hex.match(/.{2}/g).join(":");
}

export function verifyAndroidSigner(artifact, expectedFingerprint) {
  const sdkRoots = [process.env.ANDROID_HOME, process.env.ANDROID_SDK_ROOT, "/opt/homebrew/share/android-commandlinetools"].filter(Boolean);
  let apksigner;
  for (const root of sdkRoots) {
    const buildTools = join(root, "build-tools");
    if (!existsSync(buildTools)) continue;
    for (const version of readdirSync(buildTools).sort((a, b) => b.localeCompare(a, undefined, { numeric: true }))) {
      const candidate = join(buildTools, version, "apksigner");
      if (existsSync(candidate)) { apksigner = candidate; break; }
    }
    if (apksigner) break;
  }
  apksigner ??= run("which", ["apksigner"]);
  const signature = run(apksigner, ["verify", "--verbose", "--print-certs", artifact]);
  const match = signature.match(/Signer #1 certificate SHA-256 digest:\s*([0-9a-f]+)/i);
  if (!match) throw new Error("Could not read the APK signing fingerprint");
  const actual = normalizeFingerprint(match[1]);
  if (!expectedFingerprint || actual !== normalizeFingerprint(expectedFingerprint)) {
    throw new Error("Android signing fingerprint does not match the expected signer");
  }
  return actual;
}

export function verifyIosSimulatorBundle(app) {
  if (!statSync(app).isDirectory() || extname(app) !== ".app") throw new Error("iOS simulator artifact must be one .app bundle");
  const bundleId = run("plutil", ["-extract", "CFBundleIdentifier", "raw", join(app, "Info.plist")]);
  if (bundleId !== "com.tableus.app") throw new Error("iOS simulator bundle identifier is not TableUs");
  return bundleId;
}

export function iosAllowsLocalNetworking(app) {
  const result = spawnSync("plutil", ["-extract", "NSAppTransportSecurity.NSAllowsLocalNetworking", "raw", join(app, "Info.plist")], {
    encoding: "utf8",
  });
  if (result.error) throw result.error;
  if (result.status !== 0) return false;
  return result.stdout.trim() === "true";
}

export function androidManifest(artifact) {
  const candidates = [
    "/opt/homebrew/share/android-commandlinetools/cmdline-tools/latest/bin/apkanalyzer",
    "/opt/homebrew/share/android-commandlinetools/tools/bin/apkanalyzer",
  ];
  let executable = candidates.find(existsSync);
  executable ??= run("which", ["apkanalyzer"]);
  const manifest = run(executable, ["manifest", "print", artifact]);
  if (!manifest.includes('package="com.tableus.app"')) throw new Error("Android package identifier is not TableUs");
  return manifest;
}
