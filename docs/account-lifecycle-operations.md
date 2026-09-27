# Account deletion worker operations

This is a prepared procedure for the private deletion queue. It does not
authorize migration, secret creation, deployment or activation. Keep
`TABLEUS_ACCOUNT_DELETION_ENABLED=false` on the API until the approved rollout
has completed its gates. The browser and mobile apps must treat a pending
request as already removed from application data, while Auth removal may still
be running.

The API and worker each need the server-only Auth credential and correct Auth
origin when their deletion capability is enabled. The API checks availability
before new admission and can make an immediate bounded Auth-removal attempt on a
request or enabled retry; scheduling a healthy worker alone does not enable it.
Count both API and worker attempts in an approved live scope. Their enable flags
remain per process, so API admission can pause while the worker drains.

## Before scheduling

1. Apply and verify the account-deletion migration using the separate migration
   role. Confirm the runtime role has the intended DML grants on private
   `app.account_deletions`, with no schema-create or owner privilege, and public/Data API roles cannot read it.
2. Include provenance migration `9a1f2e7c4b80`, its indexes and private
   `app.run_contributors` grants (runtime SELECT/INSERT/DELETE only; denied browser
   roles). It preserves legacy rows as unknown. Inventory historical content and
   separately approve any real legacy remediation; automatic cleanup on a future
   deletion cannot recover already-lost attribution. Deploy compatible metadata
   repair clients before admission. Keep one API process: replay invalidation is
   process-local and consumed keys expire/evict or disappear on restart. Do not
   promise recall of data already delivered to offline clients.
3. Verify PostgreSQL race tests, deployed API/client versions, the trusted
   server-only Auth credential and the worker's access to the intended database.
   Keep that credential out of public client configuration and command output.
4. Assign a named on-call owner for pending, attention and support requests.
   Record the scheduler target and its execution history before admitting users.
5. Run `--status` against the intended environment. It is read-only and works
   when processing is disabled. Confirm that its counts match private database
   evidence without exporting subjects or email addresses.

Schedule **one** invocation every minute, skip a tick if the previous one is
still running, and pass `--limit 3` (the default). One batch has a 55-second
application deadline and attempts at most three due rows. Each Auth attempt is
bounded to 15 seconds; a 70-second process watchdog leaves startup and shutdown
room. Preserve scheduler exit codes and the aggregate line `processed=N`; it
counts persisted attempt outcomes, not completed deletions. The durable row,
not an in-memory task or scheduler state, owns retry and recovery. Do not add
unbounded loops or automatic operator resets.

From `backend/` in the intended private runtime:

```sh
.venv/bin/python scripts/process_account_deletions.py --status
.venv/bin/python scripts/process_account_deletions.py --limit 3
```

`--status` returns JSON containing observation time, worker availability,
pending/attention/due/leased counts, oldest pending age, 24-hour pending and
completion counts, expired final claims, and pending rows missing an Auth
subject. It returns no subject, digest, email, provider response or secret.
The command is a snapshot, not a substitute for scheduler execution history.
Batch and operator-reset modes exit before claiming a row when deletion
capability is disabled or misconfigured. Paused API retries also return existing
status without consuming an unavailable attempt. These CLI guarantees assume
the operator uses this entry point, not direct internal function calls.

## Monitor and respond

Check the aggregate status after every worker run and alert from these
conditions. The thresholds are operational defaults for the small closed beta;
review them against measured throughput before increasing admission.

| Signal | Action |
| --- | --- |
| `attention > 0` or `missing_subject > 0` | Page the owner and inspect the affected private rows. No automatic reset. |
| Oldest pending age over 15 minutes | Investigate worker executions, leases, Auth availability and due backlog. |
| Oldest pending age over 60 minutes, or no successful worker run for five minutes while pending is nonzero | Treat as an incident; pause new admission at the API while preserving the queue. |
| `expired_final_claims > 0` beyond the next worker run | Check runner health; a later batch should classify these as attention. |
| `ready_due > 0` grows across consecutive minute runs | Check capacity and provider errors before changing the fixed batch limit. |
| `worker_available=false` with pending rows | The worker cannot drain them. Repair its private configuration before running a batch. |

Do not alert on `active_leases > 0` alone; an in-flight attempt normally holds a
lease. Do not infer completion from `processed=N`; confirm completed counts or a
specific user's durable status. A stopped worker leaves pending rows durable.
Users may lose a usable session before completion, so support ownership cannot
depend on a client status screen staying accessible.

For a support request, follow the [prepared support procedure](deletion-support-procedure.md).
Verify the requester through the approved support channel before disclosure or action.
Its mailbox/case-binding rehearsal remains a launch prerequisite. If their session remains valid, `GET /api/v1/me/deletion` shows their
own status. For an expired session or an attention row, a trusted operator may
inspect the private queue using a least-privilege administrative path and locate
the corresponding subject hash. Keep the hash and raw Auth subject out of
routine logs, tickets and chat. Do not interpret `pending` as a failed account
deletion: application data was removed in the same transaction that queued Auth
removal.

Diagnose the underlying reason before reset. `unavailable` means the worker
capability/configuration is disabled; `retryable` means the bounded attempt
did not establish a final outcome; `rejected` needs operator review of the
trusted provider contract or permissions. After correction, and only for one
identified attention/exhausted row with no live lease:

```sh
.venv/bin/python scripts/process_account_deletions.py --retry-subject-hash <64-lowercase-hex-digest>
.venv/bin/python scripts/process_account_deletions.py --limit 3
.venv/bin/python scripts/process_account_deletions.py --status
```

The reset command clears attention/attempt counters. It does not contact Auth.
Record the diagnosis and result in private operational evidence, then verify
the row's final status with the trusted database path or the user's status
endpoint. A completed tombstone must remain; do not delete or rewrite it to
make re-enrollment possible.

## Admission pause and rollback

`TABLEUS_ACCOUNT_DELETION_ENABLED` is **per process** and currently gates both
API admission and Auth removal capability. To pause new full deletion requests
while draining existing jobs, set it false **only in the API process** and leave
it true in the separately configured worker process with its trusted Auth
credential. Verify `--status` reports `worker_available=true` in the worker
environment, then continue bounded batches. This separation requires an
approved deployment configuration; it is not automatic.

If Auth removal or its credential is faulty, pause API admission **and stop the
worker schedule**. Leave rows, leases, attempts and tombstones intact. Setting
the flag false on the worker makes its batch command refuse work; it does not
drain. Repair the cause, recheck the intended environment and status, then
resume one bounded worker at a time. Expired leases become eligible again,
except exhausted final claims, which move to attention on a later batch.
Never use legacy application-only `DELETE /api/v1/me` as a replacement for
full deletion. Do not roll back the queue table while requests are pending.

Activation and rollback decisions must follow the repository's explicit gates
for migration, secrets and deployment. See [account lifecycle](account-lifecycle.md)
for the API/data contract and [release runbook](release-runbook.md) for source
and evidence binding.
