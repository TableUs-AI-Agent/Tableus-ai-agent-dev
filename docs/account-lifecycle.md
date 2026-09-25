# Account lifecycle

The September 24 backend objective adds ownership resolution and opt-in full
account deletion. The client objective adds web/mobile management and deletion
recovery screens, plus provider-free plan metadata. No hosted migration,
credential, scheduler or deployment has been applied by these changes.

## API contract

| Endpoint | Behavior |
| --- | --- |
| `GET /api/v1/me/account-control` | Existing application deletion readiness plus `full_deletion_available`. Organizer count remains a blocker until resolved. |
| `GET /api/v1/me/organized-plans` | Current organizer’s plans and participant IDs/display names only; no preferences, links, candidates or provider calls. |
| `POST /api/v1/plans/{id}/transfer-ownership` | Current organizer supplies `recipient_profile_id` for another existing approved participant. Membership, shared content, votes and plan state remain. Former organizer stays a participant until deleting their account. Returns the same minimal management shape as organized-plans; no Places hydration. |
| `DELETE /api/v1/plans/{id}` | Exact `{"confirmation":"DELETE"}`; only organizer, only when sole participant. Shared plans must be transferred. |
| `POST /api/v1/me/deletion` | Exact `{"confirmation":"DELETE"}` requests full deletion. Application data removal and the durable job commit together. Then at most one due Auth attempt runs. Response is `pending` or `completed`, with retry/attention fields. Repetition reads/retries the same durable job; a disabled API returns its status without attempting Auth removal. |
| `GET /api/v1/me/deletion` | Authenticated subject can read their status after profile deletion. No writes or provider calls. Missing request is 404 for an approved profile. |
| `DELETE /api/v1/me` | Existing application-only contract remains; it does not delete Auth. Users who already took that legacy path still need operator Auth completion. |

Full deletion cannot start while the feature is unavailable or organized plans
remain. A pending request has already removed application data. Clients must not
present pending as unchanged or complete; `needs_attention` requires support.
Status uses a still-valid authenticated session, not a public lookup capability.
After Auth removal a JWT may remain cryptographically valid until expiry, but
the missing approved profile blocks product access and the subject tombstone
blocks invite re-redemption. A new identity still requires a valid invite.

The new deletion endpoint uses durable identity-scoped state rather than the
process-local response cache. Transfer replay is bounded by the existing cache;
after restart/cache expiry, clients must read plan ownership to reconcile an
ambiguous transfer before offering another mutation. Sole-plan deletion likewise
uses a follow-up plan read after a lost response; a repeated delete may be 404.
Do not automatically retry writes with a new target or payload.

Account-management clients bind sensitive requests to the initiating subject.
The shared client checks the credential subject before dispatch and before any
401 refresh replay; a different or missing subject stops the request. This is a
client-side account-switch guard, not token verification or a replacement for
server authorization. Platform state also ignores stale prior-account results.

## Client behavior

Web/mobile show organized plans, an explicit recipient confirmation for shared
plan transfer, and exact DELETE confirmation for sole-plan/account deletion.
Full deletion is disabled when the server omits or denies availability; export
and local sign-out remain available. No new screen uses legacy DELETE /me.

A deletion attempt clears private query state and opens recovery before its
response. In-flight writes exclude other account mutations and refresh. Lost
responses trigger a status/management read; any write retry is explicit and
keeps its original subject, target, payload and key. A plan absent from the owned
list is described as no longer organized by the user, not proof of a specific
new organizer. Rejected targets may be selected again from current participants.

The same valid session can read durable deletion status after /me is denied.
Pending, completed, support-attention and unconfirmed states are distinct.
Private product and join/auth routes are gated while recovering deletion;
privacy/terms remain readable. Session loss preserves the known status in the
current client session without claiming completion. After a cold restart with
no valid credential, no public lookup or guaranteed local status is offered;
trusted worker completion and support remain necessary. No queued writes,
background polling, native validation or hosted feature activation is added.

## Data treatment

| Data | Treatment |
| --- | --- |
| Profile, reviews, connections, memberships, votes, invite redemptions | Removed with profile in the application transaction. Invite use counts are not refunded. |
| Pending invite validations matching the profile email hash | Removed in that same transaction. |
| Shared plans and their recommendations, candidates and history | Preserved after transfer. Shared titles/labels/content can still reflect the former organizer's contributions. |
| Events authored by the profile | Actor reference cleared; named identity fields and exact subject/hash values scrubbed from payloads. This is not a general free-text anonymizer. |
| Auth user | Trusted hard-delete request; only confirmed success or the provider's specific user-not-found response completes the job. |
| Recovery row | Raw Auth subject retained while pending, cleared on completion. Namespaced subject hash, timestamps and retry metadata remain to prevent stale-token re-enrollment and support recovery. |
| Cohort quota counters | Stable subject digest, daily operation counts and lifetime creation baseline remain across profile/plan deletion to prevent quota reset; no raw subject or profile foreign key. See [cohort controls](cohort-controls.md); retention review is still required. |
| Logs, backups, provider audit records, transient replay cache | No new purge deadline or deletion promise. Broader retention policy and operator procedures remain release work. Existing product-access checks protect replay after profile removal. |

The completed tombstone must not be deleted or its hash namespace changed
without a reviewed stale-token/re-enrollment strategy. It does not depend on
`TABLEUS_APP_SECRET`, so rotating that secret does not bypass it. The new table
lives in the private `app` schema on PostgreSQL, with explicit runtime-role
grants and no public grant. Verify hosted role isolation before enabling.

## Recovery and deployment preparation

The queue is durable; a Python background task is not its source of truth.
Workers atomically claim due rows for 45 seconds, make one provider attempt
without an open database transaction, then update only their matching lease.
Provider transport is limited to 12 seconds; the service caps an attempt at 15
seconds. Backoff is exponential, with at most ten claims before operator
attention. A rejected request needs attention immediately. Expired final claims
are classified on a later worker batch. A worker dying after Auth success can
retry safely because confirmed user-not-found is completion.

Commands below are prepared operator entry points, not authorization to run
against a real environment. Run from `backend/` with the intended environment:

```sh
.venv/bin/python scripts/process_account_deletions.py --limit 3
# After diagnosing/correcting a rejected or exhausted job:
.venv/bin/python scripts/process_account_deletions.py --retry-subject-hash <hash>
```

A batch defaults to three and accepts at most 25 jobs, with a 55-second async
deadline. Timeout leaves durable claims recoverable after lease expiry. The
retry command resets only an attention/exhausted pending job without a current
lease; a later batch performs the actual attempt. Record the diagnosis before
using it. Aggregate `processed` output counts persisted attempt outcomes, not
only successful Auth deletions. Inspect `pending`/`needs_attention` rows through
trusted backend operations; do not publish raw subjects or provider errors.

Before activation: run the migration with the separate migration role; verify
PostgreSQL lock/race behavior and runtime privileges; provision the server-only
`SUPABASE_SERVICE_ROLE_KEY`; deploy and monitor the recovery runner; verify
the platform status/confirmation/recovery screens on the affected release; then opt in with
`TABLEUS_ACCOUNT_DELETION_ENABLED=true`. Credentials must never enter public
client environment variables. Default is disabled. Demo/test uses a deterministic
network-free remover only when explicitly enabled. Hosted demo is forbidden.

The [worker operations procedure](account-lifecycle-operations.md) defines status,
scheduling, alert thresholds, support and API-off/worker-on drain configuration.
`--status` is read-only. An unavailable CLI batch exits 2 before claiming work,
and a paused API returns existing status without attempting removal.

No scheduler is provisioned here. A stopped runner does not lose requests, but
pending requests may remain pending after the user session expires. Runner
availability and support ownership are activation prerequisites, not inferred
from local test success. Revoking/omitting the credential prevents new full
requests; existing jobs remain recoverable and may reach operator attention.

## Verification limits

Local tests cover provider outcomes, transfer permissions, plan preservation,
pending/completed/retry behavior, stale-token/replay denial and lease recovery.
PostgreSQL17.11 local checks now prove both race orderings, competing transfers,
worker exclusion, fresh/upgrade migrations and restricted runtime/browser roles.
[Exact evidence](evidence/account-lifecycle-postgres-2026-09-24/README.md) records
the passing full suite without PostgreSQL skips. These results do not prove
actual hosted grants or exposed-schema configuration.
Existing native evidence belongs to its original application SHA and does not
prove this backend or the new UI flow.

Provider contract was checked against [Supabase user management](https://supabase.com/docs/guides/auth/managing-user-data),
[admin deletion documentation](https://supabase.com/docs/reference/javascript/auth-admin-deleteuser)
and the [GoTrue deletion handler](https://github.com/supabase/auth/blob/master/internal/api/admin.go).
The current handler returns an empty JSON object with HTTP 200 after deletion;
the adapter also accepts a matching returned user ID and rejects an unrelated ID.
