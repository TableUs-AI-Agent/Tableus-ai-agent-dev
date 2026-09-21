# Dependency replacement: impact review and rollout proposal

Prepared September 21, 2026. **Decision requested: Phase W only**, the bounded
web staging replacement below. No execution approval has been received. This is
an affected-source review and plan, not a Security Scan or cumulative release
acceptance. Native execution has a concrete prerequisite and separate gates.

## Exact identities and fresh evidence

| Identity | Value |
| --- | --- |
| Proposed application source | `ed8330a766b3c4b80a505e075535678394e275e9` |
| Existing operator tooling at review | `ed8330a766b3c4b80a505e075535678394e275e9`; native retention changes require a separately recorded operator commit |
| Dependency implementation base | `5375e3389823b9c0736328709aab1cdc9be6ef98` |
| Accepted frozen staging application/API/native | `f94a1d9d1125e6c9111aa08eda496f014f20d0c0` |
| Review branch/worktree | `codex/dependency-rollout-proposal` / `/Users/brianchei/.codex/worktrees/83b4/Tableus-ai-agent-dev` |
| Review/evidence commit | Commit containing [this handoff](../../handoffs/2026-09-21-dependency-rollout.md); resolve with the command there |

The provisioned worktree was clean at the exact handoff; the named branch was
created before edits. The original `14a6` worktree is still clean. No old
artifact, session, report or worktree was changed. [Source association](source-association.json)
binds the delta, unchanged source trees and the following **fresh read-only** checks:
all eight recorded validation-source hashes match this application commit and
worktree; all nine private log hashes and nine inspected installed-consumer hashes
match the preceding task; both retained Metro source maps match their reports.

**Reused, not rerun:** frozen npm install and dependency consistency; six Node and
two actual-router compatibility tests; iOS/Android Metro JavaScript exports;
contract drift; four Chrome journeys; the one passing `make ready` (234 JavaScript,
98 Python, three PostgreSQL skips). [Original verification](../dependency-toolchain-2026-09-21/verification.json)
retains commands/provenance. New CI, Linux image-stack execution, hosted checks,
native compilation, device acceptance, symbolication and hang diagnosis remain
unperformed. Planning-only checks are in [planning validation](planning-validation.json).

## Source impact and disposition

The complete non-document delta from f94a1d9 is eleven files: eight
runtime/config/test files covered by the original verification, the adapter
README, `.gitignore` and `AGENTS.md`. The closeout base to ed8330a has the same
application delta, without the two workflow-policy files. Backend source/Python
lock, shared packages/contracts, web source/config, mobile app source except the
new test, native configuration/profiles and scene plugin are unchanged.

| Affected surface | Reviewed change | Smallest new evidence |
| --- | --- | --- |
| Web server/build | Next/eslint 16.3.1 → 16.3.5, matching SWC/env; root Next override | Exact-SHA CI and Linux dependency resolution; one Preview build; served source, asset/image, route/auth shell and origin checks; staging alias identity |
| Native JavaScript before app validation | query-string 7 resolves the root CommonJS adapter to unmodified aliased decoder 0.5.0; Node >=22.12 <23 | Packaged adapter/upstream presence; Hermes/device cold/warm link matrix on both OSs; no transfer of f94a1d9 artifact acceptance |
| Native build/config tooling | EAS stays 23.2.0; scoped AJV 8.18.0, Joi 17.13.6, minimatch 5.1.9, nanoid 3.3.18, tar 7.5.21, yaml 2.8.3; nested prebuild minimatch stays 9.0.9 | Actual archive contents and installed graph; generated scene/transport/associations; inspected builds from frozen lock, one profile at a time |
| Contract tooling | Redocly 1.34.20 / js-yaml 4.3.2; compatible root nanoid resolution 3.3.19 | Reuse unchanged generated contract and prior checks; exact-source CI covers Linux install/build |
| API/data/providers/native SDK | No implementation change; Expo 57.0.23, RN 0.86.2 remain pinned | Keep existing API deployment and original evidence identities; no migration, provider reevaluation or general SDK migration required by this delta |

The recorded npm result is zero critical/high and 17 package entries from three
exact-use tooling dispositions, not zero findings. Their consumer hashes match;
no contrary call-path change was found. Keep the UUID buffered-method, diff
patch-parser and EAS new-project exclusions in the [original assessment](../dependency-toolchain-2026-09-21/README.md).
Reopen if graph, consumer, command or input trust changes. Eight Expo recommended
patches remain deferred; this is not a clean Doctor result or an exception extension.

**Correction to the earlier narrative:** the image advisory's temporary AVIF
disable describes 16.3.3. [Next 16.3.4 re-enabled AVIF optimization](https://github.com/vercel/next.js/releases/tag/v16.3.4).
The installed 16.3.5 optimizer likewise enables the HEIF loader and retains AVIF
handling; expecting AVIF rejection would be the wrong regression check. Its lock
selects sharp 0.35.4 and sharp-libvips 1.3.3; the installed macOS package reports
libheif 1.23.2. These package identities and optimizer bytes are hashed in the
source association. Linux build evidence must record its own actual image stack.
The [advisory](https://github.com/vercel/next.js/security/advisories/GHSA-2xp9-vwfh-vxw4)
lists 16.3.3 as the patched floor; no exploit test or broad image-library audit was
performed. Frozen f94a1d9 remains potentially exposed through its older optimizer.

## Phase W — web first; proposed owner approval

Approve publication of **application ed8330a only** on a dedicated release ref,
one exact-source GitHub CI run, one Vercel **Preview** deployment in the existing
TableUs project, and replacement of the existing staging alias targets only after
checks pass. No merge is needed. No Railway deployment is proposed. The intended
service matrix is web ed8330a, API f94a1d9, installed native f94a1d9.

1. Before any push, inspect current Git integration, deployment IDs, branch
   triggers, target/protection, aliases and origins read-only. The last accepted
   Preview ID is `dpl_5iF8xTCbfuJghn2bRuUSGdKoRiJb`; the last observed API ID is
   `d929fba2-9c1e-4428-8379-ffaae6a3c4d2`. These are retained observations, not a
   current account-state claim. Bind the intended release ref to ed8330a; do not
   publish the documentation descendant as the application.
2. Set only branch-scoped, nonsecret Preview source stamps
   `TABLEUS_BUILD_SHA` and `NEXT_PUBLIC_SOURCE_SHA` to the full application SHA
   **before** the trigger. Preserve the existing approved API/Supabase/link origins
   and telemetry/privacy settings. Do not copy stale global source stamps.
   Require actual build Node >=22.12 <23 and root frozen install including
   `vendor/`; no independently generated frontend lock. A root-directory/include
   setting mismatch stops for a concrete configuration correction.
3. Publish the exact ref only after the owner has approved its automatic Preview
   side effect. Reuse that one triggered build; do not also launch a duplicate.
   If no automatic trigger exists, create the one explicit Preview from the same
   Git SHA. Dispatch `.github/workflows/ci.yml` on that ref and require its actual
   checked-out SHA to equal ed8330a (not a PR merge SHA). CI has no push trigger.
   Existing Postgres migrations run against CI's disposable database only. Record
   workflow/run URL, successful jobs, Node/npm and Linux Next/sharp/libvips
   resolution; no paid AI, EAS build workflow or new audit scan.
4. Verify the immutable deployment's Git metadata, root lock/vendor inclusion,
   build log and served source stamp. Record a representative served bundle hash
   and the resolved Next 16.3.5 image stack. Run a provider-free browser smoke of
   landing/invite/auth routes, static attribution, missing/invalid canonical links,
   auth-confirm staying web-only, and safe image success/error/cache behavior.
   Use a small benign JPEG/PNG and AVIF through the pinned optimizer locally on
   Linux, then a non-Google allowlisted benign hosted image where available;
   record fixture identity. No malicious image, Places photo request, new fixture
   deployment, live recommendation or deliberate telemetry canary. Lack of an
   allowed hosted fixture is an explicit unverified check, not a fabricated pass.
5. Check public API readiness and keep its reported SHA f94a1d9. Probe CORS for
   the exact Preview origin and `https://tableus-staging.vercel.app` and
   `https://links.table-us.com`, plus rejection of an unapproved origin. The API
   uses exact configured origins; do not widen to wildcards. A missing Preview
   origin that needs Railway config/restart is outside Phase W: stop before
   alias activation and present the exact additional deployment/config action.
6. After CI and the checks pass, bind only the existing staging aliases
   `tableus-staging.vercel.app` and `links.table-us.com` to the verified Preview,
   if account inspection confirms this preserves the production target and
   `table-us.com`. Verify served SHA/assets after the move and both association
   manifests: 200 JSON, no redirect, existing signer IDs, exact `/auth` and
   `/join/*`, no `/auth/confirm`. Any production-target coupling stops the alias
   change for a revised owner decision. Record each host's actual deployment/SHA.
7. Record old immutable Preview URLs and any remaining host still serving the
   old optimizer. Alias movement does not remove those URLs. Preserve original
   artifacts/deployments; any required access restriction has its own concrete
   approval if existing protection is insufficient. Report this residual exposure
   and the September 30 deadline; do not call all old web bytes remediated.

**Phase W cap:** one CI run and one Preview build/deployment; no automatic retry
after failure; zero live Places/Gemini, OTP emails and deliberate canaries.
Provider-free reads may verify an already saved account session only when route
inspection confirms no plan hydration; otherwise stay on public routes. Original
sessions are not cleared. Pause on a stamp/version/graph mismatch, missing vendor,
CI/build failure, origin/association regression or required out-of-scope change.

**Rollback:** Brian Chei owns the decision. Before a change, retain the old alias
map and deployment IDs. A failed pre-activation check leaves aliases unmoved.
A post-activation regression stops further rollout; retain the failing deployment
and request a specific protected rollback or forward fix. Do not automatically
restore the vulnerable f94a1d9 web or alter production. Phase W does not authorize
such a rollback deployment. Preserve the API and native installations.

## Native prerequisite — separate local operator fix

The current `scripts/local-mobile-build.mjs` hardcodes
`EAS_LOCAL_BUILD_SKIP_CLEANUP=0`, deletes its temporary root in `finally`, and
exports only artifact/inspection/receipt. Logs and dSYMs/maps are not preserved;
its error text even says logs were deleted. The current helper therefore cannot
satisfy the requested diagnostic evidence by merely adding shell environment
variables. This is an operator-tooling gap, not evidence that the decoder needs
a framework migration or that the hang is fixed.

Before any new native compilation, use a fresh bounded task to preserve private
logs, generated archive/dSYMs, matching Metro/Hermes maps and Android native
symbols/mapping when applicable, for success **and failure**, under
`/Users/brianchei/repos/Tableus-ai-agent-dev/.artifacts/mobile/ed8330a766b3c4b80a505e075535678394e275e9/`.
Use fresh per-attempt paths and hashes; no cleanup. Add focused local fixture
checks for retained failure logs, non-overwrite, symbol/source/artifact association,
and same-SHA detached builds, then one `make ready` for that tooling change.
If candidate-owned receipt logic must change, record exactly how its operator
version is selected; do not edit the detached application and call it ed8330a.

[Expo's local-build controls](https://docs.expo.dev/build-reference/local-builds/)
support a chosen working directory and skipped cleanup; local builds use the
host's tool versions and can contact Expo for project/credential checks. Existing
credentials only; no creation/rotation. Host preflight must check Node, locked
CLI, SDKs/signers, available disk (at least the earlier 20 GiB start floor, more
if retained outputs require it), no other native job, and distinct durable outputs.
No cleanup is implied by insufficient space.

The archive must include repository root lock/manifests, both shared packages,
`vendor/decode-uri-component-compat` and the upstream alias. Inspect archive/file
filter behavior after the scoped tar/minimatch changes; generic roundtrip tests
are useful but do not prove EAS packaging. Reconfirm EAS 23.2.0 and the nested
minimatch 9 resolution, then run actual generation/inspection. EAS new-project
scaffolding remains excluded. [Expo monorepo guidance](https://docs.expo.dev/build-reference/build-with-monorepos/)
places EAS commands/config in the app directory; this does not justify packaging
only `mobile/` and omitting the repository's local dependencies.

## Later native validation proposal — four artifacts, in two gates

This narrows the runbook's general six-profile sequence for this dependency delta;
it is a proposed affected-release scope, not a six-profile completion claim.
No native build is approved now. Freeze the operator fix separately, keep
application ed8330a, and require one successful inspection/receipt before the next
build. A failed attempt consumes its phase attempt; no blind rebuild.

| Gate/order | Profile and target | Acceptance and limit |
| --- | --- | --- |
| N1.1 | `test-ios`, iOS 26.5 simulator; SDK/scene preflight for installed Xcode | One build; lifecycle, offline and explicit refresh using existing deterministic runners; link matrix and focused export/relaunch diagnostic with symbols |
| N1.2 | `test-android`, API 36+ ARM64 emulator | One build after iOS passes; same deterministic lifecycle/offline/refresh and link checks; SDK roots explicitly set and matching |
| N2.1 | `readiness-ios`, retained physical iPhone/iOS 27 | One signed build with existing team/provisioning; inspect scene manifest, embedded SHA, production-shaped transport/associations and no E2E controls; observed actual canonical taps |
| N2.2 | `readiness-android`, retained API 36+ ARM64 target | One build with existing signer; same inspection, install/relaunch/session and cold/warm canonical checks |

N1 is entirely loopback/demo/deterministic with telemetry off, on separate test
devices so staging sessions are preserved. N2 is a separately approved install
and limited real-platform scope; use saved sessions and stop at any OTP prompt.
No new `auth-test-*`, `links-test-*`, telemetry or general preview builds are
required just to cover this delta. Telemetry delivery for the new release remains
**unverified**: the old six-per-provider allowance is exhausted and old deliveries
are not relabelled. No OTA, store upload/submission or cohort activation.

Existing runners have important boundaries: `mobile-links-e2e` requires a
`links-test-*` receipt; do not relabel readiness receipts to invoke it.
`mobile-readiness-e2e` requires API SHA equal to app SHA and prompts for a full
live journey; the cumulative validator also requires a single SHA and complete
telemetry. They cannot truthfully certify this intentionally mixed release.
Use separately recorded focused observations/inspections for these phases;
any new narrow evidence tooling is another reviewed local change. A later full
candidate acceptance must resolve these gates explicitly, not weaken validators
or redeploy the unchanged API just to satisfy a checkbox.

### Required link cases

Run cold and warm paths on each deterministic device with fixed synthetic values:
canonical auth `mode=sign-in`; a valid canonical plan UUID with encoded token
`a+b/c=`; Unicode and `+`/space query handling; empty/missing and duplicate values;
malformed percent bytes (`%FF%41`, trailing `%`, incomplete UTF-8); encoded path
separators/invalid UUIDs; wrong origin and web-only auth-confirm; rotated old-link
rejection. Assert decoded values at the local API boundary where applicable and
no unauthorized join/write. Retain only synthetic tokens.

Run the long malformed-query regression in the isolated local process already
covered by the five-second timeout; for native use a bounded synthetic URL (at
most 2 KiB) with a five-second route/error-response observation deadline. Confirm
no crash, blocked UI or unexpected write. Record OS URL delivery rejection
separately: it is not proof the parser ran. Do not send stress inputs to staging.

On readiness builds, verify real canonical auth and invalid/expired link handling,
then actual valid canonical cold/warm taps on physical iOS and Android when a
separate provider-read allowance is approved. Preserve existing private links and
sessions. Four plan hydrations (cold/warm on two platforms) can require **16 Places
attempts** for a four-option plan even without generation; this exceeds the eight
unused attempts in the closed run. That is a scope estimate, not a new allowance.
No new live budget is requested in Phase W or N1. Before N2 live joins, bound exact
reads/retries and obtain a separately recorded allowance/backstop decision; do not
reuse the closed-run remainder implicitly. No fresh Gemini, emails or canaries.

### Symbols and focused AppHang diagnostic

The old event was on iOS 26.5 simulator, threshold 2 seconds, with app symbols
missing and libswiftCore/UIKitCore frames; one export/relaunch repeat passed.
That does not establish causation. The [original acceptance](../ios27-staging-f94a1d9/apphang-staging-acceptance.json)
remains isolated-staging-only and bound to f94a1d9.

For the new iOS build, match app executable and dSYM UUID/architecture using
`dwarfdump --uuid`. Retain the exact archive, embedded bundle hash, matching
Metro/Hermes map and toolchain identifiers. Prove usable symbolication by resolving
an app-owned frame/address from a local controlled stack/sample to an expected
function/source location; a file's presence alone is insufficient. Never use new
symbols for the old hang. Apple's [symbolication guidance](https://developer.apple.com/documentation/xcode/adding-identifiable-symbol-names-to-a-crash-report)
requires matching build UUIDs. Retain Android unstripped native objects/build IDs
and mapping if minification is enabled; explicitly report not-applicable formats.
Before store distribution, upload matching artifacts through approved existing
Sentry/store configuration and demonstrate usable release symbolication; this
proposal grants neither an upload nor a new canary.

On the symbol-capable deterministic iOS 26.5 artifact, do **one cold and one warm
cycle**: restore local test session → Account → export → open/cancel the OS share
sheet → background/foreground → terminate/relaunch → read Account. Record action
times, responsiveness, session continuity and local main-thread samples around
export/share dismissal; no real account export data or network telemetry. If
nonreproducing, perform one equivalent physical iOS 27 cycle later within N2's
approved account-read/export scope. Avoid plan routes so this diagnostic itself
needs no Places. A loopback pass does not prove staging-only behavior absent.

Recurrence, a physical occurrence, blocked action or a >=2-second stall reopens
investigation immediately: retain that exact build's stack/system context and
stop promotion; do not repeat until it appears to pass. An explicit proposed
five-second observation cutoff limits the run; the old two-second hang threshold
is still a failure signal. If no recurrence, report only the bounded result and
unexplained historical risk. No production/distribution risk acceptance follows.

## Decisions and completion boundary

- **Requested now: W**, exact-source publication/CI/one Preview plus conditional
  staging alias replacement as described; no API deployment or merge. Owner may
  approve W alone or defer it. Approval is required by [AGENTS.md](../../../AGENTS.md)
  and the explicit originating task restrictions, not inferred from a skill.
- **Next native task:** local operator retention fix only; no build authorization.
  After its review, N1 needs explicit two-build approval. N2 then needs explicit
  two-build/install and provider-read/account-export scope. A different source,
  credential/resource need or SDK update requires a revised proposal.
- **Still gated:** merge, further deployments/access changes, new live allowance,
  source-map/symbol upload, any distribution/store action and cohort activation.
  Account lifecycle remains behind replacement rollout in the roadmap.

All execution statuses remain pending. Existing f94a1d9 staging acceptance,
artifacts and original sessions retain their provenance. Closed totals remain
Places **92/100** from baseline **329**, emails **2/4**, canaries **6/6 per provider**,
fresh Gemini **0/0**, backstop **429**. This task used none of them. The review is
complete as a planning deliverable; owner approval and execution are separate,
uncompleted outcomes. No original report is upgraded to ed8330a acceptance.
