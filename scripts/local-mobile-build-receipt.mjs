#!/usr/bin/env node

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { artifactChecksum } from "./evidence-utils.mjs";

const EXPECTED_EAS_CLI_VERSION = "23.2.0";
const repoRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));

const args = Object.fromEntries(process.argv.slice(2).reduce((pairs, value, index, all) => {
  if (!value.startsWith("--")) return pairs;
  pairs.push([value.slice(2), all[index + 1]]);
  return pairs;
}, []));

for (const key of ["platform", "profile", "artifact", "sha", "build-id", "output"]) {
  if (!args[key]) throw new Error(`--${key} is required`);
}
if (!new Set(["ios", "android"]).has(args.platform)) throw new Error("--platform must be ios or android");
if (!/^[0-9a-f]{40}$/.test(args.sha)) throw new Error("--sha must be a full lowercase Git SHA");
if (!/^local-(ios|android)-[a-z0-9._-]+$/.test(args["build-id"])) throw new Error("--build-id must be a sanitized local platform identifier");
const packageJson = JSON.parse(readFileSync(join(repoRoot, "package.json"), "utf8"));
if (packageJson.devDependencies?.["eas-cli"] !== EXPECTED_EAS_CLI_VERSION) {
  throw new Error(`eas-cli must be pinned to ${EXPECTED_EAS_CLI_VERSION}`);
}
const easResult = spawnSync(join(repoRoot, "node_modules", ".bin", "eas"), ["--version"], {
  cwd: repoRoot,
  encoding: "utf8",
  env: { ...process.env, EXPO_NO_DOCTOR: "1" },
});
if (easResult.status !== 0 || !easResult.stdout.includes(`eas-cli/${EXPECTED_EAS_CLI_VERSION}`)) {
  throw new Error("Locked EAS CLI version could not be verified");
}
const head = spawnSync("git", ["rev-parse", "HEAD"], { cwd: repoRoot, encoding: "utf8" });
const dirty = spawnSync("git", ["diff", "--quiet"], { cwd: repoRoot });
if (head.status !== 0 || head.stdout.trim() !== args.sha || dirty.status !== 0) {
  throw new Error("Local artifact receipts require a clean checkout at the exact candidate SHA");
}

const receipt = {
  schema_version: 1,
  build_runner: "eas-local-build-plugin",
  platform: args.platform,
  profile: args.profile,
  candidate_sha: args.sha,
  build_id: args["build-id"],
  artifact_sha256: artifactChecksum(args.artifact),
  eas_cli_version: EXPECTED_EAS_CLI_VERSION,
  package_lock_sha256: artifactChecksum(join(repoRoot, "package-lock.json")),
  host: { os: process.platform, architecture: process.arch },
  artifact_inspection_passed: args["inspection-passed"] === "true",
};

mkdirSync(dirname(args.output), { recursive: true });
writeFileSync(args.output, `${JSON.stringify(receipt, null, 2)}\n`, { mode: 0o600 });
console.log(`Sanitized local build receipt written for ${receipt.platform}.`);
