#!/usr/bin/env node

import { readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const repoRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const mobileRoot = join(repoRoot, "mobile");

export function workflowFiles(directory) {
  return readdirSync(directory)
    .filter((entry) => /\.ya?ml$/i.test(entry))
    .sort()
    .map((entry) => join(directory, entry));
}

export function referencedProfiles(contents) {
  return [...contents.matchAll(/^\s+profile:\s*([A-Za-z0-9_-]+)\s*$/gm)].map((match) => match[1]);
}

export function assertProfilesExist(files, easJson) {
  const available = new Set(Object.keys(easJson?.build ?? {}));
  for (const file of files) {
    for (const profile of referencedProfiles(readFileSync(file, "utf8"))) {
      if (!available.has(profile)) throw new Error(`${file} references missing EAS build profile ${profile}`);
    }
  }
}

export function validateWithEas(files, { cli = process.env.EAS_CLI || "eas", spawn = spawnSync } = {}) {
  for (const file of files) {
    const result = spawn(cli, ["workflow:validate", file, "--non-interactive"], {
      cwd: mobileRoot,
      env: process.env,
      encoding: "utf8",
      maxBuffer: 4 * 1024 * 1024,
    });
    if (result.error) throw result.error;
    if (result.status !== 0) throw new Error(`EAS workflow validation failed for ${file}: ${(result.stderr || result.stdout).trim()}`);
  }
}

function main() {
  const files = workflowFiles(join(mobileRoot, ".eas", "workflows"));
  if (files.length === 0) throw new Error("No EAS workflows were found");
  assertProfilesExist(files, JSON.parse(readFileSync(join(mobileRoot, "eas.json"), "utf8")));
  validateWithEas(files);
  process.stdout.write(`Validated ${files.length} EAS workflows against Expo's current schema.\n`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
