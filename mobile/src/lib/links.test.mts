import assert from "node:assert/strict";
import test from "node:test";

import { createCanonicalAuthUrl, createCanonicalJoinUrl, parseAuthLinkMode } from "./links.ts";

test("mobile shares canonical HTTPS links", () => {
  assert.equal(createCanonicalAuthUrl("join"), "https://links.table-us.com/auth?mode=join");
  assert.equal(
    createCanonicalJoinUrl("plan-id", "private/token"),
    "https://links.table-us.com/join/plan-id?token=private%2Ftoken",
  );
});

test("auth links accept only the two public modes", () => {
  assert.equal(parseAuthLinkMode("sign-in"), "sign-in");
  assert.equal(parseAuthLinkMode("join"), "join");
  assert.equal(parseAuthLinkMode("admin"), "join");
  assert.equal(parseAuthLinkMode(["sign-in"]), "join");
  assert.equal(parseAuthLinkMode(undefined), "join");
});
