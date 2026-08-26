import assert from "node:assert/strict";
import test from "node:test";

import { BETA_NOTICE_EFFECTIVE_DATE, mailto, PUBLIC_CONTACTS, PUBLIC_POLICY_LINKS } from "./public-info.ts";

test("closed-beta public contacts use the canonical TableUs domain", () => {
  assert.deepEqual(PUBLIC_CONTACTS, {
    supportEmail: "support@table-us.com",
    privacyEmail: "privacy@table-us.com",
  });
  assert.equal(mailto(PUBLIC_CONTACTS.supportEmail), "mailto:support@table-us.com");
  assert.equal(mailto(PUBLIC_CONTACTS.privacyEmail), "mailto:privacy@table-us.com");
});

test("incorporated Google policies use public HTTPS origins", () => {
  for (const value of Object.values(PUBLIC_POLICY_LINKS)) {
    const url = new URL(value);
    assert.equal(url.protocol, "https:");
    assert.equal(url.username, "");
    assert.equal(url.password, "");
  }
  assert.equal(BETA_NOTICE_EFFECTIVE_DATE, "August 26, 2026");
});
