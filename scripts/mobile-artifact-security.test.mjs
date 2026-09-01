import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { artifactChecksum } from "./evidence-utils.mjs";
import { assertArtifactUnchanged, embeddedAppConfiguration, stageVerifiedArtifact } from "./mobile-artifact-security.mjs";

test("iOS extraction reads exactly one canonical active configuration", () => {
  const app = mkdtempSync(join(tmpdir(), "tableus-config.app-"));
  mkdirSync(join(app, "assets"));
  writeFileSync(join(app, "assets", "app.config"), JSON.stringify({ active: true }));
  writeFileSync(join(app, "decoy.txt"), JSON.stringify({ active: false }));
  assert.deepEqual(JSON.parse(embeddedAppConfiguration("ios", app, app)), { active: true });
});

test("iOS extraction rejects duplicate canonical configuration members", () => {
  const app = mkdtempSync(join(tmpdir(), "tableus-duplicate.app-"));
  mkdirSync(join(app, "assets"));
  mkdirSync(join(app, "EXConstants.bundle"));
  writeFileSync(join(app, "assets", "app.config"), "{}");
  writeFileSync(join(app, "EXConstants.bundle", "app.config"), "{}");
  assert.throws(() => embeddedAppConfiguration("ios", app, app), /exactly one canonical/);
});

test("verified staging rejects post-inspection artifact mutation", () => {
  const root = mkdtempSync(join(tmpdir(), "tableus-staged-artifact-"));
  const artifact = join(root, "artifact.apk");
  const receiptPath = join(root, "receipt.json");
  const sha = "a".repeat(40);
  writeFileSync(artifact, "signed artifact bytes");
  const digest = artifactChecksum(artifact);
  writeFileSync(receiptPath, JSON.stringify({
    schema_version: 2,
    build_runner: "eas-local-build-plugin",
    platform: "android",
    profile: "test-android",
    candidate_sha: sha,
    source_tree_sha: "b".repeat(40),
    build_id: "local-android-test",
    artifact_sha256: digest,
    eas_cli_version: "23.2.0",
    package_lock_sha256: "c".repeat(64),
    host: { os: "darwin", architecture: "arm64" },
    inspection_report_sha256: "d".repeat(64),
    signer_type: "android-sha256-cert",
    signer_identity: "AA".repeat(32),
    artifact_inspection_passed: true,
  }));
  const verified = stageVerifiedArtifact({
    artifact,
    receiptPath,
    platform: "android",
    profile: "test-android",
    candidateSha: sha,
    buildId: "local-android-test",
    destination: join(root, "private"),
    signerType: "android-sha256-cert",
    signerIdentity: "AA".repeat(32),
  });
  writeFileSync(verified.path, "mutated after inspection");
  assert.throws(() => assertArtifactUnchanged(verified.path, verified.digest), /changed after inspection/);
});
