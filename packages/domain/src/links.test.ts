import assert from "node:assert/strict";
import test from "node:test";

import { buildAuthUrl, buildJoinUrl, normalizeHttpsOrigin } from "./index.ts";

test("normalizes a canonical HTTPS origin", () => {
  assert.equal(normalizeHttpsOrigin("https://links.table-us.com"), "https://links.table-us.com");
  assert.equal(normalizeHttpsOrigin("https://links.table-us.com/"), "https://links.table-us.com");
});

test("rejects origins that could redirect or leak link secrets", () => {
  for (const origin of [
    "http://links.table-us.com",
    "https://user:pass@links.table-us.com",
    "https://links.table-us.com:444",
    "https://links.table-us.com/path",
    "https://links.table-us.com/?query=yes",
    "https://links.table-us.com/#fragment",
    "not-a-url",
  ]) {
    assert.throws(() => normalizeHttpsOrigin(origin));
  }
});

test("builds encoded canonical join and auth URLs", () => {
  assert.equal(
    buildJoinUrl("https://links.table-us.com", "plan id", "private+/token"),
    "https://links.table-us.com/join/plan%20id?token=private%2B%2Ftoken",
  );
  assert.equal(
    buildAuthUrl("https://links.table-us.com", "sign-in"),
    "https://links.table-us.com/auth?mode=sign-in",
  );
});

test("join URLs require both opaque inputs", () => {
  assert.throws(() => buildJoinUrl("https://links.table-us.com", "", "token"));
  assert.throws(() => buildJoinUrl("https://links.table-us.com", "plan", ""));
});
