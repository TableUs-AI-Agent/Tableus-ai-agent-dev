# Private plan links: decision packet

Recommendation: preserve group sharing among already-approved TableUs members,
move the reusable secret from the URL query into a fragment, capture it into
short-lived memory, and exchange it directly for plan membership only on an
explicit authenticated Join action. Do not add an intermediate ticket service
for this beta. This is a proposed design, not implemented behavior or release
risk acceptance. Brian owns current-stage decisions and implementation; earlier
shared contributions remain shared.

Review base: `72e8ba137350b7a73b3dbd288a541039e35d5d52`.
Application/operator source: `29edb5e9f47ab7ac74034f2bac5e271a162ea620`.
[Evidence manifest](evidence/capability-link-review-2026-09-24/manifest.json)
binds the files inspected. All repository changes in this objective are documents.

## The product decision

**Recommended:** a private plan link may be forwarded, and any already-approved
TableUs member holding the current link may explicitly join, subject to the
existing eight-person limit and finalized-plan rules. A link never grants beta
account approval. Account invitations and plan invitations are distinct:
recipient-bound account invitations do not bind a plan's sharing link.

Alternative: organizer-named recipients or an organizer approval queue. This
prevents an unintended approved member from joining solely by receiving a
forwarded link, but requires new selection/request/approval/recovery UX and
membership policy. Fragment transport and short-lived tickets cannot enforce
that policy by themselves.

The owner has been asked which model to use. No answer is recorded yet; all
steps below are a concrete proposal for the recommended current sharing model.
The default remains provisional. No implementation depends on silence as approval.

## Current behavior and evidence

| Item | Disposition | Source observation |
| --- | --- | --- |
| Beta account gate | Existing control | [auth.py](../backend/tableus/auth.py#L166), lines 166–178: a profile and hosted invite redemption are required. Join uses CurrentProfile. |
| Token strength/storage | Existing control | [security.py](../backend/tableus/security.py#L10), lines 10–16: random 32-byte token; SHA-256 stored. [models.py](../backend/tableus/models.py#L138), lines 138–158: one share-token hash per plan, no token expiry or named recipient. |
| Sharing URL | Relevant gap | [domain builder](../packages/domain/src/index.ts#L93), lines 93–97 emits `/join/{id}?token=...`. A web request carries that query before application code can clear it. |
| Join authority | Existing control, policy choice open | [api.py](../backend/tableus/api.py#L1327), lines 1327–1357: authenticated approved profile, current hash, plan row lock, existing-membership check, finalized guard and cap of eight. Any eligible holder can join; no recipient list. |
| Explicit consent | Existing control | [web join](../frontend/app/join/[id]/page.tsx#L21), lines 21–75, and [mobile join](../mobile/app/join/[id].tsx#L13), lines 13–50: explicit button posts the secret in JSON. Merely opening the page does not join. |
| Navigation exposure | Relevant gap | Both routes keep the query/route token until success replaces the route. Web sign-in is inline; native pushes `/auth`. No persistent join-token store was found in the scoped client trace; router/OS state remains a surface. |
| Native fragment handling | Implementation dependency | [links.ts](../mobile/src/lib/links.ts#L17), lines 17–55 drops the fragment and reconstructs an internal query route. A builder-only change would break mobile joins. |
| Revocation | Existing control with limits | [rotation](../backend/tableus/api.py#L1550), lines 1550–1558: organizer-only row-locked hash replacement. Old links fail new joins; existing membership is not revoked. Copying a fresh link currently rotates the old one. |
| Expiry copy | Relevant inconsistency | Clients say invalid/expired/rotated, but the Plan schema and join handler have no time-expiry check. Do not describe plan links as expiring today. A timed-out local pending flow is distinct from server link expiry. |
| Application telemetry | Existing control, limited scope | [shared sanitizer](../packages/domain/src/telemetry.ts#L166), lines 166–184 removes query/fragment; [backend sanitizer](../backend/tableus/telemetry.py#L122), lines 122–133 does likewise. This cannot prove edge or platform log behavior. |
| Request and replay handling | Relevant operating boundary | [main.py](../backend/main.py#L440), lines 440–488 hashes request bodies/keys and rechecks replay access; lines 569–599 retain successful response bodies in a bounded process cache and log method/path/status, not query/body. Create/rotation response replay may retain a raw share token in server memory. |
| Referrer/cache controls | Uncertain hosted, missing explicit scoped policy | [Next headers](../frontend/next.config.ts#L42) and [header constants](../frontend/app/lib/security-headers.ts#L1) add frame protections only. No explicit join-page no-referrer/no-store policy found. Actual host headers/log retention were not inspected. |
| Join recovery | Relevant client integration requirement | [join handler](../backend/tableus/api.py#L1327) clears active_run_id for a new participant before responding, so a new join does not hydrate Places. Existing-member retries can hydrate an active run and fail on quota/provider errors. [Revision read](../backend/tableus/api.py#L1319) checks membership without providers. Use that existing path to distinguish membership from detail-loading failure. |

The API startup [wrapper](../backend/tableus/run.py#L15) does not explicitly
disable Uvicorn access logging. The application sanitizer is therefore not a
claim about every server/proxy log. The public link GET reaches the web host;
the normal API join request carries the capability in its body, not URL. No
actual token leak or compromise was observed or claimed by this scoped review.

## Options compared

| Option | Benefit | Cost or residual exposure | Recommendation |
| --- | --- | --- | --- |
| Keep query token, add redaction/header rules | Small code change | First GET still contains secret; browser/history/message copies remain | Insufficient as the preferred pre-beta transport design |
| Fragment, memory capture, direct approved-member POST | Removes capability from normal initial HTTP target; reuses existing authority/explicit action | Client scripts, clipboard/messages and original shared URL retain access; mobile parser and lifecycle work required | **Recommended** |
| Fragment plus short-lived subject-bound exchange ticket | Useful if a future durable multi-step handoff must outlive the raw capability | Extra endpoint/state/expiry/retry/revocation semantics; raw fragment still reaches client; approved forwarded-link holder can still obtain ticket | Defer unless a concrete handoff requirement appears |
| Named plan invitations or approval queue | Changes who may join; blocks forwarding alone as authority | New product workflow and backend state, different from URL exposure | Choose only if owner wants this policy |

Fragments are processed client-side rather than sent as part of URI retrieval;
this is transport behavior, not proof of safe native delivery or client storage.
See [RFC 3986 §3.5](https://www.rfc-editor.org/rfc/rfc3986#section-3.5).
An explicit no-referrer policy suppresses the Referer header; see the
[W3C Referrer Policy specification](https://w3c.github.io/webappsec-referrer-policy/#referrer-policy-no-referrer).
Neither measure erases previously copied links or prevents same-page scripts
from reading a secret before capture. No XSS, messaging-provider or device
compromise protection is claimed.

## Concrete proposed behavior

1. Share `https://links.table-us.com/join/{uuid}#token={encoded-secret}`.
   Keep canonical host/path associations. Parse one token, reject duplicate,
   malformed or conflicting query/fragment values, decode exactly once and enforce
   existing length/UUID limits. Legacy query input is a temporary reader path,
   never a second fallback when a malformed fragment is present.
2. Capture as early as practical into an isolated in-memory pending-join object;
   immediately replace the visible web URL with `/join/{uuid}`. Native intent
   handling must capture before routing and navigate with an opaque local handle,
   never the raw capability in route params. That handle resolves only within
   the current app process; it grants no server authority. Preserve proper React
   remount/Strict Mode behavior and multiple-link arrival semantics.
3. Suggested pending-flow lifetime: 20 minutes. No localStorage, sessionStorage,
   persisted query cache or SecureStore for the capability. Clear on cancellation,
   successful join, expiry, logout or switching an already-bound account. A link
   captured while signed out may bind once to the first approved session after
   sign-in. Refresh/process death loses it: show “Reopen your private link.” A
   deliberate new link replaces the prior pending flow; never auto-join it.
4. Keep inline web OTP and provide an explicit native return to the pending join
   screen after approval. Do not pass the capability through Auth redirects,
   email links or callback URLs. Preserve confirmation after sign-in. A TableUs
   newcomer still needs a separate recipient-bound beta account invitation.
5. On Join, post the capability in authenticated JSON to the existing
   `POST /api/v1/plans/{id}/join`. Preserve its full-Plan response contract and
   transaction rules. New membership clears the active recommendation run, so
   there are no candidate Places reads on that normal first-join response.
   No intermediate ticket, new admission endpoint or schema is required.
6. Preserve plan locking, approval/deletion checks, unique membership, finalized
   rules, capacity and current-token rotation semantics. On user-requested recovery
   from a lost response, check `GET /api/v1/plans/{id}/revision`: it is approved-
   member-only and provider-free. A success proves existing membership and can
   navigate to normal detail loading even if the old link was rotated. A 401/403
   must first resolve current account approval; do not blindly repost. If approved
   but not a participant, normal Join still requires the current capability.
   No background retries or offline queue. Existing-member joins otherwise can
   hydrate candidates; a failed detail read does not undo existing membership.
7. Apply no-referrer and no-store policy to join landing responses; private
   create/rotate/join acknowledgements must be non-cacheable at HTTP intermediaries.
   Verify framework and proxy behavior rather than assuming a config declaration
   alone proves it. Preserve necessary document security controls; do not add
   unrelated third-party scripts, previews or telemetry capture.

Keep server link lifetime unchanged (valid until rotation, subject to plan rules)
for this bounded recommendation. Do not introduce a new expiration policy or
recipient binding implicitly. The 20-minute pending-state limit only clears a
client-held copy. Rotation is the remedy for an exposed reusable link; remove
misleading server-expiry copy or distinguish it from pending-state expiry.

## Migration and rollout dependencies

No database or API-contract change is needed merely to move query data into a
fragment or to use existing membership as the exchange result. A ticket or named-recipient design
would require a separate schema/retention decision.

First land and locally verify fragment readers, ephemeral lifecycle handling,
membership-recovery and compatibility tests together in an isolated objective.
Keep new URL emission off until readers are available on web and the intended
mobile release. Old installed apps currently drop fragments; the backend cannot
repair a secret that never reaches it. Decide the supported cohort app versions
and confirm adoption before enabling new-format sharing. Do not invent a minimum
version gate that the current repository does not implement.

During a bounded legacy-reader transition, old query links still expose a secret
on their initial web GET even if the client clears it. For broader beta activation,
inventory active plan links and have organizers rotate/re-share through compatible
clients within an approved rollout. Refusing query parsing alone does not revoke
the underlying reusable token: a holder can move it into a fragment. Rotation
invalidates that value. Do not bulk-rotate or revoke anything in this review.
Record the exact legacy-reader cutoff and remaining risk in the release proposal;
no indefinite compatibility exception is approved here.

Keep the native validation environment unchanged. The latest inspected native
source is `f044c925d216c9caad201b2c4425bad878c0472c`, with application still
`8972865893a3f018a064594457dc9cc664f8a61f`. Its packet records C7 ending before
UI testing after a host-path lookup failure, all native allowances consumed,
and no C8 authority. Local collector diagnostics do not complete native acceptance.
Sources: [native packet](/Users/brianchei/.codex/worktrees/ea6d/Tableus-ai-agent-dev/docs/task-packets/active.md),
[C7 result](/Users/brianchei/.codex/worktrees/ea6d/Tableus-ai-agent-dev/docs/evidence/native-replacement-validation-2026-09-21/n1-f1-c7-result.md).
Their inspected bytes/hashes are recorded in the manifest. No native work was
requested or run here. Link/auth/physical association, Android and later release
gates remain with that task and require a future approved exact-source scope.

## Small Now/Next sequence

| Order | Work | Dependency | Completion criteria |
| --- | --- | --- | --- |
| Now — this packet | Source review and policy choice | Existing implementation/source access | Evidence-linked proposal, one owner sharing-policy answer, no inferred release acceptance. Packet complete independently of whether answer has arrived. |
| Next — one local implementation objective | Fragment readers/emission control, ephemeral join state, provider-free membership recovery, truthful retry/expiry UX and explicit headers | Choose approved-holder versus named/approval sharing model; recommended model keeps current product behavior | Meaningful deterministic client/API/PostgreSQL checks, one make-ready, contract compatibility and source-bound handoff; no native/live execution |
| Then — coordinated acceptance proposal | Exact release candidate, compatibility/adoption and plan-link rotation inventory, hosted log/header inspection scope, iOS/Android fragment acceptance | Finished local implementation and native owner's available gates/budget | Concrete approved limits before any hosted/native action; observed cold/warm/signed-out links and membership outcomes on intended release bytes |
| Later — beta activation | Roster/caps/support/retention, production config, distributed release acceptance | Broader roadmap gates, explicit invitation/cohort approval | Named operating owner and stop/rollback plan; no inherited staging acceptance used as a production waiver |

Suggested implementation acceptance cases: malformed/duplicate/conflicting tokens;
exactly-once decoding of percent/plus/Unicode cases; query compatibility; web
history removal before subsequent navigation; no token in router/auth/storage/
telemetry; memory expiry/cancel/process loss/account switch; explicit Join after
OTP; signed-out native return; eight-person contention; rotation racing join;
finalized and existing-member behavior; deletion versus join; lost-response retry;
existing membership with Places unavailable; no GET/prefetch mutation. Include
real platform fragment receipt and actual hosted headers/log policy only in the
separately authorized release stage, not as mocked-test claims.

## Access and verification limits

Repository source, prior exact-source invite evidence and bounded native-task
state/evidence were available. The task UI returned idle/completed status but no
assistant text for the latest turn, so native outcome is sourced to its current
committed packet/result. Hosting logs/configuration, live Auth, clipboard/history
retention by OS/chat apps and fragment transport on installed iOS/Android builds
were not inspected. Notion is not needed for this repository-level design decision
and was not modified or operated through the desktop.

No application changes, tests/builds, simulator use, providers, database runs,
real links/invitations, cloud/secret changes, deployment, merge/push or destructive
cleanup were performed. This is a scoped design review, not a reopened security
scan. Prior `29edb5e` readiness (193 Python/314 JavaScript) remains its own historical
implementation evidence, not verification of this unimplemented design.

Review correction: an initial concern about Places failing after a new join was
withdrawn after tracing active_run_id reset and conditional hydration. This packet
does not propose a backend admission redesign on that incorrect premise. Existing
member retry/detail-loading separation remains a client recovery requirement.
