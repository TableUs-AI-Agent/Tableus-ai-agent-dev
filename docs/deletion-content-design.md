# Shared-content deletion: implementation decision packet

September 25, 2026. Prepared by the root agent for Brian, current sole development
owner; historical shared contribution is unchanged. Base
`e2b9577f810fdd9b8933bdfb0155e61c34146195`; unchanged application
`484632517345e7858f48caf8fa7b128f9d9dab80`.
This is source review and design, not an implementation or acceptance result.

## Approved behavior — September 25 implementation objective

Preserve the shared plan and remaining members' inputs. Remove the departing
member's authored fields and every recommendation run derived from their inputs.
If the active/finalized result is removed, return the plan to collecting and
require fresh recommendations and votes. The surviving organizer can supply a
replacement title/location where necessary. Never automatically call providers
or replay old inputs during deletion.

The owner approved this recommendation on September 25 by asking to continue with
it. It changes the previous expectation that affected candidates/results survive
deletion. Local implementation and deterministic verification are authorized; real
data cleanup, hosted migrations and deployment remain separate gates.

[Prior retention review](retention-support-spec.md) explains the store-readiness
reason. This design does not settle all retention periods, support completion,
backup/provider deletion or store acceptance.

## Exact field and dependency map

| Stored data | Attribution available now | Proposed treatment |
| --- | --- | --- |
| Plan title, location label, Place ID and legacy coordinates | Created by request actor, but only mutable organizer ID survives on Plan | Add immutable authored-field provenance. Clear departing author's values; use neutral title and explicit location-needs-replacement state. Do not silently retain a user's location because it is represented by a Place ID |
| Participant constraints | Profile-keyed row; includes free-text notes/dietary notes | Existing cascade removes own row. Preserve other members' rows; never copy deleted inputs to a repair queue |
| Run query | Request actor known at write time, not stored on run | Record requester and exact input contributor set; remove run if departing user authored query or contributed any input |
| Candidate reasoning, scores/ranks and selection | Derived from query, plan location and all participants' constraints; only run FK stored | Delete all candidates for affected runs, including inactive historical runs. Hiding active_run_id is insufficient |
| Votes | Both profile and plan references exist, but run_id is a plain string | Explicitly remove votes for affected runs; preserve other users' votes only on unaffected runs. **Run deletion does not cascade votes** |
| Active/finalized pointers | Plain string references | Clear pointers to deleted results, reset collecting, advance revision in the same transaction |
| Events | Actor, event type and limited payload; actor removed by current deletion | Remove departing actor's content-bearing payload; sanitize or remove references to removed runs/results. Preserve only a reviewed non-content allowlist, not arbitrary free text |
| Exports/views | List, detail, managed-plan responses and account export include overlapping shared fields | All fresh responses must use cleaned state; own export does not currently include run query/reasoning, but those rows still require deletion |
| Cached successful writes | Whole response bytes retained in process memory up to 24 hours | Suppress and remove stale bodies while keeping request-consumption evidence; do not rerun a successful write merely because its old body became unsafe |

Sources: [models](../backend/tableus/models.py) lines 141–217;
[write paths](../backend/tableus/api.py) lines 1228–1457;
[read projection](../backend/tableus/api.py) lines 193–265;
[export](../backend/tableus/api.py) lines 948–1047;
[replay logic](../backend/main.py) lines 450–584;
[cache](../backend/tableus/request_controls.py) lines 326–442.

The live provider consumes the run query and the complete participant-constraint
list, not just the requesting actor's preferences:
[provider](../backend/tableus/providers/google_live.py) lines 615–657.
Generation also resolves the plan location before discovering candidates (API lines
1392–1399). A run depends on that authored location even when its author is no
longer in the participant snapshot. Requester attribution alone cannot identify
all dependent output.

## Provenance and legacy data

Proposed new schema:
- Immutable Plan author reference for creator-supplied fields, with explicit
  provenance state (`known`, `legacy_unknown`, `removed`). Future field edits
  update ownership of those specific fields; organizer transfer does not.
- Run requester plus one contributor record per participant whose data was
  supplied, and the exact plan-location version/author used for discovery. Write
  run, dependency snapshot and candidates atomically. A later location replacement
  must not erase attribution of the location used by historical runs.
- Explicit distinction between complete and unknown contributor sets. A null FK
  after account deletion must never be interpreted as safe/anonymous provenance.

Keep these references internal; do not add a permanent raw-subject archive or
duplicate personal text. Remove provenance linking the departing user only after
affected rows have been identified and cleaned in the deletion transaction.

Event history is insufficient for a complete backfill: creation/generation events
may identify actors, but generation events do not record the historical contributor
set, transfer events do not preserve field authorship, and old deletion cleared
actors. A current member list also cannot reconstruct former contributors.
Do not assign old text to the current organizer or mark uncertain dependencies known.

Recommended legacy policy for explicit review: classify uncertain records during
schema migration without destroying content. Before enabling the new deletion
guarantee, perform a separately approved, bounded remediation of unknown legacy
content: clear uncertain authored fields and derived runs, retain the plan and
remaining member inputs, and let the organizer re-enter needed metadata. This
includes already-deleted users' possible contributions, not only future deletion
requests. Preview row counts and affected plan IDs privately, not raw content.
Unknown records must not silently bypass cleanup.

This is a material disruption to existing plan results. If the owner chooses a
narrower legacy treatment, document what historical attribution can actually prove
and leave unresolved records outside a claim of complete deletion. Do not make an
individual user's deletion depend indefinitely on another organizer replying.

## Transaction, concurrency and replay contract

Both application-only deletion and full deletion should call the same content
cleanup, with full deletion additionally recording its durable Auth-removal job.
A prior full-deletion record continues returning durable status; retries do not
resurrect profiles, reset quotas or recreate content.

1. Acquire existing exclusive subject lock, identify affected plans from membership,
   authored metadata and run dependencies (including location versions and historical runs), then lock
   those plans in deterministic order. Recheck organized-plan blockers and current
   dependencies under lock.
2. Clean authored metadata, affected run votes, candidates/runs and event payloads;
   remove own membership/profile data; clear affected active/finalized pointers;
   advance affected plan revisions. Atomically commit with the deletion record.
3. Serialize generation, metadata replacement and cleanup through the same plan
   locks. A generation that wins must be included in the subsequent deletion;
   one that loses must reread current participants/constraints and cannot persist
   removed input. Preserve subject-before-plan order; do not acquire arbitrary
   other-user subject locks after a plan lock.
4. Two deletions touching the same plans, deletion versus transfer, and generation
   versus deletion need real PostgreSQL concurrency tests in both orderings.
   SQLAlchemy snapshots/identity-map objects must not reuse pre-lock input.
5. Replays require a content-validity guard independent of continued membership.
   Existing middleware checks current authority but returns old bytes for most
   plan routes. Creation responses use `POST /plans` and can contain the same
   sensitive fields despite lacking a plan ID in the request path.
6. Add explicit response dependency metadata at cache insertion (plan/content
   generation, and any profile dependencies) or an equivalently conservative
   invalidation generation. After deletion, erase old response bodies but retain
   fingerprint/consumed-key tombstones until the original expiry. Return a
   sanitized state-changed outcome requiring refresh; never execute the same
   successful write again or consume another provider operation.
7. Fence late response insertion and replay validation against deletion commit.
   A response computed before deletion must not be stored/served as fresh after
   cleanup. Cover an in-flight write committing before deletion but finishing
   response buffering afterward. Apply the invalidation design to other cached
   profile-bearing responses, including connections, not only plan detail.

Do not solve replay safety by globally clearing the cache: that loses consumption
records and may duplicate writes. Do not fetch live Places to reconstruct a replay.
Existing one-API-process constraints remain; horizontal scaling is outside scope.
Previously downloaded/exported data and already-delivered responses cannot be
recalled. Fresh server reads/replays after completion must not reintroduce removed
content; client refresh must discard superseded cached results.

## Client/API work required

The current API has no metadata-replacement route. Add a bounded organizer-only
metadata operation for cleared title/location, validate resolved US location using
the existing flow, and return the same plan revision mechanism. Allow this on a
collecting plan and explicitly handle finalized plans reset by deletion. It must
not transfer ownership or silently regenerate recommendations.

Use an explicit needs-location state, not a fake Place ID or coordinates.
Show a generic “Plan details changed; choose a location and generate new options”
message without disclosing who deleted their account. Preserve remaining members'
constraint drafts; clear rankings and retries bound to removed candidate IDs.
Regeneration remains explicit and requires two participants as today.

The web currently checks revision on a 30-second interval; mobile uses its existing
bounded refresh flow. Neither proves immediate erasure from another offline device.
At next successful refresh, drop old candidates, reasoning, finalized selection and
pending mutations whose result IDs are no longer valid. Update deletion confirmation
copy to explain its effect on shared results before the destructive confirmation.

## Completion checks for the implementation objective

These are proposed checks, not executed results.

| Scenario | Required observation |
| --- | --- |
| Creator transfers then deletes | Shared plan/member inputs survive; creator title/location and dependent output removed; replacement metadata enables explicit new recommendations |
| Non-requesting contributor deletes | Runs using their constraints are removed even if another actor generated them |
| Historical/inactive run | Stored query/reasoning removed, not merely hidden; no dangling votes or active/finalized references |
| Independent later run | Preserve only when a complete snapshot excludes the departing user's query, participant inputs and authored location; a run using their old location must still be removed |
| Unknown legacy record | Marked unknown; gated remediation applies approved policy, never inferred current-organizer authorship |
| PostgreSQL interleavings | Both generation/deletion orderings, two overlapping deletions and transfer/deletion complete without resurrected content, deadlock or partial Auth job |
| Replay before/after deletion | Old member/organizer/create/connection response body cannot reappear; same key cannot rerun mutation; late cache insertion is fenced |
| Client refresh and export | Removed title/results absent after fresh read; stale rankings reset; other members' own constraints retained; no automatic provider call |
| Failure/retry | Transaction rollback leaves no half-cleaned plan; Auth failure leaves truthful pending recovery; duplicate request causes no further mutation |
| Migration and privilege checks | Fresh/upgrade schemas, accurate unknown classification and restricted runtime privileges; browser roles denied provenance tables |

Implementation file set: models + Alembic migration; shared deletion service/API;
provider-input snapshot at run creation; replay middleware/cache; API schemas and
generated client contract; web/mobile metadata/recovery UI; lifecycle, PostgreSQL,
replay and component tests. Update existing lifecycle tests that explicitly expect
old candidates to survive. Run focused checks and one `make ready` only after
implementation is authorized; native acceptance stays with its existing task.

## Hosting access result and next action

Saved `.vercel/project.json` and the September 21
[Phase W preflight](evidence/web-dependency-rollout-2026-09-21/preflight.json)
agree on TableUs project `prj_lPu3pWZiJ5ZRUIab6wiXrJIW930G`, team
`team_0Pu6vuMiug12C8K2HQqbgOQG`, name `tableus-staging`.
A targeted connector `vercel_get_project` read returned **404 Not Found**.
This narrows the missing input to access/current existence of that exact project;
it is not evidence that a replacement project should be created. Current alias/
production configuration remains unverified.

The behavior is now approved for local implementation. Actual bulk legacy
remediation needs a separately reviewed scope. Production trust configuration
separately needs environment choice and actual resource bindings. The original
design review executed no builds, services, native runs, hosted changes, real
deletions, Notion edits, messages or provider calls; implementation evidence is
recorded separately.
