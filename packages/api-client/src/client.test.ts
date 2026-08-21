import assert from "node:assert/strict";
import test from "node:test";

import { ApiError, createApiClient } from "./index.ts";

test("client unwraps a successful envelope", async () => {
  const client = createApiClient({
    baseUrl: "https://example.test",
    fetchImpl: async () => new Response(JSON.stringify({ data: { ok: true }, meta: {} })),
  });
  assert.deepEqual(await client.get("/health"), { ok: true });
});

test("client preserves API error metadata", async () => {
  const client = createApiClient({
    baseUrl: "https://example.test",
    fetchImpl: async () =>
      new Response(JSON.stringify({ error: { code: "denied", message: "No" }, request_id: "req-1" }), { status: 403 }),
  });
  await assert.rejects(client.get("/private"), (error: unknown) => error instanceof ApiError && error.requestId === "req-1");
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
