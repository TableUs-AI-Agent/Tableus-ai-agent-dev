import assert from "node:assert/strict";
import test from "node:test";

import { RELEASE_ORIGINS, requireReleaseOrigin } from "./release-origins.mjs";

test("release evidence destinations are exact source-controlled HTTPS origins", () => {
  assert.equal(
    requireReleaseOrigin(`${RELEASE_ORIGINS.stagingApi}/`, RELEASE_ORIGINS.stagingApi, "API"),
    RELEASE_ORIGINS.stagingApi,
  );
  for (const hostile of [
    "http://api-staging-3795.up.railway.app",
    "https://user:pass@api-staging-3795.up.railway.app",
    "https://api-staging-3795.up.railway.app:444",
    "https://api-staging-3795.up.railway.app/private",
    "https://api-staging-3795.up.railway.app.evil.test",
  ]) assert.throws(
    () => requireReleaseOrigin(hostile, RELEASE_ORIGINS.stagingApi, "API"),
    /source-controlled release origin/,
  );
});
