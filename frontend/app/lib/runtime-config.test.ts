import assert from "node:assert/strict";
import test from "node:test";

import { webApiOrigin, webSupabaseOrigin } from "./runtime-config.ts";

test("accepts bare HTTPS origins and local HTTP", () => {
  assert.equal(webApiOrigin("https://api.example.com/"), "https://api.example.com");
  assert.equal(webApiOrigin("http://localhost:8000"), "http://localhost:8000");
  assert.equal(webSupabaseOrigin("http://127.0.0.1:54321"), "http://127.0.0.1:54321");
});

test("unconfigured origins stay empty", () => {
  assert.equal(webApiOrigin(""), "");
  assert.equal(webSupabaseOrigin(undefined), "");
});

test("rejects remote HTTP, credentials, paths and queries", () => {
  for (const value of [
    "http://api.example.com",
    "https://user:pass@api.example.com",
    "https://api.example.com/private",
    "https://api.example.com?token=x",
    "not a url",
  ]) {
    assert.throws(() => webApiOrigin(value), /must be an origin/);
  }
});
