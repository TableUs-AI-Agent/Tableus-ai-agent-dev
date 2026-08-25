import assert from "node:assert/strict";
import test from "node:test";

import {
  assertSanitizedGeminiSummary,
  validateGeminiReadiness,
} from "./gemini-evidence-utils.mjs";

test("Gemini readiness requires exact-SHA fully live staging", () => {
  const payload = {
    auth_mode: "supabase",
    places_provider_mode: "live",
    ai_provider_mode: "live",
    provider_mode: "live",
    build_sha: "a".repeat(40),
  };
  assert.equal(validateGeminiReadiness(payload, "a".repeat(40)), true);
  assert.throws(() => validateGeminiReadiness({ ...payload, ai_provider_mode: "deterministic" }, "a".repeat(40)));
  assert.throws(() => validateGeminiReadiness(payload, "b".repeat(40)));
});

test("Gemini evidence rejects sensitive fields", () => {
  assert.deepEqual(
    assertSanitizedGeminiSummary({ candidate_count: 4, usage_input_units: 100 }),
    { candidate_count: 4, usage_input_units: 100 },
  );
  assert.throws(() => assertSanitizedGeminiSummary({ email: "private@example.test" }));
  assert.throws(() => assertSanitizedGeminiSummary({ place_ids: ["private"] }));
  assert.throws(() => assertSanitizedGeminiSummary({ provider_response: {} }));
  assert.throws(() => assertSanitizedGeminiSummary({ prompt_text: "private" }));
});
