import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(new URL("./mobile-links-e2e.mjs", import.meta.url), "utf8");

test("verified-link evidence is pinned to the canonical no-redirect host", () => {
  assert.match(source, /https:\/\/links\.table-us\.com/);
  assert.match(source, /redirect: "manual"/);
  assert.match(source, /response\.status !== 200/);
  assert.match(source, /content-type/);
  assert.match(source, /Web auth fallback did not reach the invite screen/);
  assert.match(source, /Web join fallback is unavailable/);
});

test("device evidence deletes raw link-bearing Maestro output", () => {
  assert.match(source, /rmSync\(temporaryRoot/);
  assert.match(source, /removeNewEntries\(maestroTests/);
  assert.match(source, /removeNewEntries\(maestroLogs/);
  assert.match(source, /\(\[\?&\]token=\)/);
  assert.doesNotMatch(source, /join_url:|email: email|otp:/);
});

test("platform evidence requires signed-domain verification", () => {
  assert.match(source, /Apple Associated Domains Diagnostics/);
  assert.match(source, /Notes or Messages/);
  assert.match(source, /pm", "verify-app-links/);
  assert.match(source, /Android did not report the canonical host as verified/);
});
