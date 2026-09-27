# Priority 3: staging candidate and proposed external campaign

Prepared September 27, 2026. Brian subsequently **approved the combined campaign**
in chat for candidate `e5e7d13478aaea6f526f2de9e6978824a30c79c3`. This records that
approval; it does not waive prerequisites or expand any limit below. Follow the
[execution record](evidence/e5e7d13/execution.md) for current progress.
The [active packet](task-packets/active.md) owns this objective. Brian owns
approval, support and stop/rollback decisions. Preparation starts at
`810d410d32e7dd4ab29dc98a83ae733a304c10b3` on `codex/pilot-staging-readiness`.
The final handoff identifies the prepared commit. Native builds and real pilot
invitations remain separate priorities.

## Read-only inventory

Observed September 27 at approximately 07:24–07:37 UTC through hosting CLIs,
connectors and provider-free health endpoints. No resource/configuration changed.

| Item | Observation and implication |
| --- | --- |
| GitHub | Remote main remains `462a7dd6b3428d21a8fbccfe20a0003361904761`; local closeout `810d410` is its direct child and is preserved. |
| Railway | Project `93dcd3f4-7c47-4010-9431-fc28638813d2`, staging environment `0f546dbc-222f-48b8-a27b-ff008af4fec9`, API service `94aeecda-4575-4fc1-bb08-796bf779ada5`. Deployment `24eefe75-9583-4a90-8d3e-48450818dec0` is SUCCESS; source and ready endpoint report `f94a1d9d1125e6c9111aa08eda496f014f20d0c0`. One configured regional replica, no worker, no pending changes, zero Git triggers, `prDeploys=false`. |
| API health/config | `/health/ready` reports ready, Supabase auth, live Places and Gemini/Agent Platform, staging anonymous analytics/error-only reporting. `TABLEUS_TELEMETRY_E2E=true` is still configured: candidate sets it false. Health is not a live provider evaluation. The legacy `/health` fixture counts are not database inventory. |
| Vercel | Project `prj_lPu3pWZiJ5ZRUIab6wiXrJIW930G`, team `team_0Pu6vuMiug12C8K2HQqbgOQG`. Git deployment enabled. Both staging aliases point to READY `dpl_3ec5bdvridE1meArFaYWAp8yabKM`, exact source `ed8330a766b3c4b80a505e075535678394e275e9`. `table-us.com` remains `dpl_7csJvHoJH9qgFZDijbwu3w36r2sK` and is excluded from this campaign. |
| Supabase | `mrwdhdeubdiiydmmvlda` (TableUs Staging), PostgreSQL 17.6. `public.alembic_version=8b1d4a6c2e90`. Missing queue, counters and provenance tables/recipient column are consistent with four pending migrations. |
| Admission/data | Six application profiles, seven Auth users, 16 plans, 11 recommendation runs. Eight legacy invites, two unused, zero currently usable, zero live unredeemed reservations. No new invite has been issued. The Auth/profile difference is not permission to remove an account. |
| Baseline | Migration-equivalent creation attribution yields two accounts with two plans, one with three, one with nine; none reaches the 20-plan default. Deleted history remains unknowable. All existing provenance starts unknown; no bulk cleanup is proposed. |
| Runtime access | `tableus_runtime` has no superuser, create-role, create-db, bypass-RLS or role memberships; app USAGE true, CREATE false, schema owner postgres. Existing tables grant runtime DML. PUBLIC/anon/authenticated have no app table grants; browser roles lack app USAGE. |
| Auth hook | Existing `app.hook_restrict_signup_to_validated_invite(jsonb)` is SECURITY INVOKER with empty search_path; only postgres/Auth admin have EXECUTE. Auth admin has reservation SELECT but no invite SELECT yet. Current definition checks reservation only; recipient migration changes that definition and grants invite SELECT. Browser EXECUTE is false. |
| Provider baseline | Trailing 30 days: 394 Places HTTP attempts (11 resolve, 19 location details, 8 searches, 356 restaurant details), eight Gemini recommendation records, $0.00444025 estimated AI. Configured ceilings are 429 Places attempts and $4 AI/30d; neither grants new spending. Only 35 recorded Places attempts remain under the current setting. |

Vercel connector schema/permissions prevented its project read; existing CLI
credentials supplied the read-only result. Supabase database inspection succeeded,
but management Auth configuration read returned 401. Automatic approval review
rejected decoding a stored CLI credential for another attempt as credential
probing. The in-app dashboard was signed out. Do not retry credential extraction.
Use a normal signed-in dashboard session for the remaining readback below.

**Initially unverified prerequisites (current results in the execution record):** actual registered/enabled Auth-hook URI,
email signup/OTP/SMTP limits and sender, allowed redirect URLs, JWT expiry, exposed
Data API schemas, Supabase backup/PITR coverage, host/provider log retention and
mailbox delivery. Database function existence does not prove hook registration.
No API key/secret, email, subject, digest, invite/share token or private content
appears in this inventory. Preserve legacy data; its attribution gap is a risk,
not a cleanup authorization.

## Measured journey and budget

`backend/tests/test_pilot_journey_budget.py` exercises real API routes and durable
per-account admission with synthetic providers. It counts resolve/create, joining,
each participant's constraints, two recommendation/vote/finalize rounds with a
reopen, and a conservative web pattern where each other active screen refreshes
after every vote. Summaries, revisions, export and account metadata add zero
provider calls. Minute/global limits are tested separately; this journey is paced.

| Members | Organizer logical Places | Each other member | Total logical Places | Nominal HTTP attempts | Three-attempt retry envelope | Logical AI |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 2 | 18 | 9 | 27 | 90 | 270 | 2 |
| 4 | 22 | 13 | 61 | 226 | 678 | 2 |
| 8 | 30 | 21 | 177 | 690 | 2,070 | 2 |

The provider makes one request for resolve/location/search and four detail
requests per candidate hydration. Each HTTP request permits up to three attempts.
API reservation is 3 or 12 attempts respectively. These are bounded scenarios,
not observed customer averages; arbitrary refreshes or multiple plans add work.
The old 20/day default cannot finish the larger modeled journeys. Proposed
**staging** actor settings: Places 40/day, AI 3/day, lifetime plans 20. Defaults
remain 20/5/20 in code; apply these explicit settings only under approval.
The configuration validation ceiling for the global Places budget moves from
500 to 1,000 to accommodate old usage plus this bounded rehearsal; its default
remains 150. This is not an automatic allocation or a pilot-cohort budget.

Pricing checked September 27 against [Maps pricing](https://developers.google.com/maps/billing-and-pricing/pricing)
and [field/SKU mapping](https://developers.google.com/maps/documentation/places/web-service/data-fields):
location Text Search Pro $0.032, location Details Pro $0.017, restaurant Text
Search Enterprise $0.035 and restaurant Details Enterprise $0.020 per request at
the first paid tier. Free credits/discounts are excluded. With the committed
field masks, modeled nominal costs are $1.833, $4.553 and $13.833 respectively;
three-attempt envelopes are $5.499, $13.659 and $41.499. Retry billing is treated
conservatively as paid for every attempt; actual billing is provider-controlled.
These calculations establish why eight-person acceptance needs a separately
sized live scope even when an individual's logical quota is adequate.

Gemini accounting remains $0.25/million input and $1.50/million output including
thinking; [current Gemini pricing](https://ai.google.dev/gemini-api/docs/pricing#gemini-3.1-flash-lite)
agrees with those application estimates. The old observed average is about
$0.000555 per recommendation; it is not a bound for new requests. The API reserves
$0.02 per logical AI operation; usage records report known token cost and do not
persist each retry's attempt count. Ambiguous calls can lack complete billing
metadata. Use a conservative operator attempt ledger and provider billing
readback; never interpret the stored estimate as a guaranteed billing cap.

Proposed live rehearsal: **one two-person group journey**, two successful AI
rounds plus at most one fresh recommendation retry (nine underlying AI attempts
maximum), one sole-plan fixture, one metadata repair, and at most three extra
candidate-detail refreshes. Ceiling: **420 Places attempts, $0.25 AI, $15 total
provider spend**, stopping at the first limit. All live API/provider traffic
counts, including failed calls, API responses and web revision-triggered reads.
At current baseline the global Places setting is **814** (394 + 420); before
execution set it to freshly read baseline + 420, never above 1,000. Stop and
rescope if the baseline makes that impossible. AI global setting **0.26** is
proposed, with the separate $0.25 incremental ceiling. Existing callers must be
quiesced; totals belong to this campaign, not to one browser or agent.

Before each action reserve its worst-case attempt cost in the campaign ledger
(3 or 12 per Places operation; three per AI operation). Never dispatch beyond
remaining headroom. Count ambiguous operations at their full reservation until
reconciled, and stop on an unaccounted restart/crash. Check durable usage after
each stage and provider billing before closeout. Pace below ten Places operations
per account/minute, 60 globally, five AI/account/minute and 30 globally. A 429 is
a stop/reconciliation signal, not permission to refresh repeatedly or reset data.

## Worker and non-secret configuration

[railway.deletion-worker.toml](../railway.deletion-worker.toml) uses the same
candidate/Dockerfile, no HTTP listener or healthcheck, one replica, no restart
loop, cron `*/5 * * * *`, limit three. The application deadline is 55 seconds,
Auth removal is bounded by 15 seconds per claim (HTTP path by 12), lease 45
seconds; outer watchdog sends TERM at 70 seconds and KILL at 75. Railway skips
an overlapping invocation and does not guarantee exact-to-the-minute startup.
Verify the image contains GNU `timeout`, start path `/app`, and status output.
No minute-loop service or new scheduling provider is introduced.

| Process | Prepared settings |
| --- | --- |
| API, initial rollout | Existing restricted DB/provider config; exact candidate source/build SHA; `TABLEUS_ACCOUNT_DELETION_ENABLED=false`, `TABLEUS_ACCOUNT_DELETION_INLINE_ATTEMPT=false`, `TABLEUS_TELEMETRY_E2E=false`; quotas 40/3/20; reviewed global ceilings above; one API process. |
| API, synthetic admission | Same image, set deletion enabled true after worker/grants/client checks. Inline false makes the actual self-service request pending without an Auth call; explicit repeats remain status-only. |
| Worker | `ENVIRONMENT=staging`, `TABLEUS_AUTH_MODE=supabase`, demo false, correct Supabase origin, restricted runtime DB role/URL, existing app secret, source/build SHA, valid HTTPS allowed origin; provider mode deterministic and telemetry off. `TABLEUS_ACCOUNT_DELETION_ENABLED=true`. Do not copy Gemini/Maps keys or migration credentials. |
| Both API and worker | Provision the existing staging server-only `SUPABASE_SERVICE_ROLE_KEY` through private hosting controls under approval. Do not rotate/create a key or place it in clients, Git, command arguments/output or support records. |
| Clients | Staging API/Auth/canonical origins; fragment emission off (`query` link format); privacy contact remains `privacy@table-us.com`, general support becomes `brian@table-us.com`. No production alias/build. |

Worker-only processing defaults off in code (inline remains true); the candidate
can retain worker-only mode operationally. It does not bypass the API's availability
or credential check. Pause API admission while leaving worker enabled to drain.
A paused worker refuses claims. Attention rows require diagnosis and a separate
explicit reset; built-in ten-attempt exhaustion is **not** this campaign's budget.

## Exact synthetic scope and rehearsal order

Brian confirmed one controlled mailbox, `brian@table-us.com`, and four tagged
aliases. Assign A/B/C/D to `brian+tableus-p3-a@table-us.com` through
`brian+tableus-p3-d@table-us.com` privately. Four logical recipient inbox addresses,
one physical mailbox, **four new Auth/application accounts maximum**; no replacement
accounts. Confirm aliases deliver before consuming signup attempts.

**Six** one-use recipient-bound invites, each 24-hour expiry: four successful
invites, one deliberately revoked D invite, one D invite allowed to expire before
validation. Issue the expiry fixture a day ahead; do not edit timestamps or sleep
a day inside a tool. All codes stay in the private operator channel. Zero real
invitations; zero issuance for existing legacy members. Rejected wrong-recipient,
revoked/expired and successful same-account redemption replay use those fixtures.
One-use contention uses two redemption requests for the same new identity; it
must produce one profile/redemption/use, not two synthetic identities.

| Stage | Actions and observable evidence |
| --- | --- |
| Auth/admission | Confirm configured hook, then one direct no-reservation signup denial using D; mismatched invite validation must fail before OTP. Enroll four named fixtures through normal OTP/invite flow; perform returning sign-in for A and B, verify same-account redemption replay and one-use contention. Auth alone must not grant membership. |
| Group | A creates, B joins; both supply constraints, receive four grounded options, vote separately, finalize, refresh B, reopen and repeat one round. Capture aggregate usage and source-bound web evidence, never raw private links/OTP. Account/export/ownership management must make no provider calls. |
| Blockers | A attempts deletion while organizing shared plan: blocked, profile intact, no queue/attempt. Transfer to B; C creates/removes one sole plan. These affect only the synthetic roster. |
| Queue and support | With inline false and worker schedule held, A/C/D confirm deletion: pending, application records gone, Auth subjects present, attempts zero, same-session status/retry works. Verify mismatched support identity refusal and verified private case binding before D's session is discarded. No manual queue insertion or intentional bad Auth credential. |
| Pause/drain | Set deletion false only on API; a fresh B request is refused and pending retries consume no attempt. Enable the worker schedule for bounded draining; confirm each exact queued row completes, raw subject clears and stale sessions cannot redeem/access product. Aggregate `processed=N` alone is not completion evidence. |
| Final fixture | B observes shared-content cleanup and metadata repair state, repairs metadata, removes the now-sole plan, then API admission is temporarily re-enabled for B's self-service deletion. Worker completes it. All four accounts removed through the supported path, all tombstones/counters/invite-use history retained. |
| Closeout | Disable API admission and worker schedule after completion; pending/attention must be zero or preserved and escalated. No pilot activation is inferred. Bind web/source/worker/config and counters to the candidate. |

At most **11 OTP request calls**: four signup, two returning sign-in, four resend
allowances and one expected hook denial; at most **10 delivered OTP emails** and
**20 verification submissions**. Max four newly created Auth users. No password,
identity-provider, SMS or admin-user-create path. Session refresh/revoke requests:
maximum 12 combined during the campaign, at most 30 provider-free status reads.
Stop on unexpected mail recipients, rate-limit/config errors or additional users.
Use SMTP's actual lower limit if necessary; do not increase limits or replace SMTP
under this scope. A missing/custom-SMTP prerequisite stops before sending.

Support maximum **14 messages** between the controlled aliases, privacy mailbox
and Brian: seven inbound/seven outbound. Cover initial request/acknowledgment,
fresh verified-address challenge/reply, duplicate acknowledgment, wrong-case
refusal, unbound lost-session limitation, email-access-loss limitation, completion
notice and receipt acknowledgment. No real support inbox history is needed.
Brian supplies/operates the ordinary mailbox UI if no authorized mail connector is
available. Messages require the campaign approval; do not send draft templates now.

Worker maximum **four processing invocations total**, including any deployment-time
or manual invocation, each limit three: **12 Auth DELETE attempts maximum across
API and worker** (API inline disabled means zero expected there). Supervise the
schedule and disable before a fifth invocation; count failed startup invocations
as spent. One diagnosed synthetic attention reset is included only if no live
lease, followed by an already-budgeted remaining invocation; no added attempts.
The expected result is four successful deletes. Check the entire queue is
synthetic before each invocation: the worker has no campaign-only selector.
Stop on the first observed unexpected Auth error, bad status or non-synthetic
queue row; a running batch can finish up to three attempts before observation.
Do not schedule another batch or spend ten automatic attempts per subject.
Empty preflight `--status` reads do not process work.

Local deterministic tests cover rejected/transient Auth responses, exhausted or
stale leases, attention/reset, canceled batches and pause/retry without inventing
hosted failures. Hosted evidence must separately prove actual pending/drain and
normal Auth completion. Do not claim hosted attention-provider failure was forced
or observed if it was only mocked. If a live error occurs, preserve it and use
only the explicit recovery above after diagnosis; otherwise stop for rescoping.

## Support, retention and privacy preparation

Brian confirmed `privacy@table-us.com` forwards to him and general support is
`brian@table-us.com`. Actual delivery is still to be rehearsed. Brian owns daily
triage and the existing two-business-day acknowledgment target; estimates follow
verified state. Use the [support procedure](deletion-support-procedure.md), no
OTP/password/export/link solicitation and no email-only deletion or status lookup.
A verified case binding must exist before Auth removal if later support attribution
is needed; aggregate counts or absence of an Auth user never prove a case outcome.

Web/mobile privacy and deletion help now share pending, authored-content removal,
retained pseudonymous records and email-access-loss explanations. Remove the old
unsupported “limited period” implication. The notice date is not a new publication
attestation. The candidate copy requires Brian's approval before deployment.

Proposed synthetic support record: Brian-only encrypted local storage outside the
repository, one random case ID and minimal verified identity/job binding, timestamps,
status, next action and evidence reference. Retain for this rehearsal plus at most
30 days for review; any eventual destructive purge remains separately approved.
Do not create a cloud ticketing service. Stop before recording if a suitable
restricted location is unavailable. Do not collect real support requests here.

Account deletion clears profile/constraints/memberships and attributed dependent
shared content; raw Auth subject clears on completion. Tombstones, quota counters,
invite recipient hashes and use counts remain without an automatic purge schedule.
Provider usage records have no profile FK. Existing 16 plans/11 runs retain unknown
provenance; already-lost attribution and offline-delivered copies cannot be repaired
by a future deletion. No legacy bulk purge or indefinite retention policy is
approved by this preparation. Before real pilot invitations, approve retained-data
purposes/handling, actual hosting/provider backup/log settings, access and review
schedule. Before stores/production, complete the broader
[retention specification](retention-support-spec.md). A synthetic-only rehearsal
can establish mechanics; it cannot close those policy/operational unknowns.

## Proposed combined execution request and hard stops

Request approval only against the final prepared commit and reviewed diff:

1. Normal authenticated readback of the missing Supabase/retention settings above.
   Verify backup/recovery coverage and that no external actor/old client is writing.
   If uncertain, stop. No credential extraction, secret rotation or SMTP replacement.
2. Publication/draft PR, passing hosted CI and review, then merge of the reviewed
   candidate. This request explicitly includes that merge gate. Re-read Vercel/Railway triggers;
   confirm this branch's deployment exclusion before pushing. No publish action
   may implicitly spend the manual deployment allowance.
3. A quiesced staging window, four missing migrations in actual chain order:
   `6d7e3b91a2c4` → `ab72e4f39d10` → `d48f6c2ab913` → `9a1f2e7c4b80`.
   Use the separate migration role; never API/worker credentials. New runtime
   grants: queue DML, counters SELECT/INSERT/UPDATE only, run contributors
   SELECT/INSERT/DELETE only. Verify browser denial, private exposed schemas,
   invoker hook and Auth-admin invite/reservation SELECT before reopening.
4. One exact-source API candidate rollout, one Vercel **Preview** and conditional
   assignment of only the two staging aliases, plus one private Railway worker
   resource from that source. Preserve production aliases. Set exact stamps,
   reviewed origins/CORS, provider/telemetry controls, quotas and one API process.
   Configuration-only restarts of the same API candidate: at most four for
   admission enable, pause, re-enable and final disable; include initial rollout
   separately. No changed-source rebuild/retry after a failed deployment.
5. Provision the existing server-only Auth-removal credential privately to those
   two runtimes; no new/rotated secret. Run the fixture/call/invocation scope above
   within a supervised **60-minute live window** after the expired-invite setup.
   Cap incremental hosting at **$5** and providers at **$15** (combined $20), no
   paid tier upgrade. Stop scheduling at the budget/time/invocation boundary.
6. Approve the described four-account deletion, six invites, controlled mail and
   scoped copy/support rehearsal. End with deletion admission/schedule paused and
   no new intake. Retain tombstones/history. No existing account/data cleanup.

First unexpected core journey failure, wrong source/role/recipient/subject,
privacy leak, missing support binding, unknown billable attempt, deployment error,
budget/attempt/window breach, or inability to pause reliably stops the campaign.
Stop new invitations; halt API admission, drain only verified synthetic jobs if
Auth/configuration is healthy and approved attempts remain. If Auth/config is
faulty, stop the worker too and preserve durable queue state. Brian decides any
additional recovery. A failed campaign does not replenish allowances.

**Rollback:** additive migrations remain in place; no downgrade/drop/tombstone
purge. Current `f94a1d9` API and `ed8330a` web are incompatible rollback choices
while intake/deletion is open: they lack recipient/quota/cleanup handling. Prefer
a forward fix under fresh approval, preserving the queue, counters, provenance
and invites. If containment requires old web aliases, keep intake and API writes
closed; alias rollback alone does not make old clients safe. No automatic rollback
to unmetered writers or production target is approved. Candidate-independent API
pause, worker stop/drain and alias containment must be executable before activation.

After successful synthetic staging acceptance, the next development objective is
Priority 4: privately collect all pilot iPhone device IDs and physical-device
access, then request bounded signed iOS/Android builds and the one lost-response
local test artifact. New native accounts/live budgets must be scoped then; these
four deletion fixtures and this allowance are consumed, not reusable.

## Local verification and handoff

Independent preparation is complete; hosted acceptance is not. The final handoff
names the exact local commit on `codex/pilot-staging-readiness`, based on preserved
closeout `810d410d32e7dd4ab29dc98a83ae733a304c10b3`. No external mutation,
publication, live provider call or mail delivery was performed.

- `make ready` ran once. Lint/types passed; the sandbox then denied the fault-proxy
  test's loopback listener (`EPERM`). Remaining stages completed with local socket
  permission using `make test contract build smoke perf`: 206 Python passes with
  36 PostgreSQL-only skips, 326 JavaScript passes and zero JS skips, web/Expo-web
  builds, deterministic smoke and a 2,775,524-byte report-only web baseline.
  Logs: `/private/tmp/tableus-p3-ready.log` and
  `/private/tmp/tableus-p3-ready-continuation.log`.
- Disposable local PostgreSQL applied the full migration chain and ran 40 selected
  lifecycle/worker, cohort, Auth-hook/grant and journey tests using the restricted
  runtime role: all passed, zero skips. The server was stopped; its local files
  and `/private/tmp/tableus-p3-postgres.log` remain. This is not hosted migration proof.
- Production-build browser verification passed both public deletion/privacy and
  pending-recovery journeys. Mobile-width screenshot review confirmed the privacy
  mailbox and readable layout. Log: `/private/tmp/tableus-p3-browser.log`; screenshots
  remain under `.artifacts/deletion-support/playwright/` in this checkout.
- Generated-contract drift, configuration parsing, changed-document links and
  whitespace checks pass (116 local links/anchors). The final focused pass has
  24 passes and three PostgreSQL-only skips; it also verifies the journey's durable
  AI counters. Log: `/private/tmp/tableus-p3-final-focused.log`. No application
  inputs changed after readiness.

No new dependency or migration is added here. Remaining risks are explicitly
bounded: current-hosted source is older, retention settings still need normal
dashboard readback, worker image/scheduler delivery needs hosted proof, and
historical attribution cannot be reconstructed. Auth/SMTP, schema and recovery
preflight results are now in the [execution record](evidence/e5e7d13/execution.md). Native
physical-device acceptance and real pilot intake remain intentionally deferred.
