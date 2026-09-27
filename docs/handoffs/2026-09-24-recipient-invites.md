# Recipient-bound one-use invites — local handoff

Completed local development; no release activation. Brian owns current-stage
implementation; historical shared contributions retain their attribution.

## Exact identities

- Branch: `codex/recipient-invites`.
- Worktree: `/Users/brianchei/.codex/worktrees/recipient-invites/Tableus-ai-agent-dev`.
- Base: `c33479e80eef4ddd154783dda677cd016dc1a936`.
- Frozen application and invite operator source:
  **`29edb5e9f47ab7ac74034f2bac5e271a162ea620`**.
- Evidence is a documentation-only descendant; use the source above for executable
  verification, not the evidence commit. No merge or push was performed.
- Native task `01a0c678-55c8-7cc0-a3cb-e3200776906a` owns its original candidate,
  shared environment, acceptance and budgets. No native task action was executed.

## Observable result

Trusted CLI creation takes a private recipient email and issues one-use codes;
only email/code hashes persist. It refuses hidden-input echo fallback. Metadata
identifies legacy codes needing replacement without exposing recipient/hash/code.
Hosted validation, signup hook and first redemption enforce the current intended
recipient, capacity, expiry and revocation. Concurrent new redemptions have one
winner; successful retries and existing approved-account access remain intact.
Legacy unused codes fail closed for new hosted intake; existing records are
preserved. Demo fixtures remain compatible. Public API/OTP contracts are unchanged.

[Contract and operations](../recipient-invites.md) describe precise behaviors,
recipient privacy, legacy replacement and controlled rollout/downgrade limits.

## Verification

One full `make ready` passed at the frozen SHA: **193 Python tests with zero skips
and 314 JavaScript tests**, lint/types, unchanged generated contracts, Next build,
Expo web export and deterministic smoke. PostgreSQL 17.11 real row contention and
restricted roles pass. Fresh and populated migration checks prove legacy record
preservation, stricter admission and reversible schema mechanics. CLI tests are
synthetic; no real code was issued. The full suite includes the new tests.

[Evidence index](../evidence/recipient-invites-2026-09-24/README.md) and
[hashed receipt](../evidence/recipient-invites-2026-09-24/verification.json) bind
source and logs. Private artifacts and retained stopped database:
`/Users/brianchei/.codex/artifacts/tableus/recipient-invites-2026-09-24`.
Existing Alembic/Node warnings and an initial working-directory setup correction
are documented; the full readiness run passed first attempt. CI's local Auth role
bootstrap is updated, but hosted CI was not dispatched. No native compilation,
simulator, paid/live provider, real Auth, invitation/send, hosted migration,
deployment, merge, shared Notion or store action occurred.

## Remaining gates and next recommendation

Unused legacy invitations must be inventoried and replaced only within an approved
recipient roster and invitation scope. Quiesce old intake for migration/API rollout;
migration alone does not constrain an older API. Verify real Auth-hook grants,
configuration and affected client journeys on the selected release source.
Do not downgrade recipient binding while cohort intake is open. Native acceptance
of earlier bytes does not accept this cumulative implementation.

No global participant cap is added. Cohort roster/size, capability-link policy,
retention (including invitation email hashes), support, production configuration,
distributed builds and explicit activation remain open. Account deletion stays
disabled. Existing native attempt/stop limits and the September 30 dependency
boundary remain unchanged; canceled scans remain canceled.

**Next independent task:** a bounded read-only capability-link decision packet:
trace URL/token exchange and logging paths, compare current mitigations with a
reviewed exchange flow, propose a default and ask only the consequential UX/policy
choice. Implementation follows that decision in its own isolated objective.
This can proceed alongside native validation without replacing shared services.
