# Current decisions

Consolidated 2026-09-21; pilot direction reconciled with Brian on September 26–27.
This index contains durable choices; run progress belongs
in evidence and the active packet. The [full prior decision log](history/2026-09-21/decisions.md)
is retained with original dates and superseded decisions. Consult it by topic
when changing a subsystem; it is not a second active task packet.

## Pilot realignment — adopted 2026-09-26

Brian reviewed project direction with the development agents and adopted these
choices, which take precedence over earlier entries where they conflict:

- **Next milestone:** a staging pilot in which real groups, starting with people
  Brian knows, complete real dinner decisions on web, iOS and Android. TestFlight,
  Play, production and cohort expansion follow the pilot.
- **Beta scope:** only the shared-plan decision (invite-approved sign-in, plans,
  constraints, four options, ranked votes, organizer finalize/reopen). Discover,
  Friends, Reviews, Taste/profile and photo analysis are hidden from navigation,
  not deleted. Each diner uses their own account and constraints; learned tastes
  are deferred. Plans/Account and required auth/join/privacy/help routes remain.
- **Participation:** preserve organizer discretion to finalize before all votes
  arrive. A successful pilot decision needs at least two independent diners'
  votes; this is a measurement rule, not a new API quorum requirement.
- **Pilot candidate:** consolidate on `4a2f9ec` and merge it to `main`, then
  deploy one staging candidate with recipient-bound invites and durable quotas
  active. Review the cumulative diff and pass hosted CI before an approved merge.
  Navigation and measurement work produce the later pilot candidate. The initial
  September 26 choice to leave full deletion off is superseded by the September 27
  follow-up below. Fragment emission stays off. Shared-content cleanup and
  plan-management controls apply independently of the full-deletion flag.
- **Native acceptance for the pilot:** one signed internal build per platform on
  real devices with startup/relaunch, auth/links, the shared decision, session/
  sign-out and airplane-mode/visible retry checks, plus the bounded lost-response
  check defined below. The long automated iOS simulator campaign
  is not a release gate; its tooling stays on `codex/native-replacement-validation`.
  Preserve prior refresh, initialization, AppHang and driver findings and explicitly
  resolve or disposition them on the selected candidate. A user-blocking failure
  stops pilot use; old staging acceptance does not transfer. All three platforms
  must pass before invitations and be represented in pilot use. The AppHang symbol
  requirement below still applies before TestFlight/Play.
- **Success targets (confirmed, unmeasured):** within three weeks of the first
  invitation, at least five real groups beyond Brian and test accounts finalize a
  plan with at least two distinct votes, at least half of eligible plans with a
  second participant reach that outcome, and every organizer is asked whether
  the group went and would use TableUs again. Use bounded database aggregates and
  organizer follow-up; anonymous process-session telemetry cannot measure this
  cross-person funnel. Definitions and unknown-outcome handling live in the roadmap.
- **Evidence and documents:** formal source-bound evidence at gates (merge, staging
  deployment, native pilot builds, distribution, cohort activation). Update
  current documents in place; stop per-phase snapshots into `docs/history/`.
  Summarize routine checks and retain useful failure diagnostics and source/
  artifact bindings. This is not permission to discard evidence or rerun expired
  allowances. Reuse suitable workspaces for sequential work; isolate when needed.
- **Agent guidance:** repository instructions are agent-neutral. Brian decides;
  the agent leading a task owns integration and handoff. Codex model and subagent
  defaults stay in `.codex/`. This supersedes the 2026-09-22 GPT-6 roles entry.

### Pilot follow-up — adopted 2026-09-27

- **Deletion activation:** use the built self-service deletion for the pilot.
  Priority 3 provisions the server-only Auth-removal credential and separate hosted
  worker under explicit approval, follows [operations](account-lifecycle-operations.md),
  enables `TABLEUS_ACCOUNT_DELETION_ENABLED=true` in the required processes and
  rehearses only with approved synthetic accounts. Accept compatible clients,
  organizer-blocker resolution, pending/retry/completion behavior and truthful
  privacy/retention copy before invitations. The existing default remains off
  until activation; planning approval does not provision or deploy anything.
- **Email-access loss:** Brian explicitly accepts that a participant who loses
  access to their sign-in email may be unable to complete deletion until secure
  account recovery or assisted verification is available. This is limited to the
  bounded pilot of people he knows, with a working support contact and escalation
  path. An email request alone neither initiates nor proves deletion. This removes
  the assisted-initiation blocker for this pilot only; revisit before expansion
  or store distribution. It does not waive normal deletion or retention checks.
- **Participation measurement:** add `distinct_voter_count` from the active run
  to `plan.finalized`, without a new quorum rule, voter identities or analytics
  service. Account deletion rebuilds payloads from a strict allowlist; explicitly
  preserve the validated numeric count even if the candidate/run is gone, and
  test that cleanup path and its earlier-finalization measurement. A read-only
  query counts each eligible plan once even after reopen/re-finalize. Whole-plan
  deletion removes its events. Brian accepts exact counts for retained,
  instrumented plans with missing historical/deleted coverage disclosed; no
  deletion-surviving aggregate storage is required for this pilot.
- **iOS roster and later devices:** collect pilot iPhone device IDs before the
  first signed iOS build and verify the profile includes them. A later device may
  use an approved re-sign of an accepted IPA. Reuse prior behavioral acceptance
  only when application payload/configuration and behavior-affecting entitlements
  are verified unchanged apart from signing/provisioning metadata. Inspect and
  bind the new artifact, then install and launch it on the added device. This is
  not a full re-acceptance; changed or unproven application inputs require impact
  review and affected checks. Re-signing is still a gated distribution action.
- **Bounded recovery proof:** physical devices cover airplane mode and visible
  retry. One candidate-source `mobile-offline-e2e` run on a declared platform
  covers dropped-after-commit responses for create/finalize. It requires the
  matching local test profile, deterministic backend and fault proxy, not the
  signed staging pilot artifact. Scope any extra test build separately; do not
  enable the old extended refresh campaign or infer physical/both-platform proof.

These decisions set release requirements; they do not authorize external actions
or replenish closed native/live-provider allowances.

## Product and platform

- Invite-only US beta across Next.js web and one Expo Router iOS/Android app.
  Platform UI is separate; only API-client and domain packages are shared.
- FastAPI `/api/v1` owns product data/authorization; Supabase clients are auth-only.
  Supabase Postgres, Railway API and Vercel web remain the hosting architecture.
- Plans support 2–8 people, four grounded options, top-three Borda voting (3/2/1),
  organizer finalization/reopening and rotatable private links. Finalized plans
  reject new joins, constraints and regeneration until reopened.
- Native beta is 2D; maps/3D, broad redesign and new provider/framework work are
  deferred. Application inference remains Gemini.

## Authentication, data and privacy

- Email-bound invite validation precedes first OTP sign-in; returning users need
  an existing approved application profile and consume no new invite. The API
  profile, not the Supabase session alone, authorizes product navigation.
- Web signup recovery treats verified Auth and application enrollment as separate
  steps. Confirm the same email/subject with server-side Auth user lookup before
  resuming; do not replay an already-consumed OTP. On an expired redemption grant,
  reconcile membership before normal revalidation of the original bound invite.
  Other failures remain explicit; account mismatch requires local sign-out.
  Server invitation, quota and deletion checks remain authoritative. The owner separately approved its PR #11 staging deployment and exact recovery
  allowances; this behavior does not authorize unbounded retries or resends.
- Trusted invite issuance designates one normalized recipient email and one use.
  Only its hash is retained. Hosted validation, signup hook and first redemption
  reject legacy unbound or multi-use codes; migration retains all existing rows
  and approved-account access. Do not infer a recipient from old reservations.
  Reissue unused legacy invitations only within an approved invitation rollout.
  Same-account successful redemption retries remain idempotent; revocation stops
  new intake, not existing account access. See [operations](recipient-invites.md).
- One mobile auth coordinator owns restoration and transitions. Persist only
  expiring redemption state, never invite/OTP material. Credential lookup,
  refresh and response-body work are bounded; failed restoration offers retry.
- Sign-out explicitly uses local scope; clear local state on success and show a
  sanitized retry error on failure. Subject transitions clear private caches.
- Queries stay in memory. Writes are not queued or automatically replayed;
  ambiguous failure retains the original payload/idempotency key for explicit
  user retry. Android transparent connection retry is disabled.
- Runtime database credentials are least-privilege; migration credentials remain
  separate. Client Data API roles do not receive application-schema access.
- Export excludes credentials, invite/share tokens and provider secrets. On
  September 24 the owner approved preserving shared plans through explicit
  transfer to another approved participant, allowing explicit removal of
  sole-participant plans, and full self-service account deletion with durable
  recovery. Existing application-only deletion remains compatible; the new full
  workflow is separately opt-in and must report pending versus completed truthfully.
  Provider credentials stay server-only. Production retention windows, deployment
  and client rollout remain separate work; backend readiness alone is not release acceptance.
- On September 25 the owner approved preserving shared plans and remaining
  members' inputs while removing the departing account's authored metadata and
  dependent recommendation results. Affected choices/votes/finalization reset;
  the surviving organizer explicitly replaces removed title/location and members
  request fresh recommendations/votes. No automatic provider call accompanies
  deletion. Run dependencies include requester, all participant inputs and the
  authored location. This supersedes preserving affected candidates across
  deletion. Legacy provenance remains unknown until proved or explicitly remediated;
  no bulk real-data cleanup, retention duration or hosted activation was approved.
  See [implementation design](deletion-content-design.md).
- Full deletion removes the application profile and records its Auth-removal job
  atomically. A stable namespaced subject hash prevents stale-token re-redemption;
  raw Auth subject is retained only until confirmed removal. The minimal completion
  tombstone remains until a separately reviewed purge policy can preserve that
  guarantee. No backup/log deletion deadline is promised by this implementation.
- Places persistence retains Place IDs and user-owned labels, not provider display
  fields, coordinates or content. Live details are transient and refreshed on demand.
- Canonical links use `links.table-us.com`, exact `/auth` and `/join/*`; auth
  confirmation stays web-only. September 25 adopted current-link joining by
  approved members and bounded client capture; the earlier
  [proposal](capability-link-decision.md) is historical. Fragment emission stays
  off for the pilot. Initial-request exposure from legacy query links still needs
  candidate-specific hosted handling/risk review; no production acceptance follows.

## Reliability, providers and telemetry

- Local/CI providers are deterministic. Live Places/Gemini use explicit bounded
  approvals. Gemini remains pinned to `gemini-3.1-flash-lite` through
  `google-genai==1.75.0` and the existing Agent Platform transport. Keep strict
  local schema/privacy validation and no silent fallback. Historical accounting
  rates/quotas are recorded configuration, not a fresh provider-price assertion.
- One API process owns bounded idempotency, provider reservations and JWKS refresh
  coordination. Plan mutations row-lock current state and replay rechecks access.
  Horizontal scaling requires durable coordination. JWKS key-set cache is bounded
  to five minutes with no indefinite per-key cache.
- Request admission enforces transport/global limits and body caps before auth,
  parsing and provider work. CORS is inside that boundary. Hosted builds reject
  demo modes, unapproved origins and insufficient runtime credentials.
- Mobile plan detail does not poll. Hidden mobile routes unsubscribe, foreground
  refresh is coordinated, explicit refresh coalesces reads and scrolling triggers
  no refresh. Web polls a provider-free revision and refreshes changed plan detail.
  Previous saved votes, unsent changes and fresh submission success are distinct.
- PostHog is anonymous and allowlisted with a random process-memory UUID: no
  account identity, persistence, person profiles, GeoIP, autocapture or replay.
  Sentry is error-only with private data scrubbed; no tracing/profiling, replay,
  attachments or breadcrumbs. Canary delivery must be observed per platform;
  each mobile canary also sends one API companion and both count against the cap.
- Durable per-actor quotas, lifetime creation counters and operator-only usage are
  implemented by the cohort-control objective below. Actual cohort sizing, invite
  reservation policy and retention still require release review before expansion.

## Native builds and evidence

- Keep CNG source in Expo config/plugins, not generated iOS/Android projects.
  The current candidate pins Expo 57.0.23 and an attributed adaptation of the
  experimental scene plugin; actual generation and SDK 27 artifact checks guard
  iOS startup compatibility. No general SDK migration is approved.
- EAS CLI is locked at 23.2.0. Native builds are sequential, exact-source detached
  builds with frozen dependencies, bounded workers and durable private outputs.
  Receipts bind source/lock/artifact/inspection/signing; inspect again before use.
- Deterministic test profiles alone allow demo identities and loopback transport.
  Readiness profiles are staging-only, production-shaped and have no E2E controls.
  Telemetry canaries use separate gated profiles. Inspect signed native transport,
  not just Expo config. Preserve failed attempts and distinguish harness failures.
- Physical iPhone link acceptance requires observed taps; simulator results do
  not substitute. Owner reports, UI observations and server aggregates retain
  their actual provenance. A passed mocked test is not live session proof.
- Application source, operator tooling and evidence commits are distinct. Reuse
  matching bytes; never relabel older artifacts. Staging source-review version two
  binds accepted report and owner approval to immutable candidate/file hashes.
  Legacy scan records keep their original meaning. No new scan without approval.
- The September 26–27 pilot decisions replace the long campaign with signed
  physical-device acceptance and one bounded local lost-response run. Other
  simulator/emulator flows are optional; recovery coverage and residual-risk
  handling are defined above.

## Production and operating boundaries

- Priority 1 integration must not activate a deployment. Repository Vercel Git
  deployment is disabled for `codex/pilot-realignment` and `main`; use separately
  approved deployment operations for the staging pilot. Other branches retain
  existing behavior and require trigger review. September 27 readback found no
  Railway triggers or PR environments; recheck before merge. This implements the
  already agreed separation between integration, staging and production.

- Production trust origins, signing, store associations and credential policy are
  separate gates. Expo Updates remains disabled until signed-update authority is
  approved. Local source-map/native-symbol upload exception does not apply to stores.
- The [September 21 dependency disposition](evidence/dependency-toolchain-2026-09-21/README.md)
  replaces the blanket toolchain exception for the remediated graph only. Zero
  critical/high npm findings; retain UUID, diff and EAS new-project deep-merge
  advisories only for the documented unaffected/unused call paths. Reassess on
  graph, consumer or input-trust changes. No extension beyond September 30 or
  production for the old frozen graph. Local remediation does not patch staging.
- Keep Next on the reviewed 16.3.5 patch; preserve EAS 23.2.0 with scoped patched
  transitives and its nested minimatch 9 consumer. The root decoder adapter keeps
  Expo Router 57/query-string 7 compatible with unmodified upstream decoder 0.5.0;
  Node >=22.12 <23 is required. Remove the adapter when supported upstream packages
  provide the compatible fix. Broader Expo patch alignment needs affected native
  evidence; eight current recommendations are not waived Doctor checks.
- Brian Chei owns legal/contact review and rollback. Preserve the August 26
  legal/attribution/mailbox attestations unless their scope changes. Contact
  details and Google's unmodified attribution assets remain source-controlled.
- Explicit gates remain for merge, resources, secrets, paid AI, production
  migration, deployment, stores, destructive cleanup and significant product or
  architecture decisions. Approved routine reversible work proceeds without
  repeated permission. Staging acceptance does not authorize a cohort.

## Task lifecycle — adopted 2026-09-21

Partly superseded 2026-09-26: reuse worktrees for sequential work unless isolation is needed,
and model roles follow the agent-neutral guidance above.

Use one bounded feature/fix per conversation and named worktree. Keep current
state concise, detailed observations in evidence and a compact commit-based
handoff for the next task. Read a referenced previous task before relying on it;
retrieve only needed turns. The 2026-09-22 model policy below supersedes the
initial single-agent restriction. Preserve
budgets/approvals across tasks and distinguish measured usage from assumptions
about model cost. See [development workflow](development-workflow.md).

## Staging closeout — accepted 2026-09-21

The owner accepted the single unexplained iOS simulator AppHang as an unresolved
**isolated-staging** risk, with usable native symbols and a focused diagnostic
check required before TestFlight/distribution. Recurrence, physical-device
occurrence or a blocked user action reopens investigation. This is not a fix
or production acceptance. [Risk acceptance](evidence/ios27-staging-f94a1d9/apphang-staging-acceptance.json).

The original Android session renewed after simulator-local sign-out; provider
usage remains within the approved run limit. The cumulative validator passes for
f94a1d9. Preserve all prior failed/pending evidence and reuse the earlier passing
`make ready` for this documentation/evidence-only completion; no executable bytes
changed. The [staging handoff](handoffs/2026-09-21-staging-closeout.md) remains historical
evidence. Continue from the [dependency handoff](handoffs/2026-09-21-dependency-toolchain.md)
for replacement-candidate review, not stale main.

## Replacement rollout — Phase W completed 2026-09-21

The [impact review](evidence/dependency-rollout-2026-09-21/README.md) freezes
application ed8330a and keeps API/native f94a1d9 identities during a proposed
web-first patch. Mixed component evidence cannot satisfy the existing single-SHA
cumulative validator; do not relabel reports or weaken it. Brian approved only
[Phase W](evidence/web-dependency-rollout-2026-09-21/approval.json): one exact-source
CI, one Preview and conditional staging aliases, with no live allowance.
The owner also approved the [publication amendment](evidence/web-dependency-rollout-2026-09-21/publication-amendment.json):
temporary Preview pause, exact-ref publication, branch stamps and empty Sentry
upload token, then restore Preview triggers. It is executed with one passing CI
and one READY Preview. A subsequent owner approval authorized the exact-origin
CORS append and one existing-source API redeploy. Both staging aliases now serve
ed8330a; production/native remain unchanged. Railway rebuilt f94a1d9 with the same
pinned inputs into a new image, which retains its own identity and fresh
readiness/CORS evidence. Per-alias assignment did not change project settings or
domain bindings; future production deployments may reclaim unbound aliases.
The [completion evidence](evidence/web-dependency-rollout-2026-09-21/activation.json)
does not authorize more deployments, live use or production exposure changes.
Native diagnostic retention uses a separate committed operator SHA and durable
private per-attempt storage, including failed/interrupted runs. Preserve existing
version-two receipts; the diagnostic inventory binds their raw hashes to the
application and operator identities. Missing diagnostics remain explicit and
retained files alone do not establish usable symbolication. Local symbol matching
and an app-frame resolution check precede the focused export/relaunch diagnostic;
store symbol upload/delivery evidence remains separately gated.

## Native private-link decoding — N1-F1, 2026-09-21

Validate owned join links from the original query before Expo native extraction,
normalize them to internal paths, and consume already-decoded route parameters
without another URI decode. Preserve valid capability text exactly; reject
ambiguous duplicate tokens, malformed encoding and non-string route values before
any join write. Exercise the actual native extractor, active parser, public hook
and join-button/API boundary in local regressions; the legacy decoder alone does
not establish native link behavior. [F1 evidence](evidence/native-replacement-validation-2026-09-21/n1-f1-result.md).
This local decision does not establish OS association delivery, clear historical
crashes or authorize a native rebuild; freeze changed application bytes separately.

## GPT-6 development roles and completion — adopted 2026-09-22

Superseded 2026-09-26 by agent-neutral guidance; the Codex defaults remain in
`.codex/` for Codex sessions. Retained for history.

The owner authorized Astra (`gpt-6-astra`) as primary orchestrator and final
technical authority, Sol (`gpt-6-sol`) as the implementer for most work, and Luna
(`gpt-6-luna`) for narrow summaries/extraction. Root defaults remain Astra; child
defaults are Sol/medium, with a Luna/low read-only role. Astra retains the existing
reasoning preference, coordinates at most two children, reviews outputs and owns
integration. These defaults may be overridden by explicit task settings; no
claim is made that editing a file switches an already running task. Current
mixed-model work uses explicit model selection and bounded context.

Standing delegation and routine implementation/check/repair authority replace
per-step permission. Finish the authorized outcome and prepare concrete gated
actions before seeking any still-missing approval. Preserve the existing external /
destructive gates, exact native candidates, stop conditions, attempt limits,
closed live budgets and canceled scans. Load current documents by relevance,
keep agent briefs concise, and validate development configuration directly;
unchanged application bytes do not need another full suite or native build.

Use stable role/context prefixes and bounded follow-ups to avoid unnecessary
context churn. Codex controls its request caching; no API-only cache setting or
savings claim is added to project configuration. There is no application OpenAI
API integration to migrate in this change; do not alter Gemini or its budgets.
[Implementation, sources and verification](evidence/gpt6-development-workflow-2026-09-22/README.md).

## Substantial objectives and combined approvals — adopted 2026-09-24

Still in force for packaging work and approvals. The native campaign it refers to
is no longer a pilot gate as of 2026-09-26.

The owner requested sustained work toward broader, complete objectives with fewer
approval interruptions. Investigation, supported local fixes, verification,
evidence review and documentation are one continuous authorized workflow.
Individual tests, findings and commits are progress checkpoints, not completion
or approval boundaries. Connected native stages should be prepared as one
concrete campaign with explicit prerequisites and aggregate/per-stage limits;
root inspection and passing stage transitions require no further confirmation.

This changes how work is packaged and carried through, not what counts as evidence
or authorization. Preserve exhausted native allowances, first-failure stops,
exact candidate/device binding, unresolved failures, closed live budgets and the
existing external/destructive gates. Complete independent work before returning
with a concrete remaining gate. Native validation remains in its current task
until that objective completes, as the owner separately instructed.

## Account-management clients — 2026-09-24

The owner requested continued parallel development after the backend handoff.
Web/mobile screens use full self-service deletion when the server enables it;
unavailability is explicit and does not fall back to application-only deletion.
Deletion intent/status gates private navigation and survives loss of the profile.
Unknown outcomes require reconciliation, not a claim of success or unchanged
data. Auth session loss cannot imply completed deletion. Status is subject-scoped.

Account plan management exposes only owned-plan and participant identity/display
metadata. It must not hydrate restaurant candidates or call Places; ownership
transfer uses the same minimal response. This changes the newly added, undeployed
transfer contract; existing full plan endpoints retain their contract. Local
implementation is separate from hosted activation and affected native acceptance.

## Lifecycle runner readiness — 2026-09-24

Verify migrations and lifecycle races with a distinct restricted PostgreSQL
runtime role; SQLite and superuser-only checks cannot close these criteria.
CI now provisions disposable test roles and runs application checks as runtime.
Production/hosted database roles still require their own readback.

Keep deletion availability per process. To pause admission while draining, the
API has deletion disabled and a separately configured worker remains enabled.
Neither CLI preflight refusal nor a paused API retry may consume an unavailable
attempt. Aggregate worker status contains counts/ages only, not identity data.
The [operations procedure](account-lifecycle-operations.md) now prepares one finite
batch of three every five minutes on Railway (its minimum supported cadence), explicit attention recovery and stop thresholds;
no hosted scheduler or activation is authorized by this local completion.

## Cohort quotas and operator visibility — 2026-09-24

The owner requested this next independent development objective. Use durable
subject-digest counters: UTC-calendar-day logical live provider operations and
lifetime committed plan creations. Provider admission commits before dispatch;
ambiguous/failed attempts are charged. Creation debit commits with the plan;
rollback does not consume it, while transfer/deletion never refunds it. Existing
single-process global budgets remain binding; these counters do not authorize
horizontal scaling. Proposed configurable defaults 5/20 daily and 20 creations
remain undeployed and subject to activation review.

Seed surviving historical creations by earliest usable creation event, else
current organizer. The fallback is an approximation and can charge a successor;
deleted history is not recoverable. Preserve precise prospective accounting and
review baseline impact before quiesced hosted migration. Counters are private,
pseudonymous and retained across profile deletion; no purge promise is introduced.

Require an approved authenticated profile and an exact server subject allowlist
for aggregate provider usage. Default empty denies everyone, and time windows
are 1–30 preceding days. Configuration grants/revocations take effect when API
processes receive the configuration, not by client role claims or instant env
hot reload. Hydrate vote/finalize/reopen responses before mutating, so a quota
failure cannot be reported after the write commits. The [cohort contract](cohort-controls.md)
records resource semantics and remaining gates.


## Private plan links — adopted 2026-09-25

The owner said continue with the recommendation: retain plan joining by an
already-approved TableUs member holding the current forwarded link. Account
invitations remain recipient-bound; plan links do not become recipient-bound or
require organizer approval. Rotation revokes the old capability for new joins,
not existing membership. Server link lifetime is unchanged.

Capture valid query/fragment tokens exactly once into a bounded process-local
pending flow, scrub web URL data, and route native screens with opaque local
handles. Require explicit Join after authentication, bind to the observed account,
and clear on expiry/cancel/success/sign-out/account switch. Unknown writes use
provider-free membership reconciliation before another explicit attempt. No
exchange ticket, offline write queue, persistent capability or API schema change.

Prepare fragment emission behind a default-off client build setting. Do not
activate it until compatible web/mobile readers and installed cohort adoption
are accepted on the intended release. Legacy query links retain initial-request
exposure; release work must specify the transition/cutoff and organizer rotation
scope. Local implementation and mock checks cannot accept hosted logging,
platform association delivery or distributed clients. See the
[implementation contract](private-link-handling.md).


## External deletion requests and support — adopted 2026-09-25

The owner requested the next implementation after shared-content deletion:
a public `/account-deletion` request/help page, matching web/mobile explanations,
and a concrete support procedure. Keep the existing authenticated in-app flow;
email is an additional request path, not automatic deletion or public status lookup.
No new Auth mechanism, operator impersonation or privileged deletion endpoint.

Brian selected acknowledgment within two business days. Completion estimates
follow ownership verification and blocker assessment, with no invented purge
period. Mailbox coverage, secure assisted completion, actual retention settings
and publication require their own operational evidence. The [support procedure](deletion-support-procedure.md)
records those gaps and source-bound case handling; no real messages are authorized
by this local implementation.

## Priority 3 preparation — 2026-09-27

Brian authorized independent preparation in a fresh chat, preserving closeout
`810d410` above Priority 2 merge `462a7dd`. The named branch is
`codex/pilot-staging-readiness`; the complete approval scope subsequently granted
is recorded in [staging preparation](pilot-staging-preparation.md).

Queue-only admission is an optional operating mode: disabling inline Auth
attempts leaves transactional cleanup and durable status intact, with the
separately configured worker responsible for removal. Inline attempts still
default true; full deletion remains default off. This makes pending/drain
rehearsal possible without invalid credentials or artificial queue insertion.
Railway's five-minute minimum replaces the earlier one-minute scheduler proposal;
worker provisioning and that operating cadence remain part of the gated request.

Brian confirmed the controlled mailbox `brian@table-us.com`, four tagged aliases,
and general support at the same address. Keep `privacy@table-us.com`, which he
confirmed forwards to him. This is owner-provided routing information, not tested
delivery. Preserve two-business-day acknowledgment and no email-only deletion.

Local journey measurements support a proposed 40 Places/3 AI operations per day
for the bounded staging exercise. The validation maximum for global Places
attempts is 1,000 while the default stays 150. No live allowance or pilot-cohort
budget is adopted here; the prepared request separately caps actual attempts,
spend, fixtures and time. Brian subsequently approved that complete request for
`e5e7d13478aaea6f526f2de9e6978824a30c79c3`, including publication/CI/review/merge,
the four staging migrations, one API/web candidate and private worker, existing
server-only credential configuration and the four-account/six-invite rehearsal.
The combined incremental ceiling is $20 ($15 providers, $5 hosting); all narrower
attempt, email, worker and time limits remain in force. Approval does not permit
native builds, production, real invitations or legacy data cleanup. Retention
settings must be verified through normal authenticated access before publication
and rollout. Supabase Auth/schema/recovery readback is complete; TableUs Sentry and
PostHog plan/retention readback completed September 28. Those event-access windows
do not approve a retained-data purge policy. The routine signup template wording correction
preserves the configured OTP length and all delivery/security settings.


## Priority 3 rollout checkpoint — 2026-09-28

PR #9 merged as `2eefdc51345aeaa7951ffb343954c1669f9280c5`, preserving the
approved application's bytes and the full passing CI tree. All four migrations
and the bounded API/web/private-worker rollout completed. The existing server-only
removal key was provisioned privately to the restricted API/worker runtimes; no
key was created or rotated. Production and native releases are unchanged.

Railway now rejects TOML configuration for newly created services. The reviewed
worker command, Dockerfile, one replica and NEVER restart policy were applied
through normal service controls; the prepared TOML remains a reference, not the
new service's active configuration. No application source or provider was changed.
The schedule remains absent until supervised draining; startup processed zero
rows and counts as invocation one of four. See [Railway's transition](https://docs.railway.com/infrastructure-as-code).

The API is stopped again, with deletion admission off, while the private D fixture
expires naturally at `2026-09-30T02:48:54.780853Z` (September 29, 9:48:55 p.m.
Central). This initial single-session hold was superseded by Brian's split request
below. Resume after mailbox access and fresh source/role/queue/budget checks.
Reconcile aged-out usage and tighten the
global ceiling during the first already-budgeted admission restart; never reset
the independent 420-attempt allowance. Native acceptance and real invitations
remain later gated work.

## Split synthetic rehearsal — 2026-09-28

Brian requested “split the rehearsal.” Run session one before expiry once mailbox
and isolated browser operation are ready; defer natural-expiry rejection, B's
already-budgeted returning sign-in and B's final deletion to session two. Allocate
45 of the original 60 supervised live minutes to session one, retaining at least
15 for session two; stopped waiting time is excluded. All other limits, fixtures,
stop conditions and the exact deployed source remain unchanged. The private ledger
must retain cumulative usage across both sessions.

Session one pauses API deletion admission and drains only verified A/C/D jobs,
then verifies B's cleanup/repair and removes its sole plan. Stop the API, remove
worker scheduling and close only synthetic sessions during the interval. Session
two re-enables/resumes the same image, checks real expiry without OTP/account
creation, completes B's returning sign-in and deletion, then disables admission
and scheduling and stops the API. This retains the four approved configuration
restarts and four total worker invocations; splitting adds no source deployment,
account, OTP, provider or spending allowance. Acceptance remains open until both
sessions and final evidence pass.

Brian selected manual mailbox operation: he enters codes directly into TableUs,
never into chat. Prepare signed-out sessions on separate staging origins without
clearing legacy sessions. Verify tagged-alias delivery before signup, using the
already-scoped support exchanges if prior delivery is unconfirmed; no additional
mail allowance is created.

Eight marked support messages verified all four aliases and privacy forwarding;
Brian confirmed none missing after an initial uncertainty. Preserve the six
remaining messages for verified D challenge/reply, duplicate/ack and completion/
receipt. Session one's clock started with its first email. A local one-shot cutoff
removes scheduling and stops staging services before the fixed deadline without
another deployment. No-invitation, wrong-recipient and revoked-invite checks passed
before normal browser enrollment; all private codes remain outside chat/Git.

### Visible handoff correction — 2026-09-29

External browser use is an implementation choice for account isolation, not a
TableUs requirement. Brian could not see the tool-created rehearsal group; the
agent could not foreground it reliably. A's 20-minute reservation expired before
manual verification. The live session was contained early, with future admission
disabled without deploying and both existing API/worker images verified stopped.
No extra configuration restart or OTP was used. Forty minutes 11.955 seconds are
consumed, leaving 19 minutes 48.045 seconds of the original campaign.

Prepare owner-operated signup in a visible in-app tab first and verify that Brian
can see it before resuming any timer or requesting another code. The signed-out
links origin can hold A while preserving the legacy staging-origin session.
The form is filled but unsubmitted. No old reservation or session token is copied
between browsers. Reconcile the unfinished acceptance cases and expired grant
before further live actions; neither a fresh clock nor extra allowance is implied.

Brian subsequently confirmed the visible A form. The existing Preview's unique
origin provides a second in-app browser identity for B without clearing the legacy
session or creating another deployment. Adding that exact origin to API CORS,
45 more supervised live minutes and one additional same-image restart are proposed
in the [recovery packet](p3-rehearsal-recovery.md). Brian explicitly approved the
complete packet on September 29. The live-time ceiling is now 105 minutes and
configuration-restart ceiling five; prior usage is retained. All other cumulative
bounds and stop conditions remain unchanged. Apply the temporary exact-origin
CORS addition only at recovery resume and remove it during final disable.

Recovery restart 2/5 reused the exact approved image and passed source/readiness
and exact-origin CORS checks. The new segment receives the remaining 49 minutes
48.045 seconds of phase-one allocation, with its own cutoff; no prior elapsed
time is refunded. A's normal join flow revalidated the existing invitation and
sent one fresh code to the existing unverified Auth identity. No new account was
created. Keep the successful in-app handoff and require observable enrollment
before moving on to B. Browser pointer activation produced no request; after
readback established that fact, keyboard activation succeeded without a duplicate
email. This is an operator interaction observation, not proof of an app defect.


### Recovery cutoff reconciliation — 2026-09-29

The recovery cutoff ran while awaiting A's manual code entry. Later readback
verified API/worker stopped, no scheduling and admission off; A remains unverified.
The exact instance stop timestamp was not captured, so charge the entire allocated
recovery interval without claiming an exact measured stop time. Ninety of 105
approved live minutes are consumed; the remaining 15 are reserved for post-expiry
work. Do not reuse the expired code or automatically spend that reserve on the
incomplete first phase. Establish mailbox readiness and reconcile remaining scope
before any further OTP/restart. No additional allowance is inferred from a status
question, the existing approval, or elapsed stopped time.


### Auth email receipt diagnosis — 2026-09-29

Treat provider delivery status and owner-visible receipt separately. Brian reports
no OTP email; Resend reports both A messages delivered, with no recipient suppression
entry. The latest sender matches Brian's address and targets its tagged alias.
Google documents that self-to-alias mail may bypass Inbox, but that remains a
hypothesis until mailbox or recipient-side log evidence confirms it. Use a focused
all-mail search, then exact Message-ID trace if absent. Do not resend or change
SMTP/DNS/suppression settings based only on provider status or that hypothesis.
The prior support-mail receipt confirmation remains valid for those eight messages,
and does not prove receipt of the separate Auth emails.

### Auth email receipt resolved — 2026-09-30

Brian confirmed that the Auth code was received and that he had checked the wrong
inbox. Record owner-visible receipt as passed and close the missing-email diagnosis.
The self-to-alias hypothesis was not established; no SMTP/DNS/suppression change is
justified by this incident. Receipt alone does not establish verification or enrollment.
The old OTP and all four normal invitations have expired. Preserve the spent six-invite
allowance and 90/105 live minutes; prepare a revised signup scope before replacements
or a restart. The owner's correction does not expand campaign approval.

### Fresh invitation extension — 2026-09-30, approved

Prepare four just-in-time replacement invitations for the same A/B/C/D recipients;
retain old fixture history and A's existing Auth identity. The proposed cumulative
ceilings are ten invitations, 150 live minutes, seven same-image restarts and
45 status reads, with unchanged spending/other attempt limits. The spare restart
supports one interrupted manual OTP handoff; a five-minute handoff stall triggers
containment so another long unattended interval is not consumed. Brian continues
entering codes directly in visible in-app forms. No stored browser token extraction
or automated mailbox reading is introduced. The
[complete proposal](p3-rehearsal-next-attempt.md) was explicitly approved at commit
`a5f3de877f46673382b02ba69979eae12b295eb3`; only its four ceilings changed in the
ledger. Restart 3/7 reused the approved image, and A received a replacement invite
plus one requested code using the same unverified Auth identity. The five-minute
handoff cutoff subsequently stopped both services before verification. Charge time
through verified stop, retain the unused recovery resume, and wait for owner
readiness before spending it. Do not resend automatically or extend a reservation.
Hosted
replay/contention evidence stays open rather than claiming repeated UI clicks prove
it; neither criterion is waived by this proposal.

Brian subsequently confirmed readiness. A's Auth verification had succeeded while
the API was stopped, leaving no application membership and a visible network error.
Use the approved single recovery resume and one remaining resend through the normal
form. Its normal validation refreshes the reservation; no timestamp is manually
edited. Do not resubmit the consumed OTP or replace A. Restart 4/7 passed unchanged
image/readiness/CORS; the new code handoff remains subject to the second five-minute
cutoff, after which this attempt must stop for a new scope decision.


### Refresh web membership after signup redemption — 2026-10-01

Auth verification emits `SIGNED_IN` before the invitation redemption request
creates application membership. That early read can deny access legitimately;
a later successful redemption must explicitly refresh user context before
navigation or the private-join continuation. Bind both approval requests and the
refresh to the verified subject, and reuse version/subject guards so late results
cannot overwrite current approval. Do not infer membership from Auth alone.
Deterministic browser tests cover early and late denials and remain in CI.

A's hosted enrollment succeeded but its Plans screen failed. The second handoff
cutoff verified both services stopped, with admission/schedules off. The recovery
slot is exhausted and 44m52.328s remain, including 15 final-phase minutes. Prepare
the [changed-source web rollout and one resume](p3-signup-fix-rollout.md) for owner
approval; keep all
spent attempts/time charged and leave hosted acceptance open until retested.


Brian approved the complete [signup-fix rollout](p3-signup-fix-rollout.md) at
`9e9e939ed7000f9e19923dcbf112d2aaea2e37cc`: CI/review/merge, one additional
exact-source web Preview/staging-alias assignment and one same-image API resume.
Only Preview/restart ceilings rise to two/eight; time, spending and other attempt
limits remain. Keep services stopped during publication/build preparation, and
verify owner availability plus armed containment before starting the live clock.


The approved web rollout completed as merge `9593fba0202e830746523f29cee16532539e80a2`
and Preview `dpl_99cFtsd56wHCam5dN1EwW5XmTred`. CI passed including the new mocked
Auth regressions; production aliases and API/worker images are unchanged. Deployment
preparation consumes no supervised live time while those services stay stopped.
Wait for the requested owner-availability response before arming the next window;
no additional approval is needed for the already-scoped resume. Keep live signup,
group and deletion acceptance separate from the passing local/CI tests.


### Temporary rehearsal mailbox access loss — 2026-10-01

Brian reports that `@table-us.com` inboxes are temporarily inaccessible after not
renewing Google Workspace. Keep services stopped and remaining time/attempts intact
while the mailbox plan is resolved. The application imposes no recipient-domain
allowlist; fresh B/C/D invitations can bind other controlled addresses once Brian
supplies the intended replacements. Do not reuse old recipient-bound invitations
for a different email or replace A's identity. A's existing session is unverified
and cannot prove fresh sign-in. Support/privacy routing and challenge/receipt
acceptance remain unresolved while the original mailboxes are inaccessible.
No new recipient, provider, public contact address or authentication change has
been selected or authorized by the question about feasibility.


Brian subsequently supplied an accessible replacement inbox and authorized three
tagged aliases for the uncreated B/C/D accounts. Store personal addresses only in
the private operator record. New one-use invitations must bind those exact approved
recipients; old expired invitations are not repointed. Account/invite/OTP/time/spend
allowances do not expand. Resume the already-approved scope with these recipients,
preserving A's identity/session and recording its fresh-sign-in and original
support/privacy delivery gaps separately. No public contact-address change, admin
identity edit or authentication bypass is authorized.


The replacement-recipient resume reused the existing API image (restart 5/8).
A's preserved session passed Plans without another OTP. The five-minute handoff
cutoff then stopped the API before B verified its code: Auth succeeded but app
redemption could not run. B has no profile. Charge elapsed time through verified
stop and keep services stopped; no extra recovery was previously authorized.
Brian approved the [B recovery scope](p3-b-signup-recovery.md) at `eaa32ae`: one
extra same-image resume (ceiling nine) and ten-minute handoffs within unchanged
cumulative time/spending. Prepare all checks before sending the code and
hand off promptly. Record the OTP as consumed; preserve identity and allowance history;
use the normal form resend/revalidation after any approval. A session success
does not resolve fresh A sign-in or original mailbox support/privacy acceptance.

The approved B recovery used resume 6/9, completed normal signup, and verified
one profile/redemption plus Plans before clearing its handoff timer. The A/B
shared-plan exercise passed one recommendation and two voting rounds with a
changed winner. Reopen reused existing options, so do not claim a second live
recommendation call. Organizer deletion was disabled in the UI; no server-side
refusal or deletion request was exercised. Ownership transfer to B and natural
expiry rejection passed. Preserve these distinctions in acceptance evidence.

Stop at a useful checkpoint rather than issuing C/D codes with less than one full
handoff window outside the final reserve. Services are verified stopped at
`05:35:40.174199Z`; 18m14.050s remain including the 15-minute final reserve.
Preserve A/B sessions and the synthetic plan. No remaining counter is reset and
no extra recovery is inferred. A further first-phase resume needs a revised scope;
original mailbox support/privacy acceptance remains unresolved. No pilot launch.

### Inspect inbound routing before changing contacts — 2026-10-01

Current authoritative/public DNS returns no apex MX; Resend sending remains
verified. Keep the public support/privacy addresses and capture the DNS baseline.
Investigate Squarespace forwarding to the owner's privately supplied base inbox,
but prepare exact rules/DNS before approval. Existing Workspace eligibility and
unsupported plus-addressing may block the candidate, especially A's tagged route.
No catch-all, identity substitution, nameserver migration, paid subscription or
new provider is inferred from the request to continue. The remaining-test budget
is a draft only; services and the current cumulative clock remain stopped.


### Preserve sending DNS when restoring inbound mail — 2026-10-01

Authenticated Squarespace Email blocks forwarding because it detects existing MX,
while DNS Settings shows only the Resend `send` MX and no apex MX. Its Google
Workspace management notice is also present; the UI does not establish that
removing the MX would resolve every eligibility issue. Do not delete the sending
record as a diagnostic workaround. Keep all existing website and sender records.

Prepare ImprovMX Free as a separately approved alternative: explicit support and
privacy aliases to the owner's private base inbox, plus A's exact tagged alias
only if supported, two apex MX additions and one merged SPF edit. Do not activate
DNS until all three exact recipients are configured without a catch-all or paid
feature. Public documentation does not establish the tagged alias's behavior;
verify configuration and then delivery before claiming restoration. Introducing
a mail processor requires an explicit owner choice; no account was created,
private destination transmitted, DNS changed or probe sent during preparation.
The rehearsal extension remains a separate unapproved draft.


The owner approved the exact ImprovMX proposal at `ba5ec9546a1d668e0c2b91b52aa7af72e7f6be06`,
then asked if Squarespace itself could provide forwarding. Hold setup for that
choice without treating the question as approval to remove Resend DNS or change
A's identity. The ImprovMX landing page was opened but no private form submission,
account creation or DNS edit occurred. Existing rehearsal/probe limits remain.


### Bound the explicitly approved Squarespace MX diagnostic — 2026-10-01

The owner approved the proposed temporary removal and immediate restoration of
only the existing `send` MX. Check the restoration form and save the exact DNS
backup before deleting anything. Observe the Email control once, then restore
immediately (five-minute operational ceiling); on any unexpected flow, prioritize
restoration. Do not infer approval to create Squarespace forwarding, transmit a
new destination or run mail/OTP probes. The Add Record preflight triggered normal
Google reauthentication, so no deletion occurred. Continue after the owner passes
that check, with no repeated request for the already-approved diagnostic.


The approved diagnostic completed: removing the `send` MX cleared the existing-MX
warning but Add Rule remained disabled with the Workspace notice. Restore was
visibly verified 59.385 seconds after Delete, followed by all four authoritative
servers, two public resolvers and verified Resend sending status. Removing that
record alone is not a solution. Do not repeat the diagnostic or infer approval
to cancel Workspace. The exact additional eligibility condition remains unknown;
retain the existing sender configuration while choosing the receiving route.


After the diagnostic result, the owner explicitly selected continuation of the
approved ImprovMX recommendation. Its normal signup form was prepared with the
approved private contact, but password creation and displayed terms acceptance
are left to the owner. Do not ask again for the previously approved provider,
exact aliases or DNS scope. Confirm the tagged alias on the free tier before
activation; the separate mail-probe/rehearsal extensions remain unapproved.


The owner completed signup and signed in. ImprovMX Free is active, and the three
approved exact aliases persisted after reload, including A's tagged address.
The initial automatic catch-all was renamed before any DNS activation; none
remains. The provider's authenticated MX/SPF requirements match the approved
scope. Squarespace requested renewed owner Google verification before saving
any DNS edit. Do not broaden aliases or reset mail/rehearsal counters; after
verification, apply the approved DNS delta and verify configuration separately
from live delivery.


### Activate the approved ImprovMX route; keep delivery proof separate — 2026-10-01

After owner reauthentication, save only the approved apex MX pair (10/20, four-hour
TTL) and merge ImprovMX with Google in the existing single SPF (one-hour TTL).
All six DNS sources returned the exact values, 72 preserved-record comparisons
passed, ImprovMX shows Active and Resend sending remains verified. No catch-all,
SMTP credential, paid upgrade, Workspace change, service resume or probe occurred.

Prepare a separate three-message delivery gate: support, privacy and A's unchanged
exact address, one non-sensitive labeled message each from the existing verified
sender. The proposed gate raises support/test messages 14 to 17 and cumulative
supervised minutes 150 to 160, only for one probe/receipt window up to ten minutes.
It preserves the final 15-minute reserve and all other limits. The broader 195-minute
and extra-restart rehearsal draft stays unapproved. Receipt must be confirmed by
the owner; provider DNS or accepted/delivered status alone is insufficient.


### Approved mail probes, bounded accounting — 2026-10-01

The owner approved the exact three-message delivery test at
`1c42ca9a1ce5ed4875c413fe12b839868e591add`. SUPPORT, PRIVACY and A were each sent
once; all three Resend metadata checks reported **delivered**. Owner inbox receipt
is not confirmed for all three labels.
Hold the rehearsal; provider delivery alone does not prove owner receipt.

The supervised window ran from `2026-10-01T07:20:44.036274+00:00` to its
`2026-10-01T07:30:44.036274+00:00` deadline, charging 600 seconds. Ledger closeout
was recorded at `07:30:57.419244Z`; no provider action occurred after the deadline.
Cumulative use is **141m45.950286s of 160 minutes**, leaving
**18m14.049714s**, including the unchanged 15-minute final reserve.
Mail use is **11/17**, leaving six reserved rehearsal-case messages. Operator
status reads are **22/45**. The API/worker stayed stopped; no OTP, invitation,
restart, account, deletion or AI/Places operation occurred. All other limits and
counters are unchanged. The broader 195-minute/restart-10 scope remains unapproved.


### Owner confirms all three recovered mail routes — 2026-10-01

The owner replied “all three received” after the bounded probe window closed.
This completes SUPPORT, PRIVACY and unchanged A-address receipt evidence; preserve
the earlier unconfirmed-at-deadline observation as history. No resend, status read,
window or counter reset accompanies the confirmation. Forwarding does not restore
Google Workspace subscription or historical mailbox contents.

Prepare the remaining manual scope at 195 cumulative supervised minutes and ten
same-image API restarts, increasing current ceilings by 35 minutes and one restart.
With 141m45.950286s already used, the first phase is at most **38m14.049714s**, plus
**15 minutes** for the final phase. Validate both durations against the existing
cutoff before owner approval, without provider calls or arming a window. Retain
all other caps, six support-case messages and four exact remaining OTP requests;
no spare resend/recovery is added. The receipt confirmation does not approve
this rehearsal extension or final P3 acceptance.


### Owner approves and starts remaining manual rehearsal — 2026-10-01

The owner approved the complete remaining-case scope at `32ab7cd`; apply only the
195-minute and ten-restart ceilings, preserving all cumulative use and the final
900 seconds. Stopped preflight passed. Arm the durable cutoff before same-image
resume; restart 7/10 is verified ready. A's returning code was requested once under
a ten-minute handoff ending 08:00:56Z, within the immutable 08:26:43Z phase end.
Wait for owner normal verification; no replacement code, C/D enrollment, deletion
or extra recovery follows an unresolved handoff. The exact live state is in the
active packet and private ledger; verify automatic containment before reconciling
an expired window.


### Explicit replacement code after expired A handoff — 2026-10-01

Reconcile the automatic cutoff using its verified-stop timestamp before acting on
the owner's explicit replacement-code request. The expired first window costs
764.045910 seconds; do not charge the stopped overnight interval or erase the old
OTP reservation. Request exactly one replacement through the normal returning flow
at A's unchanged address. Keep API/worker stopped; authentication alone does not
complete the application's returning-login check. Conservatively reserve and charge
one ten-minute Auth-only handoff without extending any armed deadline or increasing
a ceiling. Preserve owner code entry and all legacy sessions. Current use is
164m29.996196s, OTP requests 9/11 and restarts 7/10. Before further rehearsal work,
reconcile the resulting shortage of one planned OTP slot and one recovery restart;
the resend request does not authorize those future changes or full P3 acceptance.


### Preserve verified Auth session during bounded API recovery — 2026-10-01

A's replacement code created exactly one session at 20:26:14Z while the existing
profile/redemption stayed singular. Treat the following network error as an API
availability failure, not a reason to spend another OTP. Preserve the session and
complete the normal membership check after source-identical API recovery. Prepare
one combined approval delta: restart ceiling 10 to 11, OTP requests 11 to 12 and
delivery reservations 10 to 11. Keep all elapsed usage, 195-minute/time and money
caps, and final 900 seconds. The remaining 930.003804-second first phase passes
the existing cutoff check; expiration leaves incomplete work rather than creating
a new allowance. See [the exact proposal](p3-session-recovery.md). No deployment or
ceiling change occurs before approval.


### Approved recovery resumes the verified session — 2026-10-01

The owner approved the exact recovery at `fa282f2`; raise only the specified
restart/request/delivery ceilings to 11/12/11. Arm cutoff before same-image restart
8/11. Readiness and both browser origins pass; A reaches Dinner plans and its
existing profile without another code. B's reopened context preserves its profile
and shared plan. Keep the final 900 seconds and immutable first-phase deadline
20:55:29Z, with containment at 20:53:29Z. Prepare A's confirmation but leave the
permanent account-deletion button to the owner, as the approved runbook requires.
Verify the exact durable outcome before claiming deletion or changing identities.


### Verify A pending deletion before moving to C — 2026-10-01

The owner initiated A deletion in the normal account UI. Bind its exact durable
pending row through the trusted Auth identity while the raw subject remains, then
preserve that mapping privately before local sign-out. Confirm profile removal,
zero worker attempts and no attention flag; do not call Auth removal complete.
Charge both status lookups, including the first locally unparseable response.
Issue C's one recipient-bound invite and single signup code only after A's local
session ends. C owner entry ends at the existing 20:53:29Z containment threshold;
no resend or deadline extension is implied. Keep the worker and all legacy
identities untouched until the bounded verified queue step.


### Verify C pending deletion and reserve D's last signup code — 2026-10-01

After the owner performed C's normal sole-plan/account confirmations, verify both
application removal and the exact pending job through its trusted Auth identity.
Preserve the private binding before normal local sign-out. A/C are the only pending
jobs; zero Auth attempts is evidence of pending work, not completion. Reconcile C's
six-attempt Places reservation to the two recorded calls before reusing headroom.
D receives the final invitation and exactly one allocated signup code, with owner
entry by 22:21:09Z and no resend. Keep the existing phase/final reserves and B's
separate browser origin. Bind D's support case before losing its session.


### Separate D account proof from support correspondence proof — 2026-10-01

D's successful normal signup and trusted confirmed-address lookup permit its own
account flow and preserve a private identity binding. They do not by themselves
verify incoming support email. Send the approved fresh challenge to that existing
address, reserve the owner's reply, and retain verification_required until Brian
confirms mailbox reply/receipt through the privacy route. Keep pending separate
from accepted email and from completed deletion. Owner confirms D deletion in the
normal Account screen; bind the exact queued row before discarding that session.


### Treat D self-forwarding receipt as unverified and contain — 2026-10-01

The owner replied from the destination Gmail inbox to the privacy alias forwarding
back to that inbox. ImprovMX reported a self-loop, and the owner had not received
the copy. This was a flaw in the rehearsal receipt setup, not evidence that normal
incoming forwarding failed. Preserve the earlier external-route proofs; do not
resend, change DNS, or claim verified support correspondence. Check Spam for the
already-sent reply. Under the approved unexpected-provider stop condition, close
the live window using verified service-stop time and preserve D/B sessions, A/C
pending jobs and unused allowances. Review the bounded remaining sequence before
any new API resume; do not silently repurpose a reserved restart.


### Separate transport acceptance from visible support receipt — 2026-10-01

ImprovMX's exact D reply log shows successful forwarding and Gmail SMTP acceptance;
the owner still found no copy in Inbox or Spam. Preserve both observations without
calling the support case verified or sending more self-loop tests. Prepare account
flow closure separately from the four uncompleted support messages. The proposed
restart reassignment fits the existing three slots by stopping processes before
final disable/CORS cleanup, with readback and no final live redeploy. It preserves
all ceilings, final time reserve and release gaps, and remains subject to owner
approval of the changed sequence; preparation does not authorize a resume.


### Approve the bounded account-flow closeout — 2026-10-01

The owner approved `f518c1bcc5eadf7f676c014dc22ffde8f9d1fefc`: use starts 10/11/12
for D resume, admission pause/drain and final B resume. Stop both processes before
final skip-deploy admission/CORS cleanup. No ceiling increases, support mail sends,
new accounts, invitations or web deployments are included. Exact trusted fixture
bindings and whole-queue checks precede each worker batch. Preserve support receipt
as unverified and retain every broader P3 acceptance gap.


### Preserve the cutoff after the D handoff expires — 2026-10-02

The owner reported the Account page not loading after the automatic shutdown.
Verify current stopped service/configuration and reconcile usage from the immutable
stop receipt; do not treat a loading report as approval to extend the clock or
repurpose the two remaining API starts. D deletion remains unobserved. Establish
its status before preparing a revised sequence, while both services stay stopped.
