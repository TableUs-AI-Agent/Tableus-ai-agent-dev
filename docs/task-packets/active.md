# Active packet: bounded auth restoration and candidate freeze

## Objective and source

Complete the Astra development transition, correct the reproduced auth-wait
gap, and prepare one verified replacement for cumulative staging acceptance.
The owner confirmed **development-only Astra**; application inference remains
Gemini/Places. This is the only active implementation packet.

Branch: `codex/astra-project-reassessment`.
Inherited/staging source: `daa89a03e1ba09b4249125476c5d28b7f2a98f31`.
Replacement: the commit containing this packet and the auth correction; its
exact SHA is recorded in the handoff. It is not deployed. Do not attribute old
CI, smoke, scan or native reports to it.

## Completed locally

- Read the referenced `Explore repository` task and its approval, scan
  cancellation, interrupted build history and partial evidence.
- Inventoried 426 inherited files and reviewed every subsystem's owning paths,
  tests, architecture, release configuration and planned objectives.
- Rechecked `daa89a0` public CI/API readiness and recovered its sanitized
  two-user live report. Native files/receipts were not recovered; the owner
  confirmed no manual copies. Treat them as unavailable for scheduling.
- Pinned the project development model to Astra, preserved application
  providers, and archived superseded planning narratives.
- Added build-ID, signer, SDK and output-path validation before native work,
  plus a no-build preflight. Existing post-build attestation stays mandatory.
- Reproduced the credential wait with no network. The replacement uses one
  request deadline for credentials, fetch, refresh and body parsing; late
  credentials cannot dispatch/retry writes.
- Bounded web/mobile startup reads to 15 seconds. Mobile has explicit
  restoration retry, preserves a pending invite/session on failure, and no
  longer signs out on a refresh transport error. Startup ignores stale results.
- Added behavioral shared-client and mobile recovery tests. Preserved the
  historical scan association in an [attributable source delta](../reviews/2026-09-12-security-delta.md).

## Current verification and next actions

1. Local verification is complete: `make ready` passed (197 JavaScript and
   98 Python tests; three Postgres checks deferred to CI), browser fixtures
   confirmed timeout/retry recovery, and contracts/locks are unchanged.
   [Evidence](../evidence/astra-reassessment/README.md) includes runtime hashes.
   The handoff commit freezes the replacement. This worktree has its own locked
   JavaScript/Python environments.
2. Request a concrete replacement staging scope only after that handoff is
   reviewable: push/CI, existing Railway/Vercel staging targets, and any bounded
   live calls or native/device work explicitly included in the request.
3. Resolve security-evidence acceptance before cumulative sign-off. The source
   delta is an ordinary review, not a new scan. The validator's current
   exact-candidate scan requirement remains in force; do not relabel the old
   scan or restart the canceled scan to fill it.
4. Freeze the application source, preflight configuration and durable output
   paths, then follow roadmap objective 2: finish each deterministic platform's
   fault flows before building readiness and telemetry pairs. Keep all native
   work sequential and preserve accepted bytes/receipts outside OS temp.

## Acceptance and stopping rules

- Focused tests, one successful completed `make ready` after fixes, clean diff,
  unchanged contracts/locks, and an exact-commit handoff establish local
  readiness. They do not establish native, hosted or production acceptance.
- No new security-plugin scan or paid AI evaluation is part of local checks.
- Diagnose a repeated identical build failure instead of blindly rerunning it.
- Use only sanitized counts, booleans, source/deployment IDs and hashes in
  shared evidence. Keep artifacts/logs private and durable.
- Device claims require actual observations; request the owner only when a
  concrete step requires a physical device or a current verification code.

## Authorization carried forward

The old task approved public push, CI, existing staging deployment, bounded
live smoke and six sequential native artifacts for `daa89a0`. Completed work
does not need repeated approval, and consumed limited-call/OTP allowances do
not reset. A replacement application/deployment needs a matching scope.

The owner's scan cancellation remains binding. This packet grants no merge,
production migration/deployment, resource/secret creation, store submission,
new mail/invites, account deletion, destructive cleanup or cohort activation.
There are no unanswered intake questions; release approval follows concrete
local verification. Later roadmap objectives are queued, not active work.
