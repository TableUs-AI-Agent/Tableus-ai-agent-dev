import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { assertProfilesExist, referencedProfiles, validateWithEas, workflowFiles } from "./validate-eas-workflows.mjs";

test("workflow validation discovers YAML and verifies referenced build profiles", () => {
  const root = mkdtempSync(join(tmpdir(), "tableus-eas-workflow-test-"));
  try {
    const workflow = join(root, "test.yml");
    writeFileSync(workflow, "jobs:\n  build:\n    params:\n      profile: test-ios\n");
    writeFileSync(join(root, "ignore.txt"), "ignored");
    assert.deepEqual(workflowFiles(root), [workflow]);
    assert.deepEqual(referencedProfiles(readFileSync(workflow, "utf8")), ["test-ios"]);
    assert.doesNotThrow(() => assertProfilesExist([workflow], { build: { "test-ios": {} } }));
    assert.throws(() => assertProfilesExist([workflow], { build: {} }), /missing EAS build profile/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("workflow validation calls the EAS CLI once per file and fails closed", () => {
  const calls = [];
  validateWithEas(["one.yml", "two.yml"], {
    cli: "eas",
    spawn(command, args) {
      calls.push([command, args]);
      return { status: 0, stdout: "valid", stderr: "" };
    },
  });
  assert.deepEqual(calls, [
    ["eas", ["workflow:validate", "one.yml", "--non-interactive"]],
    ["eas", ["workflow:validate", "two.yml", "--non-interactive"]],
  ]);
  assert.throws(() => validateWithEas(["bad.yml"], {
    spawn() { return { status: 1, stdout: "", stderr: "invalid" }; },
  }), /validation failed/);
});
