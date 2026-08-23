import assert from "node:assert/strict";
import test from "node:test";

import {
  createCanonicalAuthUrl,
  createCanonicalJoinUrl,
  parseAuthLinkMode,
  rewriteCanonicalSystemPath,
} from "./links.ts";

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

test("canonical native paths retain only allowlisted auth and join parameters", () => {
  assert.equal(
    rewriteCanonicalSystemPath("https://links.table-us.com/auth?mode=sign-in&email=private@example.com"),
    "/auth?mode=sign-in",
  );
  assert.equal(
    rewriteCanonicalSystemPath("https://links.table-us.com/auth?mode=admin&otp=private"),
    "/auth?mode=join",
  );
  assert.equal(
    rewriteCanonicalSystemPath("https://links.table-us.com/join/plan-1?token=private%20token&extra=drop"),
    "/join/plan-1?token=private%20token",
  );
});

test("native path rewriting leaves other origins and development schemes alone", () => {
  assert.equal(rewriteCanonicalSystemPath("https://example.com/auth?mode=sign-in"), "https://example.com/auth?mode=sign-in");
  assert.equal(rewriteCanonicalSystemPath("tableus://auth?mode=sign-in"), "tableus://auth?mode=sign-in");
  assert.equal(rewriteCanonicalSystemPath("https://links.table-us.com/privacy"), "https://links.table-us.com/privacy");
});
