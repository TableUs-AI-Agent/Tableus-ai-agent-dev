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
