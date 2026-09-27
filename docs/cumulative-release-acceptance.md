# Cumulative release-acceptance plan — September 25, 2026

**Historical proposal, superseded for the pilot on September 26.** The
[roadmap](roadmap.md) and [pilot checklist](release-readiness-checklist.md) now own
ordering and acceptance. Candidate `4846325`, C8 status, native task routing and
the execution sequence below are dated observations/proposals, not current
instructions. Retain useful migration/rollback and distribution considerations;
rebind source, hosted state and approval before reuse. The long simulator campaign
is no longer a pilot gate. This document does not restart it or override the
current active packet.

**Original recommended next outcome: accept one cumulative candidate in isolated staging,
then prepare production/store configuration and distribution.** Current feature
implementation is locally complete; mobile application acceptance and rollout
remain. Brian owns all development in this stage and release/rollback decisions.
Historical shared contributions remain shared. Native execution stays in
**Prepare native replacement validation**, task
`01a0c678-55c8-7cc0-a3cb-e3200776906a`.

This is a completed planning artifact, not an execution approval. It supplies
source choices, acceptance criteria, dependencies and a bounded promotion proposal.
Device/signing readback, current hosted inventory, native campaign limits and live
budgets must be bound before an execution packet is ready. No builds, tests,
simulators, live Auth/providers, migrations, deployment or shared Notion edits
were performed for this plan. Verification is read-only source/receipt review.

## Candidate choice and what changed

Use application **`484632517345e7858f48caf8fa7b128f9d9dab80`**, from completed branch
`codex/private-link-handling` at evidence commit
`ec4cf578bf7ea40f8ffefc64ee8dfc238e009a7e`, as the proposed **staging** candidate.
Its ancestry already includes lifecycle backend/clients/PostgreSQL operations,
cohort controls, recipient-bound invitations and private-link readers. No feature
merge is required to combine those changes. A merge to the integration/default
branch remains separately gated if that promotion path is chosen.

| Layer | Exact evidence / disposition |
| --- | --- |
| Local cumulative application | `4846325`: one full readiness pass, 196 Python / 311 JavaScript tests, zero skips; four mocked Chrome journeys against the production web build; contracts unchanged by private-link work. Reuse this evidence while application/tooling bytes remain unchanged. [Handoff](handoffs/2026-09-25-private-link-handling.md). |
| Native application under investigation | `8972865893a3f018a064594457dc9cc664f8a61f`; retained build `local-ios-test-8972865-f1-01`, build operator `16603dd0cf36d27b492e57a02d3c6c438a2563c4`. Its artifact does not contain the new features. |
| Latest inspected native evidence | `981e2f9e646ab51eb31cbe1868e1ce6ae615cf61`; C8 operator `ab38d27a9e2275d7b3a1716c3513adaab6b719e4`. C8 collector diagnostic passed in 17.514 seconds; **application_acceptance=false**, remaining native attempts zero. The task was active when inspected. [Immutable read snapshot](evidence/cumulative-release-acceptance-2026-09-25/source-snapshot.json). |
| Branch relationship | Common ancestor `bcc9e52d8c501dba9f51e881a7350c0959301255`. Native changes since it are diagnostic/tooling/docs, with no backend/frontend/mobile/shared-package application changes. The cumulative application already descends from native application `8972865`. Keep newer diagnostic tooling separately bound; do not merge all native chronology into the app merely to claim currency. |
| Historical deployments | API/accepted native `f94a1d9`; staging web `ed8330a`; production `e1184ec`, as recorded locally. These deployment identities were **not freshly queried** and are not cumulative acceptance. |
| Production/store suitability | `mobile/app.config.ts` explicitly rejects the production profile until production origins and signed OTA policy are committed. App version is still `0.2.0`; updates are disabled. A version string alone cannot prove reader adoption. This staging candidate is not a production release candidate. |

The old “C7 is latest / no C8 authority” summary is superseded by completed C8.
C8 did not test Settings, Maestro, TableUs, offline/refresh or platform links and
did not reproduce either earlier collector failure. The next native-owned work
is its fresh Settings baseline plus conditional offline/refresh campaign.
Do not interrupt or duplicate that preparation or retarget its retained artifact.

Dependency manifests, mobile app configuration and EAS profiles are unchanged
between native application `8972865` and cumulative app `4846325`, but application
JavaScript, authentication/account screens and shared contracts changed. Old
native artifact observations cannot validate those new bytes. Freeze any later
source adjustment separately and assess which checks/artifacts it invalidates.

## Reconciliation and affected acceptance

| Item | Current disposition | Evidence required on intended release |
| --- | --- | --- |
| Six-digit verification-code backlog note | Superseded as a fixed-length UI requirement. Both clients request the complete newest code and accept varying length. No new OTP format change is planned; actual hosted issuance/settings remain unobserved here. | Correct recipient invite, mailbox delivery/newest code, returning sign-in, bounded restore, sign-out isolation and explicit return to Join. [Web source](../frontend/app/components/auth-card.tsx), [mobile source](../mobile/app/auth.tsx). |
| Full account lifecycle | Locally implemented; activation still relevant. Export, organizer transfer/removal, subject-scoped deletion status and durable Auth-removal worker exist. | Actual hosted restricted grants, queue/worker/credential health, affected web/iOS/Android management and interrupted deletion recovery, and approved retention/support disclosure. Keep API flag off until these pass. [Operations](account-lifecycle-operations.md). |
| Cohort usage and invite admission | Locally implemented; defaults are proposed, not an approved cohort budget. Recipient-bound one-use issuance and operator-only aggregates exist. | Actual hook/grants, intended vs wrong recipient, revoke/expiry/retry/returning account, quota limits in realistic journeys, operator allowlist and baseline review. Single API process remains required. [Cohort](cohort-controls.md), [invites](recipient-invites.md). |
| Private plan links | Sharing policy resolved: approved members can join via forwarded current links. Readers/lifecycle/recovery implemented. Fragment **emission remains off**; rollout relevant. | Hosted headers/log policy; canonical cold/warm and signed-out links; once-only decoding; explicit Join after auth; cancel/expiry/account switch/remount; rotation and existing-member recovery on installed candidate bytes. [Contract](private-link-handling.md). |
| Native replacement | Diagnostic progress, application acceptance unresolved. Refresh/AppHang/offline/accessibility/initialization history remains; physical association/Auth, export, Android and N2 are open. | Native owner's exact artifact, screenshot/hierarchy, lifecycle/offline/refresh and platform receipts; no silent waiver from C8. Android still requires all iOS gates and fresh 40 GiB. |
| Production/store/beta | Relevant, not ready. Production trust policy deliberately blocks builds. | Production origins/signing/OTA decision, usable symbols/maps, privacy/retention delta, distributed signed install/update tests, roster/cap/support/spend controls, explicit submission and activation. [Runbook](release-runbook.md). |
| Maps/3D, social expansion, provider/framework swaps | Deferred outside this critical path. | Reconsider only after bounded beta evidence; no new implementation attached here. |

## Small Now / Next sequence

| Order | Work and owner | Depends on | Completion criterion |
| --- | --- | --- | --- |
| Now A — native-owned | Existing task prepares and, only under its explicit authority, runs its next complete diagnostic campaign. | Its frozen collector/proposal and fresh prerequisites; C8 has zero remaining attempts. | Reviewed Settings baseline and conditional offline/refresh outcomes with original stop rules; truthful disposition of app failures. This plan does not grant the run. |
| Now B — can proceed concurrently | Brian prepares production trust/signing/update configuration specification and privacy/retention delta, using the current local application. | Read-only target/signing inventory and product retention choices; no simulator dependency. | Exact production origins, signer/fingerprint/build-version plan, OTA policy, support/deletion wording and retained-data schedule ready for review. Historical approvals are reused where unchanged. |
| Next 1 — staging promotion preparation | Bind exact application, current native operator, hosted migration head, service identities, grants/hook, current users/invites, and release profile matrix. | This plan; native task's shared-environment availability; read access. | One frozen promotion packet with exact targets, finite commands/budgets, quiesced window, synthetic test-account roster and rollback compatibility. No missing target values at approval. |
| Next 2 — authorized staged acceptance | Promote compatible API/CLI/worker/web and validate the cumulative application on the selected native artifacts. | Explicit external/native approval and all predecessor passes; no parallel native jobs. | Candidate-bound web/API/DB/native affected journeys and remaining runbook evidence pass; root reviews screenshots/receipts; no unaccepted mixed-source claim. |
| Then — distribution/activation | Signed production TestFlight/Play closed testing, followed by bounded invitations. | Production configuration review and distributed acceptance; retention/support/cohort decisions. | Named roster/cap, installation/update/adoption proof, stop/rollback owner, explicit store and cohort approval. |

The best next independent development objective is **production release
configuration preparation**, not more feature expansion. Its first deliverable
is a source-backed trust/signing/update specification; missing real values must
not be guessed or “fixed” by relaxing the existing fail-closed checks.

## Concrete staging promotion design (proposed, not approved)

Candidate targets already declared in source:

- API: `https://api-staging-3795.up.railway.app`.
- Auth/database project: `https://mrwdhdeubdiiydmmvlda.supabase.co`.
- Web/link aliases as last recorded: `tableus-staging.vercel.app` and
  `links.table-us.com`; immutable deployment ID must be freshly bound.
- Expo project `0601c3b9-0082-454c-b636-45a1fe377f7b`, identifiers
  `com.tableus.app`. Old signer observations are not a fresh credential check.

Prepare one candidate CI run, one quiesced migration pass to `d48f6c2ab913`, one
compatible API deployment, one web Preview plus its verified alias activation,
and one worker deployment/schedule **if an existing approved target is available**.
New worker resources/secrets require their separately explicit scope. These are
proposed maxima, with zero automatic retries. They are not permissions or claims
that deployment IDs, credentials and recovery targets have been verified.

1. **Inventory first.** Read current deployed source/config, migration head,
   private-schema/browser/runtime/Auth-admin grants, configured signup hook,
   exposed schemas, worker target, active onboarding and invitation metadata.
   Keep real recipients, tokens, subjects and keys out of this artifact. Agree
   a window with the native owner before touching any shared API or Auth hook.
2. **Quiesce intake and old writers.** Migrate only the missing ancestors in order:
   deletion queue `6d7e3b91a2c4` → counters `ab72e4f39d10` → recipient hook
   `d48f6c2ab913`. Install compatible API/CLI before reopening. A migration alone
   does not stop older API writers from bypassing accounting or recipient checks.
3. **Verify denied and allowed access.** Runtime has intended DML, not schema
   ownership/create; PUBLIC/browser roles cannot access private tables or invoke
   the hook. Verify Auth-admin hook permissions and actual configured hook.
   Review approximate historical plan-counter attribution before enforcing caps.
4. **Keep feature gates deliberate.** API deletion remains false; operator
   allowlist stays denied until named; builders remain query. Verify private web
   and API headers at real proxy boundaries and sanitized log policy. Source
   defaults 5 AI / 20 Places per UTC day and 20 lifetime creations do not replace
   an approved aggregate spend/participant cap.
5. **Prove both deletion processes before admission.** Verify the server-only
   `SUPABASE_SERVICE_ROLE_KEY` and correct Auth origin in **both API and worker**.
   The API requires availability and can perform an immediate bounded Auth-removal
   attempt on a new request or enabled retry; a healthy worker alone does not
   enable API admission. Count these API attempts as well as scheduled work in
   the approved live ledger. Configure one non-overlapping worker batch/minute,
   limit three, 55-second batch deadline,
   15-second Auth attempt and 70-second watchdog. Verify scheduler history,
   aggregate status and alerts, then perform only approved synthetic deletion
   cases. Admission on the API can be off while a separately enabled worker drains.
6. **Bind affected acceptance and reopen only after review.** Use named test
   recipients/accounts and precise permitted Auth writes/emails. Core joining,
   retries, caps and deletion can trigger additional reads or irreversible writes;
   count their actual provider/Auth/telemetry budget before approving execution.
   Do not reclassify historical unused allowance as new budget.

Current planning authorization: **zero** CI dispatches, hosted mutations, native
attempts, OTP sends, provider calls or telemetry canaries. The native packet's
recorded ledger is Places 92/100 (eight unused but closed), email 2/4, canaries
6/6 per provider, fresh Gemini 0/0; these are historical scoped counters, not a
reusable balance. The September 30 boundary is unextended. A live acceptance
request must have a fresh finite ledger; no amount is guessed in this plan.

### Native profile and budget reconciliation

The current native N1/N2 dependency proposal separates two deterministic test
builds from two readiness builds. The broader cumulative runbook also calls for
the two telemetry-test profiles. Neither a four-build shortcut nor a blanket
six/eight-profile rebuild is accepted by this plan. Have the native owner map
each remaining observation to an inspected candidate/profile, identify any valid
reuse by exact bytes, and explicitly resolve telemetry proof and the closed
canary budget. Readiness artifacts contain no canary controls. Auth/links-specific
profiles may be needed if required controls are absent; do not substitute receipts.

Existing C6's 42-minute Settings/offline envelope is historical context, not new
allowance. The next native campaign must freeze its own exact collector, targets,
commands, aggregate/per-stage time, attempt count, cleanup reserves and disk gates
in the owning task. Sequential builds, first-required-failure stop and no implicit
retry remain. This planning machine had about 25 GiB free: below Android's 40 GiB
gate. No cleanup or storage relocation is authorized; this is not a fresh
native-runtime preflight.

## Link transition and safe rollback

Recommended adoption rule: keep fragment emission off until **every intended
closed-beta participant** is verified on the accepted compatible build, identified
by platform build number/source receipt rather than shared `0.2.0` version text.
There is no enforced minimum-version mechanism in this change. If adoption cannot
be established, keep query generation; do not make links fail for old clients.

Choose the legacy-reader cutoff after the accepted distribution/adoption date,
not an arbitrary date before platform acceptance. Before that cutoff, inventory
active plans and obtain explicit organizer rotation/re-sharing scope. Keep both
readers during transition. Removing query parsing cannot revoke a token moved to
a fragment; rotation revokes old values. A builder rollback to query still needs
the fragment reader for previously shared valid links.

On acceptance failure: stop later stages, keep intake closed, preserve evidence,
queue/leases/tombstones and recipient bindings. Pause new deletion admission; drain
only if Auth removal is healthy. Stop the worker too if its credential/provider
is faulty. Already-deleted application data is not restored by stopping the worker.
Do not downgrade the invite hook with open intake or return to an unmetered API
while cohort admission is open. Old `f94a1d9` is not an automatic rollback target
for this new schema/behavior. Prepare schema-compatible rollback or a forward fix
and obtain the applicable deployment approval. No automatic destructive cleanup,
DB downgrade, app reinstall or unsigned OTA update is included.

## Focused decisions and unresolved inputs

| Input | Recommended disposition | Needed by |
| --- | --- | --- |
| Available physical iPhone/Android and installed state | Reuse suitable retained devices if owner confirms availability and explicit in-place replacement scope; record model/OS/signer/build, not assumed IDs. A question is pending with Brian. | Native acceptance packet; no effect on this plan's completion. |
| Retention periods and support handling | Decide periods and truthful disclosure for surviving invite/counter hashes, deletion tombstones, operational logs/backups and plan/event history. Preserve security tombstones; do not promise full erasure or invent purge jobs. | Deletion/cohort activation; old privacy approval covers only unchanged scope. |
| First cohort size and daily total spend ceiling | A named, small staged roster with an explicit participant cap, operator/on-call identity, aggregate spend/health stops; account quotas alone are insufficient. | New live ledger, invitations and beta activation. |
| Fragment adoption/cutoff | Use complete intended-cohort build adoption above; set dated cutoff/rotation only after release acceptance. | Emission activation, not reader implementation. |
| Production trust anchors and update policy | Read actual chosen origins and signers; retain OTA disabled unless an approved signed-update policy is specified. | Production config implementation/store candidate. |

No new co-developer responsibility decision is needed: Brian owns this stage.
The native task remains an execution owner within Brian's development work, not
a second developer attribution. Portfolio evidence can accurately describe the
implemented flows, concurrency/role checks and source-bound local verification;
do not describe these features as shipped or this beta as launched.

## Concise proposed project overview

> TableUs is an invite-only group dining app being prepared for a mobile closed
> beta and documented as SWE portfolio evidence. Brian owns current development;
> historical shared work remains attributed. Account lifecycle, cohort limits,
> recipient-bound invitations and safer private-link readers are locally verified
> in one candidate. Next: complete native acceptance in its existing task while
> preparing production configuration and retention/support policy, then validate
> the cumulative staging release. Production/store distribution, new-format link
> sharing and beta activation remain gated.

This text is a local proposal; no shared Notion page was edited or freshly
reconciled here. Repository configuration and retained native evidence were
accessible. Current hosted deployment/grants/worker state, actual recipient/plan
inventory, physical-device availability and installed adoption were not inspected.
[Source hashes and verification](evidence/cumulative-release-acceptance-2026-09-25/README.md)
separate fresh reads from reused test evidence and external unknowns.
