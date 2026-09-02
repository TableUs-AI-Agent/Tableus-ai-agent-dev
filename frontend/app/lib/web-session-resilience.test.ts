import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const userContext = readFileSync(new URL("../context/user-context.tsx", import.meta.url), "utf8");
const plansPage = readFileSync(new URL("../plans/page.tsx", import.meta.url), "utf8");
const accountPage = readFileSync(new URL("../account/page.tsx", import.meta.url), "utf8");
const planPage = readFileSync(new URL("../plans/[id]/page.tsx", import.meta.url), "utf8");
const authCard = readFileSync(new URL("../components/auth-card.tsx", import.meta.url), "utf8");
const apiClient = readFileSync(new URL("v1-api.ts", import.meta.url), "utf8");

test("web session loading distinguishes signed-out and network failures", () => {
  assert.match(userContext, /type UserState = "loading" \| "approved" \| "signed_out" \| "error"/);
  assert.match(plansPage, /userState === "error"/);
  assert.match(accountPage, /userState === "error"/);
  assert.match(planPage, /userState === "error"/);
  assert.match(plansPage, />Retry</);
  assert.match(accountPage, />Retry</);
  assert.match(planPage, />Retry</);
});

test("web API requests have a bounded timeout", () => {
  assert.match(apiClient, /requestTimeoutMs: 15_000/);
  assert.match(apiClient, /refreshAccessToken:[\s\S]*supabase\.auth\.refreshSession\(\)/);
});

test("OTP verification uses the normalized address that requested the code", () => {
  assert.match(authCard, /const normalizedEmail = email\.trim\(\)\.toLowerCase\(\)/);
  assert.match(authCard, /setSentEmail\(normalizedEmail\)/);
  assert.match(authCard, /verifyOtp\(\{ email: sentEmail/);
  assert.match(authCard, /disabled=\{sent\}/);
});
