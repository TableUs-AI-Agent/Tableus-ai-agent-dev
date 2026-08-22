import assert from "node:assert/strict";
import test from "node:test";

import {
  effectiveOnline,
  getConnectivityOverride,
  isConnectivityOverride,
  netInfoIsOnline,
  setConnectivityOverride,
  subscribeConnectivityOverride,
} from "./connectivity.ts";

test("connectivity is offline unless a connection is confirmed and reachable", () => {
  assert.equal(netInfoIsOnline({ isConnected: true, isInternetReachable: true }), true);
  assert.equal(netInfoIsOnline({ isConnected: true, isInternetReachable: null }), true);
  assert.equal(netInfoIsOnline({ isConnected: false, isInternetReachable: true }), false);
  assert.equal(netInfoIsOnline({ isConnected: null, isInternetReachable: null }), false);
  assert.equal(netInfoIsOnline({ isConnected: true, isInternetReachable: false }), false);
});

test("local connectivity override is allowlisted, in memory, and observable", () => {
  let notifications = 0;
  const unsubscribe = subscribeConnectivityOverride(() => { notifications += 1; });
  setConnectivityOverride("offline");
  assert.equal(getConnectivityOverride(), "offline");
  assert.equal(effectiveOnline(true, "offline"), false);
  setConnectivityOverride("online");
  assert.equal(effectiveOnline(false, "online"), true);
  setConnectivityOverride("system");
  assert.equal(effectiveOnline(false, "system"), false);
  assert.equal(notifications, 3);
  unsubscribe();
  assert.equal(isConnectivityOverride("offline"), true);
  assert.equal(isConnectivityOverride("system"), true);
  assert.equal(isConnectivityOverride("unexpected"), false);
});
