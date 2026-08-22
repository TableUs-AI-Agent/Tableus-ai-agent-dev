import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

test("writes a sanitized checksum-only local build receipt", () => {
  const root = mkdtempSync(join(tmpdir(), "tableus-local-receipt-"));
  const artifact = join(root, "app.apk");
  const output = join(root, "receipt.json");
  writeFileSync(artifact, "artifact bytes");
  const result = spawnSync(process.execPath, [
    new URL("./local-mobile-build-receipt.mjs", import.meta.url).pathname,
    "--platform", "android",
    "--profile", "test-android",
    "--artifact", artifact,
    "--sha", "a".repeat(40),
    "--build-id", "local-android-candidate",
    "--output", output,
    "--eas-cli-version", "22.2.0",
    "--inspection-passed", "true",
  ], { encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
  const receipt = JSON.parse(readFileSync(output, "utf8"));
  assert.equal(receipt.candidate_sha, "a".repeat(40));
  assert.equal(receipt.artifact_inspection_passed, true);
  assert.match(receipt.artifact_sha256, /^[0-9a-f]{64}$/);
  assert.equal(JSON.stringify(receipt).includes(root), false);
  assert.equal(JSON.stringify(receipt).includes("artifact bytes"), false);
});
