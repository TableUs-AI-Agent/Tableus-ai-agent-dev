# Private-link handling handoff — 2026-09-25

Local implementation complete. Brian owns current-stage development; historical
shared work remains shared. Astra integrated/reviewed the shared parser/store,
API HTTP policy and evidence; bounded Sol contributions covered web and mobile.
No merge, push, deployment or native acceptance is implied.

## Exact identities

- Application and repository verification checkout:
  `484632517345e7858f48caf8fa7b128f9d9dab80`.
- Branch: `codex/private-link-handling`.
- Worktree: `/Users/brianchei/.codex/worktrees/private-link-handling/Tableus-ai-agent-dev`.
- Base: `2674fc7a798de5f090f17455a602e44641bda943`.
- Inherited application: `29edb5e9f47ab7ac74034f2bac5e271a162ea620`.
- Readiness ran in this clean, detached checkout at the frozen SHA. The final
  evidence commit changes docs only and does not replace that application SHA.
- Private artifacts:
  `/Users/brianchei/.codex/artifacts/tableus/private-link-handling-2026-09-25`.
- [Machine-readable receipt](../evidence/private-link-handling-2026-09-25/verification.json)
  hashes changed application files and retained operator harness/logs.

## Result

Approved TableUs members can still join through a forwarded current plan link.
Readers now accept both query and fragment transport, decode once, reject
malformed/conflicting input and capture into one 20-minute process-local flow.
Web scrubs the URL; native router state carries an opaque handle. Explicit Join
posts through the existing subject-checked API. Sign-in does not auto-join.
Cancel, expiry, success, sign-out and account switch clear the pending capability.
Uncertain attempts survive screen remount as handle-only metadata and require
provider-free membership reconciliation before another explicit attempt.

Join documents use dynamic rendering and no-referrer/private no-store. API v1
HTTP responses, including successful capability replay and early rejection,
receive no-store. Existing account approval, organizer rotation, membership,
finalization, row locking and capacity rules remain. No schema or API response
change, exchange service, server expiry or recipient-bound plan invitation was
added. [Behavior and release contract](../private-link-handling.md).

Both emission settings default to query: `NEXT_PUBLIC_JOIN_LINK_FORMAT` and
`EXPO_PUBLIC_JOIN_LINK_FORMAT`. No deployed configuration changed. Fragment
emission remains off until compatible released readers and cohort adoption are
accepted. Account deletion also remains disabled.

## Fresh verification

- One full `make ready` on frozen source passed: 196 Python tests, zero skips;
  311 JavaScript tests (112 scripts, 23 web unit, 56 mobile unit, 69 mobile
  component, 30 API client, 21 domain); lint/types, generated contracts, Next
  production build, Expo **web export**, deterministic smoke. Contract drift is
  empty. JavaScript size is 2,771,576 bytes, a report-only baseline.
- Root PostgreSQL focused regression: 52 passed after correcting middleware
  registration; final three private-link cases passed after adding early-body
  admission header coverage and isolating the synthetic owner. Actual competing
  joins at seven members permit one winner and enforce eight; rotation preserves
  member revision access while rejecting the old token for an outsider.
- Four installed-Chrome mocked journeys pass against the exact production build:
  fragment capture with no token in visible URL/history/storage; explicit Join;
  cancellation across client back navigation; lost-response revision and approval
  checks before same-key retry; valid then malformed same-page replacement.
  HTTP inspection observes `Referrer-Policy: no-referrer`,
  `Cache-Control: private, no-store, max-age=0`, CSP frame protection and DENY.
  Browser requests outside the local server are blocked. No actual Auth was used.
- Shared-store regressions cover expiry even with paused timers, exactly-once
  plus/percent/Unicode decoding, invalid replacement, subject binding/switch and
  stale completion. Mobile checks use actual Expo extraction/route construction
  through the Join JSON boundary; they are not OS-delivery evidence.
- Fresh PostgreSQL 17.11 database with distinct restricted runtime and migration
  roles, existing head `d48f6c2ab913`. No new migration. Task-owned port 55442
  database and port 3404 production server are stopped; logs/data retained.

## Review and retained failures

The first API-focused run failed from an accidental extra positional middleware
argument; corrected before the passing fresh-database rerun. Explicitly naming
legacy main.py in lint bypassed the normal exclusion and exposed legacy rules;
configured lint and types pass without unrelated refactoring.

The first browser attempt lacked Playwright's matching headless shell; installed
Chrome was used without downloads. Browser checks found and fixed duplicate
popstate/hashchange handling that erased a malformed-link error. Initial cancel
back-navigation fixtures assumed router.replace retained the entry; the corrected
same-document history setup passes. Initial Next production start from repository
root failed TS-config relative resolution; the standard frontend start succeeds.
All failures remain in the private artifact directory. Final production tests
rerun the browser behavior after the final source guards, rather than attributing
the earlier development run to newer bytes. Next dev deliberately overrides cache
headers; only the production observation above demonstrates local no-store.

Existing Alembic/Node warnings, missing optional Sentry build configuration and
npm deprecation notices are non-failing; no dependency audit or security scan ran.

## Remaining gates and recommended next objective

Prepare a **cumulative release-acceptance proposal** using this exact branch and
the native owner's current evidence. The proposal should resolve:

1. Which cumulative application/ref includes lifecycle, quotas, recipient invites
   and these readers, and which native artifacts must change. Preserve separate
   application, operator and evidence identities; integration/merge is gated.
2. The intended compatible mobile release/cohort versions and observable adoption
   criterion before enabling fragment emission. No minimum-version gate exists.
3. A dated legacy-reader transition/cutoff, active-plan inventory, and proposed
   organizer rotation/re-sharing scope. Old query URLs expose the initial web
   request; disabling query parsing alone does not revoke a copied capability.
4. A finite native/hosted acceptance campaign with explicit prerequisites,
   targets, disk/time/attempt limits, failure stops, header/log checks and rollback.
   Include remaining lifecycle activation/retention/support and beta controls.

This preparation can proceed independently of running native validation. Do not
execute it from this handoff. Native task `01a0c678-55c8-7cc0-a3cb-e3200776906a`
(Prepare native replacement validation) retains native ownership. Its last read
at `f044c925d216c9caad201b2c4425bad878c0472c` records C7 stopped before UI,
consumed allowances and no C8 authority. Original refresh/AppHang, physical
association/Auth, Android, links/export and N2 release gates remain. That is a
reused dated observation, not a fresh status poll or acceptance of these bytes.
No September 30 extension, native retry, live-provider budget, canceled scan,
hosted migration/resource/secret action, store submission, real invitation/link
rotation, production rollout, beta activation or destructive cleanup is granted.
Shared Notion/Notes were untouched.
