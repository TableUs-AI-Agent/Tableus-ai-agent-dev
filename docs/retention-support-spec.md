# Account deletion, retention and support release specification

Prepared 2026-09-25 against application
`484632517345e7858f48caf8fa7b128f9d9dab80`.
Brian is the current implementation, operations and decision owner.
This document specifies remaining work; it does not enable deletion or approve
new retention periods. [Production configuration](production-release-spec.md)
and [source evidence](evidence/production-release-spec-2026-09-25/README.md).

## Findings and disposition

| Data class | Actual behavior / source | Disposition before distribution |
| --- | --- | --- |
| Profile and relationships | Full request deletes profile in the same transaction as its Auth-removal queue record. Cascades remove reviews, connections, memberships, votes and redemptions; pending validation records for the email hash are removed. [API](../backend/tableus/api.py) lines 838–870; [models](../backend/tableus/models.py) lines 100–138, 161–205 | Locally implemented. Hosted migration, credential/worker, recovery and client acceptance remain required |
| Shared content | Organized shared plans must be transferred; only sole-participant plans can be removed directly. Transferred title/location, recommendation queries/reasoning/history and some contributed event content remain. Event actor is cleared; named identity keys and exact ID/hash values are scrubbed, not arbitrary free text. [API](../backend/tableus/api.py) lines 553–575; [models](../backend/tableus/models.py) lines 140–218 | **Relevant behavioral review**, not resolved by transfer or privacy wording. Determine authored personal content that must be erased while preserving collaborators' plan utility |
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
flow. The existing full-deletion flag being off, and retained shared authored
content, therefore cannot be marked submission-ready from local code alone.
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

Inventory each persistent plan field and event payload by author, contributor,
subject and surviving collaborator dependency. Current plan fields and recommendation
runs do not retain complete authorship provenance after organizer transfer; blindly
treating the current organizer as the author would be wrong. Record the historical
attribution gap and decide a conservative treatment for old records.

Proposed approach for review: preserve plan membership and collaborators' own votes/
contributions, while erasing or replacing the departing user's attributable personal
free text and identity references. Add provenance where necessary for future writes;
select and approve legacy redaction treatment before migration. Do not automatically
delete other participants' data or claim that transfer assigns away personal-data
deletion requirements.

Completion evidence: deterministic fixtures with transferred organizers, former
organizers, multiple contributors, free-text identity references, recommendation
queries/reasoning, event payloads and exports. The removed user's content must not
reappear in a surviving participant view/export or later regeneration. Document any
remaining retention purpose and exception; review the final behavior against store
requirements. This is a proposed objective, not executed work.

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

Propose a prominent `/account-deletion` web page (path proposed, not implemented):
TableUs identification, in-app settings route, account/associated-data scope,
organizer prerequisites, actual timing and retained-data explanation, plus a
`privacy@table-us.com` request path usable without reinstalling the app.
Require secure ownership verification before any destructive action; never ask
for passwords, OTPs, session tokens, invite codes or private plan links in email.
An email address alone is not proof that a sender controls the account.

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

## Draft public copy — accurate to current code, not approved for publishing

The following describes implemented behavior, including gaps. It is a drafting
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

- How to remove a departing user's authored personal content in transferred plans,
  including records without reliable historical authorship, while preserving other
  participants' contributions. Recommended next bounded implementation design.
- Enforceable retention periods and purpose for each surviving record class, based
  on actual configured provider/backup limits and stale-session safeguards.
- Support response/completion target Brian can sustain during the cohort, with
  secure verification and completion confirmation.

The previous six-digit verification-code backlog does not become a new auth
redesign through this work. Preserve the current email OTP/link decisions; assess
only affected deletion/re-authentication and distributed return flows. No new SMS
provider, verification service or messaging budget is implied.

No code or public notice was changed; no services, tests, providers, accounts or
mailboxes were exercised. These findings amend readiness claims, not prior exact-source
local test results.
