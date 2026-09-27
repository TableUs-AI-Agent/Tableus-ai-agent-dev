# External deletion help and support evidence

Final application: `f3efa7a28010454275bf3b32ec52fc43792fdaee`.
[Results](results.json), [artifact/source hashes](manifest.json),
[handoff](../../handoffs/2026-09-25-deletion-support.md).

One `make ready` on `9c8f462` passed lint/types and stopped when the existing mobile
account suite lacked a mock for its newly imported router. The repair added that
mock and an actual recovery-to-help navigation test; the page also received explicit
styles. `make test contract build smoke perf` on `189f024` completed every remaining
stage: **214 Python and 317 JavaScript tests, zero skips**, generated contract with no
drift, Next production build, Expo-web export and deterministic smoke.

Final `f3efa7a` changes only three page color classes after contrast review. Focused
page ESLint and a fresh Next production build with TypeScript passed. Two mocked
Chrome journeys and desktop/phone-width captures use that final production build.
The earlier backend/mobile/shared/test results are reused only for byte-identical
source, not relabeled as fresh tests. No second full `make ready` was run.

## Observable checks

- Public help loads without an account and makes no private v1 reads in the browser
  fixture. The email href is exactly `mailto:privacy@table-us.com`, with no private
  prefill. The privacy notice links back to the public help route.
- Pending deletion recovery opens help and returns to pending status. The mobile
  component suite verifies recovery navigation without profile reads. Three new
  mobile help checks cover visible/selectable contact details, routing and failure
  to open an email app without an unhandled rejection.
- Root viewed desktop and 390px screenshots: readable headings/sections, prominent
  action and responsive text without horizontal clipping. These are web viewport
  captures; native behavior remains untested. Action contrast improved from 2.35:1
  to 6.26:1; underlined inline links use 13.38:1 foreground contrast.
- Source review and the seven-case support tabletop distinguish unverified email,
  accepted request, pending/attention, duplicate, completed, legacy and unconfirmed
  outcomes. No mailbox/support case was actually executed.
- PostgreSQL17.11 on loopback 55938 used a separate migration administrator and
  restricted runtime role with synthetic data. Existing migrations reached
  `9a1f2e7c4b80`; no new schema change. Task services are stopped and both 55938/3405
  are closed. Artifacts, build outputs and synthetic data remain retained.

Commands and exceptions are recorded in results.json. Private logs under
`.artifacts/deletion-support/` retain the initial readiness failure, corrected
continuation, final page/build/browser checks, source identity and shutdown.
Initial root-cwd migration and ESLint commands could not find their relative
configuration; rerunning from backend/frontend respectively passed. These setup
failures are preserved, not mistaken for application failures or passing checks.
Dependencies were cloned locally; Python's editable import points at this worktree.
Tests use deterministic/demo providers, telemetry off and no real account data.

## Source guidance reviewed September 25

[Apple deletion guidance](https://developer.apple.com/support/offering-account-deletion-in-your-app/)
supports the preserved in-app flow and explicit completion/timing information.
[Google external request guidance](https://support.google.com/googleplay/android-developer/answer/13327111)
supports an additional prominent email request path without reinstalling.
[Supabase user management](https://supabase.com/docs/guides/auth/managing-user-data)
informs the unchanged Auth/status limits; the [changelog](https://supabase.com/changelog)
was read after its Markdown endpoint returned an unsupported-content error.
No policy interpretation here establishes store or legal acceptance.

Publication, working mailboxes, secure assisted completion for access-loss cases,
retention schedules and hosted/native acceptance remain unverified. The exact
limitations and proposed rehearsal are in the [support procedure](../../deletion-support-procedure.md).
