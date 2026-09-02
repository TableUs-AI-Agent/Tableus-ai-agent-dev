import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(new URL("./local-mobile-build.mjs", import.meta.url), "utf8");
const receiptSource = readFileSync(new URL("./local-mobile-build-receipt.mjs", import.meta.url), "utf8");

test("local builds originate in a fresh detached exact-SHA worktree", () => {
  for (const control of [
    '"worktree", "add", "--detach", workspace, args.sha',
    '"status", "--porcelain=v1", "--untracked-files=all"',
    '"npm", ["ci"]',
    '"build", "--local", "--non-interactive"',
    'EAS_BUILD_GIT_COMMIT_HASH: args.sha',
    'NODE_OPTIONS: process.env.NODE_OPTIONS || "--max-old-space-size=4096"',
    'SENTRY_DISABLE_AUTO_UPLOAD: "true"',
  ]) assert.equal(source.includes(control), true);
});

test("local artifacts skip build-time Sentry upload without disabling runtime telemetry", () => {
  assert.equal(source.includes('SENTRY_DISABLE_AUTO_UPLOAD: "true"'), true);
  assert.equal(source.includes("EXPO_PUBLIC_SENTRY_DSN"), false);
  assert.equal(source.includes("EXPO_PUBLIC_TELEMETRY_ENABLED"), false);
});

test("inspection and receipt are emitted before the artifact is exported", () => {
  const inspect = source.indexOf('join(workspace, "scripts", inspector)');
  const receipt = source.indexOf('"local-mobile-build-receipt.mjs"');
  const exported = source.indexOf('cpSync(builtArtifact, resolve(args.artifact)');
  assert.equal(inspect >= 0 && receipt > inspect && exported > receipt, true);
  assert.equal(receiptSource.includes('TABLEUS_ISOLATED_BUILD !== "1"'), true);
  assert.equal(receiptSource.includes('args["inspection-passed"]'), false);
});

test("raw build logs are file-backed and deleted with the isolated workspace", () => {
  assert.equal(source.includes('openSync(logPath, "wx", 0o600)'), true);
  assert.equal(source.includes('rmSync(temporaryRoot, { recursive: true, force: true })'), true);
});
