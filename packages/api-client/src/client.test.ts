import assert from "node:assert/strict";
import test from "node:test";

import { ApiError, createApiClient, createIdempotencyKey } from "./index.ts";

test("client unwraps a successful envelope", async () => {
  const client = createApiClient({
    baseUrl: "https://example.test",
    fetchImpl: async () => new Response(JSON.stringify({ data: { ok: true }, meta: {} })),
  });
  assert.deepEqual(await client.get("/health"), { ok: true });
});

test("client treats an incomplete successful response as an ambiguous network failure", async () => {
  const client = createApiClient({
    baseUrl: "https://example.test",
    fetchImpl: async () => new Response("{", { status: 200, headers: { "Content-Type": "application/json" } }),
  });

  await assert.rejects(
    client.post("/write", { value: 1 }),
    (error: unknown) => error instanceof ApiError && error.status === 0 && error.code === "network_error",
  );
});

test("client aborts a stalled request and reports an ambiguous network failure", async () => {
  let observedSignal: AbortSignal | null | undefined;
  const client = createApiClient({
    baseUrl: "https://example.test",
    requestTimeoutMs: 10,
    fetchImpl: async (_input, init) => {
      observedSignal = init?.signal;
      return new Promise<Response>((_resolve, reject) => {
        observedSignal?.addEventListener("abort", () => reject(new Error("aborted")), { once: true });
      });
    },
  });

  await assert.rejects(
    client.post("/write", { value: 1 }),
    (error: unknown) => error instanceof ApiError && error.status === 0 && error.code === "network_error",
  );
  assert.equal(observedSignal?.aborted, true);
});

test("client timeout remains active while a successful response body is incomplete", async () => {
  let observedSignal: AbortSignal | null | undefined;
  const client = createApiClient({
    baseUrl: "https://example.test",
    requestTimeoutMs: 10,
    fetchImpl: async (_input, init) => {
      observedSignal = init?.signal;
      return {
        ok: true,
        status: 200,
        json: () => new Promise((_resolve, reject) => {
          observedSignal?.addEventListener("abort", () => reject(new Error("aborted")), { once: true });
        }),
      } as Response;
    },
  });

  await assert.rejects(
    client.post("/write", { value: 1 }),
    (error: unknown) => error instanceof ApiError && error.status === 0 && error.code === "network_error",
  );
  assert.equal(observedSignal?.aborted, true);
});

test("client deadline rejects when response-body parsing ignores abort", async () => {
  let observedSignal: AbortSignal | null | undefined;
  const client = createApiClient({
    baseUrl: "https://example.test",
    requestTimeoutMs: 10,
    fetchImpl: async (_input, init) => {
      observedSignal = init?.signal;
      return {
        ok: true,
        status: 200,
        json: () => new Promise(() => {}),
      } as Response;
    },
  });

  await assert.rejects(
    client.post("/write", { value: 1 }),
    (error: unknown) => error instanceof ApiError && error.status === 0 && error.code === "network_error",
  );
  assert.equal(observedSignal?.aborted, true);
});

test("client preserves API error metadata", async () => {
  const client = createApiClient({
    baseUrl: "https://example.test",
    fetchImpl: async () =>
      new Response(JSON.stringify({ error: { code: "denied", message: "No" }, request_id: "req-1" }), { status: 403 }),
  });
  await assert.rejects(client.get("/private"), (error: unknown) => error instanceof ApiError && error.requestId === "req-1");
});

test("client reports terminal authorization boundaries without changing the response", async () => {
  const observed: number[] = [];
  const client = createApiClient({
    baseUrl: "https://example.test",
    onAuthorizationError: (status) => observed.push(status),
    fetchImpl: async (input) => {
      const status = String(input).endsWith("/unauthorized") ? 401 : 403;
      return new Response(
        JSON.stringify({ error: { code: "denied", message: "No" }, request_id: "req-1" }),
        { status },
      );
    },
  });

  await assert.rejects(client.get("/unauthorized"), (error: unknown) => error instanceof ApiError && error.status === 401);
  await assert.rejects(client.get("/forbidden"), (error: unknown) => error instanceof ApiError && error.status === 403);
  assert.deepEqual(observed, [401, 403]);
});

test("client resolves a dynamic demo identity for every request", async () => {
  const observed: Array<string | null> = [];
  let activeIdentity = "demo-organizer";
  const client = createApiClient({
    baseUrl: "https://example.test",
    demoUserId: "static-fallback",
    getDemoUserId: async () => activeIdentity,
    fetchImpl: async (_input, init) => {
      observed.push(new Headers(init?.headers).get("X-Demo-User-ID"));
      return new Response(JSON.stringify({ data: { ok: true }, meta: {} }));
    },
  });

  await client.get("/first");
  activeIdentity = "demo-guest";
  await client.get("/second");
  assert.deepEqual(observed, ["demo-organizer", "demo-guest"]);
});

test("client uses the static demo identity when the dynamic resolver returns null", async () => {
  let observed: string | null = null;
  const client = createApiClient({
    baseUrl: "https://example.test",
    demoUserId: "demo-organizer",
    getDemoUserId: async () => null,
    fetchImpl: async (_input, init) => {
      observed = new Headers(init?.headers).get("X-Demo-User-ID");
      return new Response(JSON.stringify({ data: { ok: true }, meta: {} }));
    },
  });

  await client.get("/fallback");
  assert.equal(observed, "demo-organizer");
});

test("client omits the demo header when no identity is available", async () => {
  let observed: string | null = "unexpected";
  const client = createApiClient({
    baseUrl: "https://example.test",
    getDemoUserId: async () => null,
    fetchImpl: async (_input, init) => {
      observed = new Headers(init?.headers).get("X-Demo-User-ID");
      return new Response(JSON.stringify({ data: { ok: true }, meta: {} }));
    },
  });

  await client.get("/anonymous");
  assert.equal(observed, null);
});

test("client refreshes once after 401 and reuses the idempotency key", async () => {
  const tokens: Array<string | null> = [];
  const idempotencyKeys: Array<string | null> = [];
  let calls = 0;
  const client = createApiClient({
    baseUrl: "https://example.test",
    getAccessToken: async () => "expired-token",
    refreshAccessToken: async () => "fresh-token",
    fetchImpl: async (_input, init) => {
      calls += 1;
      const headers = new Headers(init?.headers);
      tokens.push(headers.get("Authorization"));
      idempotencyKeys.push(headers.get("Idempotency-Key"));
      if (calls === 1) {
        return new Response(JSON.stringify({ error: { code: "unauthorized", message: "Expired" }, request_id: "req-1" }), { status: 401 });
      }
      return new Response(JSON.stringify({ data: { ok: true }, meta: {} }));
    },
  });

  assert.deepEqual(await client.post("/private", { value: 1 }), { ok: true });
  assert.deepEqual(tokens, ["Bearer expired-token", "Bearer fresh-token"]);
  assert.equal(idempotencyKeys[0], idempotencyKeys[1]);
  assert.ok(idempotencyKeys[0]);
});

test("client does not retry when refresh fails", async () => {
  let calls = 0;
  const client = createApiClient({
    baseUrl: "https://example.test",
    getAccessToken: async () => "expired-token",
    refreshAccessToken: async () => null,
    fetchImpl: async () => {
      calls += 1;
      return new Response(JSON.stringify({ error: { code: "unauthorized", message: "Expired" }, request_id: "req-1" }), { status: 401 });
    },
  });

  await assert.rejects(client.get("/private"), (error: unknown) => error instanceof ApiError && error.status === 401);
  assert.equal(calls, 1);
});

test("client does not retry when refresh throws", async () => {
  let calls = 0;
  const client = createApiClient({
    baseUrl: "https://api.example",
    getAccessToken: async () => "expired",
    refreshAccessToken: async () => { throw new Error("refresh failed"); },
    fetchImpl: async () => {
      calls += 1;
      return new Response(JSON.stringify({ error: { code: "unauthorized", message: "expired" }, request_id: "req" }), { status: 401 });
    },
  });
  await assert.rejects(() => client.get("/api/v1/me"), (error: unknown) => error instanceof ApiError && error.status === 401);
  assert.equal(calls, 1);
});

test("client never refreshes or retries a 403", async () => {
  let calls = 0;
  let refreshes = 0;
  const client = createApiClient({
    baseUrl: "https://example.test",
    getAccessToken: async () => "valid-token",
    refreshAccessToken: async () => {
      refreshes += 1;
      return "unused-token";
    },
    fetchImpl: async () => {
      calls += 1;
      return new Response(JSON.stringify({ error: { code: "denied", message: "No" }, request_id: "req-1" }), { status: 403 });
    },
  });

  await assert.rejects(client.get("/private"), (error: unknown) => error instanceof ApiError && error.status === 403);
  assert.equal(calls, 1);
  assert.equal(refreshes, 0);
});

test("client sends an explicit JSON body with DELETE requests", async () => {
  let request: RequestInit | undefined;
  const client = createApiClient({
    baseUrl: "https://api.example.test",
    fetchImpl: async (_input, init) => {
      request = init;
      return new Response(JSON.stringify({ data: { deleted: true }, meta: {} }));
    },
  });

  await client.delete("/api/v1/me", { confirmation: "DELETE" });

  assert.equal(request?.method, "DELETE");
  assert.equal(request?.body, JSON.stringify({ confirmation: "DELETE" }));
});

test("client sends explicit idempotency keys for every write method", async () => {
  const observed: Array<[string | undefined, string | null]> = [];
  const client = createApiClient({
    baseUrl: "https://api.example.test",
    fetchImpl: async (_input, init) => {
      observed.push([init?.method, new Headers(init?.headers).get("Idempotency-Key")]);
      return new Response(JSON.stringify({ data: { ok: true }, meta: {} }));
    },
  });

  await client.post("/post", {}, { idempotencyKey: "post-key" });
  await client.put("/put", {}, { idempotencyKey: "put-key" });
  await client.patch("/patch", {}, { idempotencyKey: "patch-key" });
  await client.delete("/delete", {}, { idempotencyKey: "delete-key" });

  assert.deepEqual(observed, [
    ["POST", "post-key"],
    ["PUT", "put-key"],
    ["PATCH", "patch-key"],
    ["DELETE", "delete-key"],
  ]);
});

test("client generates distinct non-empty idempotency keys", () => {
  const first = createIdempotencyKey();
  const second = createIdempotencyKey();
  assert.ok(first);
  assert.ok(second);
  assert.notEqual(first, second);
});

test("client adds anonymous telemetry context without account identity", async () => {
  const observed: Array<[string | null, string | null]> = [];
  const client = createApiClient({
    baseUrl: "https://api.example.test",
    getTelemetrySessionId: () => "5f6ad44d-42d8-4d11-b5c3-90d137e34b87",
    telemetryPlatform: "web",
    fetchImpl: async (_input, init) => {
      const headers = new Headers(init?.headers);
      observed.push([
        headers.get("X-TableUs-Telemetry-Session"),
        headers.get("X-TableUs-Client"),
      ]);
      return new Response(JSON.stringify({ data: { ok: true }, meta: {} }));
    },
  });
  await client.get("/api/v1/me");
  assert.deepEqual(observed, [["5f6ad44d-42d8-4d11-b5c3-90d137e34b87", "web"]]);
});

test("client omits incomplete telemetry context", async () => {
  let observed: Headers | undefined;
  const client = createApiClient({
    baseUrl: "https://api.example.test",
    getTelemetrySessionId: () => null,
    telemetryPlatform: "ios",
    fetchImpl: async (_input, init) => {
      observed = new Headers(init?.headers);
      return new Response(JSON.stringify({ data: { ok: true }, meta: {} }));
    },
  });
  await client.get("/api/v1/me");
  assert.equal(observed?.get("X-TableUs-Telemetry-Session"), null);
  assert.equal(observed?.get("X-TableUs-Client"), null);
});
