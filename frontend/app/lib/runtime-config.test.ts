import assert from "node:assert/strict";
import test from "node:test";

import { PUBLIC_RUNTIME_POLICY } from "@tableus/domain";

import { webApiOrigin, webSupabaseOrigin } from "./runtime-config.ts";

test("hosted web service origins accept only source-controlled staging origins", () => {
  assert.equal(webApiOrigin(PUBLIC_RUNTIME_POLICY.stagingApiOrigin), PUBLIC_RUNTIME_POLICY.stagingApiOrigin);
  assert.equal(
    webSupabaseOrigin(PUBLIC_RUNTIME_POLICY.stagingSupabaseOrigin),
    PUBLIC_RUNTIME_POLICY.stagingSupabaseOrigin,
  );
  for (const value of [
    "https://attacker.example",
    `${PUBLIC_RUNTIME_POLICY.stagingApiOrigin}/private`,
    `${PUBLIC_RUNTIME_POLICY.stagingApiOrigin}?token=redirect`,
    `https://user:password@${new URL(PUBLIC_RUNTIME_POLICY.stagingApiOrigin).host}`,
  ]) {
    assert.throws(() => webApiOrigin(value), /approved HTTPS origin/);
  }
});

test("unconfigured web origins remain inert", () => {
  assert.equal(webApiOrigin(""), "");
  assert.equal(webSupabaseOrigin(undefined), "");
});
