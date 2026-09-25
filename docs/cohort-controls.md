# Closed-beta cohort controls

Local implementation, not cohort activation. Brian owns current development;
historical shared work keeps its attribution. All provider checks here use
synthetic local data and mocks, never paid calls.

## Admission rules

| Setting | Proposed default | Meaning |
| --- | --- | --- |
| `COHORT_AI_OPERATIONS_PER_DAY` | 5 | Logical live AI operations per authenticated account per UTC calendar day |
| `COHORT_PLACES_OPERATIONS_PER_DAY` | 20 | Logical live Places operations per authenticated account per UTC calendar day |
| `COHORT_PLANS_LIFETIME` | 20 | Successfully committed plan creations, plus migration baseline |
| `TABLEUS_OPERATOR_SUBJECTS` | Empty | Exact comma-separated trusted Auth subjects allowed to inspect aggregate usage |

These are configurable starting values, not permission to spend or launch. The
owner was asked for a preference; absent a different selection, code retains
these proposed defaults. Limit fields reject zero/negative values and excessive
values (see Settings); changing limits does not erase counters. No automatic
quota reset, operator override endpoint or budget increase is added.

Daily quota increments commit **before provider dispatch**. Retries internal to
one provider operation share one debit; a fresh API operation is another debit.
Failures, cancellation after reservation and ambiguous outcomes are not refunded.
A global-budget refusal before actor admission does not debit the daily quota.
Deterministic providers do not consume daily provider quotas. Existing per-minute
limits, rolling global Places attempts and estimated AI spend budgets still apply.
This is a logical-operation cap, not a token/currency allowance or pricing claim.

Places calls include location resolution, discovery and candidate hydration.
A recommendation journey can therefore consume several Places operations, and
reading a saved candidate plan consumes another. Reaching the cap can prevent
full plan-detail refresh and vote/finalize/reopen responses until the next UTC
day. These three mutations hydrate before changing durable state, so quota/provider
failure does not masquerade as a failed write after it committed. Their successful
response reuses that hydration without another charged call. Plan summaries,
revision reads and account-management metadata remain provider-free. No synthetic
restaurant details or persisted provider display cache is introduced. Tune caps
against affected release journeys before activation; local checks do not establish
that the proposed defaults are sufficient for the cohort's real usage.

Plan creation first checks the current allowance before location work, then
increments atomically in the same transaction as the new plan. A failed transaction
rolls back its plan debit. Concurrent creates may both pass the cheap precheck
and spend bounded location operations, but only available plan slots can commit.
Successful idempotency replay does not debit again. Deletion, transfer, profile
removal/recreation, process restart and another worker do not refund a creation.
This limits creations, not the number of shared plans a recipient may organize
or join. Named invites and cohort size still need separate controls.

## Migration and data treatment

Migration `ab72e4f39d10` follows `6d7e3b91a2c4`. New private
`app.cohort_counters` rows key by stable subject digest, kind and UTC-day/lifetime
period, with count and update time. No raw Auth ID, email or foreign key to a
profile is added. These are **pseudonymous**, not anonymous records. Profile or
plan deletion does not erase them; otherwise re-enrollment could reset limits.
No new purge schedule is implied. Retention/support disclosure remains a release
gate, alongside the existing account-deletion tombstone policy.

The migration counts each surviving plan once. It uses the earliest usable
`plan.created` event's actor, else the current organizer. This fallback can
attribute a transferred plan to its current organizer when original authorship
is unavailable. Deleted historical plans/events cannot be recovered. Thus the
baseline is approximate; exact lifetime creation enforcement is prospective
from this migration, not a claim of complete historical reconstruction. Review
existing-user baseline impact before hosted migration. Migrating without pausing
writes from older API versions would leave a race with unmetered legacy creates;
quiesce old writers during the approved rollout and deploy only compatible code.

The runtime role receives SELECT/INSERT/UPDATE but not DELETE, TRUNCATE, REFERENCES
or TRIGGER; the migration explicitly removes inherited default grants first.
PUBLIC/anon/authenticated have no access. The trusted runtime can update counts;
these permissions are least privilege, not tamper-proof accounting. No API route
exposes counter mutation. Hosted exposed-schema/grant checks remain mandatory.

## Operator visibility and response

`GET /api/v1/provider-usage/summary?days=30` requires an approved profile and exact
membership in the server allowlist. Empty configuration denies everyone; email,
client headers, profile names and editable JWT metadata cannot grant access.
The query accepts 1–30 preceding days and returns only provider/operation totals,
input/output units and estimated cost. It includes no account IDs, email, quota
digests, request contents or credentials. Ordinary members receive 403.

Configuration is process-cached. Grant/revoke operator subjects through the
approved server configuration rollout and verify every API process has received
it; changing an environment record alone does not hot-revoke a running process.
No operator subject has been provisioned by this task.

For quota pressure, a trusted operator can run this aggregate-only SQL using the
private database path (never from a browser client or public Data API):

```sql
SELECT kind, period_key, count(*) AS account_count, sum(used) AS operations
FROM app.cohort_counters
WHERE period_key IN ('lifetime', to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD'))
GROUP BY kind, period_key
ORDER BY kind, period_key;
```

Provider usage totals and quota admissions are different: an ambiguous/crashed
operation can retain a quota debit without a recorded provider outcome. Do not
promise refunds or infer billed cost from the quota counter. On 429, preserve the
user's input and wait for the indicated reset; lifetime creation needs an owner
capacity decision, not delete/recreate. Changes to proposed caps require reviewed
cohort/budget impact; they do not extend prior native or provider allowances.

## Remaining release gates

No deployment, hosted migration, secret, operator account, real-user operation,
invitation, native run or beta activation occurred. The existing native task owns
its candidate and active validation environment. Do not replace shared services
while it uses them. Provider global reservations and idempotency remain scoped
to one API process; durable actor counters do **not** authorize horizontal scaling.

Before rollout: approve exact source/targets and a quiesced migration window,
review baseline/retention impact and realistic quota values, configure the
operator, verify actual hosted grants, then complete affected web/native acceptance.
Do not roll back to an unmetered API while cohort admission is open. Named one-use
invite issuance, capability-link disposition, production configuration, distributed
build acceptance and explicit cohort/spend approval remain separate roadmap work.
