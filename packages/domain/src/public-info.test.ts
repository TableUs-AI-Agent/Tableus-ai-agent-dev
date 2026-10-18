import assert from "node:assert/strict";
import test from "node:test";

import {
  BETA_NOTICE_EFFECTIVE_DATE,
  mailto,
  PUBLIC_CONTACTS,
  PUBLIC_POLICY_LINKS,
  HOSTED_ENVIRONMENTS,
  hostedEnvironment,
  requireExactHttpsOrigin,
} from "./public-info.ts";
import { requireCanonicalUuid } from "./index.ts";

test("closed-beta public contacts use the canonical TableUs domain", () => {
  assert.deepEqual(PUBLIC_CONTACTS, {
    supportEmail: "brian@table-us.com",
    privacyEmail: "privacy@table-us.com",
  });
  assert.equal(mailto(PUBLIC_CONTACTS.supportEmail), "mailto:brian@table-us.com");
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
  const api = HOSTED_ENVIRONMENTS.staging.apiOrigin;
  assert.equal(requireExactHttpsOrigin(api, api, "API origin"), api);
  for (const value of [
    "http://api-staging-3795.up.railway.app",
    "https://attacker.example",
    `${api}/private`,
    `${api}?redirect=https://attacker.example`,
    `https://user:password@${new URL(api).host}`,
  ]) {
    assert.throws(() => requireExactHttpsOrigin(value, api, "API origin"), /approved HTTPS origin/);
  }
});

test("staging and production never share a hosted origin", () => {
  const { staging, production } = HOSTED_ENVIRONMENTS;
  for (const key of ["webOrigin", "linkHost", "apiOrigin", "supabaseOrigin"] as const) {
    assert.notEqual(staging[key], production[key], key);
  }
  assert.equal(hostedEnvironment("production"), "production");
  for (const value of [undefined, "", "prod", "Production"]) {
    assert.throws(() => hostedEnvironment(value), /TABLEUS_DEPLOY_ENV/);
  }
});
