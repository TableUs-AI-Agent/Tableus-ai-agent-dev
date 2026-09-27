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
window is sixty minutes after the day-ahead expired-invite setup. Narrower limits
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
read scope is unavailable; analytics-retention readback remains open. Both PostHog's
normal dashboard and Sentry's dashboard are signed out; Brian has been asked to
sign in to each. No scope expansion or substitute credential was requested.

## Review and reused verification

The integration review inspected queue-only admission/retry, unchanged worker
claim/deadline handling, configuration bounds, contact/privacy copy, the explicit
worker config, migration ancestry and deployment exclusions. No blocking code
finding was identified. This is the bounded change review, not a reopened security
scan or hosted acceptance.

Local verification remains as recorded in the prepared campaign: readiness stages,
206 Python passes (36 PostgreSQL-only skips), 326 JavaScript passes, forty selected
restricted-PostgreSQL passes, two browser journeys and final focused checks. No
application bytes changed after those checks. Hosted CI has not run for this candidate.

## Allowances and next action

One routine staging configuration change is complete: the signup email wording
correction above. All other campaign mutation counters remain **zero**: no
publication/PR/merge, hosted migration, resource/secret change, runtime configuration
change, deployment, invite, synthetic account, email, provider operation or worker
invocation. Campaign incremental spend is zero; existing services continue their
ordinary billing.

Finish provider-retention readback, then publish the approved candidate,
run CI/review and follow the migration/rollout/rehearsal order. Missing access is
a prerequisite, not a request for repeated campaign approval. Do not start paid or
Auth traffic, substitute credentials, or skip the remaining preflight. Preserve
production, existing identities/data, native artifacts and all closed allowances.
