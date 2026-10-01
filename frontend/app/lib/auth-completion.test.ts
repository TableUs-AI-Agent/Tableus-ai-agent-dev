import assert from "node:assert/strict";
import test from "node:test";
import { ApiError, createApiClient } from "@tableus/api-client";
import { AuthSessionMissingError } from "@supabase/supabase-js";
import { completeWebAuth, confirmedSubject } from "./auth-completion.ts";

const user = { id: "test-subject", email: "person@example.test", email_confirmed_at: "2026-10-01T00:00:00Z" };
const input = { mode: "join" as const, subject: user.id, email: user.email, invite: "synthetic-invite", name: "Test person", redemption: "original-grant" };
const token = `e30.${Buffer.from(JSON.stringify({ sub: user.id })).toString("base64url")}.test`;
const ok = (data: unknown) => Response.json({ data, meta: {} });
const failure = (status: number) => Response.json({ error: { code: `http_${status}`, message: "Synthetic failure" }, request_id: "test" }, { status });
function client(handler: (path: string, body: Record<string, string> | null) => Response | Promise<Response>) {
  return createApiClient({ baseUrl: "https://api.example.test", getAccessToken: async () => token,
    fetchImpl: async (url, options) => handler(new URL(String(url)).pathname, options?.body ? JSON.parse(String(options.body)) : null) });
}

test("only a confirmed, matching server identity can resume completion", async () => {
  const read = async () => ({ data: { user }, error: null });
  assert.equal(await confirmedSubject(read, " PERSON@example.test ", user.id), user.id);
  await assert.rejects(confirmedSubject(read, "other@example.test"), /does not match/);
  await assert.rejects(confirmedSubject(read, user.email, "different-subject"), /does not match/);
  await assert.rejects(confirmedSubject(async () => ({ data: { user: { ...user, email_confirmed_at: undefined } }, error: null }), user.email), /does not match/);
});

test("a missing session is distinct from an unavailable Auth server", async () => {
  assert.equal(await confirmedSubject(async () => ({ data: { user: null }, error: new AuthSessionMissingError() }), user.email), null);
  await assert.rejects(confirmedSubject(async () => { throw new Error("offline"); }, user.email), /Network unavailable/);
});

test("a failed redemption can retry using the same verified subject and grant", async () => {
  const calls: string[] = [];
  let offline = true;
  const api = client((path, body) => {
    calls.push(path);
    assert.equal(body?.redemption_token, "original-grant");
    if (offline) throw new TypeError("offline");
    return ok({ id: user.id });
  });
  await assert.rejects(completeWebAuth(api, input), /Network unavailable/);
  offline = false;
  await completeWebAuth(api, input);
  assert.deepEqual(calls, ["/api/v1/access/redeem", "/api/v1/access/redeem"]);
});

test("expired grant after a committed signup recovers through membership without consuming an invite", async () => {
  const calls: string[] = [];
  await completeWebAuth(client((path) => {
    calls.push(path);
    return path.endsWith("/redeem") ? failure(400) : ok({ id: user.id });
  }), input);
  assert.deepEqual(calls, ["/api/v1/access/redeem", "/api/v1/me"]);
});

test("expired unredeemed signup refreshes only the original email-bound invitation", async () => {
  const calls: string[] = [];
  await completeWebAuth(client((path, body) => {
    calls.push(path);
    if (path === "/api/v1/me") return failure(403);
    if (path.endsWith("/validate")) {
      assert.deepEqual(body, { code: input.invite, email: input.email });
      return ok({ redemption_token: "fresh-grant" });
    }
    return body?.redemption_token === "original-grant" ? failure(400) : ok({ id: user.id });
  }), input);
  assert.deepEqual(calls, ["/api/v1/access/redeem", "/api/v1/me", "/api/v1/access/validate", "/api/v1/access/redeem"]);
});

test("a matching existing Auth session can finish after a reload without a saved grant", async () => {
  const calls: string[] = [];
  await completeWebAuth(client((path) => {
    calls.push(path);
    if (path === "/api/v1/me") return failure(403);
    if (path.endsWith("/validate")) return ok({ redemption_token: "fresh-grant" });
    return ok({ id: user.id });
  }), { ...input, redemption: "" });
  assert.deepEqual(calls, ["/api/v1/me", "/api/v1/access/validate", "/api/v1/access/redeem"]);
});

test("redemption refusal and failed membership reconciliation do not revalidate or bypass an invite", async () => {
  for (const status of [401, 403, 409, 429, 500]) {
    let calls = 0;
    await assert.rejects(completeWebAuth(client(() => { calls++; return failure(status); }), input), ApiError);
    assert.equal(calls, 1);
  }
  const calls: string[] = [];
  await assert.rejects(completeWebAuth(client((path) => { calls.push(path); return failure(path.endsWith("/redeem") ? 400 : 500); }), input), ApiError);
  assert.deepEqual(calls, ["/api/v1/access/redeem", "/api/v1/me"]);
});

test("returning sign-in only checks membership and a swapped session never sends a redemption", async () => {
  const calls: string[] = [];
  await completeWebAuth(client((path) => { calls.push(path); return ok({ id: user.id }); }), { ...input, mode: "sign-in" });
  assert.deepEqual(calls, ["/api/v1/me"]);
  const api = createApiClient({ baseUrl: "https://api.example.test", getAccessToken: async () => token,
    fetchImpl: async () => { throw new Error("Must not reach transport"); } });
  await assert.rejects(completeWebAuth(api, { ...input, subject: "changed-identity" }), /session|account/i);
});
