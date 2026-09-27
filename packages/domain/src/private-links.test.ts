import assert from "node:assert/strict";
import test from "node:test";
import { buildJoinUrl, parseJoinToken, PendingJoinStore } from "./index.ts";

const id = "123e4567-e89b-42d3-a456-426614174000";
const token = "private-capability-0123456789";

test("query compatibility and fragment opt-in both round trip exactly once", () => {
  for (const secret of [token, "long-prefix-a+b/c=&token=#end", "literal-long-prefix%2F%2B%FF", "long-prefix-東京 / café"]) {
    for (const format of ["query", "fragment"] as const) {
      const link = buildJoinUrl("https://links.table-us.com", id, secret, format);
      assert.equal(parseJoinToken(link), secret);
      assert.equal(new URL(link).search.length === 0, format === "fragment");
    }
  }
  assert.ok(buildJoinUrl("https://links.table-us.com", id, token).includes("?token="));
  assert.equal(parseJoinToken(`/join/${id}`), null);
});

test("malformed, duplicated and ambiguous capabilities fail without echoing them", () => {
  const invalid = [
    `?token=${token}&token=${token}`, `?%74oken=${token}&token=${token}`,
    `?token=${token}#token=${token}`, `?token=${token}#bad`,
    `#token=${token}&token=${token}`, "#token=%FF", "#token=%E0%A4", "#token=short",
    `#token=${"x".repeat(201)}`, `#token=${token}%00`, `#token=${token}\ud800`,
    `?token=${token}&bad=%FF`, `?token=${token}#`, "#token=",
  ];
  for (const suffix of invalid) {
    assert.throws(() => parseJoinToken(`/join/${id}${suffix}`), { message: "This private link is invalid." });
  }
});

function fixture() {
  let now = 1000;
  let number = 0;
  const store = new PendingJoinStore({ now: () => now, createHandle: () => `local-handle-${++number}` });
  return { store, advance: (ms: number) => { now += ms; } };
}

test("anonymous flow binds once; subject changes and sign-out destroy the secret", () => {
  const { store } = fixture();
  const pending = store.capture(id, token);
  assert.equal(store.read(pending.handle, "alice"), null);
  assert.equal(JSON.stringify(store.getSnapshot()).includes(token), false);
  store.setSubject(null); // initial signed-out restore preserves the pending flow
  store.setSubject("alice");
  assert.equal(store.read(pending.handle, "alice"), token);
  assert.equal(store.read(pending.handle, "bob"), null);
  store.setSubject("bob");
  assert.equal(store.getSnapshot(), null);
  assert.equal(store.read(pending.handle, "alice"), null);
  const next = store.capture(id, token);
  assert.equal(next.subject, "bob");
  store.setSubject(null);
  assert.equal(store.read(next.handle, "bob"), null);
});

test("expiry prevents dispatch even when the platform paused timers", () => {
  const { store, advance } = fixture();
  store.setSubject("alice");
  const pending = store.capture(id, token);
  advance(20 * 60 * 1000);
  assert.equal(store.read(pending.handle, "alice"), null);
  assert.equal(store.getSnapshot(), null);
});

test("expiry actively clears the snapshot and notifies subscribers", async () => {
  const store = new PendingJoinStore({ createHandle: () => "local-handle", ttlMs: 10 });
  store.capture(id, token);
  await new Promise<void>((resolve, reject) => {
    const failure = setTimeout(() => reject(new Error("Expiry did not notify")), 1000);
    store.subscribe(() => { if (!store.getSnapshot()) { clearTimeout(failure); resolve(); } });
  });
  assert.equal(store.getSnapshot(), null);
});

test("replacement and scoped clear make stale completions harmless", () => {
  const { store } = fixture();
  store.setSubject("alice");
  const previous = store.capture(id, token);
  const next = store.capture(id, token + "new");
  assert.notEqual(previous.handle, next.handle);
  store.clear(previous.handle);
  assert.equal(store.read(previous.handle, "alice"), null);
  assert.equal(store.read(next.handle, "alice"), token + "new");
  assert.equal(store.getSnapshot(), store.getSnapshot());
  store.clear(next.handle);
  assert.equal(store.getSnapshot(), null);
});

test("invalid replacement clears the previous capability", () => {
  const { store } = fixture();
  store.capture(id, token);
  assert.throws(() => store.capture(id, "short"));
  assert.equal(store.getSnapshot(), null);
});
