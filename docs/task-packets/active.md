# Active packet: recipient-bound one-use invites

Owner: Brian, sole developer at this stage; historical shared work remains shared.
The owner requested the recommended next independent objective.

## Identity

- Branch: `codex/recipient-invites`.
- Worktree: `/Users/brianchei/.codex/worktrees/recipient-invites/Tableus-ai-agent-dev`.
- Exact base: `c33479e80eef4ddd154783dda677cd016dc1a936`.
- Prior candidate: `25e34ec9e35e1935cebe8dbb8f34465fd2b313e0`;
  [cohort handoff](../handoffs/2026-09-24-cohort-controls.md).
- Native task `01a0c678-55c8-7cc0-a3cb-e3200776906a` retains all native work,
  source identities, approvals and exhausted allowances.

## Outcome and acceptance

Trusted local issuance requires one intended email and permits one redemption.
Only its normalized hash is stored. Validation, signup hook and redemption check
current recipient, expiry, revocation and capacity. Concurrent redemption has
one winner; successful same-account retries remain idempotent. Returning approved
accounts need no fresh invite. Hosted new intake fails closed for legacy unbound
or multi-use codes; retain their rows and existing account access. Demo fixtures
remain compatible. No in-place recipient reassignment or real invitations.

Root owns integration/review, PostgreSQL setup, API changes, docs and final checks.
Sol owns disjoint model/migration/hook and CLI/tests components. Focused checks
cover recipient mismatch, old grants, revocation/expiry, retry/race, privacy and
fresh/populated migrations with actual restricted roles. Freeze source, then one
passing `make ready`, contract-drift check and evidence-bound handoff.

## Boundaries

Local code and synthetic deterministic tests only. No native builds/devices,
live Auth/providers, real deletion or invite issuance/sends, cloud resources,
secrets, hosted migration, deployment, merge/push, stores, beta activation or
shared Notion edits. Account deletion stays disabled. Use a fresh task-owned
PostgreSQL cluster; stop it and retain data/logs. Capability exchange and release
activation remain separate objectives. Hosted rollout must review replacement
of unused legacy invites and quiesce intake across migration/code transition.

## Status

Implementation in progress; no invite or release acceptance claimed.
