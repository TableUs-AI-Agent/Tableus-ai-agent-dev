import assert from "node:assert/strict";
import test from "node:test";

import { summarizeAccountExport } from "./lib/account-controls.ts";

test("account export summary accepts the versioned shape and returns counts only", () => {
  const result = summarizeAccountExport({
    schema_version: "1",
    profile: { id: "private-profile-id" },
    reviews: [{ review_text: "private review" }],
    connections: [{ connected_profile_id: "private-id" }],
    invite_redemptions: [{}],
    plan_memberships: [{ constraints: { notes: "private" } }],
    votes: [{ ranking: ["a", "b", "c"] }],
    authored_plan_events: [{ payload: { private: true } }],
  });

  assert.deepEqual(result, {
    valid: true,
    reviewCount: 1,
    connectionCount: 1,
    membershipCount: 1,
    voteCount: 1,
    authoredEventCount: 1,
  });
  assert.equal(JSON.stringify(result).includes("private"), false);
});

test("account export summary fails closed for unversioned or incomplete data", () => {
  assert.equal(summarizeAccountExport(null).valid, false);
  assert.equal(summarizeAccountExport({ schema_version: "2" }).valid, false);
  assert.equal(summarizeAccountExport({ schema_version: "1", profile: {} }).valid, false);
});
