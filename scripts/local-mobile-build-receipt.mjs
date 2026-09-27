#!/usr/bin/env node

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { artifactChecksum } from "./evidence-utils.mjs";
import {
  RECEIPT_SCHEMA_VERSION,
  assertExactCleanGitTree,
  readStrictJson,
  validateInspectionReport,
} from "./mobile-artifact-security.mjs";

const EXPECTED_EAS_CLI_VERSION = "23.2.0";
const repoRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
if (process.env.TABLEUS_ISOLATED_BUILD !== "1") {
  throw new Error("Receipts may only be emitted by the isolated exact-SHA local build orchestrator");
}

const args = Object.fromEntries(process.argv.slice(2).reduce((pairs, value, index, all) => {
  if (!value.startsWith("--")) return pairs;
  pairs.push([value.slice(2), all[index + 1]]);
  return pairs;
}, []));

for (const key of ["platform", "profile", "artifact", "sha", "build-id", "output", "inspection-report"]) {
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
const sourceTreeSha = assertExactCleanGitTree(repoRoot, args.sha);
const artifactSha256 = artifactChecksum(args.artifact);
const inspectionReportSha256 = artifactChecksum(args["inspection-report"]);
const inspection = validateInspectionReport(
  readStrictJson(args["inspection-report"], "Inspection report"),
  {
    platform: args.platform,
    profile: args.profile,
    candidate_sha: args.sha,
    artifact_sha256: artifactSha256,
  },
);

const receipt = {
  schema_version: RECEIPT_SCHEMA_VERSION,
  build_runner: "eas-local-build-plugin",
  platform: args.platform,
  profile: args.profile,
  candidate_sha: args.sha,
  source_tree_sha: sourceTreeSha,
  build_id: args["build-id"],
  artifact_sha256: artifactSha256,
  eas_cli_version: EXPECTED_EAS_CLI_VERSION,
  package_lock_sha256: artifactChecksum(join(repoRoot, "package-lock.json")),
  host: { os: process.platform, architecture: process.arch },
  inspection_report_sha256: inspectionReportSha256,
  signer_type: inspection.signer_type,
  signer_identity: inspection.signer_identity,
  artifact_inspection_passed: true,
};

mkdirSync(dirname(args.output), { recursive: true });
writeFileSync(args.output, `${JSON.stringify(receipt, null, 2)}\n`, { mode: 0o600 });
console.log(`Sanitized local build receipt written for ${receipt.platform}.`);
