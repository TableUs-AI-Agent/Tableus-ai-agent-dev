import assert from "node:assert/strict";
import test from "node:test";

import { FRAME_PROTECTION_HEADERS, FRAME_PROTECTION_SOURCE, PRIVATE_JOIN_HEADERS, PRIVATE_JOIN_SOURCE } from "./security-headers.ts";

test("web responses deny framing on every route", () => {
  assert.equal(FRAME_PROTECTION_SOURCE, "/:path*");
  assert.deepEqual(FRAME_PROTECTION_HEADERS, [
    { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
    { key: "X-Frame-Options", value: "DENY" },
  ]);
});

test("join landing disables referrers and intermediary storage", () => {
  assert.equal(PRIVATE_JOIN_SOURCE, "/join/:path*");
  assert.deepEqual(PRIVATE_JOIN_HEADERS, [
    { key: "Referrer-Policy", value: "no-referrer" },
    { key: "Cache-Control", value: "private, no-store, max-age=0" },
  ]);
});
