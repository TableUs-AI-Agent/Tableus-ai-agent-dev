# Active packet: Phase W complete

Started and completed 2026-09-21. One primary agent; no Security Scan.
The approved web dependency rollout is complete. This packet has no remaining
implementation action; use a fresh task for the next bounded objective.

## Identities

- Evidence branch: `codex/web-dependency-rollout`.
- Active worktree: `/Users/brianchei/.codex/worktrees/90bd/Tableus-ai-agent-dev`.
- Review base: `89dac2d4f9deb428668c0bcf62828e31100b2968`.
- Prior evidence checkpoint: `514a0136e1eb2ea0c52c315bf92efaf92809dfc9`.
- Application / repository operator: `ed8330a766b3c4b80a505e075535678394e275e9`.
- Clean detached application: `.artifacts/phase-w/source` under this worktree.
- Published release ref: `codex/web-deps-ed8330a`, exact ed8330a.
- Prior proposal/task: [proposal](../evidence/dependency-rollout-2026-09-21/README.md),
  `01a0c5de-c4a5-7cf2-8a2c-76494dd98c3b`; approval retrieved with bounded scope.
- Exact completion commit is supplied by the final response and resolvable via
  `git log -1 --format=%H -- docs/handoffs/2026-09-21-phase-w-complete.md`.

## Completed authority and result

The original [Phase W approval](../evidence/web-dependency-rollout-2026-09-21/approval.json),
[publication amendment](../evidence/web-dependency-rollout-2026-09-21/publication-amendment.json)
and [CORS/API amendment](../evidence/web-dependency-rollout-2026-09-21/cors-approval-request.json)
are executed. Do not request those approvals again or infer additional allowance.
One CI 35661503170 passed and one exact-source Preview
`dpl_3ec5bdvridE1meArFaYWAp8yabKM` is READY. Both `tableus-staging.vercel.app` and
`links.table-us.com` now point to that Preview and serve verified ed8330a bundles.

Eleven existing API origins were preserved and the exact immutable Preview origin
was appended. One redeploy without `--from-source` produced API
`24eefe75-9583-4a90-8d3e-48450818dec0`, ready at f94a1d9. Railway rebuilt the
same source/pinned inputs into a new image; artifact equivalence is not claimed.
Only ALLOWED_ORIGINS changed. Production target/apex/www remain
`dpl_7csJvHoJH9qgFZDijbwu3w36r2sK` / e1184ec; native and original f94a1d9 evidence
are unchanged. Vercel project settings/protection and all 85 old deployments remain.

[Execution evidence](../evidence/web-dependency-rollout-2026-09-21/README.md) binds
CI, measured local Linux x64/ARM64 stacks, hosted image/cache/error behavior,
source/bundle hashes, seven guarded Preview browser checks and final readiness,
four CORS cases, 24 public alias HTTP checks and four anonymous browser checks.
Hosted sharp/libvips versions remain lock inference. Live discovery requests were
blocked; no new authenticated/live journey or cumulative mixed-SHA acceptance.
Original compatibility/Metro/contract/browser and one passing `make ready` are
reused; no full-suite rerun for unchanged source. Task-local harnesses have their
own hashes. [Completion handoff](../handoffs/2026-09-21-phase-w-complete.md).

## Remaining boundaries and next objective

One CI, one Preview and one API redeploy are consumed. No further deployment,
merge, production/domain-binding change, new resources/secrets, live provider
use, OTP email, canary, native build/install, symbol upload, migration, cleanup,
store submission, cohort activation or Security Scan is authorized by this packet.
Brian Chei owns rollback; do not automatically restore vulnerable web.

Places 92/100 from baseline 329 (8 unused, no reopened allowance), emails 2/4,
canaries 6/6 per provider, fresh Gemini 0/0; configured backstop remains 429.
AppHang acceptance remains isolated-staging-only. September 30 is unextended.
Production and retained immutable web bytes remain outside this patch; authorized
holders can access retained deployments. Future production deployments may reclaim
unbound aliases. Preserve worktrees, saved sessions and `.artifacts/phase-w` files
and containers until separately authorized cleanup.

Next proposed objective: local native diagnostic-retention helper repair in a
fresh task/worktree starting from this completion commit, with a distinct operator
SHA. Preserve success/failure logs, symbols/maps and exact-source receipts; focused
checks and one `make ready`. No native compilation or external operations in that
objective. Do not begin it from stale main or merge this branch implicitly.
