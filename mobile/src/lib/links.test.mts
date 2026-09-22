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
    createCanonicalJoinUrl("123e4567-e89b-42d3-a456-426614174000", "private/token"),
    "https://links.table-us.com/join/123e4567-e89b-42d3-a456-426614174000?token=private%2Ftoken",
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
    rewriteCanonicalSystemPath("https://links.table-us.com/join/123e4567-e89b-42d3-a456-426614174000?token=private%20token&extra=drop"),
    "/join/123e4567-e89b-42d3-a456-426614174000?token=private%20token",
  );
  assert.equal(
    rewriteCanonicalSystemPath("https://links.table-us.com/join/%2e%2e%2fshare-token%2frotate?token=private"),
    "/join/invalid",
  );
});

test("native path rewriting leaves other origins and development schemes alone", () => {
  assert.equal(rewriteCanonicalSystemPath("https://example.com/auth?mode=sign-in"), "https://example.com/auth?mode=sign-in");
  assert.equal(rewriteCanonicalSystemPath("tableus://auth?mode=sign-in"), "tableus://auth?mode=sign-in");
  assert.equal(rewriteCanonicalSystemPath("https://links.table-us.com/privacy"), "https://links.table-us.com/privacy");
  assert.equal(rewriteCanonicalSystemPath("tableus://e2e/identity?user=demo-guest"), "tableus://e2e/identity?user=demo-guest");
  assert.equal(rewriteCanonicalSystemPath("exp://127.0.0.1:8081/--/join/fixture?token=dev"), "exp://127.0.0.1:8081/--/join/fixture?token=dev");
});

test("custom-scheme joins become internal paths without changing encoded token values", () => {
  const id = "123e4567-e89b-42d3-a456-426614174000";
  assert.equal(
    rewriteCanonicalSystemPath(`tableus://join/${id}?token=a%2Bb%2Fc%3D&extra=drop`),
    `/join/${id}?token=a%2Bb%2Fc%3D`,
  );
  assert.equal(
    rewriteCanonicalSystemPath(`/join/${id}?token=literal%252F%25&extra=drop`),
    `/join/${id}?token=literal%252F%25`,
  );
  assert.equal(rewriteCanonicalSystemPath(`tableus://user@join/${id}?token=value`), "/join/invalid");
  assert.equal(rewriteCanonicalSystemPath(`tableus://join:123/${id}?token=value`), "/join/invalid");
});

test("duplicate and malformed tokens are rejected instead of normalized into a different capability", () => {
  const id = "123e4567-e89b-42d3-a456-426614174000";
  for (const query of ["token=one&token=two", "token=&token=two", "token=one&%74oken=two", "token=%FF%41", "token=%E2%82", "token=trailing%", "token=%GG"]) {
    for (const origin of ["tableus://join", "https://links.table-us.com/join"]) {
      assert.equal(rewriteCanonicalSystemPath(`${origin}/${id}?${query}`), "/join/invalid", query);
    }
  }
});
