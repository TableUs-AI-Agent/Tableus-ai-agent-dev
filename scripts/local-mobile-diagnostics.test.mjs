import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";
import test from "node:test";
import { artifactChecksum } from "./evidence-utils.mjs";
import { assertDurableOutputs, scanDiagnostics, withDiagnosticAttempt } from "./local-mobile-diagnostics.mjs";

const identity = { application_sha: "a".repeat(40), operator_tooling_sha: "b".repeat(40), build_id: "local-ios-fixture", platform: "ios", profile: "test-ios" };
function fixture(t) {
  const parent = mkdtempSync(join(tmpdir(), "tableus-diagnostics-fixture-"));
  t.after(() => rmSync(parent, { recursive: true, force: true }));
  return join(parent, "attempt");
}
const readInventory = (root) => JSON.parse(readFileSync(join(root, "inventory.json"), "utf8"));

test("successful stub retains logs, dSYM, Android symbols and maps bound to separate source/operator identities", async (t) => {
  const root = fixture(t);
  const result = await withDiagnosticAttempt({ root, identity }, async ({ run, inventory }) => {
    await run(process.execPath, ["-e", "console.log('build output'); console.error('build stderr')"]);
    mkdirSync(join(root, "App.dSYM", "Contents", "Resources", "DWARF"), { recursive: true });
    writeFileSync(join(root, "App.dSYM", "Contents", "Resources", "DWARF", "App"), "symbol fixture");
    writeFileSync(join(root, "app.js.map"), '{"version":3}');
    writeFileSync(join(root, "libapp.so"), "ELF fixture");
    writeFileSync(join(root, "mapping.txt"), "mapping fixture");
    writeFileSync(join(root, "app.apk"), "artifact fixture");
    inventory.artifact_sha256 = artifactChecksum(join(root, "app.apk"));
    inventory.receipt_sha256 = "c".repeat(64);
  });
  assert.equal(result.status, "succeeded");
  assert.equal(result.application_sha, identity.application_sha);
  assert.equal(result.operator_tooling_sha, identity.operator_tooling_sha);
  assert.equal(result.build_id, identity.build_id);
  assert.deepEqual(result.diagnostics.missing, []);
  assert.equal(result.diagnostics.files.length, 5);
  for (const file of result.diagnostics.files) assert.equal(file.sha256, artifactChecksum(join(root, file.path)));
  assert.match(readFileSync(join(root, "build.log"), "utf8"), /build output\nbuild stderr/);
  assert.equal(statSync(root).mode & 0o777, 0o700);
  assert.equal(statSync(join(root, "build.log")).mode & 0o777, 0o600);
  assert.equal(statSync(join(root, "inventory.json")).mode & 0o777, 0o600);
  assert.deepEqual(readInventory(root), result);
  await assert.rejects(withDiagnosticAttempt({ root, identity }, async () => {}), /EEXIST/);
});

test("failed stub retains partial map, stderr and exit status; missing symbols are explicit", async (t) => {
  const root = fixture(t);
  await assert.rejects(withDiagnosticAttempt({ root, identity }, async ({ run }) => {
    writeFileSync(join(root, "partial.js.map"), "partial");
    await run(process.execPath, ["-e", "console.error('compiler failed'); process.exit(23)"]);
  }), /23/);
  const result = readInventory(root);
  assert.equal(result.status, "failed");
  assert.equal(result.commands[0].exit_code, 23);
  assert.deepEqual(result.diagnostics.missing, ["native-symbol"]);
  assert.match(readFileSync(join(root, "build.log"), "utf8"), /compiler failed/);
  assert.equal(result.receipt_sha256, undefined);
});

test("spawn and post-build inspection failures finalize inventories without discarding artifacts", async (t) => {
  for (const kind of ["spawn", "inspection"]) {
    const root = join(fixture(t), kind);
    mkdirSync(join(root, ".."));
    await assert.rejects(withDiagnosticAttempt({ root, identity }, async ({ run }) => {
      if (kind === "spawn") await run(join(root, "missing-command"), []);
      writeFileSync(join(root, "build.ipa"), "unaccepted artifact");
      throw new Error("inspection rejected");
    }));
    assert.equal(readInventory(root).status, "failed");
    if (kind === "inspection") assert.equal(existsSync(join(root, "build.ipa")), true);
  }
});

test("SIGTERM finalizes interrupted evidence after child termination", async (t) => {
  const root = fixture(t);
  const moduleUrl = new URL("./local-mobile-diagnostics.mjs", import.meta.url).href;
  const script = `import {withDiagnosticAttempt} from ${JSON.stringify(moduleUrl)};
    await withDiagnosticAttempt({root: ${JSON.stringify(root)}, identity: ${JSON.stringify(identity)}}, async ({run}) => {
      await run(process.execPath, ['-e', "console.log('started'); setInterval(() => {}, 1000)"]);
    }).catch(() => { process.exitCode = 1; });`;
  const child = spawn(process.execPath, ["--input-type=module", "-e", script], { stdio: "ignore" });
  t.after(() => { if (child.exitCode === null) child.kill("SIGKILL"); });
  const exit = new Promise((resolve) => child.once("close", resolve));
  const deadline = Date.now() + 5000;
  while (!existsSync(join(root, "build.log")) || !readFileSync(join(root, "build.log"), "utf8").includes("started")) {
    if (Date.now() > deadline) throw new Error("Stub did not start");
    await new Promise((resolve) => setTimeout(resolve, 20));
  }
  child.kill("SIGTERM");
  assert.equal(await exit, 1);
  assert.equal(readInventory(root).status, "interrupted");
  assert.equal(readInventory(root).failure.signal, "SIGTERM");
  assert.match(readFileSync(join(root, "build.log"), "utf8"), /started/);
});

test("inventory excludes dependency maps and symlinks, and reports empty maps as missing", (t) => {
  const root = fixture(t); mkdirSync(root);
  mkdirSync(join(root, "node_modules"));
  writeFileSync(join(root, "node_modules", "dependency.js.map"), "map");
  writeFileSync(join(root, "empty.js.map"), "");
  symlinkSync(join(root, "node_modules"), join(root, "external"));
  const result = scanDiagnostics(root);
  assert.equal(result.files.length, 1);
  assert.ok(result.missing.includes("javascript-source-map"));
});

test("durable preflight rejects OS temp even through a symlink", (t) => {
  const root = fixture(t); mkdirSync(root);
  symlinkSync(tmpdir(), join(root, "alias"));
  assert.throws(() => assertDurableOutputs([join(root, "alias", "new-build")]), /temporary storage/);
  assert.throws(() => assertDurableOutputs([join(tmpdir(), "new-build")]), /temporary storage/);
});
