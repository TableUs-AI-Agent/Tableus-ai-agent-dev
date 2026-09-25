import assert from "node:assert/strict";
import test from "node:test";

import { captureJoinLocation, markJoinUncertain, needsJoinReconciliation, pendingJoin } from "./pending-join.ts";

const planId = "123e4567-e89b-42d3-a456-426614174000";
const secret = "a-private-share-token-with-enough-length";

function browser(url: string) {
  const parsed = new URL(url);
  const state = { nextRouterTree: "preserved" };
  const calls: { state: unknown; url: string }[] = [];
  return {
    location: { href: url, pathname: parsed.pathname, search: parsed.search, hash: parsed.hash },
    history: {
      state,
      replaceState(nextState: unknown, _unused: string, cleanUrl: string) {
        calls.push({ state: nextState, url: cleanUrl });
      },
    },
    calls,
    state,
  };
}

test("fragment is captured in memory and removed from the browser address", () => {
  pendingJoin.clear();
  pendingJoin.setSubject(null);
  const page = browser(`https://links.table-us.com/join/${planId}#token=${secret}`);
  assert.equal(captureJoinLocation(planId, page.location, page.history), "captured");
  assert.deepEqual(page.calls, [{ state: page.state, url: `/join/${planId}` }]);
  const snapshot = pendingJoin.getSnapshot();
  assert.ok(snapshot);
  assert.equal(JSON.stringify(snapshot).includes(secret), false);
  pendingJoin.setSubject("approved-a");
  assert.equal(pendingJoin.read(snapshot.handle, "approved-a"), secret);
  assert.equal(pendingJoin.read(snapshot.handle, "approved-b"), null);
  markJoinUncertain(snapshot.handle);
  assert.equal(needsJoinReconciliation(snapshot.handle), true);
  const remount = browser(`https://links.table-us.com/join/${planId}`);
  assert.equal(captureJoinLocation(planId, remount.location, remount.history), "restored");
  assert.equal(pendingJoin.getSnapshot()?.handle, snapshot.handle);
  assert.equal(needsJoinReconciliation(snapshot.handle), true);
  assert.deepEqual(remount.calls, []);
  pendingJoin.clear();
  pendingJoin.setSubject(null);
});

test("legacy query input is scrubbed and a malformed new link clears older state", () => {
  pendingJoin.clear();
  pendingJoin.setSubject(null);
  const legacy = browser(`https://links.table-us.com/join/${planId}?token=${secret}`);
  assert.equal(captureJoinLocation(planId, legacy.location, legacy.history), "captured");
  assert.equal(legacy.calls[0]?.url, `/join/${planId}`);
  const firstHandle = pendingJoin.getSnapshot()?.handle;
  const replacement = browser(`https://links.table-us.com/join/${planId}#token=${secret}-replacement`);
  assert.equal(captureJoinLocation(planId, replacement.location, replacement.history), "captured");
  assert.notEqual(pendingJoin.getSnapshot()?.handle, firstHandle);
  assert.equal(firstHandle ? needsJoinReconciliation(firstHandle) : false, false);
  assert.equal(replacement.calls[0]?.url, `/join/${planId}`);
  const ambiguous = browser(`https://links.table-us.com/join/${planId}?token=${secret}#token=${secret}`);
  assert.equal(captureJoinLocation(planId, ambiguous.location, ambiguous.history), "invalid");
  assert.equal(ambiguous.calls[0]?.url, `/join/${planId}`);
  assert.equal(pendingJoin.getSnapshot(), null);
});

test("account switch and explicit cancellation remove the pending capability", () => {
  pendingJoin.clear();
  pendingJoin.setSubject("approved-a");
  const page = browser(`https://links.table-us.com/join/${planId}#token=${secret}`);
  captureJoinLocation(planId, page.location, page.history);
  const handle = pendingJoin.getSnapshot()?.handle;
  assert.ok(handle);
  pendingJoin.setSubject("approved-b");
  assert.equal(pendingJoin.read(handle, "approved-a"), null);
  assert.equal(pendingJoin.getSnapshot(), null);
  const replacement = browser(`https://links.table-us.com/join/${planId}#token=${secret}`);
  captureJoinLocation(planId, replacement.location, replacement.history);
  const cancellationHandle = pendingJoin.getSnapshot()?.handle;
  assert.ok(cancellationHandle);
  pendingJoin.clear(cancellationHandle);
  assert.equal(pendingJoin.read(cancellationHandle, "approved-b"), null);
  assert.equal(pendingJoin.getSnapshot(), null);
  pendingJoin.setSubject(null);
});
