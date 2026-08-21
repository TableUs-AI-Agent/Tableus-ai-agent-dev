import assert from "node:assert/strict";
import test from "node:test";
import { ApiError } from "@tableus/api-client";

import { resolveApproval, startAuthTransaction } from "./auth-operations.ts";
import { createPendingTransaction } from "./auth-transaction.ts";

test("invite signup validates before sending and permits account creation", async () => {
  const calls: string[] = [];
  const transaction = await startAuthTransaction("join", { invite: " fresh ", email: " PERSON@Example.COM ", displayName: " Person " }, {
    validateInvite: async (input) => { calls.push(`validate:${input.code}:${input.email}`); return { redemption_token: "grant" }; },
    sendCode: async (input) => { calls.push(`send:${input.email}:${input.shouldCreateUser}`); },
  });
  assert.deepEqual(calls, ["validate:fresh:person@example.com", "send:person@example.com:true"]);
  assert.equal(transaction.redemptionToken, "grant");
  assert.equal(transaction.displayName, "Person");
});

test("returning sign-in never creates a user or validates an invite", async () => {
  let validated = false;
  let shouldCreateUser: boolean | undefined;
  await startAuthTransaction("sign-in", { email: "person@example.com" }, {
    validateInvite: async () => { validated = true; return { redemption_token: "unused" }; },
    sendCode: async (input) => { shouldCreateUser = input.shouldCreateUser; },
  });
  assert.equal(validated, false);
  assert.equal(shouldCreateUser, false);
});

test("approval resolves redemption success and recoverable failures", async () => {
  const transaction = createPendingTransaction({ mode: "join", email: "person@example.com", displayName: "Person", redemptionToken: "grant" });
  const profile = { id: "profile", display_name: "Person", share_taste: false };
  assert.deepEqual(await resolveApproval(transaction, { redeem: async () => profile, getProfile: async () => profile }), { kind: "approved", profile });
  const transient = new Error("offline");
  assert.deepEqual(await resolveApproval(transaction, { redeem: async () => { throw transient; }, getProfile: async () => profile }), { kind: "retryable", error: transient });
});

test("approval distinguishes unapproved profiles and invalid grants", async () => {
  const getProfile = async () => { throw new ApiError("not approved", 403, "forbidden"); };
  assert.deepEqual(await resolveApproval(null, { redeem: async () => { throw new Error("unused"); }, getProfile }), { kind: "unapproved" });
  const transaction = createPendingTransaction({ mode: "join", email: "person@example.com", displayName: "Person", redemptionToken: "grant" });
  const redeem = async () => { throw new ApiError("expired", 409, "conflict"); };
  assert.deepEqual(await resolveApproval(transaction, { redeem, getProfile }), { kind: "invalid_invite" });
});
