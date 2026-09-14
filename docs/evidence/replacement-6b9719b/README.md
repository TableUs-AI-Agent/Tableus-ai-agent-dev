# Replacement verification execution

Status: owner approved execution on 2026-09-14; hosted CI/deployment pass and
sequential native execution is in progress.
The [approval record](execution-approval.json) binds the owner's direct reply to
the plan at `9ee4a8035389d2cdd26e2dec2efae0eb39c5ee42`. The preflight remains a
historical snapshot; source-bound execution evidence follows separately.

[Deployment evidence](deployment.json) records the exact-source CI and healthy
Railway/Preview deployments, CORS, reduced provider ceiling and unchanged
Production pointers. Fresh [PostHog](posthog-baseline.json) and
[Sentry](sentry-baseline.json) baselines contain no replacement canaries.
Native/device/telemetry delivery and cumulative acceptance remain outstanding.

## Candidate and readiness

- Application: `6b9719b4e63e34803f2e7c2598e45851790df661`, clean detached source
  and local publishing ref `codex/replacement-6b9719b`.
- Operator tooling: `1c75832ef421335662319635e1b74888476cdb77`.
- The [staging security review](../source-review-6b9719b/README.md) is already
  accepted. Its source/report and the two recorded medium risks are unchanged.
- [Preflight evidence](preflight.json): six retained c5b041c artifact/receipt
  sets verify, no replacement artifacts exist, and all six new build-input
  checks pass. Runtime, dependencies and build-tool bytes match prior checks;
  another full `make ready` would repeat those unchanged checks.
- Node 22.23.1, EAS 23.2.0, Xcode 26.6 and the existing Android API 36/ARM64
  tools are available. Expo authentication and a local signing identity exist.
  Resolved iOS readiness configuration has the exact replacement SHA and staging
  endpoints. Final credential reuse and artifact inspection remain build gates.
- The prior six builds took about 98 minutes of compilation. This is historical
  timing, not a duration guarantee; device checks and any token-expiry wait add time.
  iOS/Android test targets are stopped. The physical iPhone is paired but currently
  unavailable; reconnect/unlock it when its signed artifact is ready.

## Approved execution scope

1. Update existing **Preview/staging** source stamps, then push only
   `codex/replacement-6b9719b` and run its GitHub CI. A branch push automatically
   creates Vercel Preview, so prepare stamps before pushing. No evidence-only
   descendant is a substitute for the application SHA.
2. Deploy the exact SHA to the existing Railway `tableus-staging` API and Vercel
   `tableus-staging` Preview. Verify Git metadata, `/health/ready`, Preview CORS
   and source stamps. Preserve the Production target, its aliases and protection.
   Existing service/project/environment IDs and rollback source c5b041c are in
   the preflight record. No migration, merge, new service or secret is included.
3. Build the six existing profiles locally and sequentially: `test-ios`,
   `test-android`, `readiness-ios`, `readiness-android`, `telemetry-test-ios`,
   `telemetry-test-android`. Run each deterministic lifecycle/offline suite before
   advancing beyond the first pair. Reuse existing signing credentials only;
   stop if new credentials are needed. Inspect source/signer/checksums before
   installation; retain every artifact and receipt in the prepared private
   `.artifacts/mobile/<application-sha>/` directory in the primary checkout.
4. Verify both sign-out directions, plan refresh behavior and the required
   current-source readiness/telemetry observations using existing approved
   accounts and the existing dinner plan. Preserve its existing recommendation
   run; no fresh Gemini generation is needed. Scope includes refreshed views,
   ranked votes, organizer finalize/reopen, private-link rotation/rejection and
   read-only account export/deletion readiness. Do not delete accounts or plans.

## Budget and operating limits

| Measure | Bound for this approved run |
| --- | --- |
| Additional Places attempts | At most 80, including failed attempts and detail reads |
| New Gemini generations | Zero; no additional live-AI evaluation |
| New sign-in emails | At most four total, entered only in the apps/browser |
| Telemetry | One canary per web/iOS/Android flow; up to five analytics and five error events including API companions; no blind resends |
| Native concurrency | One native build or simulator/emulator workload at a time |
| Disk | At least 20 GiB before starting each build; stop before 8 GiB; no unrelated cleanup |

The current **project-wide 30-day** Places total is 269 against a runtime ceiling
of 500. It includes earlier work and is separate from the completed c5b041c run's
80 attempts. Before executing, recheck this baseline with a read-only aggregate
query. If it changed, reconcile the delta before proceeding.

Lower the staging `PLACES_RUNTIME_MAX_ATTEMPTS_30D` backstop to 349 for the
approved run (269 + 80), without changing the rolling window or raising the
current ceiling. Maintain a separate per-run ledger as well; rolling expiry
must not replenish the run's allowance. Leave the reduced backstop in place at
handoff until another explicit operating scope changes it. Stop before a step
whose maximum requests exceed the remaining allowance, and pause immediately
on unexplained request growth. No fresh generation is authorized even though
historical Gemini usage remains in the database.

Plan for two sign-in codes to restore deliberately signed-out devices; the other
two are contingency for stale retained sessions or establishing the matching
account on a second client. Prefer retained sessions and stop at four. No new
account, invite email or broader message allowance is included.

## Evidence that will count

For each platform's sign-out, establish two valid sessions for the same approved
account. Sign out only the device running the inspected replacement. Confirm
that device clears its local account state and cannot read protected data.
On the other client, require a successful session refresh after the sign-out,
with sanitized provider/session evidence. A cached Plans screen or an unexpired
access token alone does not prove refresh-session preservation. If needed,
schedule observation after the existing token expires; never collect token
values in the evidence or bypass normal authentication.

For plan refresh, measure provider-ledger deltas with one detail view active at
a time. Check hidden-route foregrounding without extra detail hydration, return
to the plan with current state, foregrounding an active plan and manual refresh.
The existing four-card plan normally hydrates four Places details per full read;
measure actual attempts and stop on unexpected repeats. Keep the other clients
on the Plans list while measuring. Do not attribute all historical excess reads
to one cause or claim zero necessary visible reads.

Record new source-bound web, physical-iPhone, Android, association and telemetry
evidence. A prior generation may remain as application data, but old native
receipts and observations cannot be relabeled. Assemble version-two cumulative
input with the accepted security record only after all other fields are real.
If a check fails, record the failure and stop the dependent phase.

## Deployment and rollback boundaries

The currently healthy Railway deployment and Vercel Preview both serve
`c5b041c85f4f7b959436c13bef48c959622c624f`. The Vercel Production target is a
separate older deployment which owns `table-us.com`, `www.table-us.com`,
`links.table-us.com` and the stable staging alias. Preserve those pointers.
The request includes reverting **only the newly changed staging/Preview
deployment and source/CORS settings** to the recorded baseline if validation
fails. Do not promote, roll back or otherwise move the Production target.
Keep the reduced provider backstop on a rollback; no extra calls follow.

Use the prepared build arguments and the previously working build SDK/Java
locations. The build SDK and emulator SDK use different installed roots; do
not set conflicting `ANDROID_HOME`/`ANDROID_SDK_ROOT` values. Keep logs private
and file-backed, inspect actual compiled source literals, and disable local
source-map upload as the existing build helper specifies. No new scanner,
dependency upgrade, production release, store submission or cohort activation
is part of this request.
