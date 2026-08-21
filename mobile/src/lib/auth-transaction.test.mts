import assert from "node:assert/strict";
import test from "node:test";

import {
  authTransactionKey,
  clearPendingTransaction,
  createPendingTransaction,
  loadPendingTransaction,
  maskEmail,
  normalizeEmail,
  parsePendingTransaction,
  savePendingTransaction,
  type AuthTransactionStorage,
} from "./auth-transaction.ts";
import { applyAuthAppState, performSignOutCleanup, shouldClearQueryCache } from "./auth-lifecycle.ts";

function memoryStorage(): AuthTransactionStorage & { values: Map<string, string> } {
  const values = new Map<string, string>();
  return {
    values,
    getItem: async (key) => values.get(key) ?? null,
    setItem: async (key, value) => { values.set(key, value); },
    removeItem: async (key) => { values.delete(key); },
  };
}

test("pending auth transactions normalize and recover without invite codes or OTPs", async () => {
  const storage = memoryStorage();
  const pending = createPendingTransaction({
    mode: "join",
    email: "  Diner@Example.COM ",
    displayName: "Diner",
    redemptionToken: "redemption-token",
  }, 1_000);
  await savePendingTransaction(storage, pending);
  const raw = storage.values.get(authTransactionKey) ?? "";
  assert.equal(raw.includes("invite"), false);
  assert.equal(raw.includes("otp"), false);
  assert.deepEqual(await loadPendingTransaction(storage, 2_000), pending);
  assert.equal(normalizeEmail(" Diner@Example.COM "), "diner@example.com");
  assert.equal(maskEmail("diner@example.com"), "d••••@example.com");
});

test("expired or malformed pending auth transactions are discarded", async () => {
  const storage = memoryStorage();
  const pending = createPendingTransaction({ mode: "sign-in", email: "diner@example.com" }, 1_000);
  await savePendingTransaction(storage, pending);
  assert.equal(await loadPendingTransaction(storage, pending.expiresAt), null);
  assert.equal(storage.values.has(authTransactionKey), false);
  assert.equal(parsePendingTransaction("not-json"), null);
  const sanitized = parsePendingTransaction(JSON.stringify({ ...pending, expiresAt: 10_000, invite: "must-drop", otp: "must-drop" }), 2_000);
  assert.equal("invite" in (sanitized ?? {}), false);
  assert.equal("otp" in (sanitized ?? {}), false);
});

test("pending auth transactions can be explicitly cleared", async () => {
  const storage = memoryStorage();
  await storage.setItem(authTransactionKey, "value");
  await clearPendingTransaction(storage);
  assert.equal(storage.values.size, 0);
});

test("auth lifecycle starts only in foreground and cache clears on subject changes", async () => {
  const calls: string[] = [];
  const lifecycle = {
    startAutoRefresh: async () => { calls.push("start"); },
    stopAutoRefresh: async () => { calls.push("stop"); },
  };
  await applyAuthAppState("active", lifecycle);
  await applyAuthAppState("background", lifecycle);
  assert.deepEqual(calls, ["start", "stop"]);
  assert.equal(shouldClearQueryCache(null, "user-1"), false);
  assert.equal(shouldClearQueryCache("user-1", "user-1"), false);
  assert.equal(shouldClearQueryCache("user-1", "user-2"), true);
  assert.equal(shouldClearQueryCache("user-1", null), true);
});

test("sign-out cleanup removes pending state before session and cache data", async () => {
  const calls: string[] = [];
  await performSignOutCleanup({
    clearPending: async () => { calls.push("pending"); },
    signOut: async () => { calls.push("session"); },
    clearCache: () => { calls.push("cache"); },
  });
  assert.deepEqual(calls, ["pending", "session", "cache"]);
});
