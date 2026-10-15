import assert from "node:assert/strict";
import test from "node:test";
import { buildJoinUrl, parseJoinToken } from "./index.ts";

const id = "123e4567-e89b-42d3-a456-426614174000";
const token = "private-capability-0123456789";

test("query compatibility and fragment opt-in both round trip exactly once", () => {
  for (const secret of [token, "long-prefix-a+b/c=&token=#end", "literal-long-prefix%2F%2B%FF", "long-prefix-東京 / café"]) {
    for (const format of ["query", "fragment"] as const) {
      const link = buildJoinUrl("https://links.table-us.com", id, secret, format);
      assert.equal(parseJoinToken(link), secret);
      assert.equal(new URL(link).search.length === 0, format === "fragment");
    }
  }
  assert.ok(buildJoinUrl("https://links.table-us.com", id, token).includes("?token="));
  assert.equal(parseJoinToken(`/join/${id}`), null);
});

test("malformed, duplicated and ambiguous capabilities fail without echoing them", () => {
  const invalid = [
    `?token=${token}&token=${token}`, `?%74oken=${token}&token=${token}`,
    `?token=${token}#token=${token}`, `?token=${token}#bad`,
    `#token=${token}&token=${token}`, "#token=%FF", "#token=%E0%A4", "#token=short",
    `#token=${"x".repeat(201)}`, `#token=${token}%00`, `#token=${token}\ud800`,
    `?token=${token}&bad=%FF`, `?token=${token}#`, "#token=",
  ];
  for (const suffix of invalid) {
    assert.throws(() => parseJoinToken(`/join/${id}${suffix}`), { message: "This private link is invalid." });
  }
});
