import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const authRoute = readFileSync(new URL("../app/auth.tsx", import.meta.url), "utf8");
const joinRoute = readFileSync(new URL("../app/join/[id].tsx", import.meta.url), "utf8");
const planRoute = readFileSync(new URL("../app/plans/[id].tsx", import.meta.url), "utf8");

test("public auth links select mode without accepting private auth fields", () => {
  assert.match(authRoute, /parseAuthLinkMode\(requestedMode\)/);
  assert.doesNotMatch(authRoute, /useLocalSearchParams<[^>]*(email|invite|otp|token)/s);
});

test("signed-out join routes present auth over the retained route", () => {
  assert.match(joinRoute, /Sign in to join/);
  assert.match(joinRoute, /pathname: "\/auth", params: \{ mode: "sign-in" \}/);
  assert.match(joinRoute, /invalid, expired, or has been rotated/);
  assert.doesNotMatch(joinRoute, /SecureStore|AsyncStorage|localStorage/);
});

test("mobile plan sharing uses the canonical HTTPS builder", () => {
  assert.match(planRoute, /createCanonicalJoinUrl\(id, share_token\)/);
  assert.doesNotMatch(planRoute, /Linking\.createURL\(`\/join/);
});
