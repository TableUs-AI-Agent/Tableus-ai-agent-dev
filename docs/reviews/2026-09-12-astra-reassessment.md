# Astra project reassessment — 2026-09-12

## Outcome

Keep TableUs's implemented web/Expo/FastAPI architecture and its current
Gemini/Places application providers. Use GPT-6 Astra for development, recover
release evidence, and finish bounded reliability and release objectives in a
clear order. The project is substantially implemented but not ready for
production or cohort sign-off.

## Review basis and limits

- Application source: `daa89a03e1ba09b4249125476c5d28b7f2a98f31`.
- Referenced task: `Explore repository`,
  `01a00832-2cb1-77b3-b4af-30610e7115fd`; read through the task tool.
- Inventoried all 426 tracked files. Reviewed representative owning
  implementation and tests across every subsystem, release configuration,
  current/historical plans and the later delta from the last focused scan.
  This is a project/architecture review, not a new exhaustive security scan or
  a claim that every source line and device behavior was verified.
- Fresh external observations are read-only: GitHub CI and public API readiness.
  The recovered live-smoke JSON is prior evidence. No paid inference, OTP,
  deployment, native build, store operation or account deletion ran here.
- The previous instruction to halt security scans remains effective.

## What is worth preserving

The `/api/v1` boundary, generated shared contract, platform-specific UI, strict
provider output validation, deterministic fixtures, invite-approved profile
authorization, private-schema database, explicit mobile retries and
privacy-limited telemetry are coherent foundations for a small beta. Replacing
them during model migration would expand risk without a demonstrated user need.

The beta's valuable unit is one complete two-person dining decision: join,
constraints, four options, votes, organizer finalization and recovery. Prioritize
that observable journey over demo polish, a provider rewrite or new agent
frameworks.

## Findings and actions

| Priority | Finding and evidence | Action |
| --- | --- | --- |
| Immediate, fixed locally | Native `local-mobile-build.mjs` checked the build ID only in the post-build receipt script. The prior task lost a completed iOS build to `local-test-ios-daa89a0`; Android retried with no SDK path. | Validate platform-bound IDs, distinct outputs and explicit SDK roots before any dependency install. Provide `--preflight-only true`. Keep post-build attestation. |
| Immediate, fixed in planning | Current checkout, active packet, roadmap and checklist named different stages/SHAs. The checklist still named `d025b56`; latest candidate is `daa89a0`. | Separate application candidate, tooling branch and evidence status; archive narrative; use one active packet and one remaining-work matrix. |
| Immediate, fixed locally | `packages/api-client/src/index.ts` awaits `getAccessToken` before starting its deadline and awaits refresh separately. Web startup also awaits `getSession` directly. | One request deadline now covers credentials, refresh and body parsing; 15-second startup reads fail to a retry state. Mobile preserves sessions on refresh errors. Tests use fakes only. |
| Before expensive release work | Four accepted artifacts were reported, but their bytes/receipts were not recovered in checked locations. The last turn stopped during the fifth artifact. | Owner confirmed no manual copies. Treat files as unavailable; build the frozen replacement in the revised order. Do not treat old task commentary as a receipt. |
| Before cumulative sign-off | The latest sealed clean focused scan is for `069473c`, while the cumulative schema requires candidate-bound security evidence. Later app/config changes exist. | Preserve the baseline association in the [source delta](2026-09-12-security-delta.md). Resolve acceptance policy before cumulative sign-off; no new scan is implied. |
| Before production | `make ready` builds the Expo web export; its performance target only reports bundle bytes. It does not run Playwright, native/device checks or a measured latency budget. | Keep those gates explicit; establish measured pilot performance criteria during release preparation. |
| Before production | Mobile `production` intentionally throws; web/mobile trust origins still pin staging. The roadmap previously understated this as deployment setup. | A separate reviewed source change must introduce production trust, signing and update policy before production deployment. |
| Before production/cohort | Account deletion separates application and Supabase Auth; share capabilities, quotas, invite policy, retention and ownership have explicit unresolved decisions. | Close or explicitly accept each applicable risk for the chosen pilot before activation. Keep multi-process operation blocked until durable coordination exists. |
| During release preparation | Prior scans/builds repeatedly restarted whole verification and compiled six artifacts before early journey failures were resolved. | Cheap local checks → candidate/CI/config → first platform fault flows → second platform fault flows → other signed profiles → cumulative acceptance. |

### Deterministic auth-wait observation

A fake `getAccessToken` returning an unresolved promise was supplied to the
shared client with `requestTimeoutMs: 20`. The request remained pending after
100 ms and made zero network calls. That proves the configured client deadline
did not bound credential lookup at the inherited source. It does not prove that Supabase is currently
hanging in staging; real-session verification follows the local correction.

The replacement bounds every awaited request stage under one configured budget.
Regression tests cover rejected/hung credentials, late-result suppression,
refresh timeout, one-time refresh and idempotency-key reuse. Mobile component
tests cover retry, pending invite preservation, SDK/storage failure and sign-out
superseding profile restoration. Boot reads are bounded on both platforms;
SDK errors are sanitized. No OTP or other write is automatically retried.

Supabase documents that `getSession` may refresh, and that async work inside an
auth callback can deadlock. Both providers keep SDK work outside the callback
lock and give the bounded boot read ownership of `INITIAL_SESSION`.
[Session reference](https://supabase.com/docs/reference/javascript/auth-getsession),
[callback troubleshooting](https://supabase.com/docs/guides/troubleshooting/why-is-my-supabase-api-call-not-returning-PGzXw0).
The current [Supabase changelog](https://supabase.com/changelog) was checked; its
Node/TypeScript deprecations are already covered by the locked toolchain and no
auth or database version migration is needed for this change.

## Astra migration

The new `.codex/config.toml` pins only `model = "gpt-6-astra"`. Existing task or
CLI overrides can take precedence; this does not change the old task's model or
the user's global defaults. Project configuration requires a trusted checkout.
No reasoning setting is forced and no claim of lower account consumption is
made. [Official Codex configuration](https://learn.chatgpt.com/docs/config-file/config-basic)

Official Astra guidance recommends auditing instruction files, calibrating
testing and making delegation intentional. The updated engineering guide uses
one primary agent, bounded objectives, current documents and targeted checks.
[Official Astra guidance](https://developers.openai.com/api/docs/guides/latest-model/gpt-6-astra.md#prompting-best-practices)

The application uses `LiveGeminiProvider`; there is no active Sol API default to
replace. The owner explicitly confirmed development-only migration. Any future in-app
Astra change would be a separate provider implementation/evaluation decision
with its own credentials and budget.
Astra tool calling requires Responses, unsupported sampling fields must be
removed, and `none/minimal` reasoning migrates to `low`; these are future
compatibility requirements, not edits needed in the existing Gemini adapter.
[Official migration quickstart](https://developers.openai.com/api/docs/guides/latest-model/gpt-6-astra.md#migration-quickstart)

## Evidence recovered

Public [CI run 33696336882](https://github.com/TableUs-AI-Agent/Tableus-ai-agent-dev/actions/runs/33696336882)
is successful for `daa89a0`. The public staging API reports the same SHA,
Supabase auth, live Places/Agent Platform and staging anonymous/error-only
telemetry. The saved two-user report records four distinct candidates and
$0.00443325 estimated usage; it is preserved in its original source namespace.

Searches covered the repository worktrees, Downloads, `/private/tmp`, and
TableUs-named directories in the task's temporary root. No `daa89a0` native
artifact/receipt set was recovered. This is an incomplete recovery inventory,
not a claim that the artifacts no longer exist elsewhere. The owner confirmed no manual copies were saved. Treat the artifacts as
unavailable for scheduling, without claiming they cannot exist elsewhere.

## Validation and deferred work

`make ready` passed on the completed runtime change: 197 JavaScript tests,
98 Python tests, lint, types, contract generation, web/Expo-web builds and
deterministic smoke. Three Postgres-only migration assertions are skipped in
the local SQLite environment and must run in CI. Contracts and lockfiles are
unchanged. The bundle report measured 2,820,354 bytes; it has no pass threshold.
Initial attempts exposed shared-dependency resolution and test-command
configuration issues; isolated locked installs and corrected environment
settings resolved them without weakening checks.

Playwright CLI with local Supabase/API fixtures observed a stalled session
reaching visible Retry, followed by successful restoration of the plans screen.
[Local evidence](../evidence/astra-reassessment/README.md) preserves screenshots
and hashes of the tested runtime files. This is not live-auth acceptance.

Native builds, physical-device acceptance, current alias/association
verification, security-evidence acceptance, production, stores and cohort
activation remain outstanding. The auth correction and source delta are part
of this local replacement.

The [roadmap](../roadmap.md) and [active packet](../task-packets/active.md) carry
the execution order. Historical legal/contact attestations are retained with
their original date; no new owner signature or legal review is implied.
