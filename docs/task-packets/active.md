# Active packet: private-link handling

Owner: Brian, sole current-stage developer. Historical shared work remains shared.
On September 25 the owner said continue with the recommendation: retain private
link sharing among approved members and implement the prepared safer transport.

- Branch: `codex/private-link-handling`.
- Worktree: `/Users/brianchei/.codex/worktrees/private-link-handling/Tableus-ai-agent-dev`.
- Base: `2674fc7a798de5f090f17455a602e44641bda943`.
- Inherited application: `29edb5e9f47ab7ac74034f2bac5e271a162ea620`.
- [Design packet](../capability-link-decision.md); native task
  `01a0c678-55c8-7cc0-a3cb-e3200776906a` retains all native execution and budgets.

## Outcome

Read fragment and legacy query capabilities once, keep secrets out of router/auth/
persistent state, retain only a 20-minute process-local pending join, clear on
cancel/success/expiry/logout/account switch, and require explicit approved-member
Join through the existing API. User-requested ambiguous recovery first checks
provider-free membership. Preserve existing plan authority/rotation/capacity.
New-format emission is prepared but defaults OFF (legacy query) until compatible
web/mobile readers and installed-client adoption pass separate release acceptance.
Add explicit join-page referrer/cache policy and private API no-store responses.

## Ownership and checks

Astra: shared pure parser/store, API HTTP headers, integration/review, PostgreSQL
setup and final evidence. Sol: separate frontend and mobile implementation/tests.
React quality checklist applies. Meaningful parser/lifecycle/mock client and API
checks, one passing make-ready on frozen source, generated-contract drift and
durable exact-source handoff. Local PostgreSQL only, synthetic data, no live Auth.

## Boundaries

No native builds, simulator/device actions, live or paid providers/Auth, real
invites/links, cloud/secret changes, hosted migration or CI, deployment, merge/push,
store submission, beta activation, shared Notion edit or destructive cleanup.
No native retry or September 30 extension. Account deletion stays disabled;
canceled scans stay canceled. Keep and stop task-owned local PostgreSQL; retain
logs/data. No rollout acceptance from mocked tests.

## Status

Local implementation complete; application frozen at `484632517345e7858f48caf8fa7b128f9d9dab80`.
One full make-ready passes 196 Python / 311 JavaScript tests, zero skips; unchanged
generated contracts, lint/types, Next build, Expo web export and deterministic
smoke. Four mocked Chrome journeys pass on those exact production bytes; observed
join headers include no-referrer/private no-store. Local servers are stopped;
logs/data retained. [Handoff](../handoffs/2026-09-25-private-link-handling.md)
and [receipt](../evidence/private-link-handling-2026-09-25/verification.json).

Approval applies to the recommended current-sharing model and local scope, not
production risk acceptance or new-format activation. The next bounded objective
is a cumulative release-acceptance proposal: exact compatible candidate, native
impact/ownership, reader adoption and transition/rotation scope, hosted header/log
checks and remaining activation gates. Prepare that proposal read-only before
requesting any new native/external execution; do not start from stale main or
silently merge these branches.
