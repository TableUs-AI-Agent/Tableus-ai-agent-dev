# Active packet: policy-safe Google Places staging and location flow

## Status

Local implementation and validation are complete on
`codex/maps-staging-validation`, branched from merged `main` at
`2169338d3edc760b9df0d045551745c2b91b45c0`. Focused checks, migration checks,
API drift checks, `make ready`, and sequential Expo Go iOS/Android location
smokes pass. The first pushed candidate exposed one stale Playwright create-plan
step in pull request #3; the corrected four-journey browser suite and cumulative
readiness gate now pass locally, and a replacement exact SHA is pending approval.
Railway static outbound IPs are enabled but require the gated redeploy before
they become active. Google Cloud, migration, secret, and deployment actions
remain gated for the replacement candidate.

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
  retries, four-way detail concurrency, and typed provider errors.
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

After candidate approval: create the isolated `TableUs Staging Maps` project,
attach billing, enable only Places API New, configure a $10 budget with
50/80/100-percent alerts and 60-request/minute Nearby/Text/Details quotas, enable
Railway Pro static outbound IPs, restrict the server key to those IPs and API,
store it only in Railway staging and operator Keychain, apply the approved
migration, deploy Railway/Vercel from the exact SHA, and send one returning OTP
to each of two existing approved accounts.

## Boundaries

No Gemini live call, Sentry/PostHog activation, new invite, production migration
or build, EAS artifact, store submission, account deletion, photo/review Places
data, or legacy discovery-page migration is included.
