import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

import { assertExactCleanGitTree, validateBuildReceipt } from "./mobile-artifact-security.mjs";

function run(cwd, ...args) {
  const result = spawnSync("git", args, { cwd, encoding: "utf8" });
  if (result.status !== 0) throw new Error(result.stderr);
  return result.stdout.trim();
}

function repository() {
  const root = mkdtempSync(join(tmpdir(), "tableus-receipt-git-"));
  run(root, "init", "-q");
  run(root, "config", "user.email", "receipt@test.invalid");
  run(root, "config", "user.name", "Receipt Test");
  writeFileSync(join(root, "source.txt"), "clean\n");
  run(root, "add", "source.txt");
  run(root, "commit", "-qm", "fixture");
  return { root, sha: run(root, "rev-parse", "HEAD") };
}

test("exact source attestation accepts a fully clean checkout", () => {
  const fixture = repository();
  assert.match(assertExactCleanGitTree(fixture.root, fixture.sha), /^[0-9a-f]{40}$/);
});

test("exact source attestation rejects staged changes", () => {
  const fixture = repository();
  writeFileSync(join(fixture.root, "source.txt"), "staged\n");
  run(fixture.root, "add", "source.txt");
  assert.throws(() => assertExactCleanGitTree(fixture.root, fixture.sha), /staged, unstaged, or untracked/);
});

test("exact source attestation rejects untracked files", () => {
  const fixture = repository();
  writeFileSync(join(fixture.root, "untracked.txt"), "untracked\n");
  assert.throws(() => assertExactCleanGitTree(fixture.root, fixture.sha), /staged, unstaged, or untracked/);
});

test("a caller-supplied inspection boolean cannot satisfy a version-two receipt", () => {
  assert.throws(() => validateBuildReceipt({
    schema_version: 2,
    artifact_inspection_passed: true,
  }, {}), /unexpected or missing fields/);
});
