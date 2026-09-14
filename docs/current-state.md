# Current state

Updated 2026-09-14. Development uses GPT-6 Astra. Application providers remain
Gemini and Google Places. The next client correction is local on
`codex/device-session-plan-refresh`, frozen application source
`6b9719b4e63e34803f2e7c2598e45851790df661`; deployed staging still runs
`c5b041c85f4f7b959436c13bef48c959622c624f`.
Only [the active packet](task-packets/active.md) directs current implementation.

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

## Local client correction

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

The owner accepted keeping the exact-candidate scan requirement and fixing the
known issues before scanning the replacement. No new scan is authorized or
started. Codex Security 0.1.24 is installed with owner approval; its desktop
launcher exposes no hard token/dollar cap. A [bounded proposal](reviews/2026-09-14-security-scan-proposal.md)
for one Standard pass, two active reviewers maximum and a 20-minute checkpoint
is awaiting separate execution approval. A clean detached candidate checkout
is prepared at `.worktrees/security-6b9719b`. The historical focused scan belongs to 069473c and its sealed report
is unavailable; the deep scan remains canceled. The cumulative validator
continues to reject c5b041c's missing security evidence. Ordinary source review
is not scan evidence, and no cumulative sign-off is claimed.

The local correction must receive its own source-bound review/scan and affected
native/hosted verification before release acceptance. New pushes trigger Vercel
Preview, so keep the branch local until authorized. Production trust origins,
privacy/Auth deletion/retention, capability and invite/cohort limits, signing,
OTA authority, source maps, rollback and store distribution remain roadmap work.
Native default tab glyph polish remains queued before distribution.

## Worktree handoff

Work in `.worktrees/astra-project-reassessment` on
`codex/device-session-plan-refresh`, based on evidence commit `1c65f68`.
`codex/astra-project-reassessment` preserves that evidence checkpoint. The
separate `.worktrees/native-c5b041c` checkout remains clean at the deployed SHA.
The original checkout and its unrelated/untracked work are preserved.
