import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const workflow = readFileSync(new URL("../.github/workflows/ci.yml", import.meta.url), "utf8");
const dockerfile = readFileSync(new URL("../backend/Dockerfile", import.meta.url), "utf8");
const mobilePackage = JSON.parse(readFileSync(new URL("../mobile/package.json", import.meta.url), "utf8"));
const mobileRunner = readFileSync(new URL("../mobile/script/build_and_run.sh", import.meta.url), "utf8");

test("CI actions and service images use immutable revisions", () => {
  const actionReferences = [...workflow.matchAll(/uses:\s+[^@\s]+@([^\s#]+)/g)].map((match) => match[1]);
  assert.ok(actionReferences.length > 0);
  assert.ok(actionReferences.every((reference) => /^[0-9a-f]{40}$/.test(reference)));
  assert.doesNotMatch(workflow, /image:\s+[^\s@]+:[^\s@]+(?:\s|$)/);
  assert.match(workflow, /image:\s+postgres:17@sha256:[0-9a-f]{64}/);
});

test("container inputs retain readable tags and immutable digests", () => {
  assert.match(dockerfile, /^FROM python:3\.12-slim@sha256:[0-9a-f]{64}/m);
  assert.match(dockerfile, /COPY --from=ghcr\.io\/astral-sh\/uv:0\.12\.5@sha256:[0-9a-f]{64}/);
  assert.doesNotMatch(dockerfile, /^FROM [^\n@]+$/m);
  assert.doesNotMatch(dockerfile, /COPY --from=[^\s@]+\s/);
});

test("Expo Doctor is locked and the Codex action cannot install a mutable version", () => {
  assert.equal(mobilePackage.devDependencies["expo-doctor"], "1.20.4");
  assert.match(mobileRunner, /npm exec --offline -- expo-doctor/);
  assert.doesNotMatch(mobileRunner, /npx expo-doctor|expo-doctor@latest/);
});
