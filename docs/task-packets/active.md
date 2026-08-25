# Active packet: policy-safe Google Places staging and location flow

## Status

Implementation and exact-SHA staging validation are complete on
`codex/maps-staging-validation`, branched from merged `main` at
`2169338d3edc760b9df0d045551745c2b91b45c0`. Focused checks, migration checks,
API drift checks, `make ready`, and sequential Expo Go iOS/Android location
smokes passed. Corrected exact candidate
`4a790b4ee40a12cdba8540fb12da586b3373a895` and pull request #3 are green. The
isolated Google project, $10 budget alerts,
60-RPM method quotas, restricted replacement key, staging migration, active
Railway static egress, and exact-SHA Railway/Vercel deployments are configured.
The first live journey authenticated both approved users but exposed a real
city-level response shape: Google returned a populated `200` while omitting
`postalAddress.regionCode`, which the adapter rejected as non-US. The local
correction requests the country address component and uses it only when the
postal region is absent, while remaining fail-closed for any location not
conclusively in the US. The rerun passed two-user authentication, location
resolution, plan creation/joining, four distinct candidates, refreshed details,
policy-safe persistence, and aggregate usage checks. Sanitized evidence is in
`docs/evidence/4a790b4/maps-staging/`. Merge remains an explicit owner gate.

## Objective

Enable live Places API New on Supabase-authenticated staging while Gemini stays
deterministic. Replace fixed coordinates with an explicit web/mobile location
lookup and persist only the user's normalized label, the Google Place ID, and
TableUs-owned planning metadata.

## Deliverables

- Independent Places and AI provider modes with mixed readiness and production
  fail-closed validation.
- Text Search New location resolution and query discovery, Nearby Search New for
  blank discovery, 5 km server-side enforcement, strict field masks, bounded
  retries, four-way detail concurrency, and typed provider errors. US validation
  prefers the postal region and permits the country address component only as a
  transient fallback for city-level results that omit a postal address.
- Nullable legacy coordinates plus `plans.location_place_id`; new live plans
  store no Google coordinates or provider display label.
- Lightweight plan summaries and revision polling that avoid paid Place Details
  calls until a full plan is actually refreshed.
- Per-user/global process-local paid-operation limits and aggregate-only provider
  usage records with outbound-attempt and returned-record counts.
- Web and Expo location selection, accessible Google Maps attribution, explicit
  offline retry with no queue, and policy disclosures.
- Exact-SHA, two-approved-account, sanitized `make maps-staging-e2e` evidence.

## Acceptance

- Deterministic CI and local device flows remain credential-free and use both
  provider modes set to deterministic.
- Live location resolution accepts US locations only and returns a Place ID,
  transient provider label, and attribution marker without coordinates.
- A live-mode plan stores its user-entered label and Place ID with null
  coordinates; candidate rows contain only Place ID and TableUs metadata.
- Recommendation generation commits exactly four refreshed distinct Place IDs
  or returns an honest `422` without a partial run.
- Exact-SHA staging readiness reports Supabase auth, live Places, deterministic
  AI, and `mixed`; sanitized evidence contains no account, OTP, query, coordinate,
  Place ID, Google content, response, key, or session data.

## External gate

Complete. The corrected exact SHA is public, Railway and Vercel are healthy from
that SHA, both returning-code authentications passed, and sanitized staging
evidence is retained. No new invite, production resource, Gemini call, or store
action occurred.

## Boundaries

No Gemini live call, Sentry/PostHog activation, new invite, production migration
or build, EAS artifact, store submission, account deletion, photo/review Places
data, or legacy discovery-page migration is included.
