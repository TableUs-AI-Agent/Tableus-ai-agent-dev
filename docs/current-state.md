# Current state

Updated 2026-09-25 for external deletion help and support preparation. Brian
owns all development at this stage. The owner approved this work in parallel
with native validation; only [this worktree's active packet](task-packets/active.md)
directs work here. Native evidence remains tied to its original candidate.

## Working identities

| Role | Value |
| --- | --- |
| Active branch | `codex/deletion-support` |
| Active worktree | `/Users/brianchei/.codex/worktrees/deletion-support/Tableus-ai-agent-dev` |
| Implementation base | `838244aa4ba08cd67859a68d8f25b4d339476a74` |
| Current support application | `f3efa7a28010454275bf3b32ec52fc43792fdaee` |
| Prior deletion-content application / verification source | `72c592b511bba6b74bba2521524c6111b9cf5916` / `390cd2f7531dbc955317556b3693546ee3eadead` |
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

Replacement native acceptance remains incomplete. The bounded packet read at
`246853f219b4567be12f1cd949a517c4a41ba5e7` records C9 prepared, not approved
or executed. C8 remains a 17.514-second collector diagnostic pass with no
application acceptance; C7/C8 are closed and create no reusable allowance.
Application remains `8972865`, build operator `16603dd`. The existing native
task owns its Settings-baseline/conditional offline-refresh campaign and all
remaining application/platform/AppHang, physical links/Auth, export, Android
and N2 gates. [Immutable packet snapshot](evidence/production-release-spec-2026-09-25/native-active-at-246853f.md)
preserves exact proposal ownership and limits. No native action occurred here.

The [prior cumulative acceptance plan](cumulative-release-acceptance.md) selected
`4846325`. Current application `72c592b` adds deletion provenance, cleanup, replay
fencing and client repair. That plan must be rebound and its affected acceptance
expanded before execution; older checks do not accept the new bytes. Native
diagnostic tooling remains separately bound.
Production mobile builds are deliberately disabled until production origins and
signed OTA policy are committed. Production configuration/retention preparation
can proceed in parallel with native work; actual deployment/grants/scheduler,
installed adoption and real-device availability remain unverified.

The September 30 dependency boundary is unextended. Production and old immutable
artifacts are outside the replacement dependency disposition. Cohort controls are locally implemented; production configuration, distributed TestFlight/Play
acceptance and beta activation remain roadmap work. Canceled security scans stay
canceled; no broader cohort or release readiness is claimed.

## Production configuration and retention specification

The [production specification](production-release-spec.md) and
[retention/support specification](retention-support-spec.md) are prepared with
source hashes, read-only hosting metadata and current official store/update
references. Their original source snapshot remains historical. Separate production and
staging, with OTA disabled initially, is a recommendation awaiting the owner's
environment choice, not an adopted deployment decision.

Read-only inventory finds the TableUs staging API, an empty production-named
Railway environment, and only TableUs Staging in the connected Supabase inventory.
Saved deployment metadata identifies TableUs Vercel project
`prj_lPu3pWZiJ5ZRUIab6wiXrJIW930G`; targeted connector retrieval returns 404.
Current access/existence and web alias/production configuration remain unverified. Existing `links.table-us.com` staging use
requires an explicit transition before production; do not repoint it during
native validation.

The owner approved [shared-content deletion](deletion-content-design.md). Both
deletion APIs now preserve shared plans and remaining members' inputs, remove
authored metadata and dependent historical/current results and votes, and require
explicit organizer metadata repair plus fresh recommendations/votes. Complete new
run provenance distinguishes independent surviving results. Unknown legacy content
is conservatively removed when a current member deletes; already-deleted legacy
contributors still require a separately scoped inventory/remediation. Departing
actors' free-text event payloads are cleared. In-process response replay bodies
are invalidated after commit while consumed keys remain; stale responses return
a refresh-required 409 without repeating the write. The cache is still bounded,
process-local and not durable across restart. [Implementation handoff](handoffs/2026-09-25-deletion-content.md)
binds completed local readiness: **214 Python and 313 JavaScript tests, zero skips**,
lint/types, generated contract, Next/Expo-web builds and deterministic smoke; three
production-build mocked Chrome journeys pass. The initial readiness assertion
failure and successful continuation are recorded. No hosted or native acceptance
is implied.
Retention periods, provider/backup settings, secure support completion and the
hosted external deletion-request path also remain unverified. No release, resource,
secret, retention duration or production acceptance was approved by this work.


## External deletion help and support

Public `/account-deletion` and a matching mobile help screen offer an explicit
privacy-email request path, selectable-address fallback and optional Account and
data navigation. Auth/privacy/account screens link to help; deletion recovery does
not block it. Shared copy distinguishes request receipt, accepted deletion, pending
Auth and completion, explains shared-content treatment and pseudonymous retention.
Brian adopted acknowledgment within two business days; completion estimates follow
verification and blocker assessment. No new authentication or deletion API is added.

The [support procedure](deletion-support-procedure.md) covers verification, exact
case/job binding, duplicate requests, pending/attention/completion and privacy-safe
correspondence. Publication remains gated on actual mailbox coverage, approved
retention notice and a rehearsed secure assisted-completion path. In particular,
the current worker finishes existing jobs; it cannot initiate deletion for an
email-only requester without authenticated access. An email alone cannot map a
completed deletion back to its cleared Auth subject. These gaps are recorded,
not treated as solved by a help page. No mailbox/account operation occurred here.

Local implementation is complete. The [support handoff](handoffs/2026-09-25-deletion-support.md)
binds 317 JavaScript/214 Python checks with zero skips, completed local readiness,
two final-production-build mocked Chrome journeys and desktop/phone-width review.
Initial test/setup failures and final style-only checks are recorded by exact SHA.
Nothing was published, merged or deployed; native acceptance remains separate.
