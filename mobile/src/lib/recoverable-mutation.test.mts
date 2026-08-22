import assert from "node:assert/strict";
import test from "node:test";

import { ApiError } from "@tableus/api-client";

import { isRetryableMutationError, mutationFailure } from "./mutation-retry-policy.ts";

test("recoverable mutation statuses are deliberately narrow", () => {
  for (const status of [0, 408, 429, 500, 503]) {
    assert.equal(isRetryableMutationError(new ApiError("retry", status, "retry")), true);
  }
  for (const status of [401, 403, 404, 409, 422]) {
    assert.equal(isRetryableMutationError(new ApiError("terminal", status, "terminal")), false);
  }
});

test("known offline and ambiguous failures have distinct safe instructions", () => {
  const offline = mutationFailure(new ApiError("offline", 0, "offline"), false);
  assert.equal(offline.kind, "offline");
  assert.equal(offline.retryable, true);
  assert.match(offline.message, /not sent or queued/i);

  const ambiguous = mutationFailure(new ApiError("network", 0, "network"), true);
  assert.equal(ambiguous.kind, "ambiguous");
  assert.equal(ambiguous.retryable, true);
  assert.match(ambiguous.message, /may have completed/i);
});

test("authorization, conflict, and validation failures are terminal", () => {
  for (const status of [401, 403, 404, 409, 422]) {
    const failure = mutationFailure(new ApiError("terminal", status, "terminal"), true);
    assert.equal(failure.kind, "server");
    assert.equal(failure.retryable, false);
  }
});
