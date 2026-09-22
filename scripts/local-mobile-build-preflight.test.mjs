import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

import { assertLocalBuildPreflight } from "./local-mobile-build-preflight.mjs";

const valid = {
  platform: "ios",
  "build-id": "local-ios-test-daa89a0",
  artifact: "/tmp/tableus-preflight/app.app",
  "inspection-report": "/tmp/tableus-preflight/inspection.json",
  receipt: "/tmp/tableus-preflight/receipt.json",
};

test("rejects the identifier that previously wasted a successful iOS build", () => {
  assert.throws(() => assertLocalBuildPreflight({ ...valid, "build-id": "local-test-ios-daa89a0" }, {}), /local-ios-/);
  assert.throws(() => assertLocalBuildPreflight({ ...valid, "build-id": "local-android-test-daa89a0" }, {}), /local-ios-/);
  assert.doesNotThrow(() => assertLocalBuildPreflight(valid, {}));
});

test("rejects output collisions before compilation", () => {
  assert.throws(() => assertLocalBuildPreflight({ ...valid, receipt: valid.artifact }, {}), /non-overlapping/);
  assert.throws(() => assertLocalBuildPreflight({ ...valid, receipt: join(valid.artifact, "receipt.json") }, {}), /non-overlapping/);
});

test("Android requires a complete, unambiguous SDK location", (t) => {
  const root = mkdtempSync(join(tmpdir(), "tableus-build-preflight-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const args = { ...valid, platform: "android", "build-id": "local-android-test-daa89a0", "android-fingerprint": "ab".repeat(32) };
  assert.throws(() => assertLocalBuildPreflight(args, {}), /Set ANDROID_HOME/);
  assert.throws(() => assertLocalBuildPreflight(args, { ANDROID_HOME: root }), /platforms and build-tools/);
  for (const sdk of [join(root, "sdk-a"), join(root, "sdk-b")]) {
    mkdirSync(join(sdk, "platforms"), { recursive: true });
    mkdirSync(join(sdk, "build-tools"));
  }
  const sdk = join(root, "sdk-a");
  assert.doesNotThrow(() => assertLocalBuildPreflight(args, { ANDROID_HOME: sdk }));
  assert.doesNotThrow(() => assertLocalBuildPreflight(args, { ANDROID_SDK_ROOT: sdk }));
  assert.throws(() => assertLocalBuildPreflight(args, { ANDROID_HOME: sdk, ANDROID_SDK_ROOT: join(root, "sdk-b") }), /same installed SDK/);
});

test("rejects malformed signer identifiers before native work", () => {
  assert.throws(() => assertLocalBuildPreflight({ ...valid, "apple-team-id": "invalid" }, {}), /Apple team identifier/);
  assert.throws(() => assertLocalBuildPreflight({ ...valid, platform: "android", "build-id": "local-android-test", "android-fingerprint": "invalid" }, {}), /signing certificate fingerprint/);
});

test("CLI rejects invalid input without creating a build workspace or invoking EAS", (t) => {
  const root = mkdtempSync(join(tmpdir(), "tableus-build-preflight-cli-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const result = spawnSync(process.execPath, [
    new URL("./local-mobile-build.mjs", import.meta.url).pathname,
    "--platform", "ios", "--profile", "test-ios", "--sha", "a".repeat(40),
    "--build-id", "local-test-ios-daa89a0", "--artifact", join(root, "output.app"),
    "--inspection-report", join(root, "inspection.json"), "--receipt", join(root, "receipt.json"),
  ], { encoding: "utf8", env: { ...process.env, TMPDIR: root, PATH: "" } });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /--build-id must start with local-ios-/);
  assert.deepEqual(readdirSync(root), []);
});

test("CLI preflight-only checks the commit but starts no build", (t) => {
  const root = mkdtempSync(new URL("../.preflight-test-", import.meta.url).pathname);
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const repo = new URL("..", import.meta.url).pathname;
  const sha = spawnSync("git", ["rev-parse", "HEAD"], { cwd: repo, encoding: "utf8" }).stdout.trim();
  const result = spawnSync(process.execPath, [
    new URL("./local-mobile-build.mjs", import.meta.url).pathname,
    "--platform", "ios", "--profile", "test-ios", "--sha", sha,
    "--build-id", valid["build-id"], "--artifact", join(root, "output.app"),
    "--inspection-report", join(root, "inspection.json"), "--receipt", join(root, "receipt.json"),
    "--preflight-only", "true",
  ], { encoding: "utf8", env: { ...process.env } });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /no build started/);
  assert.deepEqual(readdirSync(root), []);
});
