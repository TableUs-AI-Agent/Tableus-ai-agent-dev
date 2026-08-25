import assert from "node:assert/strict";
import test from "node:test";

import {
  buildAndroidAssociation,
  buildAppleAssociation,
  parseAndroidFingerprints,
} from "./site-association.ts";

const fingerprint = Array.from({ length: 32 }, (_, index) =>
  index.toString(16).padStart(2, "0"),
).join(":");

test("builds fail-closed Apple and Android association payloads", () => {
  const apple = buildAppleAssociation("ABCDE12345", "com.tableus.app");
  assert.deepEqual(apple.applinks.details[0].appIDs, ["ABCDE12345.com.tableus.app"]);
  assert.deepEqual(apple.applinks.details[0].components, [{ "/": "/join/*" }, { "/": "/auth" }]);
  assert.equal(JSON.stringify(apple).includes("/auth*"), false);
  assert.equal(JSON.stringify(apple).includes("/auth/confirm"), false);

  const fingerprints = parseAndroidFingerprints(fingerprint);
  const android = buildAndroidAssociation("com.tableus.app", fingerprints);
  assert.deepEqual(android[0].target.sha256_cert_fingerprints, [fingerprint.toUpperCase()]);
});

test("rejects placeholder signing identifiers", () => {
  assert.throws(() => buildAppleAssociation("configure", "com.tableus.app"));
  assert.throws(() => parseAndroidFingerprints("not-a-fingerprint"));
});
