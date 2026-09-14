# Active packet: device session and plan refresh correction

## Objective

Prepare the replacement client candidate with device-only sign-out and fewer
unnecessary Places-backed reads. The owner accepted the recommended order on
2026-09-14: fix locally, freeze/review the replacement, then request explicit
scope/usage approval for an exact-candidate security scan. Keep the scan
requirement and its fail-closed validator unchanged. This is the only active
implementation packet.

Branch: `codex/device-session-plan-refresh` in the isolated
`.worktrees/astra-project-reassessment` worktree, based on evidence commit
`1c65f68c6cba9bb675bb898b13b7080f6f97a925`.
Frozen replacement application source: `6b9719b4e63e34803f2e7c2598e45851790df661`.
[Validation](../evidence/device-session-plan-refresh/local-validation.json) and
[ordinary source review](../reviews/2026-09-14-device-session-plan-refresh.md)
are complete. Native/hosted/scan acceptance for this replacement is pending.
Development uses Astra; application providers remain Gemini and Places.

## Implementation and acceptance

- Mobile sign-out explicitly uses Supabase local scope. Successful sign-out
  clears local pending auth, profile and query state. A returned provider error
  leaves the session/cache available and displays a sanitized retry message.
- Hidden mounted plan routes unsubscribe from their query. They do not start
  detail reads on mount, global invalidation, foreground or reconnect.
- AppProviders is the single owner of foreground query refresh. Auth resumes
  pending approval without separately invalidating every query. A real return
  to the foreground refreshes subscribed queries even within the 30-second
  default freshness window; duplicate active notifications do not refetch.
- Re-entering a plan refreshes votes/status immediately. Pull-to-refresh and
  offline cached reads remain available. Mutation responses update the plan
  without an additional client detail request.
- Component tests reproduce the original faults and exercise the actual auth,
  app and plan components with real TanStack Query and mocked external edges.
  Eleven focused tests and mobile types passed. The final `make ready` passed
  204 JavaScript/98 Python tests (three local Postgres skips), lint/types,
  contracts, builds and smoke. The narrow source review is complete.

## Evidence boundaries and next gate

The frozen deployed application remains
`c5b041c85f4f7b959436c13bef48c959622c624f`. Its six artifacts, both native
checklists, shared journey and four-platform telemetry remain attributed to
that source. Its cumulative status still rejects missing security evidence.
[Historical acceptance packet](../history/2026-09-14/c5b041c-acceptance-packet.md).

Do not relabel that evidence for the replacement. The exact replacement source
and ordinary review are recorded above. Codex Security is not installed/callable
in this session. Obtain authorization to enable it, inspect supported scope and
usage controls, then present a bounded scan proposal for separate approval.
Another scan, push/CI, deployment, native build/device acceptance or paid live
run needs its applicable explicit authorization. The canceled scan stays canceled.

No new provider calls, sign-in emails, accounts, secrets, resources, merge,
production/store/cohort action or destructive cleanup are authorized here.
The completed live run remains 80 Places attempts, one generation,
$0.00056825 estimated Gemini and six conservatively consumed messages.

## Deliberate limits

This correction removes reproduced client triggers; it does not add provider
storage or alter backend hydration. A necessary visible detail read or mutation
response still hydrates live restaurant data. The origin of every historical
read remains unproven. Real cross-device session preservation and native
navigation on the replacement still require later authorized device evidence.
Native glyph polish and production privacy/distribution remain queued.
