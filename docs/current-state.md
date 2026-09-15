# Current state

Updated 2026-09-15. Development uses GPT-6 Astra; application providers remain
Gemini and Google Places. Railway staging and the new Vercel Preview now serve
`2ad48a8d8ec4d3aa9a7bd52061b823bb55960bcd`; production pointers and protection
are unchanged. Saved staging devices retain `6b9719b4e63e34803f2e7c2598e45851790df661`.
That older live run is paused. The refresh correction is frozen at
`2ad48a8d8ec4d3aa9a7bd52061b823bb55960bcd`, and its deterministic iOS and Android
verification is complete. Operator/evidence work is on
`codex/plan-refresh-verification` in the isolated `plan-refresh-controls` worktree.
Only [the active packet](task-packets/active.md) directs the next objective.

Both exact-source test artifacts pass inspection, lifecycle, offline recovery and
all five refresh phases. On both platforms, scrolling caused zero detail reads
or writes, repeated taps during a delayed response made one request, and an
explicit recovery made one successful read. The failure phase delivered three
iOS and two Android injected errors, with no upstream requests. Every refresh
phase made zero app writes and preserved the previous vote. Fourteen screenshots
were reviewed across the [iOS](evidence/plan-refresh-verification-2ad48a8/ios-deterministic.json)
and [Android](evidence/plan-refresh-verification-2ad48a8/android-deterministic.json)
records. Both new test devices are stopped and retained; local test ports are
closed. No live provider or sign-in allowance was consumed.

Android's three failed attempts are retained in the
[native evidence](evidence/plan-refresh-verification-2ad48a8/README.md): an overly
exact failed-request count, duplicated fixture input, and forced centering of a
fully visible retry control. The corrected operator retains bounded error counts,
pre-submission exact-input checks, full visibility and all original assertions.
The fourth offline/refresh attempt passed using the same APK and the already
completed lifecycle. Latest `make ready`: 220 JavaScript and 98 Python passes,
three local Postgres skips. Subsequent changes were YAML/navigation and evidence;
YAML parsing and evidence privacy checks pass. Existing Expo patch warnings remain.

The [next staging verification plan](evidence/plan-refresh-staging-2ad48a8/README.md)
was approved on 2026-09-15. [Hosted deployment checks](evidence/plan-refresh-staging-2ad48a8/deployment.json)
pass: exact-source readiness and served Preview bundles, both Preview CORS origins,
canonical native associations, unchanged production/protection and the configured
409-attempt backstop. CI run `35016584574` passes 216 JavaScript, 101 Python and
four browser tests. The provider aggregate remains 329; this new run has used zero
Places attempts, sign-in messages, generations or canaries. Xcode now requires
owner completion of its license/setup prompts before native tools can run; no new
native build has started. The approved plan reuses both test artifacts, builds the four
remaining profiles, and caps a new run at 80 additional Places attempts, four
sign-in messages and zero generations. All four input preflights pass. The exact
[focused source review](evidence/source-review-2ad48a8/README.md), including its
same two medium risks, now has matching owner acceptance. The new approval
covers the four remaining builds, staging/Preview deployment and saved-device
checks under the linked limits. No Security Scan is authorized. The fresh provider
baseline remains 329 Places attempts, allowing the approved backstop of 409.

## Reported scrolling and refresh behavior

The owner clarified that Android displayed a vote saved in the previous session;
they did not deliberately submit a new vote. They also report a persistent loading
indicator and unintended repeated refresh while scrolling upward through the plan.
The server's single vote write remains an observed fact, but intentional owner
submission is no longer accepted. The Android owner evidence records this correction.

Local component regression tests reproduce overlapping refresh callbacks starting
two detail requests while the first is unresolved, and an old saved vote displaying
the same success text as a new submission. The local correction replaces the
plan's pull gesture with an explicit `Refresh plan` button, shares an in-flight
query, and separates manual loading from automatic query activity. Existing votes
and unsent ranking changes receive distinct messages. Hidden-route inactivity,
foreground updates and offline recovery remain required. See the
[local investigation](reviews/2026-09-15-explicit-plan-refresh.md) for validation
and the limits of request attribution. This does not prove an endless native loop
or establish the origin of every historical request. Both isolated native platforms now pass; hosted and physical verification of
the new source remain outstanding. Retained 6b9719b artifacts retain their actual SHA.
All local readiness targets pass: 216 JavaScript and 98 Python tests, with three
Postgres-only tests skipped. The initial `make ready` passed lint/types but could
not open the proxy test's loopback listener in the sandbox. The remaining targets
passed after local-listener access was granted; completed lint/types were reused.
The [validation record](evidence/plan-refresh-controls/local-validation.json)
preserves both attempts and log hashes.

## Product and architecture

TableUs is an invite-only US group-dining beta for web, iOS and Android.
FastAPI `/api/v1`, SQLAlchemy/Alembic, Supabase authentication, Next.js and Expo
implement approved sign-in, shared plans, constraints, four grounded options,
ranked votes, organizer finalize/reopen and private-link rotation. Shared client
code is limited to `packages/api-client` and `packages/domain`.

Local and CI providers are deterministic. Live Places/Gemini usage is separately
budgeted. Browser/native app data use the API; direct Supabase access is for auth.
Privacy controls include hashed capabilities, minimized provider storage,
anonymous allowlisted PostHog, error-only Sentry and application data export.
Supabase Auth deletion and production retention remain separate release work.
The beta API uses one process: idempotency/JWKS/provider coordination is bounded
but not a substitute for durable coordination before horizontal scaling.

## Client correction and replacement execution

[Hosted deployment evidence](evidence/replacement-6b9719b/deployment.json)
records Railway `69c96019-bedc-4b53-a37d-358a103f7e24` and Preview
`dpl_2qeefqPhARdErQxUqxLssCintxte` at 6b9719b. Both Preview origins pass CORS;
Production pointers/protection are unchanged. CI run `34905755622` passes
204 JavaScript, 101 Python and four browser tests. The reduced Places backstop
is verified at 349; starting aggregate remains 269. Both test artifacts passed
source/checksum/receipt inspection and isolated lifecycle/offline verification.
[iOS evidence](evidence/replacement-6b9719b/ios-deterministic.json) and
[Android evidence](evidence/replacement-6b9719b/android-deterministic.json)
bind the reports and reviewed screenshots to their actual artifacts. Android's
first startup was obscured by a System UI unresponsive dialog; the four-core
retry passed lifecycle. Its offline run required a documented operator scroll
before the unchanged retry-button assertion. Before/after screenshots confirm
the control was clipped at the viewport edge; all request-count checks passed.
Application bytes and the frozen checkout are unchanged. The owner approved
removing the two completed disposable test devices. [Cleanup evidence](evidence/replacement-6b9719b/disk-cleanup-execution.json)
records only those two removals, with all artifacts/evidence and saved live
devices preserved. Free space was 27.7 GiB immediately afterward and 30.0 GiB
when `readiness-ios` started. Both readiness artifacts now pass source, checksum,
receipt and signer inspection. [All six artifacts](evidence/replacement-6b9719b/native-artifacts.json)
now pass inspection, and their build timestamps verify sequential execution.
The saved iOS simulator restored its original session after installing the inspected
telemetry profile. [Its iOS and API canaries](evidence/replacement-6b9719b/ios-telemetry-observation.json)
reached both providers with the exact source release. [Session isolation](evidence/replacement-6b9719b/session-isolation-progress.json)
is incomplete: iOS local sign-out removed its own session, and the original
Android session subsequently refreshed after replacement installation. The
owner confirms Android Plans before and after relaunch. The first direction
passes; the reverse direction still requires observation. The first restoration used a different account. That account was signed out
locally; the correct account now matches Android and its new session is retained
for the reverse-direction check. The inspected Android readiness build is installed.
[Execution progress](evidence/replacement-6b9719b/execution-progress.json)
also records web session restoration, read-only account controls and one delivered
web canary in each provider. A later Preview network error recovered with one
Retry while retaining the organizer session. The web plan shows four attributed candidates and
organizer controls. Two private-link rotations are recorded, and the
[repaired local helper](evidence/replacement-6b9719b/local-helper-observation.json)
accepted the owner's copied link. Three sign-in emails are confirmed, and sixty Places
attempts are counted: sixteen for web/link recovery, sixteen for iPhone
join/vote and twenty-eight for Android join/vote. Android links, four candidates,
guest permissions pass, and the server records one new vote write. The owner
subsequently denied deliberate submission, so the intentional Android voting
check remains incomplete. The Android phase
expected at most twelve attempts; [its request trace](evidence/replacement-6b9719b/android-request-observation.json)
shows one join, one vote and five successful detail reads on the same plan.
Four extra reads are under investigation; the owner reports unintentional refresh
during scrolling, while attribution of each read is not established.
Live verification is paused with twenty attempts remaining against thirty-six
still allocated. The owner closed the physical iPhone app, and Android was
stopped without resetting data;
new Gemini generation remains zero. [Request timing](evidence/replacement-6b9719b/web-request-observation.json)
is consistent with a web revision refresh following rotation. Native live-device
and cumulative acceptance remain incomplete. Saved live-account devices remain
preserved and stopped during the request investigation. Accepted artifacts
remain intact. The
connected iPhone's first installation was blocked by Screen Time. The owner
resolved the restriction; the same inspected package is now installed. Physical
session restoration, relaunch, canonical auth/private links, four candidates,
guest permissions and read-only account controls pass. One new iPhone vote is
confirmed by its server event. Finalize/reopen, foreground state and rotated-link
rejection remain in progress.

The EAS build's Expo Doctor step passes 20/21 checks and reports eleven SDK 57
patch-version recommendations. The exact same warning appears in the retained
c5b041c build log. [The observation](evidence/replacement-6b9719b/build-toolchain-observation.json)
records locked/recommended versions; dependencies remain frozen. This corrects
the release checklist's unqualified historical Doctor-pass wording. No fresh
advisory query or dependency upgrade was performed.

Mobile device sign-out now explicitly uses Supabase local scope. It clears local
state after success and exposes a sanitized retry message on failure instead of
claiming the session ended. Hidden plan routes unsubscribe from TanStack Query;
AppProviders handles foreground query refresh without duplicate auth invalidation.
Visible return/navigation still refreshes current plan state, manual refresh
remains available, and offline cached views and mutation responses are preserved.
No backend, dependency, API contract, provider storage or security-validator
change is included. Necessary visible reads/mutation responses still hydrate
Places details. Historical individual read triggers remain unproven.

Focused component tests reproduce the original sign-out scope, hidden-query
and duplicate-active-notification faults. Eleven auth/refresh tests and mobile
type checking pass. Full `make ready` passed: 204 JavaScript and 98 Python
tests, with three Postgres-only tests skipped locally; lint, types, contract
generation, web/Expo-web builds and deterministic smoke passed. The narrow
[source review](reviews/2026-09-14-device-session-plan-refresh.md) identified
no unresolved critical/high runtime finding in the changed code.
Mocked session isolation is not hosted cross-device proof.

## Accepted evidence for frozen c5b041c

- Exact-source local `make ready` passed 197 JavaScript/98 Python tests; three
  Postgres-only tests subsequently passed in CI. [CI run 34728044149](https://github.com/TableUs-AI-Agent/Tableus-ai-agent-dev/actions/runs/34728044149)
  passed 197 JavaScript/101 Python, four browser tests and seven deterministic
  AI cases. This evidence does not certify the new local client source.
- Railway staging `dcccd4a1-cca7-489b-9d7d-81e4019aad0c` and Vercel Preview
  `dpl_9zGVqXpFNQkCzSXBaecR18hqMs2M` use c5b041c. Public readiness, exact
  Preview CORS, canonical association manifests, signer/path allowlists and
  browser fallbacks were verified. Production aliases/protection were preserved.
- Six native artifact/receipt pairs are accepted in durable private storage.
  Both deterministic native lifecycle/offline suites pass. Physical iPhone and
  Android each have a complete ten-phase readiness checklist, explicitly
  assembled from owner observations and original installation evidence.
  Android's final state observation followed emulator restart; original
  interactive runners did not finish their own summary reports.
- The shared three-account journey completed two constraints, one generation,
  four candidates, two ranked votes, one finalize/reopen/rotation and old-link
  rejection. Final state is voting, votes preserved. Account export and
  deletion-readiness were checked without deletion.
- Web/iOS/Android/API PostHog canaries delivered 1/1/1/2 events. Sentry's three
  projects recorded five redacted events at the exact release. This is connector
  and authenticated UI evidence, not a completed standalone collector run.
- Final usage: 80/100 approved Places attempts, one generation,
  $0.00056825/$0.25 estimated Gemini and six conservatively consumed sign-in
  messages. No new run or replenished message allowance follows from this.

[Deployment evidence](evidence/c5b041c/README.md),
[native evidence](evidence/c5b041c/native/README.md),
[candidate status](evidence/c5b041c/native/candidate-readiness-status.json).
Both simulators and the temporary link server are stopped; sessions/artifacts
were preserved. The detailed previous state is [archived](history/2026-09-14/c5b041c-current-state.md).

## Security and release boundary

The owner accepted the staging source-review policy and exact 6b9719b report
on 2026-09-14. Codex Security remains installed but no
scan has started. The earlier scan proposal is superseded. Version-one scan
records remain supported; new version-two staging-only evidence binds the review
and owner acceptance to the candidate and immutable file/report hashes.
The [acceptance record](evidence/source-review-6b9719b/owner-acceptance.json)
binds the actual owner reply, policy, candidate and report digest; validation passes.
Historical c5b041c cumulative evidence stays unchanged and incomplete.
The historical focused scan report is unavailable, and the deep scan stays canceled.

The [accepted report](evidence/source-review-6b9719b/README.md) binds eleven
reviewed files and seven control areas to 6b9719b. Two medium risks remain open:
shared provider quota consumption and private capabilities in URLs. The owner
accepted these risks for isolated staging; neither is resolved. The historical
pending record still fails validation. Tooling `make ready` passed 212
JavaScript and 98 Python tests, with three Postgres-only local skips; lint,
types, contracts, web/Expo-web builds and deterministic smoke also passed.
This tooling verification does not replace the application candidate's own
204-JavaScript-test record or its outstanding device/hosted acceptance.

The security review decision is complete. The local correction still requires
affected native/hosted verification before release acceptance. The owner approved
publishing the exact candidate and its existing staging/Preview deployments.
Production trust origins,
privacy/Auth deletion/retention, capability and invite/cohort limits, signing,
OTA authority, source maps, rollback and store distribution remain roadmap work.
Native default tab glyph polish remains queued before distribution.

## Worktree handoff

Work in `.worktrees/astra-project-reassessment` on
`codex/replacement-verification`, based on owner-acceptance evidence `09acc1b`.
Source-review tooling is frozen at `1c75832ef421335662319635e1b74888476cdb77`;
evidence commit `6469bb4f451f246bf50103dc4ce9e24b18f52d15` records its validation.
The owner-acceptance and preflight changes update evidence/documentation only;
application, tooling and test bytes still match the prior verification.
The active packet's [execution request](evidence/replacement-6b9719b/README.md)
was approved on 2026-09-14 and execution is starting. Six build-input
checks pass; all six older artifact/receipt sets still verify. Node/EAS/Xcode,
Android tools, existing Expo authentication and Vercel CLI access are available.
Resolved iOS readiness configuration carries the replacement SHA and staging
origins. Hosted CI/deployment now pass; replacement native artifacts and live
acceptance remain in progress.

The approved run permits at most 80 additional Places attempts, four new sign-in
emails, no fresh Gemini generation and the six sequential native profiles. The
project-wide 30-day Places baseline was 269/500 at execution start; staging now
uses the approved reduced backstop of 349. This is distinct from
the prior completed run's 80/100 attempts. The paired iPhone is currently
unavailable; simulator/emulator targets are stopped. A successful token refresh
on the other client must support cross-device sign-out preservation; cached UI
alone is insufficient. No scan, build, message, deployment or paid journey ran
during this preflight.

The client candidate and prior validation remain on `codex/device-session-plan-refresh`.
`codex/astra-project-reassessment` preserves that evidence checkpoint. The
separate `.worktrees/native-c5b041c` checkout remains clean at the deployed SHA.
The original checkout and its unrelated/untracked work are preserved.
