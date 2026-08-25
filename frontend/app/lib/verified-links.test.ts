import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const authCard = readFileSync(new URL("../components/auth-card.tsx", import.meta.url), "utf8");
const joinPage = readFileSync(new URL("../join/[id]/page.tsx", import.meta.url), "utf8");
const plansPage = readFileSync(new URL("../plans/page.tsx", import.meta.url), "utf8");
const planPage = readFileSync(new URL("../plans/[id]/page.tsx", import.meta.url), "utf8");

test("returning web sign-in cannot create a new Supabase user", () => {
  assert.match(authCard, /mode === "sign-in"[\s\S]*shouldCreateUser: false/);
  assert.match(authCard, /shouldCreateUser: true/);
});

test("inline join authentication retains no token outside the current route", () => {
  assert.match(joinPage, /<AuthCard/);
  assert.match(joinPage, /setShowAuth\(false\)/);
  assert.doesNotMatch(joinPage, /localStorage|sessionStorage|AsyncStorage|SecureStore/);
  assert.doesNotMatch(authCard, /share_token|shareToken|useSearchParams|localStorage|sessionStorage/);
});

test("both web share actions use the canonical link builder", () => {
  assert.match(plansPage, /createCanonicalJoinUrl\(plan\.id, share_token\)/);
  assert.match(planPage, /createCanonicalJoinUrl\(id, share_token\)/);
  assert.doesNotMatch(`${plansPage}\n${planPage}`, /window\.location\.origin/);
});
