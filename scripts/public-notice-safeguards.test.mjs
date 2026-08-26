import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";

const root = new URL("../", import.meta.url);
const source = (path) => readFileSync(new URL(path, root), "utf8");
const digest = (path) => createHash("sha256").update(readFileSync(new URL(path, root))).digest("hex");

test("web and mobile notices use canonical contacts and incorporated Google policies", () => {
  const publicInfo = source("packages/domain/src/public-info.ts");
  const webTerms = source("frontend/app/terms/page.tsx");
  const webPrivacy = source("frontend/app/privacy/page.tsx");
  const mobileTerms = source("mobile/app/terms.tsx");
  const mobilePrivacy = source("mobile/app/privacy.tsx");

  assert.match(publicInfo, /support@table-us\.com/);
  assert.match(publicInfo, /privacy@table-us\.com/);
  assert.doesNotMatch([webTerms, webPrivacy, mobileTerms, mobilePrivacy].join("\n"), /tableus\.app/);
  assert.match(webTerms, /googleMapsPlatformTerms/);
  assert.match(mobileTerms, /googleMapsPlatformTerms/);
  assert.match(webPrivacy, /googlePrivacyPolicy/);
  assert.match(mobilePrivacy, /googlePrivacyPolicy/);
});

test("committed Google Maps attribution files exactly match the approved official asset", () => {
  const officialDigest = "62c52df68d8f450c860d5d65068fc96d63c2dfaec849b91ac64b3256a898936e";
  assert.equal(digest("frontend/public/google-maps-attribution.svg"), officialDigest);
  assert.equal(digest("mobile/assets/google-maps-attribution.svg"), officialDigest);
  const asset = source("frontend/public/google-maps-attribution.svg");
  assert.match(asset, /width="98px" height="18px"/);
  assert.match(asset, /fill="#1F1F1F"/);
});

test("attribution components preserve official size, clear space, accessibility, and provider proximity", () => {
  const webAttribution = source("frontend/app/components/google-maps-attribution.tsx");
  const mobileAttribution = source("mobile/src/components/google-maps-attribution.tsx");
  const webPlans = source("frontend/app/plans/page.tsx");
  const webDetail = source("frontend/app/plans/[id]/page.tsx");
  const mobilePlans = source("mobile/app/(tabs)/plans.tsx");
  const mobileDetail = source("mobile/app/plans/[id].tsx");

  assert.match(webAttribution, /width=\{98\}[\s\S]*height=\{18\}[\s\S]*alt="Google Maps"/);
  assert.match(webAttribution, /px-\[10px\] pb-\[5px\] pt-\[10px\]/);
  assert.match(mobileAttribution, /accessibilityLabel="Google Maps"/);
  assert.match(mobileAttribution, /paddingLeft: 10, paddingRight: 10, paddingTop: 10, paddingBottom: 5/);
  for (const surface of [webPlans, webDetail, mobilePlans, mobileDetail]) {
    assert.match(surface, /data_provider === "google_maps"|selectedLocation[\s\S]*GoogleMapsAttribution/);
  }
});
