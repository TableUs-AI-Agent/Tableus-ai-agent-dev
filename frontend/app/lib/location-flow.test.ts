import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const plans = readFileSync(new URL("../plans/page.tsx", import.meta.url), "utf8");
const detail = readFileSync(new URL("../plans/[id]/page.tsx", import.meta.url), "utf8");

test("web plans resolve and attribute a transient location before creation", () => {
  assert.match(plans, /City, neighborhood, or ZIP code/);
  assert.match(plans, /locations\/resolve/);
  assert.match(plans, /selectedLocation\?\.place_id/);
  assert.match(plans, />Google Maps</);
  assert.doesNotMatch(plans, /42\.3601|-71\.0589/);
});

test("web plan detail polls revision before refreshing paid details", () => {
  assert.match(detail, /plans\/\$\{id\}\/revision/);
  assert.match(detail, /refetchInterval: 30_000/);
  assert.match(detail, /setQueryData<PlanRevision>/);
  assert.doesNotMatch(detail, /\}, \[plan,/);
  assert.doesNotMatch(detail, /get<Plan>\(`\/api\/v1\/plans\/\$\{id\}`\), refetchInterval/);
});
