# Active packet: native diagnostic retention (2c)

Started and completed 2026-09-21. One primary agent; local tooling and deterministic fixtures only.

## Identities and outcome

- Branch: `codex/native-diagnostic-retention`.
- Worktree: `/Users/brianchei/.codex/worktrees/63bd/Tableus-ai-agent-dev`.
- Exact base: `a556c572d038c034267f098dd5bed877d104ea5f` (Phase W complete).
- Prior task: `01a0c5ec-b7f9-77d1-b739-0f49a238de16`; its completion handoff
  provides the required context without unresolved questions requiring retrieval.
- Application remains `ed8330a766b3c4b80a505e075535678394e275e9`;
  prior operator ed8330a. This change receives a separate operator commit, resolved with
  `git log -1 --format=%H -- scripts/local-mobile-diagnostics.mjs`.
- Preserve prior worktree `/Users/brianchei/.codex/worktrees/90bd/Tableus-ai-agent-dev`,
  private Phase W evidence, artifacts and sessions.

## Completed result

Success/failure/interruption logs and available diagnostic files survive in
private durable per-attempt storage. Inventory binds source tree/lock, separate
operator SHA, build ID, artifact and unchanged version-two receipt hashes.
Missing families are explicit; symbol/map usability is not inferred.

Fresh: 24 focused fixture/stub tests; `make ready` passed with 244 JavaScript and
98 Python tests (three PostgreSQL skips), builds, deterministic smoke and report-only
performance. The first readiness attempt was stopped by sandbox EPERM on the
existing local HTTP fixture; the permission-enabled run passed. Contract drift
check passed. No native compiler, device, external CI or live operation ran.
[Detailed evidence](../evidence/native-diagnostic-retention-2026-09-21/README.md)
and [handoff](../handoffs/2026-09-21-native-diagnostic-retention.md).

This objective is complete; preserve this worktree and private evidence. Next is
roadmap 2d in a fresh task, beginning with exact-commit review and an approval
proposal for two deterministic native builds, then two readiness builds/installs.
No native execution is authorized by this completed packet.

## Boundaries

No compilation, installs/device operations, uploads, CI, deployments, merges,
live requests, OTP emails, canaries, resources/secrets, migrations, destructive
cleanup, store submission, cohort activation or canceled security scans.
One CI/Preview/API redeploy consumed in Phase W. Closed ledger: Places 92/100
from baseline 329 (8 unused, not reopened), emails 2/4, canaries 6/6 per provider,
fresh Gemini 0/0; backstop 429. September 30 is unextended; AppHang acceptance
remains isolated-staging-only. Native replacement is a later approved objective.
