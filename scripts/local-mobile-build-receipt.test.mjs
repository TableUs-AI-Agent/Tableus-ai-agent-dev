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
    "--inspection-passed", "true",
  ], { encoding: "utf8" });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /clean checkout at the exact candidate SHA/);
});
