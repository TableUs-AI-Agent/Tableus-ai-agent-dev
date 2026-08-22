import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function source(relativePath: string) {
  return readFileSync(new URL(relativePath, import.meta.url), "utf8");
}

test("every plan workspace write uses the recoverable controller and an explicit key", () => {
  const plan = source("../app/plans/[id].tsx");
  assert.equal((plan.match(/useRecoverableMutation\(/g) ?? []).length, 6);
  for (const route of ["constraints", "recommendations", "vote", "finalize", "reopen", "share-token/rotate"]) {
    assert.match(plan, new RegExp(`${route.replace("/", "\\/")}.*idempotencyKey`, "s"));
  }
  assert.match(plan, /setRankingDraft\(null\)/);
});

test("photo retries retain no image state and must open the picker again", () => {
  const review = source("../app/(tabs)/review.tsx");
  const analyze = review.slice(review.indexOf("const analyze"), review.indexOf("\n  return (", review.indexOf("const analyze")));
  assert.match(review, /mutationFn: async[\s\S]*launchImageLibraryAsync/);
  assert.match(review, /retryLabel="Choose photo and retry"/);
  assert.doesNotMatch(review, /useState<.*(Image|Asset|FormData)/);
  assert.doesNotMatch(analyze, /api\.post[^\n]+idempotencyKey/);
});

test("destructive account retry preserves confirmation and remains explicitly gated", () => {
  const account = source("../app/account.tsx");
  assert.match(account, /Retry deleting application data/);
  assert.match(account, /confirmation !== DELETE_CONFIRMATION \|\| deleteAccount\.isPending \|\| deleteAccount\.canRetry \|\| !control\.data\?\.can_delete/);
  assert.doesNotMatch(account, /setConfirmation\(""\)/);
});
