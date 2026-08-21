#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { extname, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

function parseArgs(argv) {
  const result = {};
  for (let index = 0; index < argv.length; index += 2) {
    const key = argv[index]?.replace(/^--/, "");
    const value = argv[index + 1];
    if (!key || !value) throw new Error(`Invalid argument near ${argv[index] ?? "end"}`);
    result[key] = value;
  }
  return result;
}

function artifactBytes(path) {
  if (!statSync(path).isDirectory()) {
    if (extname(path) !== ".apk") return readFileSync(path);
    const result = spawnSync("unzip", ["-p", path], { encoding: null, maxBuffer: 512 * 1024 * 1024 });
    if (result.error) throw result.error;
    if (result.status !== 0) throw new Error("Could not inspect Android APK contents.");
    return result.stdout;
  }
  const chunks = [];
  const visit = (directory) => {
    for (const entry of readdirSync(directory)) {
      const current = join(directory, entry);
      if (statSync(current).isDirectory()) visit(current);
      else chunks.push(readFileSync(current));
    }
  };
  visit(path);
  return Buffer.concat(chunks);
}

const args = parseArgs(process.argv.slice(2));
const artifact = resolve(args.artifact ?? "");
if (!existsSync(artifact) || !args.sha || !args["api-url"] || !args["supabase-url"]) {
  throw new Error("--artifact, --sha, --api-url, and --supabase-url are required");
}
if (!args["api-url"].startsWith("https://") || !args["supabase-url"].startsWith("https://")) {
  throw new Error("Auth artifacts require HTTPS API and Supabase URLs.");
}

const content = artifactBytes(artifact).toString("latin1");
for (const required of [args.sha, args["api-url"], args["supabase-url"], "authE2E"]) {
  if (!content.includes(required)) throw new Error(`Artifact is missing required marker: ${required}`);
}
const forbidden = [
  "demo-organizer",
  "demo-guest",
  "http://127.0.0.1:8000",
  "http://localhost:8000",
  "http://[::1]:8000",
  "service_role",
  "SUPABASE_SERVICE_ROLE",
  ...(args["forbidden-origins"] ?? "").split(",").filter(Boolean),
];
for (const marker of forbidden) {
  if (content.includes(marker)) throw new Error(`Artifact contains forbidden marker: ${marker}`);
}
if (!/localE2E.{0,24}(false|0)/s.test(content)) throw new Error("Artifact does not prove localE2E=false.");
if (!/authE2E.{0,24}(true|1)/s.test(content)) throw new Error("Artifact does not prove authE2E=true.");
process.stdout.write("Mobile auth artifact inspection passed.\n");
