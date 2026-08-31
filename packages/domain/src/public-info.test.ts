import assert from "node:assert/strict";
import test from "node:test";

import {
  BETA_NOTICE_EFFECTIVE_DATE,
  mailto,
  PUBLIC_CONTACTS,
  PUBLIC_POLICY_LINKS,
  PUBLIC_RUNTIME_POLICY,
  requireExactHttpsOrigin,
} from "./public-info.ts";
import { requireCanonicalUuid } from "./index.ts";

test("closed-beta public contacts use the canonical TableUs domain", () => {
  assert.deepEqual(PUBLIC_CONTACTS, {
    supportEmail: "support@table-us.com",
    privacyEmail: "privacy@table-us.com",
  });
  assert.equal(mailto(PUBLIC_CONTACTS.supportEmail), "mailto:support@table-us.com");
  assert.equal(mailto(PUBLIC_CONTACTS.privacyEmail), "mailto:privacy@table-us.com");
});

test("canonical identifiers reject route delimiters and endpoint confusion", () => {
  assert.equal(
    requireCanonicalUuid("123e4567-e89b-42d3-a456-426614174000", "Plan ID"),
    "123e4567-e89b-42d3-a456-426614174000",
  );
  for (const hostile of [
    "123e4567-e89b-42d3-a456-426614174000/finalize",
    "123e4567-e89b-42d3-a456-426614174000?token=x",
    "%2e%2e%2fshare-token%2frotate",
    "123E4567-E89B-42D3-A456-426614174000",
  ]) assert.throws(() => requireCanonicalUuid(hostile, "Plan ID"), /canonical UUID/);
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

test("hosted public runtime origins are exact source-controlled trust anchors", () => {
  assert.equal(
    requireExactHttpsOrigin(
      PUBLIC_RUNTIME_POLICY.stagingApiOrigin,
      PUBLIC_RUNTIME_POLICY.stagingApiOrigin,
      "API origin",
    ),
    PUBLIC_RUNTIME_POLICY.stagingApiOrigin,
  );
  for (const value of [
    "http://api-staging-3795.up.railway.app",
    "https://attacker.example",
    `${PUBLIC_RUNTIME_POLICY.stagingApiOrigin}/private`,
    `${PUBLIC_RUNTIME_POLICY.stagingApiOrigin}?redirect=https://attacker.example`,
    `https://user:password@${new URL(PUBLIC_RUNTIME_POLICY.stagingApiOrigin).host}`,
  ]) {
    assert.throws(
      () => requireExactHttpsOrigin(value, PUBLIC_RUNTIME_POLICY.stagingApiOrigin, "API origin"),
      /approved HTTPS origin/,
    );
  }
});
