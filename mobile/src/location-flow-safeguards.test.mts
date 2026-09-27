import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const plans = readFileSync(new URL("../app/(tabs)/plans.tsx", import.meta.url), "utf8");
const detail = readFileSync(new URL("../app/plans/[id].tsx", import.meta.url), "utf8");
const attribution = readFileSync(new URL("./components/google-maps-attribution.tsx", import.meta.url), "utf8");

test("mobile plan creation requires a selected provider location", () => {
  assert.match(plans, /City, neighborhood, or ZIP code/);
  assert.match(plans, /Find location/);
  assert.match(plans, /selectedLocation\.place_id/);
  assert.match(plans, /location_place_id/);
  assert.doesNotMatch(plans, /42\.3601|-71\.0589/);
});

test("mobile lookup is explicit, retryable, attributed, and invalidated by edits", () => {
  assert.match(plans, /useRecoverableMutation[\s\S]*locations\/resolve/);
  assert.match(plans, /Retry finding location/);
  assert.match(plans, /setSelectedLocation\(null\)/);
  assert.match(plans, /GoogleMapsAttribution/);
});

test("mobile Google Maps content uses the official accessible attribution asset", () => {
  assert.match(plans, /GoogleMapsAttribution/);
  assert.match(detail, /GoogleMapsAttribution/);
  assert.match(attribution, /google-maps-attribution\.svg/);
  assert.match(attribution, /accessibilityLabel="Google Maps"/);
  assert.match(attribution, /width: 98, height: 18/);
  assert.match(attribution, /paddingLeft: 10/);
  assert.doesNotMatch(detail, /Restaurant data provided by Google Maps/);
});
