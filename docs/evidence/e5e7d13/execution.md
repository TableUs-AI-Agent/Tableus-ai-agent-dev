# Priority 3 execution record

## Authorization and source

Brian approved the complete [prepared campaign](../../pilot-staging-preparation.md)
on September 27, 2026, replying “approve” to the candidate-bound request.
Application candidate: `e5e7d13478aaea6f526f2de9e6978824a30c79c3`.
Preparation base: `810d410d32e7dd4ab29dc98a83ae733a304c10b3`, directly above
integrated main `462a7dd6b3428d21a8fbccfe20a0003361904761`.
Branch: `codex/pilot-staging-readiness`; checkout: `.worktrees/pilot-realignment`.
Subsequent documentation records execution without changing application inputs.

Approval includes publication/draft PR, hosted CI and review, merge, four staging
migrations, one API rollout, one web Preview with the two staging aliases, one
private worker and existing server-only credential configuration. The synthetic
rehearsal is bounded by four accounts, six one-use invitations, 420 Places HTTP
attempts, three logical/nine underlying AI attempts, $0.25 incremental AI,
$15 total providers, $5 hosting, eleven OTP requests/ten emails/twenty verification
submissions, fourteen support messages, twelve refresh/revoke calls, thirty status
reads and four worker invocations/twelve total Auth DELETE attempts. The live
window was originally sixty minutes after the day-ahead expired-invite setup;
Brian's September 28 split request now shares those sixty supervised live minutes
across two sessions, with a stopped interval. Narrower limits
and all stop rules in the campaign apply; no allowance has been replenished.

## Preflight observed September 27, approximately 07:53–07:57 UTC

- Local candidate and worktree were clean before this approval record. Remote
  main still equals `462a7dd`; the objective branch and PR do not yet exist remotely.
- Vercel Git deployment remains enabled at project level. Candidate `vercel.json`
  explicitly disables Git deployments for the objective branch and `main`.
- Railway still runs API deployment `24eefe75-9583-4a90-8d3e-48450818dec0`, one
  configured us-west2 replica, no worker and no pending changes. The project has
  zero deployment triggers and `prDeploys=false`.
- Read-only Supabase query at `2026-09-27T07:56:48Z` confirms migration head
  `8b1d4a6c2e90`, six profiles, seven Auth users, sixteen plans, eleven recommendation
  runs, eight invites, zero active invites and zero live reservations. Provider
  baseline is unchanged: 394 Places attempts, eight Gemini recommendations and
  $0.00444025 estimated AI in the trailing thirty days. No account content or
  identifying values were retrieved by this inventory.
- Brian completed normal Supabase dashboard sign-in. No credential extraction
  was retried after the earlier automatic-review denial.

## Auth, schema and recovery preflight

Dashboard readback confirms the Before User Created hook is enabled and points
to `app.hook_restrict_signup_to_validated_invite`. New signup and email confirmation
are enabled; anonymous sign-in and manual linking are disabled. Custom Resend SMTP
is enabled (`smtp.resend.com:465`) with a configured sender, hidden stored password
and sixty-second per-user email interval. Limits are thirty emails/hour, thirty
signup/sign-in and thirty verification requests per five minutes/IP, and 150 token
refresh requests per five minutes/IP. No limit or credential was changed.

Email OTPs have eight digits and expire after 3,600 seconds; clients accept variable
length codes. Signup and returning-sign-in templates both contain `{{ .Token }}`.
The signup template's stale “six-digit code” wording was changed to “verification
code” through the normal dashboard and verified after reload. Its subject, token,
sender and delivery/security settings are unchanged. Proof is saved privately at
`/private/tmp/tableus-p3-signup-template.png`; no email was sent.
Site URL is `http://localhost:3000`, with no redirect allowlist. This campaign uses
code verification only; templates and clients do not use redirects. Redirect-based
Auth remains outside acceptance until its origins are explicitly configured.
Access tokens expire after 3,600 seconds; refresh replay detection is enabled with
a ten-second reuse interval. Session duration/inactivity are unlimited on Free.

Data API is enabled for `public` and `graphql_public`; `app` is explicitly excluded.
Its automatic new-table exposure toggle is enabled, so the post-migration check
must still verify the intended private app grants. Extra search path is
`public, extensions`; no schema exposure was changed.

Supabase Free has neither scheduled backups nor PITR. The existing linked CLI's
normal `db dump` path succeeded without manual credential extraction. Following
the [official logical-backup procedure](https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore),
roles, schema and data were exported to an owner-only directory outside Git on the
local FileVault-encrypted disk:
`/Users/brianchei/Library/Application Support/TableUs/Backups/2026-09-27-p3`.
No plan upgrade, cloud backup resource, key rotation or hosted restore occurred.

| Backup | Bytes | SHA-256 |
| --- | ---: | --- |
| roles.sql | 654 | `e47e4db72b17e5200c45d7e211739e668623269925df924f06642f94b5b25b7a` |
| schema.sql | 17,037 | `b28a83eb82a8e48cd97eb28c866c96d0a92b4b12e009da6ba2d459477a3a1e05` |
| data.sql | 128,134 | `166bfc016ee44834ce7e27a3f4a5a1046ac5243216339bd14c65e33424394dbd` |

An isolated local PostgreSQL 17 instance restored all fourteen app/public tables
and 404 rows; counts match the export. Managed extensions were omitted from this
local-only schema copy, and placeholder platform roles/an empty Realtime publication
were supplied. All four Alembic upgrades passed against the restored snapshot:
head `9a1f2e7c4b80`, six profiles, sixteen plans, eleven runs, sixteen backfilled
creation credits, empty queue, correct runtime queue DML and no runtime counter
DELETE or browser queue SELECT. The server is stopped; private logs and
`restore-verification.json` remain beside the backup. Two local harness setup
failures (space-containing socket path, missing publication) were corrected;
neither touched hosted state or application source.

The export includes seven Auth users and related Auth records, but managed Auth/
storage restoration was not tested. It is a local recovery checkpoint, not an
off-site backup, full project clone, hosting-configuration backup or permission to
restore/overwrite staging. Original files remain unchanged; any destructive
retirement needs its existing gate. No stored secret or private row contents were
printed or committed.

## Hosting and telemetry retention readback

Vercel team is Hobby; Railway workspace is HOBBY. Current documented runtime-log
access is one hour for [Vercel Hobby](https://vercel.com/docs/logs/runtime) and
seven days for [Railway Hobby](https://docs.railway.com/observability/logs).
These access windows are not a provider-wide erasure guarantee. Railway workspace
usage baseline is $2.790764313797531 for September 20–October 20; existing services'
ordinary usage is distinct from the $5 incremental campaign ceiling.

PostHog connector readback confirms project `578352`, organization
`01a03e29-5cd0-0000-5731-1ddec9f8b373`, session recording disabled and a configured
recording-retention field of 30 days. That field does not establish analytics-event
retention. The connector's advertised `learn` command is unavailable to this client;
its supported read-only project/organization schemas were inspected. Billing
read scope is unavailable. Brian's initial dashboard sessions exposed only Sellr;
no Sellr setting was changed or accepted as TableUs evidence. On September 28
(September 29 UTC), Brian switched to the existing TableUs account. The PostHog
dashboard now confirms project `578352` and Free plan, with no payment card.
The connector's supported documentation search establishes the Free plan's
[one-year events query window](https://posthog.com/docs/data/events-retention).
This applies to event queries, is distinct from replay retention, and is explicitly
not a data-deletion mechanism. The privacy setting does not discard IP data;
the application must continue its existing telemetry allowlist/scrubbing. No
PostHog setting was changed and no broader access was requested.

Sentry's normal dashboard confirms TableUs Staging, organization
`4511977317466112` (`tableus-staging`), US data region, Developer plan and no
payment method. The plan shows 14/5,000 error events, zero dropped errors, and no
log/replay/span ingestion this cycle; the existing uptime-monitor slot is occupied.
[Sentry's current policy](https://www.sentry.help/en/articles/13964940-how-long-are-my-organization-s-audit-logs-stored)
gives Developer events 30 days and organization audit logs indefinite retention.
These distinct scopes must not be presented as universal erasure deadlines.
No Sentry setting, monitor or plan was changed. Telemetry-retention preflight is
complete for this synthetic campaign; retained-data purposes, enforceable purge
policy, broader provider records and real-pilot/store acceptance remain open as
specified in the prepared campaign.

The PR description is prepared privately at `/private/tmp/tableus-p3-pr-body.md`.
Read-only GitHub inspection confirms no existing objective-branch PR. Deployment
exclusions, worker configuration syntax and unchanged application inputs passed
local checks. The September 29 `02:21:21Z` refresh confirms the same migration head,
six profiles, seven Auth users, sixteen plans, eleven runs, eight invites, zero
active invites/reservations and last provider activity September 17. Older usage
has aged out of the rolling window: 306 Places attempts and $0.00224625 AI are now
recorded in thirty days. Re-read immediately before setting the runtime ceiling;
the current baseline-plus-420 calculation is 726, not an additional allowance.
Remote main is still `462a7dd`; no objective branch/PR exists. Railway still runs
the same deployment with one replica, zero Git triggers, `prDeploys=false` and no
pending changes. Vercel Git deployments are enabled at project level; branch/main
exclusions remain present in the candidate. Publication can proceed without
spending a manual deployment allowance. Quiescing API writes remains required
before any hosted migration.

## Review and reused verification

The integration review inspected queue-only admission/retry, unchanged worker
claim/deadline handling, configuration bounds, contact/privacy copy, the explicit
worker config, migration ancestry and deployment exclusions. No blocking code
finding was identified. This is the bounded change review, not a reopened security
scan or hosted acceptance.

Local verification remains as recorded in the prepared campaign: readiness stages,
206 Python passes (36 PostgreSQL-only skips), 326 JavaScript passes, forty selected
restricted-PostgreSQL passes, two browser journeys and final focused checks. No
application bytes changed after those checks. Hosted CI subsequently passed as recorded below.

## Integration and rollout, September 29 UTC

The branch was published with deployment exclusions verified. Draft PR #9 was
reviewed and [CI run 36512407578](https://github.com/TableUs-AI-Agent/Tableus-ai-agent-dev/actions/runs/36512407578)
passed on `d2ccc7e32015b8982b64035382d7a3ab03b64acf`: **242 Python, 326 JavaScript
and five browser tests, zero skips**, plus restricted-role migrations, lint/types,
seven deterministic evaluation cases, contracts, web/Expo-web builds and smoke.
No blocking change-review finding remained. [PR #9](https://github.com/TableUs-AI-Agent/Tableus-ai-agent-dev/pull/9)
merged at `2026-09-29T02:33:07Z` as
`2eefdc51345aeaa7951ffb343954c1669f9280c5`. Both head and merge have tree
`35798fe4ae9e5f2b7f12f054f50b0068d52783a6`. Application inputs remain the approved
`e5e7d1`; intervening commits contain documentation only.

### Quiescence, backup and migrations

The installed Railway scale command rejected its documented project flags before
any mutation. The supported `deploymentStop` operation then stopped all old API
instances; Railway reported `deploymentStopped=true`, readiness returned 502 and
there were no active runtime database statements. The service/configuration was
preserved. A fresh owner-only backup was saved outside Git at
`/Users/brianchei/Library/Application Support/TableUs/Backups/2026-09-28-p3-quiesced`.
Roles/schema hashes match the September 27 export; fresh data is 128,616 bytes,
SHA-256 `697a402cbf870f87bec773abaa5159aadcd03080e67cc27cae20dac3126bb69c`.
The prior local restore verification remains the recovery exercise; the fresh
Auth-inclusive export is not a full managed-project restore test.

The normal linked CLI supplied its temporary database login in memory. It has
existing postgres-role membership; explicitly selecting that role and committing
the connection setup lets unchanged Alembic retain the migration role. This did
not create a role, grant access, decode a Keychain credential or enable JIT access.
TLS certificate and hostname verification used the public Supabase root CA.
The first two read-only connection checks diagnosed certificate/role setup; no
migration was attempted until `alembic current` passed at the expected old head.

The four unchanged migrations then passed once, in their approved order, ending
at `9a1f2e7c4b80`. Post-migration checks confirmed:

- Six profiles, seven Auth users, sixteen plans, eleven runs and eight legacy
  invites preserved; empty queue and sixteen creation credits backfilled.
- All legacy plans/runs remain `legacy_unknown`; no attribution was invented.
- Runtime queue DML, counter SELECT/INSERT/UPDATE and contributor SELECT/INSERT/DELETE.
  Runtime has no schema CREATE, superuser, create-role/database or bypass-RLS.
- Browser roles have no app USAGE or new-table grants. The app schema remains
  excluded from Data API. Auth hook is invoker with empty search path; Auth admin
  has invite/reservation SELECT and EXECUTE, browser EXECUTE false.

### Exact-source API, web and worker

Both services and Vercel received a fresh `git archive` of merge `2eefdc5` (1,016
tracked files); no local secret/fixture file was included. Railway's uploaded
archive has no provider Git-source attestation; the archive command, observed
build inputs, release stamps and image metadata bind this deployment. No claim
of an independently recomputed remote source-tree hash is made.

| Target | Deployment and result |
| --- | --- |
| API | `217e257f-9fbe-40fb-adec-ce231ff54c28`, SUCCESS, readiness reports full `2eefdc5` SHA; image `sha256:4fc94ba63d5ee76f5e9e25868a0a347db252b12d4defacfcfa30078598d4c5b8`. One us-west2 process. |
| Vercel Preview | `dpl_7j4HwYgzPw4139i3W535V5iUFqrv`, READY, target Preview, node 22.x; source metadata full `2eefdc5`. URL `https://tableus-staging-mvbl5qxnl-briancheis-projects.vercel.app`. |
| Private worker | Service `cac758a2-077c-4011-bff5-12b52db2d05a`, deployment `18a8f3f8-886e-4dac-ba7e-9804bb584f75`, SUCCESS and exited; image `sha256:292ac97e9120612919399186ce53dbb68e650851f293c8d0a69421b2cae27797`. |

API deletion admission and inline attempts are false; telemetry E2E is false,
actor quotas 40 Places/3 AI/20 lifetime plans, global AI $0.26 and Places 726.
The fresh baseline at configuration was 306; no new call allowance was created.
CORS is restricted to the two staging aliases; the normal preflight passed.
Existing server-only Auth-removal credential was passed privately via stdin to
API/worker with automatic deploys suppressed, then verified in memory. No key
creation/rotation. Neither runtime has a migration credential. Worker has only
restricted runtime credentials, deterministic providers and telemetry off, with
no Maps/Gemini keys or telemetry credentials.

Vercel public origins and absence of runtime DB/removal credentials were verified
through supported environment pull. Sensitive values are not returned by that
CLI, so blank pulled fields are not absence evidence. Source stamps, staging
telemetry, E2E=false and query-link emission were explicit deployment overrides.
Sentry build upload stayed disabled, matching the previous accepted staging
Preview; no new symbol-upload operation or credential change was introduced.

Only `tableus-staging.vercel.app` and `links.table-us.com` moved to the new Preview.
Both `table-us.com` and `www.table-us.com` still point to
`dpl_7csJvHoJH9qgFZDijbwu3w36r2sK`, including the existing apex redirect.
Deletion/privacy/terms pages return 200 and contain the approved privacy/support
addresses and retention explanations. Fifteen public script assets were checked; two contain the exact merged release
stamp. Browser review confirmed the public layout;
proof: `/private/tmp/tableus-p3-public-deletion.png`. The ordinary staging origin
restored a pre-existing legacy browser session during public-page review; no
account action was taken and that tab was closed. Future synthetic acceptance
must use isolated sessions. Auth audit readback since 02:40 UTC had no events.

Railway's connector rejected selecting the prepared TOML for the new worker;
[the provider now prohibits new-service Config as Code](https://docs.railway.com/infrastructure-as-code).
The normal service controls accepted identical Dockerfile, watchdog/start command,
one replica and NEVER restart settings. Deployment metadata confirms no file
manifest, no healthcheck, no public domain and no cron. The approved five-minute
schedule remains held until supervised draining; scheduled delivery is not yet
proven. This configuration adaptation did not change application source.

Worker invocation **1 of 4** started at 02:47:36Z, logged `processed=0`, then
`worker_available=true`, pending/attention/leases all zero, and exited after about
seven seconds. This proves the watchdog command/image/start path and empty
runtime access, not real Auth deletion. No Auth DELETE attempt occurred.

### Day-ahead expiry fixture and holding state

The supported invite CLI, with the restricted runtime login, created one one-use
D fixture for `brian+tableus-p3-d@table-us.com`. Its actual expiry is
`2026-09-30T02:48:54.780853Z`, **September 29 at 9:48:55 p.m. Central**.
No timestamp was edited; it has not been validated or sent. Code and ID are in an
owner-only 0600 record outside Git:
`/Users/brianchei/Library/Application Support/TableUs/Rehearsals/2026-09-28-p3/d-expired-invite.json`.
The post-issuance inventory has nine invites and one active recipient fixture,
with all other legacy counts unchanged and queue empty.

The new API was stopped again after readiness/CORS/public-page checks so no
application writes or provider calls can run during the expiry wait. Railway
confirmed both API and worker stopped, with no worker cron/next run. No API
configuration restart has been consumed. Its first approved admission restart
must resume this same image, after fresh source, queue, mailbox and budget checks.
Read-only Railway schema discovery exposes `deploymentRedeploy(id,
usePreviousImageTag: true)` for explicit previous-image reuse. Do not use an
unqualified source redeploy; verify the resulting image digest and applied
variables before any live request. That path is discovered, not yet exercised.
At 02:50 UTC, older Places usage had aged down to 272, with last provider activity
still September 17. Tighten the rolling ceiling on resume; retain the independent
420-attempt campaign ledger regardless of aging.

Railway workspace usage immediately before rollout was $3.5537236772908645;
post-rollout read was $3.5582677543201853, a $0.0045440770293208 difference across
all workspace services. This is delayed aggregate billing, not exact attributed
campaign spend or final billing. Keep the $5 incremental hosting backstop and
reconcile at resume/closeout. No paid plan upgrade occurred.

## Allowances and next action

Consumed: one approved merge, four migrations, one API rollout, one Vercel
Preview/two staging alias assignments, one private worker resource/deployment,
one of six invitation fixtures and one of four processing invocations. The two
existing-credential assignments and approved runtime configuration are complete.
API configuration restarts: **0/4**. Auth DELETE attempts: **0/12**. New accounts,
OTP sends/verification, support messages and live provider requests: **zero**.
No 60-minute live window has started. Local/read-only tool setup errors above
consumed no hosted deployment, worker processing or provider allowance.

Next: after Brian's mailbox/browser readiness, resume the same API image under the
first allowed admission restart for session one. Only session two waits for real
expiry. Use fresh isolated identities and only remaining invitations/invocations.
Do not add a rollout, reset budgets, reuse legacy identity/session data or activate
real intake. End with deletion admission and scheduling off. Native builds,
production, broader retention policy and real pilot invitations remain deferred.

## Split authorization, September 28 Central / September 29 UTC

Brian requested “split the rehearsal.” No live test had started when this change
was recorded. Session one receives at most 45 supervised live minutes; session two
uses the remaining original allowance, at least 15 minutes reserved. Stopped wait
time is excluded. No account, invite, OTP, support, provider, worker, restart or
spending allowance is replenished. No additional deployment is authorized.

The [active packet](../../task-packets/active.md#split-rehearsal-authorized-september-28-central)
defines the revised order. Session one includes Auth/group/blocker/pending/support,
API pause/B refusal, bounded A/C/D drain and B's content repair/sole-plan removal.
Defer B's already-budgeted returning sign-in to session two, together with real
expiry rejection and B's final deletion. Source inspection confirms public invite
validation checks the invite's expiry before creating a reservation, independently
of an Auth identity; the later D rejection needs no replacement account or OTP.
The API stays stopped and worker schedule absent between sessions. Session-two
re-enable doubles as same-image resume, retaining exactly four configuration
restarts. Mailbox operation remains a prerequisite; no test mail was sent here.

## Session-one preflight, September 29 UTC

Brian selected option 1: he operates the mailbox and enters codes directly in
TableUs. The four tagged aliases' delivery is not yet confirmed. No signup/code,
support message, new invitation, API restart or live session started in this pass.
Chrome's staging and links origins both show the explicit signed-out Account
state; the old in-app staging identity was neither used nor cleared. The first
signup form is prepared with an empty invite field and its send button disabled.

Read-only checks confirm the same stopped API/worker image digests, no worker
schedule, expected source/runtime role/credentials configuration, both new staging
alias targets and both unchanged production targets. The migration head and legacy
six profiles/seven Auth users/sixteen plans/eleven runs match; queue and active
reservations remain empty, with nine invites/one active expiry fixture. Browser
schema denial, restricted runtime, invoker hook and Auth-admin execute pass.
Provider rows since rollout remain zero. The fresh rolling Places baseline is
270, requiring a fresh baseline plus remaining allowance at admission (currently
690, down from configured 726), never an allowance reset.

Railway's delayed workspace usage is $3.567051228426481, $0.0133275511356165 above
the pre-rollout baseline across the workspace. It is not exact campaign attribution.
No hosted configuration or service state changed. The first restart remains unused;
finish alias-delivery readiness before starting the live clock.
