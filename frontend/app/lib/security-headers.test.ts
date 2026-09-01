import assert from "node:assert/strict";
import test from "node:test";

import { FRAME_PROTECTION_HEADERS, FRAME_PROTECTION_SOURCE } from "./security-headers.ts";

test("web responses deny framing on every route", () => {
  assert.equal(FRAME_PROTECTION_SOURCE, "/:path*");
  assert.deepEqual(FRAME_PROTECTION_HEADERS, [
    { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
    { key: "X-Frame-Options", value: "DENY" },
  ]);
});
