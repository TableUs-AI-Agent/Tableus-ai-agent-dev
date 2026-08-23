import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { artifactChecksum } from "./evidence-utils.mjs";

test("artifactChecksum matches a standard SHA-256 for files", () => {
  const root = mkdtempSync(join(tmpdir(), "tableus-evidence-checksum-"));
  try {
    const artifact = join(root, "tableus.apk");
    const contents = Buffer.from("deterministic artifact");
    writeFileSync(artifact, contents);
    assert.equal(artifactChecksum(artifact), createHash("sha256").update(contents).digest("hex"));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("artifactChecksum is stable for directory artifacts and sensitive to contents", () => {
  const root = mkdtempSync(join(tmpdir(), "tableus-evidence-directory-"));
  try {
    const app = join(root, "TableUs.app");
    mkdirSync(join(app, "assets"), { recursive: true });
    writeFileSync(join(app, "Info.plist"), "metadata");
    writeFileSync(join(app, "assets", "main.js"), "first");
    const initial = artifactChecksum(app);
    assert.equal(artifactChecksum(app), initial);
    writeFileSync(join(app, "assets", "main.js"), "second");
    assert.notEqual(artifactChecksum(app), initial);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
