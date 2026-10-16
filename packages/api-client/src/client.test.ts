import assert from "node:assert/strict";
import test from "node:test";

import { ApiError, createApiClient, createTableUsApi } from "./index.ts";

type Call = { url: string; init: RequestInit };

function fakeFetch(responses: Array<{ status: number; body: unknown }>) {
  const calls: Call[] = [];
  const fetchImpl = (async (url: string, init: RequestInit) => {
    calls.push({ url, init });
    const next = responses.shift() ?? { status: 200, body: { data: null, meta: {} } };
    return new Response(JSON.stringify(next.body), { status: next.status });
  }) as unknown as typeof fetch;
  return { calls, fetchImpl };
}

test("demo identity travels in a header and data is unwrapped", async () => {
  const { calls, fetchImpl } = fakeFetch([{ status: 200, body: { data: { id: "p1" }, meta: {} } }]);
  const client = createApiClient({ baseUrl: "http://api", demoUserId: "demo-guest", fetchImpl });
  assert.deepEqual(await client.get("/api/v1/me"), { id: "p1" });
  assert.equal(new Headers(calls[0].init.headers).get("X-Demo-User-ID"), "demo-guest");
});

test("an expired token is refreshed once and the request retried", async () => {
  const { calls, fetchImpl } = fakeFetch([
    { status: 401, body: { error: { code: "http_401", message: "expired" }, request_id: "r" } },
    { status: 200, body: { data: "ok", meta: {} } },
  ]);
  const client = createApiClient({
    baseUrl: "http://api",
    fetchImpl,
    getAccessToken: async () => "old",
    refreshAccessToken: async () => "new",
  });
  assert.equal(await client.post("/api/v1/plans", {}), "ok");
  const tokens = calls.map((call) => new Headers(call.init.headers).get("Authorization"));
  assert.deepEqual(tokens, ["Bearer old", "Bearer new"]);
});

test("server errors surface their message, status and request id", async () => {
  const { fetchImpl } = fakeFetch([
    { status: 409, body: { error: { code: "http_409", message: "This plan is full" }, request_id: "abc" } },
  ]);
  const client = createApiClient({ baseUrl: "http://api", fetchImpl });
  await assert.rejects(client.post("/x"), (error: unknown) => {
    assert.ok(error instanceof ApiError);
    assert.equal(error.message, "This plan is full");
    assert.equal(error.status, 409);
    assert.equal(error.requestId, "abc");
    return true;
  });
});

test("a slow request becomes a network error at the deadline", async () => {
  const fetchImpl = ((_url: string, init: RequestInit) => new Promise((_resolve, reject) => {
    init.signal?.addEventListener("abort", () => reject(new Error("aborted")));
  })) as unknown as typeof fetch;
  const client = createApiClient({ baseUrl: "http://api", fetchImpl, requestTimeoutMs: 20 });
  await assert.rejects(client.get("/slow"), (error: unknown) =>
    error instanceof ApiError && error.code === "network_error");
});

test("only standard headers are sent so CORS preflight stays simple", async () => {
  const { calls, fetchImpl } = fakeFetch([{ status: 200, body: { data: {}, meta: {} } }]);
  const client = createApiClient({
    baseUrl: "http://api", fetchImpl, getAccessToken: async () => "t",
    getTelemetrySessionId: () => "session", telemetryPlatform: "web",
  });
  await client.post("/x", {});
  const names = [...new Headers(calls[0].init.headers).keys()].sort();
  assert.deepEqual(names, ["authorization", "content-type"]);
});

test("typed endpoints call the expected paths and methods", async () => {
  const { calls, fetchImpl } = fakeFetch([]);
  const api = createTableUsApi(createApiClient({ baseUrl: "http://api", fetchImpl }));
  await api.joinPlan("plan/1", "token-value");
  await api.vote("p", ["a", "b", "c"]);
  await api.finalize("p");
  assert.deepEqual(calls.map((call) => [call.init.method ?? "GET", call.url]), [
    ["POST", "http://api/api/v1/plans/plan%2F1/join"],
    ["PUT", "http://api/api/v1/plans/p/vote"],
    ["POST", "http://api/api/v1/plans/p/finalize"],
  ]);
  assert.equal(calls[0].init.body, JSON.stringify({ share_token: "token-value" }));
});

test("account deletion refuses to run if a refresh switched accounts", async () => {
  const { calls, fetchImpl } = fakeFetch([
    { status: 401, body: { error: { code: "http_401", message: "expired" }, request_id: "r" } },
  ]);
  const token = (sub: string) => `x.${Buffer.from(JSON.stringify({ sub })).toString("base64url")}.y`;
  const api = createTableUsApi(createApiClient({
    baseUrl: "http://api",
    fetchImpl,
    getAccessToken: async () => token("person-a"),
    refreshAccessToken: async () => token("person-b"),
  }));
  await assert.rejects(api.deleteAccount("person-a"), (error: unknown) =>
    error instanceof ApiError && error.code === "subject_changed");
  assert.equal(calls.length, 1);
});
