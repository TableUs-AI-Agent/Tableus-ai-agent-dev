# Current state

Updated 2026-09-27. GitHub state and deployment-trigger settings were freshly
read for [baseline integration](evidence/6dac996/integration.md). Application
serving identities below remain the September 25 record, not fresh health checks.

## Source baseline

| Item | Value |
| --- | --- |
| Cumulative local source baseline | Application baseline `4a2f9ecc37070f434df7fc75c1054d5875f21ba9` (`codex/deletion-support`); September 26–27 product/planning realignment on `codex/pilot-realignment` |
| Refreshed `origin/main` | `e1184eca9b73e1a9f26d1007ab543df9d54c7124` (pull request #6); GitHub still uses `main`, with no branch protection/rulesets |
| Integration scope | 165 commits from `main` through realignment source `6dac996`, plus publication guard/documentation. No divergence. The native diagnostic branch diverges after `bcc9e52`; do not merge it wholesale. |
| Root checkout | Stale at `codex/privacy-safe-observability` (`8e9625e`). Use the baseline, not the root checkout. |

The last full local readiness at the baseline's application source passed 214
Python and 317 JavaScript tests with zero skips, plus lint, types, contract
generation, web and Expo-web builds and deterministic smoke
([handoff](handoffs/2026-09-25-deletion-support.md)). [Integration PR #7](https://github.com/TableUs-AI-Agent/Tableus-ai-agent-dev/pull/7)
is open. Its first hosted run on `dc7989e` passed role setup, migrations, lint and
types, then stopped at a test wrapper's hard-coded Homebrew Python path. The
wrapper now uses `python3` from `PATH`; a complete replacement hosted pass is
required before merge. The lifecycle, quota, invite, private-link and deletion
work still has no complete hosted pass after `ed8330a` (September 21). The
[integration review](evidence/6dac996/integration.md) distinguishes reused local
checks from the PR's hosted result.

Vercel project Git auto-deployment is enabled, but repository configuration now
excludes `codex/pilot-realignment` and `main`. Other branches still need trigger
review before pushing. Railway currently has no deployment triggers and PR
environments are disabled. No hosting setting or running deployment was changed.

## Deployed staging

| Component | Source | Notes |
| --- | --- | --- |
| API (Railway `tableus-staging`) | `f94a1d9` | Supabase auth, live Places, live Gemini through Agent Platform, anonymous telemetry |
| Web aliases `tableus-staging.vercel.app`, `links.table-us.com` | `ed8330a` | Dependency-patched web; API remains `f94a1d9` |
| Accepted native artifacts | `f94a1d9` | Isolated-staging acceptance with an owner-accepted simulator AppHang risk ([closeout](evidence/ios27-staging-f94a1d9/closeout.md)) |
| Production-facing `table-us.com` | `e1184ec` | Not a pilot target |

On the recorded deployment state, the later features below are not deployed.
Four migrations added after `f94a1d9` are expected to be pending: account deletion queue, shared-content
provenance, cohort counters and recipient-bound invites. After that last
migration, any unused legacy unbound invite code in staging is rejected for new
signups and must be reissued to a named recipient.

## Product

The core journey is implemented on web, iOS and Android: invite-approved email
OTP sign-in, shared plans for 2–8 people, per-participant constraints, four
grounded options from Places and Gemini, top-three ranked voting, organizer
finalize and reopen, private-link rotation, explicit refresh and explicit retry of
ambiguous mobile writes. Clients use `/api/v1`; Supabase is used directly only for
authentication. Earlier candidate evidence is not acceptance of the cumulative
local application. The API allows organizer finalization with zero or partial
votes; the agreed pilot counts success only with at least two independent votes.

Hackathon-era surfaces remain visible: web Discover (the current home redirect),
Friends, Review and Profile, and mobile People, Review and Profile tabs. They are
not inputs to shared-plan recommendations: that path uses each participant's plan
constraints (`backend/tableus/api.py`, `generate_recommendations`). The pilot
will hide these surfaces; see the [roadmap](roadmap.md). No navigation code changed
during realignment.

## Implemented in the baseline, not deployed

| Capability | Default after deployment | Contract |
| --- | --- | --- |
| Full account deletion with recoverable Auth removal | Off today/default (`TABLEUS_ACCOUNT_DELETION_ENABLED=false`); pilot requires approved activation and rehearsal in Priority 3 | [account lifecycle](account-lifecycle.md), [operations](account-lifecycle-operations.md) |
| Plan transfer, sole-plan removal and legacy application-only deletion | Available subject to authorization/blockers; not disabled by the full-deletion flag | [account lifecycle](account-lifecycle.md) |
| Shared-content removal and organizer repair on deletion | Applies to legacy and full deletion; not gated by the full-deletion flag | [design](deletion-content-design.md) |
| Durable per-account quotas: 5 AI and 20 Places operations per UTC day, 20 plan creations per lifetime; operator-only usage reports | On, configurable | [cohort controls](cohort-controls.md) |
| Recipient-bound, one-use invitations | On after migration | [recipient invites](recipient-invites.md) |
| Private-link capture into bounded client memory; fragment link emission | Capture on; emission off (`*_JOIN_LINK_FORMAT`) | [private links](private-link-handling.md) |
| Public account-deletion help and support procedure | Page present; not published operationally | [procedure](deletion-support-procedure.md) |

## Known gaps and risks for the pilot

- Reads of plans with candidates hydrate Places; empty/summary/revision reads do
  not do that hydration. The default 20 daily logical Places operations per
  account needs complete-journey sizing, separately from billable attempts/spend.
- Structured cuisines are intersected only when supplied. Current web/mobile
  plan forms send free-text notes and empty cuisine arrays. The four-result
  requirement can still produce no result; its effect on real groups is unmeasured.
- Anonymous telemetry cannot measure group completion across accounts/sessions.
  `plan.finalized` currently records only the candidate ID. Priority 2 adds a
  distinct-voter count and updates the strict payload allowlist used by account
  deletion; [current cleanup](../backend/tableus/api.py) would otherwise discard
  it. Whole-plan deletion also removes events through the
  [foreign key](../backend/tableus/models.py). The [roadmap](roadmap.md) scopes exact
  counts to retained, instrumented plans and discloses the accepted coverage gaps.
- Full deletion is implemented but has no hosted activation/worker acceptance.
  Priority 3 must prove the normal self-service path, organizer-blocker resolution,
  recovery and truthful retention/copy before invitations. Brian accepts that a
  known pilot participant who loses sign-in email access may be unable to delete
  until secure recovery/assisted verification exists. A support contact/escalation
  route remains required; the [support procedure](deletion-support-procedure.md)
  cannot initiate deletion from an email request alone.
- Idempotency, provider reservations and spend coordination are process-local, so
  the API must run as one process.
- Ad hoc iOS builds install only on devices included in the provisioning profile;
  collect all pilot iPhone device IDs before building. Production mobile builds
  are deliberately disabled until production origins and update policy exist.
- Hosted restricted-role database setup and migrations passed on the first
  integration run; the PostgreSQL test suite still awaits a complete hosted pass.
- The old frozen dependency graph (`f94a1d9` native artifacts and API image) is
  not covered beyond September 30; a new candidate from the baseline uses the
  remediated graph ([disposition](evidence/dependency-toolchain-2026-09-21/README.md)).

## Native validation

The C1–C11 iOS 27 diagnostic campaign did not establish application acceptance
for `8972865`; several attempts stopped before TableUs ran, including the latest
memory prerequisite failure. Worktree counts do not establish the cause of RAM
pressure. Original refresh failures, accessibility-driver crashes, initialization
stall and AppHang remain unresolved findings, not automatically application defects
or resolved issues. Native history remains in its task at `c680b59`.

Brian replaced that campaign as the pilot gate with candidate-bound physical
device acceptance, including airplane-mode/visible retry and explicit finding
dispositions. One bounded `mobile-offline-e2e` run on a separate local test artifact
from the candidate covers writes whose responses are lost; its selected platform
and test configuration are explicit, not physical or cross-platform proof. A
signed physical-iPhone iOS 27 startup check passed for `f94a1d9`. Pilot native
acceptance uses the [pilot checklist](release-readiness-checklist.md); old device
results do not accept the new bytes. No task was messaged or stopped by this review.
