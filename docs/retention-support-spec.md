# Account deletion, retention and support release specification

Prepared 2026-09-25 against application
`484632517345e7858f48caf8fa7b128f9d9dab80`.
Brian is the current implementation, operations and decision owner.
The original source/line references below describe that historical snapshot.
The September 25 [implementation handoff](handoffs/2026-09-25-deletion-content.md)
and [current lifecycle contract](account-lifecycle.md) supersede its shared-content
findings; all other unverified operational/policy items remain open.
This document specifies remaining work; it does not enable deletion or approve
new retention periods. [Production configuration](production-release-spec.md)
and [source evidence](evidence/production-release-spec-2026-09-25/README.md).

## Findings and disposition

| Data class | Actual behavior / source | Disposition before distribution |
| --- | --- | --- |
| Profile and relationships | Full request deletes profile in the same transaction as its Auth-removal queue record. Cascades remove reviews, connections, memberships, votes and redemptions; pending validation records for the email hash are removed. [API](../backend/tableus/api.py) lines 838–870; [models](../backend/tableus/models.py) lines 100–138, 161–205 | Locally implemented. Hosted migration, credential/worker, recovery and client acceptance remain required |
| Shared content | Current code removes departing-account authored metadata, dependent historical/current results and votes, clears authored event free text, and preserves the shared plan/remaining inputs. Provenance supports future cleanup; legacy unknowns receive conservative member-deletion treatment. [Current contract](account-lifecycle.md) | Behavior approved and implemented locally. Real legacy inventory/remediation, compatible clients, hosted migration and affected acceptance remain |
| Auth and recovery | Auth hard deletion can remain pending/attention. Raw subject is cleared after confirmed removal; stable subject hash, tombstone and retry/completion metadata remain. [lifecycle](../backend/tableus/account_lifecycle.py) lines 34–103; [models](../backend/tableus/models.py) lines 47–65 | Locally implemented recovery; current purge period absent. Preserve stale-token/re-redemption protection until a replacement is proved |
| Invitations | Recipient email SHA-256, invite metadata and use count outlive profile deletion. Hashes can be matched to a known email and are not anonymous. [Invite contract](recipient-invites.md); [models](../backend/tableus/models.py) lines 83–106 | Relevant retention decision and purge design, not a claim of erasure or anonymization |
| Usage limits | Stable subject-digest/day and lifetime counters survive deletion; no purge schedule. [Cohort contract](cohort-controls.md) lines 54–60; [models](../backend/tableus/models.py) lines 68–80 | Separate daily counters from lifetime abuse protection; do not reset counters incidentally during account deletion |
| Operations and providers | ProviderUsage has no profile FK. No newly implemented guarantee removes backups, logs or provider-side records by a deadline. [Models](../backend/tableus/models.py) lines 220–230; [lifecycle contract](account-lifecycle.md) lines 66–81 | Actual host/provider settings, lawful purpose and enforceable durations remain uncertain |
| Public notice | Web describes a vague limited retention period and settings deletion; mobile omits the retention explanation and pending Auth distinction. [Web privacy](../frontend/app/privacy/page.tsx) lines 9–17; [mobile privacy](../mobile/app/privacy.tsx) lines 12–20 | Relevant copy delta, publish only after behavior and durations are settled |
| Support | `support@table-us.com` and `privacy@table-us.com` already adopted in [shared constants](../packages/domain/src/public-info.ts) lines 1–4 | Preserve contacts. Current mailbox coverage, secure verification and completion notification workflow were not exercised |

Historical approval to preserve shared plans through transfer remains valid.
It did not establish a blanket exception for retained authored personal content
or approve indefinite pseudonymous retention.

## Store-readiness implication

Apple requires in-app initiation of account deletion, clear completion expectations,
and removal of associated user-generated content. Its guidance does not generally
allow ordinary apps to require contacting support instead of providing the deletion
flow. The full-deletion flag remains off, and the newly implemented cleanup
requires rollout and legacy review; local code alone is not submission readiness.
This is a release-review finding, not a prediction of App Review's decision.
[Apple account deletion guidance](https://developer.apple.com/support/offering-account-deletion-in-your-app/).

Google Play requires an accessible external web resource from which users can
request deletion without reinstalling the app; it can prominently provide a
support-email pathway. Retained data needs an explained legitimate purpose and
the Data safety answers must reflect actual behavior. The existing privacy email
is useful, but this review did not verify a published, prominently labeled
account-deletion pathway and its operation.
[Google Play deletion requirements](https://support.google.com/googleplay/android-developer/answer/13327111).

## Bounded implementation objectives

### Authored-content treatment

Approved and implemented locally on September 25. New metadata, run requester,
location-author/version and participant provenance support transactional cleanup.
Dependent results and votes reset; remaining member inputs and independent results
survive. Organizer repair precedes fresh explicit generation. Cached stale responses
require a fresh read without replaying the mutation. See the [handoff](handoffs/2026-09-25-deletion-content.md)
for PostgreSQL races, exports, event handling, browser/mobile checks and limits.

Legacy rows are preserved as unknown during migration, then conservatively cleaned
when an affected current member deletes. Already-deleted historical contributors
remain an attribution gap requiring a separately scoped inventory and approval for
real cleanup. No provider/backups erasure deadline or full store acceptance follows
from this implementation.

### Retention schedule

For every class above, record: purpose; exact data fields; retention start event;
duration; purge/aggregation method; backup expiry and restore treatment; operator;
failure alert; and evidence. No duration is approved by this document.

Prioritize expiring daily operational counters and invite metadata separately from
the minimum tombstone needed to block stale sessions. Any purge must preserve
quota/invite abuse protection and prove the relevant token/refresh/recreation
bounds, rather than guessing a universal number of days. Do not store raw Auth
subjects after completed removal. Inventory Railway/Vercel logs, Supabase Auth/
database backups, Sentry/PostHog retention, Google provider records and support
tickets separately. Their names are an inventory requirement, not a statement
that all contain personal data or have identical retention.

Completion: an approved schedule with implemented, idempotent bounded purge/
aggregation where needed; tests for expiry boundary, restart, failed purge and
restore handling; redacted operational proof. Do not publish a finite deletion
promise while the production mechanism and backup expiry are unknown.

### Support and external request pathway

The current objective implements a prominent `/account-deletion` web page:
TableUs identification, in-app settings route, account/associated-data scope,
organizer prerequisites, actual timing and retained-data explanation, plus a
`privacy@table-us.com` request path usable without reinstalling the app.
Require secure ownership verification before any destructive action; never ask
for passwords, OTPs, session tokens, invite codes or private plan links in email.
An email address alone is not proof that a sender controls the account.

Brian adopted an acknowledgment target of two business days on September 25.
The [support procedure](deletion-support-procedure.md) binds verification, duplicate
handling, exact status proof and remaining access-loss completion gaps.
Brian owns triage and operator follow-through. The current runner supplies aggregate
health, not a demonstrated complete support-case system. Define a restricted case
lookup and authorization procedure, minimal case identifier, status/attention
escalation, completion confirmation and case-record retention. Do not expose subject
hashes or queue internals to public callers. The support flow must not become a
mandatory substitute for the in-app path.

Full deletion may commit application-data removal before the HTTP response or Auth
operation completes. If a session is lost, do not tell a user to create a fresh
account to check status. Support must distinguish pending/attention/completed
without promising that a successful request already removed every provider record.
Both API and worker need Auth deletion credentials when enabled; use the
[existing operations and pause/drain procedure](account-lifecycle-operations.md).

Completion: verified mailbox routing/coverage and a bounded response/completion
target; authenticated request handling, duplicate request and uncertain-result
recovery; confirmed Auth completion and honest retained-data notice; accessible
external request page; web/mobile parity; matching store disclosures. Sending
messages or deleting real accounts requires a separately authorized campaign.

## Historical draft public copy — superseded, not approved for publishing

The following describes the historical `4846325` behavior, including gaps. It is a drafting
baseline, **not a proposed substitute for the authored-content fix or an approved
privacy notice**. Rewrite it against the final accepted behavior and schedule.

> Account settings let you request full-account deletion when that feature is
> enabled. First, transfer shared plans you organize to another approved participant,
> or remove plans in which you are the only participant. After you confirm deletion,
> your TableUs profile and linked application records are removed. Removal of your
> authentication account may still be pending. If your session ends or the status is
> unclear, contact privacy@table-us.com.
>
> Under the current implementation, transferred shared plans and some content you
> contributed remain available to their participants. Direct account references are
> removed, but free text is not automatically cleared of every reference to you.
> We retain pseudonymous invitation, usage-limit and deletion-recovery records to
> prevent invitation reuse, quota resets and stale-session access. These records
> are not anonymous. Operational logs, backups and provider records follow separate
> handling; their retention periods are still being established.

Do not ship the last paragraph's unresolved-period statement as the completed
production policy. Replace it with approved, implemented periods and exceptions;
replace the shared-content paragraph after the behavioral decision is implemented.
Keep export/app-only deletion distinct from full-account deletion and use one
reviewed content source or parity check for both clients. Revisit the notice's
effective date only when the new notice actually takes effect.

## Decisions still needed

- Real legacy-content inventory and a bounded remediation scope for records whose
  contributors were already deleted before provenance existed. Future deletion
  behavior is approved and implemented; blanket historical cleanup is not.
- Enforceable retention periods and purpose for each surviving record class, based
  on actual configured provider/backup limits and stale-session safeguards.
- Operational proof for the adopted two-business-day acknowledgment target,
  secure verification and supported case-specific completion estimates.

The previous six-digit verification-code backlog does not become a new auth
redesign through this work. Preserve the current email OTP/link decisions; assess
only affected deletion/re-authentication and distributed return flows. No new SMS
provider, verification service or messaging budget is implied.

The original specification exercised no services/accounts/mailboxes. Subsequent
local implementation and tests are recorded separately in its handoff; no public
privacy notice, hosted account, mailbox or retention schedule was changed.
