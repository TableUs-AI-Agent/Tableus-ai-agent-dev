# Account lifecycle activation proposal

**Prepared candidate; not authorization to execute.** Local verification is
complete. Target reservation, hosted resource identity and release acceptance
remain unresolved. Do not use this document as a runnable deployment approval.

## Candidate and proposed destination

Application/worker: `eab922ee6b7a21d193514d7008a47806c9e118e3`.
Migration: `8b1d4a6c2e90` → `6d7e3b91a2c4` (no destructive down-migration).
Image recipe: `backend/Dockerfile`; worker command from `/app`:
`python scripts/process_account_deletions.py --limit 3`.
API/web/mobile must all be accepted for their actual source; older device
artifacts do not prove this candidate.

The recorded staging API is `https://api-staging-3795.up.railway.app`;
web aliases are `https://tableus-staging.vercel.app` and
`https://links.table-us.com`. Their last readback for the inherited rollout is
[Phase W](handoffs/2026-09-21-phase-w-complete.md), not a fresh deployment inventory.
The native task currently owns validation using its own candidate. **Do not
replace its shared API, auth configuration, aliases or app artifacts while it
uses them.** Reserve staging after that task releases it, or separately scope
and approve a new isolated environment. No new environment is implied here.
Production `table-us.com` is excluded.

## Connected sequence and proposed limits

| Stage | Proposed work | Exit / stop condition |
| --- | --- | --- |
| 0: read-only preparation | Confirm native task's environment reservation; record actual Railway project/environment/API IDs, Supabase project and schema exposure, Vercel project and current rollback targets; record current migration head and role grants without secret values. Brian reviews retention wording and the support contact. | Any mismatch, unresolved policy or shared-environment contention stops publication. Bind the exact resource IDs and cost/attempt ceiling to an approval amendment before external actions. |
| 1: gated publication | One exact-source CI run, one API candidate, one web Preview, one incremental staging migration and one separately configured worker deployment. Preserve feature-off API and no worker schedule during setup. Provision only the named server-side Auth credential after explicit approval. | Stop on first failing CI/migration/deployment/role check; no automatic retry or target substitution. No native compilation or alias activation in this allowance. |
| 2: gated worker proof | One worker instance, one nonoverlapping minute schedule, limit 3, application deadline 55s, supervisor kill 70s, automatic process restart disabled. Read aggregate status after each run. Start only with an approved synthetic staging account/queue fixture and explicit live-Auth deletion budget. | Stop if runtime is privileged, app schema exposed to browser roles, any identity appears in routine logs, worker exits nonzero, lease/attempt behavior disagrees with evidence, or counts cannot be reconciled. No real-user fixtures. |
| 3: affected release acceptance | Web management/status/paused-retry smoke on exact Preview; separately approved native candidate validation by its existing owner, including deletion recovery/session loss and transferred shared plans. | Affected signed/device evidence and actual source IDs must pass before general feature activation. Prior native budget does not fund this candidate. |
| 4: explicit activation | Only after stages 1–3 plus retention/support decisions, enable API admission for the approved cohort, retain independent worker capability and watch status/execution history. | Explicit owner approval names participant cap, spend limit, targets and rollback. This proposal grants none. |

The publication counts above are proposed upper bounds, not permissions. A real
Auth test budget and cost ceiling cannot be inferred from previous provider or
native allowances. Prepare the synthetic account/recovery fixture and exact
number of Auth calls before requesting that connected campaign. Do not grant
itself retries by advancing stages. No merge, production migration, stores,
beta invitation or destructive cleanup is included.

## Worker configuration to review

Use the same verified backend image as the API with a **separate process/service
configuration**. Keep its database connection under the runtime role; do not
copy the migration administrator into worker environment. `SUPABASE_URL` and
`SUPABASE_SERVICE_ROLE_KEY` belong only in approved server configuration.
`TABLEUS_AUTH_MODE=supabase` is mandatory in hosted operation; deterministic
demo configuration is only local proof.

The worker requires `TABLEUS_ACCOUNT_DELETION_ENABLED=true`; admission pause sets
it false only on API processes. Do not inherit the API's HTTP health check or
`ON_FAILURE` restart policy from `railway.toml` for this one-shot worker. The
scheduler must record exits and skip overlapping invocations, and its supervisor
must enforce the process watchdog. A cron expression without these controls
does not complete readiness. No scheduler is configured by this branch.

Proposed monitoring: page Brian for attention or missing-subject rows; investigate
pending age 15 min; pause admission at 60 min or five minutes without a successful
worker run while pending exists. These are operational thresholds, not retention
or deletion-completion promises. [Operations](account-lifecycle-operations.md)
defines evidence, per-row diagnosis and bounded explicit recovery.

## Rollback and remaining decisions

Pause new requests at the API first. Continue the separately configured worker
only if Auth behavior is trustworthy. For credential/provider faults, stop the
schedule and preserve all queue rows/leases/tombstones; recover after diagnosis.
Never roll back the deletion table with pending rows, erase tombstones, retry
under an unrelated identity or substitute legacy application-only deletion.
Retain the accepted application image that understands the queue and return
truthful pending status; an arbitrary pre-lifecycle rollback is unsafe.

Before activation Brian must select retention promises for shared contributions,
backups/logs/provider records and pending recovery data, plus a working support
channel after session loss. The preserved subject-hash tombstone remains until
a reviewed stale-token/re-enrollment strategy replaces it. These decisions do
not block the next local cohort-controls implementation. Historical co-developer
attribution is unchanged; current execution ownership is Brian's.
