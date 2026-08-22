import assert from "node:assert/strict";
import test from "node:test";

import { OFFLINE_REFRESH_MESSAGE, refreshWhenOnline } from "./offline-refresh.ts";

test("offline refresh retains cached data by skipping the network", async () => {
  let calls = 0;
  assert.equal(await refreshWhenOnline(false, async () => { calls += 1; }), false);
  assert.equal(calls, 0);
  assert.match(OFFLINE_REFRESH_MESSAGE, /most recently loaded data/i);
});

test("online refresh delegates exactly once", async () => {
  let calls = 0;
  assert.equal(await refreshWhenOnline(true, async () => { calls += 1; }), true);
  assert.equal(calls, 1);
});
