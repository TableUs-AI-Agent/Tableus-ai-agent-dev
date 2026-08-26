#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import {
  validateCumulativeReadinessInput,
  validateStagingReadiness,
  writeCumulativeReadinessEvidence,
} from "./readiness-evidence-utils.mjs";

function parseArgs(argv) {
  const values = {};
  for (let index = 0; index < argv.length; index += 2) {
    const key = argv[index];
    const value = argv[index + 1];
    if (!key?.startsWith("--") || !value) throw new Error("Arguments must be --name value pairs");
    values[key.slice(2)] = value;
  }
  return values;
}

const args = parseArgs(process.argv.slice(2));
const apiUrl = args["api-url"];
const sha = args.sha;
const inputPath = resolve(args.input ?? "");
const evidence = resolve(args.evidence ?? "");
if (!apiUrl || !sha || !args.input || !args.evidence) throw new Error("--api-url, --sha, --input, and --evidence are required");
const parsedApi = new URL(apiUrl);
if (parsedApi.protocol !== "https:" || parsedApi.username || parsedApi.password || parsedApi.search || parsedApi.hash) {
  throw new Error("Cumulative staging evidence requires a credential-free HTTPS API origin");
}

const input = validateCumulativeReadinessInput(JSON.parse(readFileSync(inputPath, "utf8")), sha);
const response = await fetch(`${apiUrl.replace(/\/$/, "")}/health/ready`, { signal: AbortSignal.timeout(15_000) });
if (!response.ok) throw new Error(`Staging readiness failed (${response.status})`);
const readiness = validateStagingReadiness(await response.json(), sha);
const summary = {
  ...input,
  staging_readiness: readiness,
  raw_personal_data_retained: false,
  restricted_google_content_retained: false,
  raw_workspaces_retained: false,
};
const target = writeCumulativeReadinessEvidence(evidence, summary);
process.stdout.write(`Sanitized cumulative readiness evidence written to ${target}\n`);
