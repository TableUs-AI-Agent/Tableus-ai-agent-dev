import assert from "node:assert/strict";
import test from "node:test";

import { pendingJoinStore } from "./pending-join.ts";
import { createCanonicalAuthUrl, createCanonicalJoinUrl, parseAuthLinkMode, rewriteCanonicalSystemPath } from "./links.ts";

const id = "123e4567-e89b-42d3-a456-426614174000";
const token = "Abc_def-0123456789GhijkLMN_opQRSTuvWxyZ";

test.afterEach(() => { pendingJoinStore.clear(); pendingJoinStore.setSubject(null); });

test("mobile defaults to compatible query links; fragment emission requires opt-in", () => {
  assert.equal(createCanonicalAuthUrl("join"), "https://links.table-us.com/auth?mode=join");
  assert.equal(createCanonicalJoinUrl(id, token), `https://links.table-us.com/join/${id}?token=${token}`);
  const prior = process.env.EXPO_PUBLIC_JOIN_LINK_FORMAT;
  try {
    process.env.EXPO_PUBLIC_JOIN_LINK_FORMAT = "fragment";
    assert.equal(createCanonicalJoinUrl(id, token), `https://links.table-us.com/join/${id}#token=${token}`);
  } finally {
    if (prior === undefined) delete process.env.EXPO_PUBLIC_JOIN_LINK_FORMAT;
    else process.env.EXPO_PUBLIC_JOIN_LINK_FORMAT = prior;
  }
});

test("auth links accept only public modes", () => {
  assert.equal(parseAuthLinkMode("sign-in"), "sign-in");
  assert.equal(parseAuthLinkMode("admin"), "join");
  assert.equal(parseAuthLinkMode(["sign-in"]), "join");
});

test("native query and fragment links capture before routing without a secret route parameter", () => {
  for (const delimiter of ["?", "#"]) {
    const path = rewriteCanonicalSystemPath(`https://links.table-us.com/join/${id}${delimiter}token=${token}&extra=drop`);
    const captured = pendingJoinStore.getSnapshot();
    assert.ok(captured);
    assert.equal(path, `/join/${id}?pending=${captured.handle}`);
    assert.ok(!path.includes(token));
    pendingJoinStore.setSubject("actor-a");
    assert.equal(pendingJoinStore.read(captured.handle, "actor-a"), token);
    assert.equal(rewriteCanonicalSystemPath(path), path);
    pendingJoinStore.clear();
    pendingJoinStore.setSubject(null);
  }
});

test("malformed new links clear a previous capability and never carry raw bytes into the route", () => {
  rewriteCanonicalSystemPath(`tableus://join/${id}?token=${token}`);
  for (const suffix of [
    `?token=${token}&token=${token}`,
    `?token=${token}#token=${token}`,
    `#token=%FF%41`,
    `#token=short`,
    `#token=trailing%`,
    `#other=value`,
  ]) {
    assert.equal(rewriteCanonicalSystemPath(`tableus://join/${id}${suffix}`), "/join/invalid");
    assert.equal(pendingJoinStore.getSnapshot(), null);
    rewriteCanonicalSystemPath(`tableus://join/${id}?token=${token}`);
  }
  assert.equal(rewriteCanonicalSystemPath(`tableus://user@join/${id}?token=${token}`), "/join/invalid");
  assert.equal(pendingJoinStore.getSnapshot(), null);
});

test("unrelated and auth links remain canonicalized without private fields", () => {
  assert.equal(rewriteCanonicalSystemPath("https://links.table-us.com/auth?mode=sign-in&email=private@example.com"), "/auth?mode=sign-in");
  assert.equal(rewriteCanonicalSystemPath("https://example.com/privacy"), "https://example.com/privacy");
  assert.equal(rewriteCanonicalSystemPath(`https://links.table-us.com/join/${id}%2Fextra?token=${token}`), "/join/invalid");
});
