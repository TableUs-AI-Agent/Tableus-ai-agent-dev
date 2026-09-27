import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const scripts = [
  "mobile-auth-e2e.mjs",
  "mobile-links-e2e.mjs",
  "maps-staging-e2e.mjs",
  "gemini-staging-e2e.mjs",
].map((name) => [name, readFileSync(new URL(name, import.meta.url), "utf8")]);

test("live evidence secrets use the shared no-echo prompt", () => {
  for (const [name, source] of scripts) {
    assert.match(source, /promptSecret/, `${name} must use promptSecret`);
    assert.doesNotMatch(source, /\.question\([^\n]*(?:OTP|verification code|invite|private join URL|account email)/i);
  }
});

test("live authenticated mobile runners retain no raw screenshots", () => {
  for (const name of ["mobile-auth-e2e.mjs", "mobile-links-e2e.mjs"]) {
    const source = scripts.find(([candidate]) => candidate === name)[1];
    assert.match(source, /screenshots_retained_by_runner: false/);
    assert.doesNotMatch(source, /copyFileSync|collectScreenshot/);
    assert.match(source, /removeNewEntries\(maestroTests, testsBefore\)/);
    assert.match(source, /removeNewEntries\(maestroLogs, logsBefore\)/);
  }
});
