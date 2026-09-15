# Approved f94a1d9 remaining staging verification

The owner approved the [exact execution scope](execution-approval.json), including
CI/push, deployment to existing staging targets, five sequential native builds
and bounded device/live checks. Reuse the signed iOS pilot artifact. The shared
usage ledger is carried forward; no allowance is reset or increased. No scan,
production/store/cohort action, secrets, migrations or additional cleanup.

Status: exact-source CI and hosted checks pass. Candidate branch:
`codex/ios27-f94a1d9`; application SHA
`f94a1d9d1125e6c9111aa08eda496f014f20d0c0`.

- [CI](https://github.com/TableUs-AI-Agent/Tableus-ai-agent-dev/actions/runs/35031840606):
  226 JavaScript, 101 Python, four browser tests and seven deterministic AI cases.
- [Protected Preview](https://tableus-staging-i6b1exrb3-briancheis-projects.vercel.app)
  and Railway staging serve this source. [Hosted checks](hosted-preflight.json)
  confirm served JavaScript, API readiness, exact origins, canonical association
  hashes and unchanged production target/protection.
- [Execution record](hosted-execution.json) preserves the initial rejected
  Preview and the branch-scoped metadata correction. No live provider operation,
  new email, generation or canary was requested in this phase.
- Five native builds remain unstarted. Disk is 19.76 GiB, below the approved
  20 GiB start guard. Only the generated active worktree `frontend/.next` cache
  (437 MiB) has been proposed for additional cleanup; permission is pending.
  After cleanup approval and a fresh disk check, start `test-android` and inspect
  it before proceeding through the approved five-profile order. Reuse the signed
  iOS pilot; cumulative device/live acceptance is still outstanding.
