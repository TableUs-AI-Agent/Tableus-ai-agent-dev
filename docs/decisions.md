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
The [operations procedure](account-lifecycle-operations.md) proposes one finite
batch of three every minute, explicit attention recovery and stop thresholds;
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
