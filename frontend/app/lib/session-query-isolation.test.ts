import assert from "node:assert/strict";
import test from "node:test";

import { QueryClient } from "@tanstack/react-query";

import { clearPrivateQueryState, shouldClearForAuthTransition } from "./session-query-isolation.ts";

test("auth subject transitions clear private query and mutation state", () => {
  const client = new QueryClient();
  client.setQueryData(["plans", "subject-a"], [{ title: "Private plan" }]);
  client.getMutationCache().build(client, { mutationKey: ["plan-write", "subject-a"] });

  assert.equal(shouldClearForAuthTransition(undefined, "subject-a", "INITIAL_SESSION"), false);
  assert.equal(shouldClearForAuthTransition("subject-a", "subject-a", "TOKEN_REFRESHED"), false);
  assert.equal(shouldClearForAuthTransition("subject-a", null, "SIGNED_OUT"), true);
  clearPrivateQueryState(client);

  assert.equal(client.getQueryCache().getAll().length, 0);
  assert.equal(client.getMutationCache().getAll().length, 0);
  assert.equal(shouldClearForAuthTransition(null, "subject-b", "SIGNED_IN"), true);
});
