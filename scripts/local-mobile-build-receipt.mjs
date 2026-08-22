#!/usr/bin/env node

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { artifactChecksum } from "./evidence-utils.mjs";

const args = Object.fromEntries(process.argv.slice(2).reduce((pairs, value, index, all) => {
  if (!value.startsWith("--")) return pairs;
  pairs.push([value.slice(2), all[index + 1]]);
  return pairs;
}, []));

for (const key of ["platform", "profile", "artifact", "sha", "build-id", "output", "eas-cli-version"]) {
  if (!args[key]) throw new Error(`--${key} is required`);
}
if (!new Set(["ios", "android"]).has(args.platform)) throw new Error("--platform must be ios or android");
if (!/^[0-9a-f]{40}$/.test(args.sha)) throw new Error("--sha must be a full lowercase Git SHA");
if (!/^local-(ios|android)-[a-z0-9._-]+$/.test(args["build-id"])) throw new Error("--build-id must be a sanitized local platform identifier");

const receipt = {
  schema_version: 1,
  build_runner: "eas-local-build-plugin",
  platform: args.platform,
  profile: args.profile,
  candidate_sha: args.sha,
  build_id: args["build-id"],
  artifact_sha256: artifactChecksum(args.artifact),
  eas_cli_version: args["eas-cli-version"],
  host: { os: process.platform, architecture: process.arch },
  artifact_inspection_passed: args["inspection-passed"] === "true",
};

mkdirSync(dirname(args.output), { recursive: true });
writeFileSync(args.output, `${JSON.stringify(receipt, null, 2)}\n`, { mode: 0o600 });
console.log(`Sanitized local build receipt written for ${receipt.platform}.`);
