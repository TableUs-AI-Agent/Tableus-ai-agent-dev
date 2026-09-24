import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repo = resolve(dirname(fileURLToPath(import.meta.url)), "..");

test("Settings UI evidence analyzer uses pure Python fixtures", () => {
  const result = spawnSync("python3", ["-m", "unittest", "-q", "scripts/maestro_ui_evidence_test.py"], {
    cwd: repo,
    env: { ...process.env, PYTHONDONTWRITEBYTECODE: "1" },
    encoding: "utf8",
    timeout: 30_000,
    maxBuffer: 1024 * 1024,
  });
  assert.equal(result.status, 0, result.stderr || result.error?.message || "UI evidence fixtures failed");
});
