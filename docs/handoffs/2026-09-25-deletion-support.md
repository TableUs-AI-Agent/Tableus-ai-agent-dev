# External deletion help and support — local handoff

Completed September 25, 2026. Brian owns current development/support; historical
shared TableUs contributions remain attributed. This objective adds a public
request path, consistent platform explanation and a concrete support procedure.

## Source and delivered behavior

- Branch: `codex/deletion-support`.
- Worktree: `/Users/brianchei/.codex/worktrees/deletion-support/Tableus-ai-agent-dev`.
- Base: `838244aa4ba08cd67859a68d8f25b4d339476a74`.
- Final application: `f3efa7a28010454275bf3b32ec52fc43792fdaee`.
- Readiness source: `189f02440deb09dd931d3df06001cb02c05cf691`; final delta is
  three page color classes, covered by fresh web build/lint/browser checks.
- This handoff's subsequent commit contains documentation/evidence only.

Public `/account-deletion` and the mobile help screen expose a bare privacy email
link and selectable-address fallback. Auth, account and privacy screens link to
help. Pending deletion recovery can open help and return to status. Shared wording
conditions data removal on an accepted full request, explains shared-content reset
and retained pseudonymous records, and preserves optional authenticated deletion.
A failed mail-app launch leaves a usable address and explanatory message.

Brian adopted acknowledgment within **two business days**. Completion estimates
follow ownership verification and blocker assessment; no fixed completion or purge
deadline is invented. Opening the mail link does not send a request or delete data.
No privileged initiation route, authentication mechanism or public status lookup
was added. The [support procedure](../deletion-support-procedure.md) specifies
verification, exact case/job binding, duplicate handling, pending/attention and
completion evidence, minimum private records and response templates.

## Validation

[Evidence/results and hashes](../evidence/deletion-support-2026-09-25/README.md):

- **317 JavaScript and 214 Python tests passed, zero skips** on restricted-role
  local PostgreSQL. Generated contract has no drift; Next/Expo-web builds and
  deterministic smoke passed. Performance output is report-only.
- One make-ready stopped after passing lint/types because the existing account
  component test needed a router mock. Corrected test adds recovery navigation;
  remaining readiness stages passed. Final page contrast fix received focused
  lint and a fresh production web build, including TypeScript.
- **Two mocked Chrome journeys passed against final application bytes**: public
  access/privacy navigation and recovery-to-help-to-status. Three mobile help
  component tests plus the existing account suite verify contact failure handling
  and recovery navigation. No native acceptance claim.
- Root inspected desktop and phone-width captures. Email-action text contrast is
 6.26:1, inline link text 13.38:1. Independent source review found no consequential
  issue in the scoped page/procedure. Source-based support tabletop is explicitly
  distinct from actual mailbox operation.
- Both loopback services are stopped; data/logs/builds remain in private artifacts.
  App/contract bytes have not drifted after verification. No merge or push.

## Remaining release gates

The page is **implemented locally, not published**. Mailbox routing/coverage and
the acknowledgment target still need operational rehearsal. No account-specific
information may be disclosed to an unverified email sender.

The worker processes existing durable jobs; it cannot initiate new deletion for
an email-only requester without authenticated access. A completed job clears its
raw Auth subject, so email alone cannot recover a lost subject/job binding. Secure
assisted initiation and recovery must be designed/rehearsed before claiming those
cases can be completed. No direct Auth deletion, manual queue insertion or guessed
ownership transfer is an acceptable shortcut.

Actual retention periods, case-tool permissions, provider/backup treatment, legacy
content remediation, compatible hosted clients, production targets and affected
cumulative/native acceptance remain open. Prior TableUs Vercel access remains
unverified; no hosting inventory was refreshed here. The native validation task
retains its original artifacts and limits; no provider/native allowance was reset.

No native builds/simulators/devices, live providers, mailbox reads/sends, real
requests/deletions, hosted changes, resources/secrets, deployments/publication,
store submissions, Notion/Notes or canceled security scans were performed.

## Next recommendation

Prepare a bounded secure assisted-deletion design for verified users who cannot
sign in. Bind identity/consent to an exact account, retain organizer safeguards,
and reuse transactional cleanup plus the durable deletion job. Include proof for
pending/completed support lookup without exposing digests or recreating accounts.
This closes a concrete operational gap before publication; it grants no authority
for real account actions. Retention/provider inventory can run independently.
