import assert from "node:assert/strict";
import test from "node:test";

import { safeNext } from "./next-path.ts";

test("keeps same-site paths", () => {
  assert.equal(safeNext("/join/abc?x=1"), "/join/abc?x=1");
  assert.equal(safeNext(null), "/plans");
});

test("refuses anything that leaves the site", () => {
  for (const value of ["//evil.example", "/\\evil.example", "/\\/evil.example", "https://evil.example", "evil", "/%5Cevil.example"]) {
    const next = safeNext(value);
    assert.ok(next.startsWith("/") && !next.startsWith("//") && !next.includes("\\"), `${value} -> ${next}`);
    assert.equal(new URL(next, "https://tableus.app").origin, "https://tableus.app", value);
  }
});
