import assert from "node:assert/strict";
import test from "node:test";

import { distance } from "./format.ts";

test("distance reads like a restaurant app and skips plans without a spot", () => {
  const plan = { latitude: 40.7359, longitude: -73.9911 };
  assert.equal(distance(plan, { latitude: 40.7411, longitude: -73.9897 }), "0.4 mi");
  assert.equal(distance(plan, { latitude: 40.9, longitude: -73.9911 }), "11 mi");
  assert.equal(distance({ latitude: null, longitude: null }, plan), null);
});
