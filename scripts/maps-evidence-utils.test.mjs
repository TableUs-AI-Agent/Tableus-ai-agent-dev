import assert from "node:assert/strict";
import test from "node:test";

import { assertSanitizedMapsSummary, validateMapsReadiness } from "./maps-evidence-utils.mjs";

test("maps readiness requires exact SHA, Supabase, live Places, and deterministic AI", () => {
  assert.equal(validateMapsReadiness({ auth_mode: "supabase", provider_mode: "mixed", places_provider_mode: "live", ai_provider_mode: "deterministic", build_sha: "abc" }, "abc"), true);
  assert.throws(() => validateMapsReadiness({ auth_mode: "supabase", provider_mode: "live", places_provider_mode: "live", ai_provider_mode: "live", build_sha: "abc" }, "abc"));
  assert.throws(() => validateMapsReadiness({ auth_mode: "supabase", provider_mode: "mixed", places_provider_mode: "live", ai_provider_mode: "deterministic", build_sha: "old" }, "abc"));
});

test("maps evidence rejects private and provider-derived fields", () => {
  assert.deepEqual(assertSanitizedMapsSummary({ candidate_count: 4, distinct_candidates: true }), { candidate_count: 4, distinct_candidates: true });
  assert.throws(() => assertSanitizedMapsSummary({ email: "private@example.test" }));
  assert.throws(() => assertSanitizedMapsSummary({ place_ids: ["secret"] }));
  assert.throws(() => assertSanitizedMapsSummary({ provider_response: {} }));
});
