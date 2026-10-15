import assert from "node:assert/strict";
import test from "node:test";

import { pendingJoin, rewriteIncomingLink } from "./links.ts";

const plan = "0b6f2a4e-1c2d-4e5f-8a9b-0c1d2e3f4a5b";
const token = "a".repeat(43);

test("universal join links open the join screen and hold the token in memory", () => {
  assert.equal(rewriteIncomingLink(`https://links.table-us.com/join/${plan}?token=${token}`), `/join/${plan}`);
  assert.deepEqual(pendingJoin.take(), { planId: plan, token });
});

test("other paths pass through untouched", () => {
  assert.equal(rewriteIncomingLink("/plan/123"), "/plan/123");
  assert.equal(pendingJoin.peek(), null);
});

test("a link without a token still opens the join screen, which explains the problem", () => {
  assert.equal(rewriteIncomingLink(`https://links.table-us.com/join/${plan}`), `/join/${plan}`);
  assert.equal(pendingJoin.peek(), null);
});
