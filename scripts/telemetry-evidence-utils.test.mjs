import assert from "node:assert/strict";
import test from "node:test";

import { assertSafeEvidence, parseArgs } from "./telemetry-evidence-utils.mjs";

test("evidence allows aggregate-only values", () => {
  assert.deepEqual(assertSafeEvidence({ passed: true, count: 3, platforms: ["web", "ios"] }), { passed: true, count: 3, platforms: ["web", "ios"] });
});

test("evidence rejects identifiers and private payload fields", () => {
  assert.throws(() => assertSafeEvidence({ value: "person@example.test" }), /prohibited/);
  assert.throws(() => assertSafeEvidence({ access_token: "secret" }), /prohibited/);
  assert.throws(() => assertSafeEvidence({ prompt_count: 1 }), /prohibited/);
});

test("operator arguments are explicit pairs", () => {
  assert.deepEqual(parseArgs(["--api-url", "https://api.example", "--sha", "abc"]), { "api-url": "https://api.example", sha: "abc" });
  assert.throws(() => parseArgs(["--api-url"]));
});
