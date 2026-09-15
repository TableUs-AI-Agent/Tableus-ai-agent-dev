# Active packet: replacement hosted/native verification

## Objective and authority

Execute verification of the frozen replacement's device-only sign-out and
plan focus/foreground refresh on web, iOS and Android. This is the only active
implementation packet. Use one primary agent and preserve the existing release
architecture and provider choices.

The owner accepted the staging source-review policy and exact candidate report,
including its two medium risks. That decision is complete and must not be asked
again for unchanged source/report. Separately, the owner approved the prepared
execution plan on 2026-09-14; its deployment, native-build and live-operation
limits below now apply without repeated permission requests.

## Source and evidence

Preparation is complete. The [concrete execution plan](../evidence/replacement-6b9719b/README.md)
is [approved](../evidence/replacement-6b9719b/execution-approval.json).
Operator branch: `codex/replacement-verification`; exact
application publishing ref: `codex/replacement-6b9719b`, now pushed at the exact
candidate. The operator/evidence branch remains unpublished.
The approval includes staging/Preview deployment, six sequential native profiles,
at most 80 additional Places attempts, four new sign-in emails and zero new
Gemini generation. Lower the current 500-attempt rolling backstop to 349 based
on the observed 269 baseline; reconcile any drift before executing.

- Application candidate: `6b9719b4e63e34803f2e7c2598e45851790df661`.
- Accepted policy/report: [source-review evidence](../evidence/source-review-6b9719b/README.md).
  Parsed-report SHA-256: `046bba5a771112ef1e49888b6a09235f9c6d259b757b81f90f85607785795122`.
- Evidence tooling: `1c75832ef421335662319635e1b74888476cdb77`.
- Previously deployed source and retained older native/telemetry artifacts:
  `c5b041c85f4f7b959436c13bef48c959622c624f`.
- The accepted security record passes local validation. The prior full checks
  remain applicable because this acceptance change alters evidence/docs only.
  The [completed review packet](../history/2026-09-14/staging-source-review-packet.md)
  is historical.

## Preparation before an execution request

1. Verify the clean detached 6b9719b source, source/tooling separation, retained
   artifact inventory, SDK/signing availability, disk headroom and durable
   private output directory. Reuse accepted bytes only at their actual SHA;
   older c5b041c receipts do not establish replacement acceptance.
2. Identify the exact candidate ref, existing Railway staging and Vercel Preview
   targets and rollback source. A push triggers Preview deployment and needs
   the same explicit deployment scope. Keep production aliases unchanged.
3. Scope the narrow real-session checks: two devices using the same already
   approved account; one device signs out while the other retains its session;
   repeat for the other platform. Require a successful other-client session
   refresh after sign-out, not just cached UI or an unexpired access token.
   Verify restoration, hidden-plan inactivity,
   visible return/foreground refresh and offline/recovery behavior. Prefer
   retained sessions; count any required sign-in codes before requesting them.
4. Prepare a concrete execution request covering deployment/CI, necessary native
   profiles, owner availability and provider/message ceilings. Full plan reads
   hydrate Places details, so budget reads as well as mutations. The prior run
   ended at 80/100 Places attempts, one generation and six conservatively counted
   sign-in messages; it grants no automatic new allowance. A fresh recommendation
   generation is not needed merely to prove the two client corrections.

## Verification after the applicable execution approval

Hosted execution passes: [deployment evidence](../evidence/replacement-6b9719b/deployment.json)
binds CI run `34905755622`, Railway `69c96019-bedc-4b53-a37d-358a103f7e24`
and Preview `dpl_2qeefqPhARdErQxUqxLssCintxte` to 6b9719b. Source stamps,
exact Preview CORS and the 349-attempt backstop are verified; Production is
unchanged. Both test builds, artifact inspections and deterministic lifecycle/offline
verification pass. Android acceptance retains its earlier System UI startup failure
and offline visibility failure; the final offline run uses a recorded operator
scroll before the unchanged retry-button assertion. Web session reload and read-only
account controls pass, and both providers received one exact-release web canary.
See the [execution progress](../evidence/replacement-6b9719b/execution-progress.json).
The existing web plan has four attributed candidates and organizer controls.
One private-link rotation succeeded; the local clipboard handoff is pending.
Usage is twelve Places attempts and one counted email, with zero new generation.
Four additional details were loaded to prepare an owner-operated copy into the
local helper; up to eight attempts are reserved from the existing allowance.
The second four-detail response followed rotation and is consistent with the
web revision poll; it is counted, and native live refresh proof remains pending.
Use isolated deterministic
test targets because those harnesses reset app data; preserve the existing
staging simulator/emulator sessions for the same-account refresh checks.

The owner approved removing the two completed disposable test devices after
the disk guard paused execution. [Cleanup is complete](../evidence/replacement-6b9719b/disk-cleanup-execution.json),
with accepted artifacts, diagnostics and saved live sessions preserved. The four
remaining builds resumed sequentially at `readiness-ios` with 30.0 GiB free.
Keep the 20 GiB start guard and stop on failed inspection or resource checks;
do not restart the two completed deterministic builds or request their approval again.

EAS Expo Doctor reports 20/21 checks passing and eleven patch recommendations,
identical to the retained previous build. Keep frozen dependencies for this
approved staging run and retain the explicit [toolchain observation](../evidence/replacement-6b9719b/build-toolchain-observation.json).
Do not describe Doctor as entirely passing or claim a fresh advisory review.

Build sequentially from the exact clean application source, with logs in files
and inspected artifacts/receipts retained outside temporary storage. Run and
accept `test-ios` and `test-android` lifecycle/offline checks first, then the
`readiness-ios`/`readiness-android` pair and the separate telemetry pair required
by the unchanged cumulative contract. Stop on a failed prerequisite.

Record actual same-account cross-device observations and plan request behavior.
Use deterministic or retained plan state where it satisfies the check; any
live reads or messages must stay within the newly approved scope. Preserve
accounts, sessions and previous artifacts throughout installation and rollback.

Assemble version-two cumulative staging input with `security.accepted.json`
only once all other evidence genuinely belongs to 6b9719b. Missing native,
hosted, association or telemetry fields remain missing until verified. The
historical c5b041c pending input remains unchanged and incomplete.

## Exit and deferred work

Preparation exits with a concrete, bounded execution request. Verification exits
with source-bound CI/deployment/device evidence and a truthful cumulative
validation result. A source/report change requires matching review acceptance;
a new scanner is never automatic. No application change is currently planned.

Shared provider quotas and private capability URLs remain accepted medium risks
for isolated staging only. Production/privacy/retention, broader cohorts,
scaling, store signing/submission, OTA authority and native tab polish remain
later objectives. No merge, production change, secret/resource creation or
destructive cleanup is implied.

## Completed preflight

All six build-input checks pass and the six retained c5b041c artifact/receipt
sets verify. No replacement artifacts or CI run exist. Existing tools, signing
identity and Expo/Vercel CLI access are available. Resolved iOS readiness config
contains 6b9719b and staging endpoints. The build SDK and emulator SDK use
different installed roots; prepared private inputs reproduce the previously
working build SDK/Java setup. The physical iPhone is paired but unavailable;
the simulator and emulator are stopped. Previous six-build compilation took
about 98 minutes; new duration and session-refresh waiting are not guaranteed.

The preflight and this packet change documentation/evidence only. Prior full
local validation remains applicable to unchanged application/tooling/test bytes.
No scan, native build, deployment, sign-in email or paid journey ran.
