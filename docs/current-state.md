# Current state

Updated 2026-09-23. Original f94a1d9 isolated-staging acceptance remains intact,
including the unresolved simulator AppHang risk. Replacement application ed8330a
is published and serves both staging aliases after exact-source CI, Preview and
activation checks. **Phase W is complete.** The approved CORS append and one API
redeploy retain f94a1d9 source with a newly built image. Native and production
remain unchanged; this is component staging evidence, not cumulative replacement acceptance.
Only [the active packet](task-packets/active.md) directs
implementation. [Historical snapshots](history/2026-09-21/README.md) preserve the
previous narrative without making it an active checklist.

## Working identities

| Role | Value |
| --- | --- |
| Accepted API/native and retained Preview candidate | `f94a1d9d1125e6c9111aa08eda496f014f20d0c0` |
| Current task branch / worktree | `codex/native-replacement-validation` / `/Users/brianchei/.codex/worktrees/ea6d/Tableus-ai-agent-dev` |
| Staging web / prior native application | `ed8330a766b3c4b80a505e075535678394e275e9`; completed dependency remediation |
| Local F1 mobile candidate | `8972865893a3f018a064594457dc9cc664f8a61f`; iOS/D2/lifecycle and P2 Settings probe passed; O1/O2 platform crashes and refresh failure unresolved; offline/links/exports incomplete |
| Native diagnostic operator | `16603dd0cf36d27b492e57a02d3c6c438a2563c4`; operator unchanged |
| Previous task / exact base | `01a0c661-7b3f-7403-906c-0f60f60a3dd4`; `5b39d937b905691798a585b4aced79f91c7e97bf` |
| Evidence index | [Current candidate](evidence/ios27-staging-f94a1d9/closeout.md) |

The root checkout is an older branch and is not the implementation base.
Application, operator and evidence commits are distinct. Phase W deployed ed8330a;
this task freezes local N1-F1 mobile candidate `8972865893a3f018a064594457dc9cc664f8a61f`.
Build operator 16603dd is unchanged. The previous worktree
`/Users/brianchei/.codex/worktrees/90bd/Tableus-ai-agent-dev` retains its private
`.artifacts/phase-w/source` and evidence. Existing staging artifacts prove only
their original application SHA.

## Implemented product

Invite-approved email sign-in, shared plans for 2–8 people, constraints, four
provider-grounded options, top-three ranked votes, organizer finalize/reopen,
private-link rotation and application-data export are implemented across Next.js,
Expo and FastAPI `/api/v1`. Supabase client access is authentication-only.
Gemini and Places remain the application providers. Development now uses Astra
for orchestration/final technical review, Sol for most implementation and Luna
for bounded read-only support. Project agent configuration and the
[development workflow](development-workflow.md) carry standing delegation and
completion authority; existing native/live gates and frozen application bytes
are unchanged. See [migration evidence](evidence/gpt6-development-workflow-2026-09-22/README.md).

Deterministic providers are the local/CI default. Mobile uses bounded requests,
explicit ambiguous-write retries, private in-memory queries and device-local
sign-out. The plan uses explicit refresh, coalesces in-flight reads and distinguishes
previous votes from new submissions. The candidate also repairs iOS 27 scene
startup with pinned Expo 57.0.23 and a reviewed local config plugin.

## Frozen f94a1d9 evidence

- Local candidate `make ready`: 226 JavaScript and 98 Python tests; three local
  PostgreSQL skips. Exact-source CI adds PostgreSQL/browser coverage: 101 Python,
  four browser tests and seven deterministic AI cases. These are recorded results,
  not a fresh CI run in this task.
- Six native artifact/receipt pairs passed inspection, including the signed
  physical-iPhone pilot. iOS 26.5 simulator and Android API 36 ARM64 deterministic
  lifecycle, offline and five refresh phases pass. Physical iOS 27 startup,
  relaunch, auth/private links, scroll and explicit refresh passed separately.
- Real votes, organizer finalize/reopen, participant permissions, export,
  deletion-readiness and cold/warm links passed. The recovered final owner report
  confirms old-link rejection and canonical cold/warm opening on both platforms.
- Exact-release web/iOS/Android/API telemetry delivery and the candidate's
  staging-only source review are accepted. No new scan or canary is needed.
- Simulator local sign-out removed its server session while Android's remained.
  On September 21 the owner confirmed Android's subsequent relaunch and account
  read succeeded without a code. Read-only reconciliation matches the same original
  Android session and proves renewal at September 17, 01:17:33 UTC, after the
  simulator sign-out at 00:55:07 UTC. No reverse-direction result is claimed.

## Dependency remediation and next work

The owner restored Supabase access and accepted the simulator hang as an
unresolved isolated-staging risk. Session renewal and provider totals are verified;
the closeout cumulative validator and public readiness check passed. The
[final report](evidence/ios27-staging-f94a1d9/final/closed-beta-readiness-summary.json)
and [handoff](handoffs/2026-09-21-staging-closeout.md) closed that objective.

Local fixes: Next.js 16.3.5, scoped EAS transitive patches, Redocly/js-yaml patch
and a CommonJS adapter to the unmodified patched URL decoder. Expo/React Native
pins are unchanged. [Assessment and exact-use dispositions](evidence/dependency-toolchain-2026-09-21/README.md)
replace the blanket exception for this graph only: 17 audit entries arise from
three tooling advisories outside the used vulnerable paths. No expiry extension
or production waiver; f94a1d9 still contains its original dependencies.

The prior `make ready` (234 JavaScript, 98 Python passes, three PostgreSQL skips),
router/EAS regressions, Metro exports and four Chrome journeys are reused. Fresh
review matched eight source hashes, nine private logs, nine installed consumers
and both Metro maps; backend/shared/config source objects are unchanged.
[Phase W execution](evidence/web-dependency-rollout-2026-09-21/README.md): owner
approved the original scope and the temporary Preview-pause/publication amendment.
Application ed8330a is on `codex/web-deps-ed8330a`; CI 35661503170 passed with
234 JS / 101 Python / four browser / seven deterministic AI cases. Preview
`dpl_3ec5bdvridE1meArFaYWAp8yabKM` is READY with exact served source stamps,
provider-free browser, benign hosted image/cache/error and association checks.
Measured local Linux ARM64 and x64 image stacks pass; hosted sharp/libvips versions
are lock-derived, not directly introspected. Discovery's automatic nearby request
was blocked by the browser guard; live data behavior is not part of this proof.

The owner-approved [CORS action](evidence/web-dependency-rollout-2026-09-21/cors-approval-request.json)
is complete. API `24eefe75-9583-4a90-8d3e-48450818dec0` is ready at f94a1d9;
the new image has matching pinned base inputs and frozen dependencies, with fresh
readiness/CORS evidence rather than transferred artifact acceptance. Both
`tableus-staging.vercel.app` and `links.table-us.com` now serve ed8330a from the
verified Preview. [Activation evidence](evidence/web-dependency-rollout-2026-09-21/activation.json)
records 24 public HTTP and four anonymous browser checks, exact bundle/attribution
hashes, unchanged associations and preserved production e1184ec. All eleven prior
origins, other API variables, Vercel project settings/protection and 85 old web
deployments are retained. One CI, one Preview and one API redeploy were consumed;
no live-provider allowance was used. See the [completion handoff](handoffs/2026-09-21-phase-w-complete.md).
AVIF decoding was verified on the patched stack. The native helper now retains
private attempt logs, working files, available symbols/maps and hashed diagnostic
inventories bound to separate application/operator identities. [Local verification](evidence/native-diagnostic-retention-2026-09-21/README.md)
passed: 24 focused checks, 244 JavaScript / 98 Python tests (three PostgreSQL
skips), contract drift, builds and smoke. The approved [N1 iOS attempt](evidence/native-replacement-validation-2026-09-21/n1-checkpoint.md)
compiled ed8330a using operator 16603dd and passed artifact inspection/receipt
export. Actual dSYM UUIDs match both architectures; an app-owned runtime frame
resolves to AppDelegate.swift:18. After five initial debugger launches produced
no trace and one unresolved native crash, the owner-approved [D1 capture](evidence/native-replacement-validation-2026-09-21/d1-result.md)
completed without an observed new crash: 9,339 runtime samples, 841 stack frames,
and actual app/route frames resolved with the exact composed map. Fifty
app/shared/decoder map contents match retained source; no direct decoder function
was sampled. The earlier crash remains unresolved. The owner-approved
[N1-R run](evidence/native-replacement-validation-2026-09-21/n1-r-result.md)
passed all seven lifecycle and eleven offline/refresh flows once, including
retry idempotency and all five refresh phases. The link harness then stopped at
its first cold auth assertion: it incorrectly expected a sign-in screen for an
already-approved demo actor whose route guard shows Plans. The screenshot/source
support a harness expectation error, not an established application regression.
The owner then approved [N1-R2](evidence/native-replacement-validation-2026-09-21/n1-r2-result.md).
Its first cold join case reached the screen but sent `a b/c=` for encoded
`a+b/c=`. The local proxy blocked the request before the backend and stopped the
run. An offline reproduction with three exact bundle-map source matches traces
the corruption to custom-scheme extraction followed by another query parse.
Remaining links and export cycles did not run; no new target crash was found.
The owner approved [N1-F1](evidence/native-replacement-validation-2026-09-21/n1-f1-result.md).
Its local fix preserves encoded custom-scheme tokens and avoids a second decode
in the join hook; duplicate/malformed tokens fail closed. All 48 routing checks
and the complete make-ready target set pass (292 JavaScript, 98 Python; three
PostgreSQL skips), with unchanged generated contracts. [Exact candidate freeze and impact/revalidation](evidence/native-replacement-validation-2026-09-21/n1-f1-native-revalidation.md)
are complete. The local-fix phase included no native build or replay; fresh
resumption follows below.
Canonical HTTPS delivery, auth-mode presentation and historical AppHang clearance
remain unverified.
The owner [authorized bounded F1 native resumption](evidence/native-replacement-validation-2026-09-21/n1-f1-resumption-approval.json).
[Cache cleanup](evidence/native-replacement-validation-2026-09-21/f1-storage-cleanup.md)
recovered about 26.85 GiB and reached 42.20 GiB free. The new F1 iOS build passed;
[artifact verification](evidence/native-replacement-validation-2026-09-21/n1-f1-native-result.md)
matched 42 diagnostic hashes, both native UUIDs and 50 map/source contents. A new
disposable iOS 26.5 target received it. After a corrected pre-launch Python
setup error, the single actual diagnostic attempt hit the 45-second LLDB start
cap before a breakpoint hit or sampled trace. The app was terminated; initial
and delayed checks found no matching crash, and no target/debugger remains.
The cause remains unresolved. The owner then approved [D2](evidence/native-replacement-validation-2026-09-21/n1-f1-d2-approval.json).
Its [runtime proof](evidence/native-replacement-validation-2026-09-21/n1-f1-d2-result.md)
passed in 39.147 seconds with 8,661 samples, 1,644 frames and 55 exact matching
sampled source files. [F1 runtime result](evidence/native-replacement-validation-2026-09-21/n1-f1-runtime-result.md):
lifecycle passed all seven flows in 526.029 seconds. Offline stopped after
483.490 seconds: nine flows passed, then the refresh-error message assertion
failed. Three of five refresh phases have passed counters; failed-phase request
counts were not retained, so the cause remains unproved. No new crash report;
the disposable app and local services are stopped. Links, exports and Android
did not run. The separately approved [F1-O1 run](evidence/native-replacement-validation-2026-09-21/n1-f1-o1-result.md)
stopped after 182.790 seconds: create-failure passed, then SpringBoard crashed in
XCTest accessibility support before create-retry's first assertion. The failure
screenshot shows the iOS home screen; TableUs survived until cleanup. One create
POST and no retry POST were observed. The original refresh failure was not reached
and remains unresolved. O1's one extra attempt is consumed; app/services are stopped.
The approved [F1-P1 Settings-only probe](evidence/native-replacement-validation-2026-09-21/n1-f1-p1-result.md)
stopped after 84.869 seconds when its repeated simulator-monitor call timed out.
Both attempted flows completed their UI commands, but only the first passed the
whole flow/observation gate. SpringBoard stayed at PID 17600; no new crash or
TableUs launch was observed. The subsequently approved
[P2 host-monitor probe](evidence/native-replacement-validation-2026-09-21/n1-f1-p2-result.md)
passed three Settings flows in 130.308 seconds with 105 healthy host observations,
no new crash and confirmed cleanup. Both probe allowances are consumed. These
Settings results do not clear O1 or validate TableUs. The
[approved O2 run](evidence/native-replacement-validation-2026-09-21/n1-f1-o2-result.md)
stopped after 88.308 seconds on a separate SpringBoard crash with O1's XCTest
accessibility signature. The first flow's UI commands completed, but the platform
gate failed; no retry POST, refresh phase, link or export ran. Cleanup is confirmed
and O2's one attempt is consumed. The approved older system-support cache removal
recovered 5.689 GiB; preflight had passed with 25.34 GiB free. Storage no longer
blocked this attempt. Existing source/runtime evidence remains bound to its exact
device and OS. The [O3 operation](evidence/native-replacement-validation-2026-09-21/n1-f1-o3-result.md)
created and booted its iOS 27 target, then stopped after 143.997 seconds when the
initial process query exceeded eight seconds. No app install, launch or offline
runner occurred. The target is shut down; services/ports are clear. Five system
service reports during shutdown are distinct from O1/O2. The approved [O4 operation](evidence/native-replacement-validation-2026-09-21/n1-f1-o4-result.md)
passed its control query in 9.465 seconds, then stopped after 113.791 seconds on a
host process-query timeout during runner setup. No UI execution is retained;
install/launch and app traffic are unproved. Cleanup is independently confirmed.
The approved [H1 recovery](evidence/native-replacement-validation-2026-09-21/n1-f1-h1-result.md)
shut down both older TableUs simulators in 28.499 seconds, with data retained and
three successful host queries. Process rows fell from 1,215 to 803 and swap use
fell by 408 MiB during the observation window; this does not establish causality
or stability. No app test ran. The approved [O5 diagnostic](evidence/native-replacement-validation-2026-09-21/n1-f1-o5-result.md)
failed after 452.002 seconds. Installation passed, but iOS killed Maestro's
XCTest runner when its initialization assertion timed out (`0x2182BAAD`), before
the test connection or retained UI commands. Zero flows/phases were accepted;
no TableUs process or application request was recorded. The underlying stall is
unproved. Root stopped the leftover owned diagnostic collector, retained its
logs and confirmed target Shutdown, absent target/runner processes and idle
ports. Nine other service reports are retained; the SpringBoard/TableUs monitor
does not cover them. O5 is consumed. [T1 local operator preparation](evidence/native-replacement-validation-2026-09-21/n1-f1-t1-result.md)
now detects startup failure, retains diagnostics and bounds cleanup to proven
owned collectors. Synthetic/mocked checks and a structural O5 file replay pass;
its native entry points are disabled. The underlying stall remains unresolved.
[P3](evidence/native-replacement-validation-2026-09-21/n1-f1-p3-proposal.md) is now
prepared and verified for one Settings-only startup baseline on the retained
iOS 27 target, with no TableUs run. Nine mocked checks, a retained P2 parser
replay and one fresh full readiness pass (293 JS / 98 backend Python, three
PostgreSQL skips) pass. The proposed 420-second operation/240-second flow window
needs explicit approval; no new native attempt or timeout change has executed.
The owner chose to keep native validation in this task; the active packet is
condensed with linked history for smaller routine context.
Accepted native remains
f94a1d9. Android still requires all iOS gates and fresh 40 GiB capacity;
N2/live reads and canonical/auth/physical probes remain separately gated.
Preserve all new diagnostics, 63bd retention evidence and 90bd Phase W evidence.
No cumulative replacement acceptance.
Merge and release gates remain separate.

Latest provider observation: September 21, 19:20:36 UTC. Places totals
421 against baseline 329: **92/100 used, 8 remaining**. Emails **2/4**;
explicit telemetry **6/6 per provider**, exhausted; fresh Gemini generations
**0/0**. The closeout reconciled provider totals; email/canary counts retain their
execution-ledger/delivery provenance. A new task resets none of these limits.
The configured staging backstop was verified at 429.

The unexplained simulator AppHang, placeholder tab glyphs, eight Expo package
patch recommendations, remaining native/production dependency rollout, privacy/retention/Auth deletion,
capability and quota controls, signing and symbolication remain tracked in the
[release checklist](release-readiness-checklist.md). A single-process API is still
required. Passed staging observations do not authorize production or distribution.
