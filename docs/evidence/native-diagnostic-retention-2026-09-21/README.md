# Native diagnostic retention — objective 2c

Completed 2026-09-21 from Phase W completion
`a556c572d038c034267f098dd5bed877d104ea5f`, on
`codex/native-diagnostic-retention` in worktree
`/Users/brianchei/.codex/worktrees/63bd/Tableus-ai-agent-dev`.
Application remains `ed8330a766b3c4b80a505e075535678394e275e9`;
operator code is separate commit `16603dd0cf36d27b492e57a02d3c6c438a2563c4`. See the [handoff](../../handoffs/2026-09-21-native-diagnostic-retention.md)
for exact identities and remaining authority.

## Observable change

Previously the local helper used OS temp, deleted logs/worktrees in `finally`,
and allowed EAS cleanup. It now retains a private directory per attempt, an EAS
working directory, requested iOS composed source map, raw artifacts, logs from
all build/inspection/receipt steps, and an atomic diagnostic inventory. No
automatic cleanup remains. Optional `DIAGNOSTICS` / `--diagnostics` overrides
the default `<artifact>.diagnostics`. OS temp, path collisions and preexisting
outputs are rejected, including canonicalized ancestor symlinks. A clean committed
operator checkout is required for execution; application builds still use a
fresh detached checkout of the exact requested SHA and its frozen dependencies.

Inventories distinguish requested application SHA/tree/lock from operator SHA,
platform/profile/build ID, per-file hashes, retained raw output hashes and
inspected artifact/receipt/report hashes. Version-two receipt bytes and consumers
remain compatible; inventory is their bound sidecar. Missing/empty diagnostic
families and scan errors are explicit. Catchable interrupts terminate the child
process group before inventory; hard-killed attempts remain `running` and cannot
be treated as accepted output. Existing artifacts and old receipts are not relabeled.

## Fresh deterministic verification

- 24 focused checks: Android CLI success/build failure/inspection failure,
  iOS archive extraction and export, independent application/operator Git commits,
  artifact/receipt hashes, retained stderr, partial maps, native dSYM/shared-library
  fixtures, missing diagnostics, spawn failure, SIGTERM, permissions, collision
  protection, symlink/temp rejection, plus existing source/SDK/receipt checks.
- `make ready`: 244 JavaScript tests; 98 Python passes and three local PostgreSQL
  skips; lint/type checks, OpenAPI generation, Next production build, Expo web
  export, deterministic smoke, report-only web chunks 2,820,196 bytes.
- `npm run contract:check`: pass, no generated drift.
- Initial readiness run hit sandbox `listen EPERM` on the existing fault-proxy
  fixture. A permission-enabled local rerun passed. Both logs are retained.
- Local dependencies came from `npm ci --offline`; Python uses the existing
  local virtualenv. No cloud schema/CI invocation or native compiler ran.

[Verification manifest](verification.json) hashes the source files and private
logs. Logs remain under `.artifacts/native-diagnostic-retention/` in this preserved
worktree, not tracked public evidence. Test fixtures are synthetic and removed by
test cleanup; they are never claimed as application build artifacts. Full CLI
fixtures stub npm/EAS/inspectors while using actual Git worktrees and orchestration.
Existing receipt/security tests cover the unchanged validators.

## Practical limits

This verifies retention, not native compiler behavior, dSYM UUID/build-ID matching,
unstripped shared libraries, valid/composed maps or app-frame resolution. Dependency
folders/symlinks are excluded from discovery. The retained EAS working tree can
contain credentials/signing material and consumes disk; keep its enclosing 0700
directory private. Hard kills/power loss cannot finalize an inventory. Native
replacement validation, symbol uploads, device acceptance and AppHang investigation
remain separate gates. Read the updated [native runbook](../../release-runbook.md#4-preflight-every-native-build).
