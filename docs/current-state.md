# Current state

Updated 2026-09-25 for private-link implementation. Brian
owns all development at this stage. The owner approved this work in parallel
with native validation; only [this worktree's active packet](task-packets/active.md)
directs work here. Native evidence remains tied to its original candidate.

## Working identities

| Role | Value |
| --- | --- |
| Active branch | `codex/private-link-handling` |
| Active worktree | `/Users/brianchei/.codex/worktrees/private-link-handling/Tableus-ai-agent-dev` |
| Implementation base / inherited application | `2674fc7a798de5f090f17455a602e44641bda943` / `29edb5e9f47ab7ac74034f2bac5e271a162ea620` |
| Private-link application / verification checkout | `484632517345e7858f48caf8fa7b128f9d9dab80` |
| Cohort application candidate | `25e34ec9e35e1935cebe8dbb8f34465fd2b313e0` |
| Native validation task | `01a0c678-55c8-7cc0-a3cb-e3200776906a`, Prepare native replacement validation |
| Native worktree | `/Users/brianchei/.codex/worktrees/ea6d/Tableus-ai-agent-dev` |
| Native application / build operator | `8972865893a3f018a064594457dc9cc664f8a61f` / `16603dd0cf36d27b492e57a02d3c6c438a2563c4` |
| Accepted API/native | `f94a1d9d1125e6c9111aa08eda496f014f20d0c0` |
| Staging web | `ed8330a766b3c4b80a505e075535678394e275e9` |
| Production, as recorded at base | `e1184ec` |

The saved root checkout is stale. No shared deployment or native worktree was
changed in this objective. The [base state](history/2026-09-24/current-state-at-lifecycle-base.md)
and [base native packet](history/2026-09-24/native-packet-at-lifecycle-base.md)
retain detailed source/evidence history. Their live/native allowances are not
reopened by this task or branch.

## Product foundation

Invite-approved email sign-in, shared plans for 2–8 people, constraints, four
grounded options, ranked votes, organizer finalize/reopen, private-link rotation
and application-data export exist across FastAPI, Next.js and Expo. Shared
clients use `/api/v1`; direct Supabase client access is authentication-only.
Local/CI providers are deterministic. Gemini and Places remain application
providers. Mobile has bounded restoration/requests, device-local sign-out,
explicit ambiguous-write recovery, private in-memory queries and explicit refresh.

## Account lifecycle

Implementation adds transfer to an existing approved participant, explicit
sole-participant plan removal, and a separately enabled full-account deletion
request/status API. App deletion and its durable Auth-removal record commit
atomically. Trusted Auth attempts are bounded and recoverable, with lease checks,
backoff and operator attention for rejected/exhausted requests. A minimal stable
subject-hash tombstone prevents stale-token re-redemption; raw Auth subject is
cleared on completion. Existing application-only deletion remains compatible.

The feature defaults off. The client objective adds organized-plan resolution
and full-deletion recovery to web/mobile, with provider-free management metadata.
Screens do not silently fall back to legacy application-only deletion. Local
client implementation and review are complete; no release acceptance is claimed.
There is no hosted migration, credential provisioning, deployed worker or
activation. Broader retention durations remain open. [Contract, data treatment
and recovery](account-lifecycle.md) document the exact scope.

The [backend handoff](handoffs/2026-09-24-account-lifecycle-backend.md) and
[client handoff](handoffs/2026-09-24-account-lifecycle-clients.md) retain their
exact-source checks, including seven mocked Chrome journeys. Fresh PostgreSQL17.11
verification now passes both orderings of deletion/redeem and transfer/deletion,
competing transfers and worker exclusion. Fresh and incremental migrations pass
restricted-runtime and denied browser-role checks. Separate worker processes
complete synthetic recovery; no live Auth was used.

The worker CLI adds privacy-safe aggregate status and refuses unavailable work
before claiming attempts. Paused API retries return durable status without
consuming attempts. Local initialization respects a pre-migrated private schema.
CI is configured to use a separate restricted application role, with migrations
under the administrator; that changed hosted CI has not run yet.

Inherited lifecycle candidate `eab922e` passes **314 JavaScript and 139
Python tests, zero skips**, lint/types, contract generation, Next build, Expo web
export and deterministic smoke. Contract drift is empty. The
[PostgreSQL handoff](handoffs/2026-09-24-account-lifecycle-postgres.md) and
[operations procedure](account-lifecycle-operations.md) bind local evidence and
remaining activation gates. Local PostgreSQL privileges do not attest to actual
hosted grants, exposed schemas, scheduler health, credentials or native behavior.

## Cohort controls

Durable pseudonymous counters now limit logical live AI/Places operations per
account per UTC day and committed plan creations over the account lifetime.
Proposed configurable defaults are 5 AI / 20 Places daily and 20 plan creations;
existing per-minute and global budgets remain. Operator usage is default-denied
unless the approved subject appears in server configuration, with reports bounded
to 1–30 preceding days. The [cohort contract](cohort-controls.md) explains accounting,
operator operations and rollout prerequisites.

The migration seeds surviving plan creation history, with current-organizer
fallback when creator evidence is missing. Deleted history is unavailable and
fallback attribution is approximate; prospective enforcement is exact. Deletion,
transfer and process restart do not refund counters. Quota-limited Places
hydration for vote/finalize/reopen now happens before mutation, preventing an
error after a successful commit. Full plan reads remain subject to Places caps.

Fresh make-ready on `25e34ec` passes **162 Python with zero skips and 314
JavaScript tests**, lint/types, contract generation, Next build, Expo web export
and deterministic smoke. Contract drift is empty. [Handoff and evidence](handoffs/2026-09-24-cohort-controls.md)
retain the initial test-isolation failure and passing rerun. No hosted
migration, operator subject, configuration rollout or cohort activation occurred.
Recipient-bound invites and the accepted private-link design are described below.
Affected release acceptance and retention/support review remain open.

## Recipient-bound invites

Trusted issuance now designates one recipient and fixes capacity to one use.
Only the normalized email hash is stored; recipient entry uses a hidden prompt
or standard input. Validation and first redemption check the designated recipient;
the Auth signup hook joins the current invite and rejects revoked, expired,
exhausted or legacy unbound invitations. Retry of an already successful redemption
and ordinary returning-account access remain valid. Local demo fixtures remain
compatible; hosted unused legacy codes need replacement before rollout.

The [invite contract and rollout procedure](recipient-invites.md) describe the
migration, private issuance, legacy handling and exact limits. Frozen invite source `29edb5e` passes full local readiness: **193 Python
with zero skips and 314 JavaScript tests**, lint/types, unchanged generated
contracts, web builds/export and deterministic smoke. Real PostgreSQL contention,
Auth-hook role checks and populated upgrade/downgrade/re-upgrade pass.
[Handoff and evidence](handoffs/2026-09-24-recipient-invites.md) bind exact source. No real invite, hosted migration, Auth call, deployment or native
validation was performed. Existing native evidence does not accept these bytes.

## Private plan links

The owner accepted continued sharing among already-approved TableUs members on
September 25. Query and fragment readers now capture once into a single 20-minute
process-local flow. Web clears the URL; native routes contain only a local handle.
Account changes, sign-out, cancellation, success and expiry clear pending state.
Join stays explicit after authentication, and uncertain results first use the
existing provider-free membership endpoint. No new ticket service, server expiry,
recipient restriction or membership schema is introduced.

New-format emission is opt-in and defaults OFF on both clients. Old installed
readers discard fragments, so compatible release readers and adoption are still
activation prerequisites. Legacy query URLs still reach the initial web request
before client scrubbing. Join documents request no-referrer/no-store; API v1
responses are no-store including successful replays and early admission errors.
Hosted header/log behavior and actual native delivery remain unproven.

Frozen private-link source `4846325` passes one full make-ready: **196 Python
and 311 JavaScript tests, zero skips**, lint/types, unchanged generated contracts,
Next production build, Expo web export and deterministic smoke. Four mocked
Chrome journeys also pass against the exact production build, including history/
storage scrubbing, cancellation across client history, interrupted-join recovery
and malformed replacement. Actual loopback production responses have no-referrer
and private no-store. [Handoff and evidence](handoffs/2026-09-25-private-link-handling.md)
bind exact source. Task-owned PostgreSQL and web servers are stopped; no native,
live Auth, hosted configuration or release activation occurred.
The [implementation contract](private-link-handling.md) records behavior and
release gates. The [prior decision packet](capability-link-decision.md) preserves
the pre-implementation review; its then-pending policy question is now resolved.

## Native and release evidence

Original f94a1d9 isolated-staging acceptance remains intact, with owner-accepted
unresolved simulator AppHang risk. [Staging closeout](handoffs/2026-09-21-staging-closeout.md)
and [Phase W](handoffs/2026-09-21-phase-w-complete.md) retain their evidence.
Phase W placed ed8330a on both staging web aliases; the approved CORS/API redeploy
kept f94a1d9 application source. This is not cumulative mixed-source acceptance.

Replacement native acceptance remains incomplete. The latest bounded read of
Prepare native replacement validation found it idle after C7, not accepted.
Its committed packet/result at `f044c925d216c9caad201b2c4425bad878c0472c` records
C7 stopping before UI on an unavailable host executable-path lookup, consumed
allowances, no C8 authority and separately verified local diagnostics. Original
refresh/AppHang issues and links/exports, physical association/auth, Android and
N2 gates remain. [Read provenance](evidence/capability-link-review-2026-09-24/manifest.json)
binds the exact inspected native files. No native operation or retry ran here.

The September 30 dependency boundary is unextended. Production and old immutable
artifacts are outside the replacement dependency disposition. Cohort controls are locally implemented; production configuration, distributed TestFlight/Play
acceptance and beta activation remain roadmap work. Canceled security scans stay
canceled; no broader cohort or release readiness is claimed.
