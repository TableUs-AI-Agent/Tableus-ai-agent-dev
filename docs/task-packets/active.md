# Active packet: native replacement validation (2d)

Started 2026-09-21. N1 approved; **execution blocked on disk capacity**.
One primary Astra agent; no delegation or canceled scans.

## Identities

- Base: `5b39d937b905691798a585b4aced79f91c7e97bf`.
- Branch: `codex/native-replacement-validation`.
- Worktree: `/Users/brianchei/.codex/worktrees/ea6d/Tableus-ai-agent-dev`.
- Previous task: `01a0c661-7b3f-7403-906c-0f60f60a3dd4`; one recent turn read.
- Application: `ed8330a766b3c4b80a505e075535678394e275e9`.
- Retention implementation / proposed build operator:
  `16603dd0cf36d27b492e57a02d3c6c438a2563c4`.
- Evidence checkpoint: commit containing the linked proposal; never substitute it
  for the app or actually invoked operator SHA. No build operator invoked yet.

## Reviewable result and checks

[Proposal, exact command templates and stop conditions](../evidence/native-replacement-validation-2026-09-21/README.md).
Fresh: source/log associations, local host metadata, profile/signing/source review,
no-build input checks and documentation validation. Reused unchanged 2c manifest:
24 focused fixtures; make ready 244 JavaScript / 98 Python, three PostgreSQL skips;
contract drift. No compiler, device or external execution; no usable-symbol claim.
No executable bytes changed; do not repeat make ready for this checkpoint.

## Next action within this task

The owner approved N1: two sequential deterministic attempts, limited existing
Expo/dependency access, new disposable simulator/emulator and bounded local checks.
[Approval receipt](../evidence/native-replacement-validation-2026-09-21/n1-approval.json)
binds the exact proposal. Resolve capacity first: freshly observed 21.29 GiB is below
the approved 40 GiB floor; no cleanup authorized. Both attempts remain unused;
operator setup and device creation have not started. Require symbols/maps to match and resolve app frames before
moving to the next artifact; helper success alone is insufficient. Preserve failed
attempts and stop, no automatic rebuild. The N1 approval persists; do not request it again.

Only after N1 evidence passes, request separate N2 approval for two readiness
builds and in-place staging updates, acknowledging replacement of installed
f94a1d9. Live plan reads/passive telemetry need explicit scope; no OTP or canaries.
Roadmap 2d remains incomplete. Keep this task for the pending gate; do not create
a fresh task or claim native replacement completion at this preparation checkpoint.

## Preserved boundaries

Preserve `/Users/brianchei/.codex/worktrees/63bd/Tableus-ai-agent-dev` and all
retention logs, `/Users/brianchei/.codex/worktrees/90bd/Tableus-ai-agent-dev` and all
Phase W evidence, accepted artifacts and sessions. Web ed8330a; API/native f94a1d9;
production e1184ec; API rebuilt-image provenance unchanged. No cumulative transfer.
One CI/Preview/API redeploy consumed. Closed Places 92/100 (baseline 329; 8 unused,
not reopened), emails 2/4, canaries 6/6 per provider, fresh Gemini 0/0; backstop 429.
September 30 unextended; AppHang risk accepted only for isolated staging.
Only the scoped N1 compilation, disposable-device actions and deterministic checks
are authorized after the recorded gates pass. N2, upload, CI, deployment, merge,
live product requests, OTP, canary, resource/secret change, migration, cleanup, store
and cohort actions remain unapproved. No durable architecture decision changed.
