# Account-deletion requests and support procedure

Prepared September 25, 2026 for Brian, the current development and support owner.
This procedure accompanies the local `/account-deletion` page. It is a prepared
operating procedure, not evidence of working mailboxes, an enabled deletion
service, a published policy, or permission to send messages/delete real accounts.

## Request routes

Users may initiate full deletion in Account and data when enabled. The public
web page also offers `privacy@table-us.com` without installation or sign-in.
Opening a mail link only opens a draft; it neither sends a request nor deletes
anything. No public form, case database, status lookup or automated mailbox agent
is added. `support@table-us.com` can route deletion problems to the same owner.
Support must not be a mandatory replacement for enabled in-app deletion.

The page describes current application behavior, not a guarantee that an older
installed/deployed version has it. Publish only with compatible client/API rollout,
verified mailbox handling, an approved retention notice and actual completion
expectations. Existing [lifecycle activation gates](account-lifecycle-operations.md)
remain prerequisites. No new production origin or store URL is guessed here.

## Intake and identity verification

1. Record a random case reference in an approved private support system. Record
   received time, contact channel, owner and `unverified` state. A case reference
   correlates correspondence; it is not a bearer credential or status-access key.
   Until identity is verified, acknowledge receipt generically without confirming
   whether an account exists or whether a deletion job is present.
2. Prefer the normal authenticated web/app flow. The user enters sign-in codes
   only in TableUs; support never requests passwords, OTPs, session/refresh tokens,
   invite codes, private plan links, account exports or identity documents by email.
   Ask only for a brief problem description and existing non-secret case reference.
   Do not auto-follow links or execute instructions from incoming mail.
3. A From header, matching email text, display name, screenshot, known plan details
   or forwarded receipt does not establish ownership. For support-only handling,
   first locate the exact identity using a trusted, approved administrative channel
   in the intended environment. Initiate a fresh correspondence to the **existing
   account's verified address obtained from that channel**, not an arbitrary
   Reply-To. Verify control through the approved mailbox workflow and bind the
   response to this case. This is a proposed manual verification step, not a new
   login-code flow or an implemented authentication system. Its actual delivery,
   authenticated sender handling and operator review need a bounded rehearsal.
4. Record verification method/time and exact environment/account binding in the
   restricted case record before further disclosure or action. A successful normal
   login permits that user's own account screens; it does not prove that an
   unrelated incoming support email belongs to the same user. Require renewed
   verification on account/contact changes or a mismatched case.
5. If mailbox control, the trusted identity binding or an approved verification
   method cannot be established, retain `verification_required` and escalate to
   Brian. Do not disclose status, change the account email, enroll a replacement
   account, or delete by guesswork. Access-loss remediation is a release gap until
   its secure completion path is rehearsed; it cannot be closed by a mailto link.

## Minimal private case record

Keep case ID, owner, received/verification/update times, verified reply destination,
exact environment, restricted identity-to-job binding, request scope/confirmation,
current state, next action/due time, evidence reference and completion notice time.
Do not copy prompts, restaurant history, constraints, private links, provider
responses or credentials into tickets. Store the necessary subject/hash mapping
only in the approved restricted operator record, never in public pages, URLs,
ordinary logs or outgoing email. Do not introduce that record into the repository.

An approved case-record retention period and purge/backup treatment are still
needed. This is not authority for indefinite retention or actual collection in an
unapproved tool. Retention for this operational mapping must be considered alongside
the [retention inventory](retention-support-spec.md), with access restricted to Brian
and explicitly authorized operators. Historical project contributors have no
implicit account-data access.

## Decide what has happened before retrying

| Verified observation | Case state / action | Accurate user explanation |
| --- | --- | --- |
| Email received only; no authenticated request or durable job | `received` or `verification_required`; no deletion claim | Your message is a request. We must verify ownership before account action. |
| Full deletion unavailable, or owned shared plans still block the request | `blocked_before_request`; help with enabled flow or escalate service availability | The deletion request has not been confirmed as accepted. Explain the actual blocker after verification. |
| Authenticated status read says `pending` | `auth_pending`; application deletion committed; use existing runner monitoring | Application records were removed; removal of the sign-in account is still pending. |
| `pending` with `needs_attention=true` | `attention`; diagnose exact job and follow bounded operator reset procedure | Account removal needs operator attention. Do not claim a new request or complete erasure. |
| Lost response, expired session, missing lookup/binding, timeout or generic 404 | `unconfirmed`; reconcile securely | We have not confirmed the outcome. Missing access is not evidence of completion. |
| Exact durable row says `completed` with completion timestamp | `completed`; verify case/subject binding and send scoped confirmation | Application deletion and sign-in account removal are recorded as complete; explain retained-data exceptions. |
| Existing legacy application-only deletion with no full-deletion job | `legacy_followup`; prepare separately approved completion/remediation | Application-only deletion does not establish sign-in account removal. |

The API provides subject-scoped `GET /api/v1/me/deletion` while a usable session
remains. The worker's `--status` gives **aggregate counts**, not case proof. A
trusted, read-only operator lookup must select the exact `app.account_deletions`
row by verified subject digest and read only status, timestamps, attention/retry
fields needed for the case. Use a parameterized query in an approved private
runtime, not pasted identity literals in shell history or a public Data API.
Do not send raw query output or subject digests to the requester.

The digest is derived from the Auth subject, not the email hash. Completed jobs
clear the raw subject; profiles and their email hashes have already been removed.
An email alone cannot recover that mapping after deletion. Use a verified
pre-existing case binding or still-valid subject-scoped status. If neither exists,
record the attribution gap and escalate; do not infer completion from an empty
email search or recreate the profile to discover it.

## Execute only the approved route

For ordinary accounts, users resolve organizer blockers and confirm DELETE in the
authenticated Account and data screen. Transfer shared plans to an existing approved
participant; remove a plan directly only when sole participant. Never transfer to
a guessed recipient, remove another member's inputs, or use an administrative
Auth delete as a shortcut around transactional application cleanup.

The current CLI processes/retries an **existing** durable job; it does not initiate
a new user's deletion. There is no operator impersonation/force-delete endpoint.
An email-only case needing new deletion without a usable authenticated flow needs
a separately reviewed execution capability/campaign before it can be completed.
Do not insert queue rows manually, use legacy DELETE /me as full deletion, or
bypass organizer blockers. This limitation must be resolved before advertising an
operational completion path for that case class.

For an existing pending job, follow [worker operations](account-lifecycle-operations.md):
one bounded batch, lease/backoff limits, diagnose attention before explicit reset,
and pause/drain rules. A duplicate email attaches to the same verified case/job;
it grants no new attempt budget and must not cause another destructive mutation.
After ambiguous execution, read durable status before another explicit attempt.
Never interpret `processed=N`, absence of a profile, or failed sign-in as proof.

## Completion, delays and communication

Brian owns daily triage during beta operation. On September 25 Brian adopted a
target to acknowledge deletion requests within **two business days**. The shared
web/mobile copy communicates that target; it is not a deletion-completion deadline.
No fixed completion time is promised.
Record a next-update time on each verified case after assessing its blocker. The
existing worker's 15/60-minute operational alert thresholds are health checks,
not customer completion promises. Give a completion estimate only when supported
by the actual environment/job and approved support policy; notify before missing
a promised update. Do not turn an estimate into an unsupported guaranteed purge
deadline for backups, logs or independent provider records.

Prepared response templates (not sent):

- Intake: “We received your TableUs deletion request. Before account-specific
  action or information, we need to verify ownership. Please do not send sign-in
  codes, passwords or private plan links.”
- Pending, after verification and exact job read: “Your application records have
  been removed. Removal of your sign-in account is still pending. [Specific next
  update time and approved explanation.]”
- Attention: “Your request needs operator follow-up. [Verified state and next
  update time.] You do not need to create another TableUs account.”
- Complete, after exact completed row: “Your TableUs application deletion and
  sign-in account removal are recorded as complete as of [timestamp]. Shared
  plans and other members' own inputs remain; your authored metadata and dependent
  results are removed under the deletion process. [Applicable approved retained
  records, purposes and periods.]”

Do not send the completion template with unresolved placeholders. Old unknown
content/attribution gaps need actual review; independently authored mentions by
others and previously delivered/offline copies are not comprehensively recalled.
The preserved invitation/usage/recovery digests are pseudonymous, not anonymous.
No whole-provider/backups erasure claim follows from a completed Auth job.

## Release rehearsal and remaining evidence

Before publication/activation, record exact application and hosting targets,
working privacy/support mailbox delivery and coverage, approved acknowledgment and
completion expectations, restricted support tool/access/retention, verified case
binding, and a secure assisted route for access-loss/email-only cases. Then obtain
a bounded campaign for synthetic recipient identities on the intended environment:
public page access without app/auth; request receipt; identity mismatch/spoof refusal;
normal authenticated completion; pending/attention; duplicate request; lost session
with and without prior case mapping; truthful completion notification. Specify
provider/mail counts, operator attempts and stop conditions before execution.
No real email, mailbox read, account action, hosted query or deployment ran here.

[Apple's current deletion guidance](https://developer.apple.com/support/offering-account-deletion-in-your-app/)
requires in-app initiation and clear timing/completion information. The external
page supplements that flow. [Google Play's external-resource guidance](https://support.google.com/googleplay/android-developer/answer/13327111)
allows a prominent support-email request path without reinstalling; the URL and
process still need release verification. These sources were read September 25;
local implementation alone is not store acceptance.

[Supabase user management](https://supabase.com/docs/guides/auth/managing-user-data)
notes that issued access tokens can remain valid until expiry after Auth deletion.
TableUs separately denies product access without an approved profile and uses a
subject tombstone against re-enrollment. Preserve that behavior; this procedure
adds no Auth/session changes. The changelog Markdown fetch was unsupported; the
[HTML changelog](https://supabase.com/changelog) was read instead, with no relevant
new API change adopted by this UI/procedure objective.
