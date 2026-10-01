# P3: mail-route recovery and remaining manual cases

Prepared October 1, 2026, from `8fecf04b8cfa57808692e959a27447fd418fb906`.
**The owner approved the exact ImprovMX account/aliases/DNS setup at
`ba5ec9546a1d668e0c2b91b52aa7af72e7f6be06`, including bounded rollback.**
They then requested the bounded Squarespace diagnostic below. It completed with
exact restoration, and the owner then requested continuation of the ImprovMX
recommendation. The owner completed signup; Free is active. All three exact
aliases persisted after reload, including A's tagged address, and no catch-all
remains. After renewed Squarespace verification, the approved MX pair and merged
SPF were saved. ImprovMX shows Active; all six DNS sources agree, retained records
match, and Resend sending stays verified. Delivery remains untested. The separate
[three-message test](p3-mail-route-delivery-test.md) and broader rehearsal allowance
extensions remain unapproved.

## Approved Squarespace diagnostic: completed, original record restored

The owner authorized one brief remove/inspect/restore test and completed normal
Google reauthentication. The original record was backed up at
`2026-10-01T06:34:34.404584Z`: host `send`, type MX, priority 10, TTL 14400, value
`feedback-smtp.us-east-1.amazonses.com`. Delete was confirmed at `06:43:32.535Z`.
The DNS table then omitted it and a refreshed Email page cleared the existing-MX
warning. **Add Rule stayed disabled**, with the Google Workspace management
notice still visible. This proves removing the MX alone does not unlock forwarding;
the UI does not expose the precise additional eligibility condition.

The original record was resubmitted at `06:44:18.929Z` and its exact values and
save confirmation were visible at `06:44:31.920Z`: 59.385 seconds after Delete,
within the five-minute ceiling. At `06:45:03.261037Z`, all four authoritative
nameservers and two public resolvers returned the original MX. Matching baseline
website, SPF, Resend DKIM and DMARC records were unchanged. Resend readback still
showed sending enabled and the domain/DKIM/SPF MX/SPF TXT all verified. This does
not measure the global absence interval or prove live email delivery.

[Structured diagnostic evidence](evidence/mail-routing-2026-10-01/squarespace-mx-test.json)
contains the backup, timestamps, DNS answers and comparison results. Screenshots:
`/private/tmp/tableus-squarespace-mx-removed-forwarding-disabled.png` and
`/private/tmp/tableus-squarespace-mx-restored.png`. No forwarding, mail probe,
Workspace cancellation, identity change or staging resume occurred. Do not repeat
the record removal; the approved diagnostic is complete and its original record
was restored before ImprovMX activation.

## Verified routing state

Public authoritative DNS still uses `nse1`–`nse4.squarespacedns.com`. All four
authoritative servers and Cloudflare/Google now return both approved apex MX
records and one merged SPF. The authoritative TTLs match the approved values.
Seventy-two before/after comparisons confirm retained DNS values, including
website records, Google/Resend DKIM, Resend `send` MX/TXT, DMARC and nameservers;
authoritative retained TTLs also match. ImprovMX shows **Active** with all three
required record checks passing. Resend reports domain/DKIM/SPF MX/SPF TXT verified,
sending enabled and receiving disabled. No live delivery was tested.

The [public DNS baseline](evidence/mail-routing-2026-10-01/dns-baseline.json) records
the original absent apex MX and Google-only SPF. The
[setup evidence](evidence/mail-routing-2026-10-01/improvmx-setup.json) records fresh
before/after DNS, the exact three saves and provider status. Only the two approved
apex MX additions and single SPF edit remain as net DNS changes. Public contacts,
SMTP, Workspace subscription and website settings were not changed.
Screenshot: `/private/tmp/tableus-improvmx-active.png`.

The prior Squarespace test demonstrated that removing Resend's `send` MX did not
unlock built-in forwarding. Its exact additional eligibility condition remains
unknown. That record was restored and remains intact; do not repeat the test.

[Squarespace forwarding documentation](https://support.squarespace.com/hc/en-us/articles/19000909092237-Email-forwarding-with-a-Squarespace-domain)
describes free forwarding for eligible managed domains and automatic mail DNS
records. Existing custom-email service can prevent eligibility. It also says
plus-addressing is unavailable. A uses an existing tagged address, so do not infer
that a base-address forward restores its OTP route. The destination must be a
working inbox, and forwarding tests must originate elsewhere. Activation may take
24–48 hours after destination verification; keep application services stopped.

## Approved alternative, DNS active: ImprovMX Free

Squarespace's built-in candidate is blocked. The proposed alternative is
[ImprovMX Free](https://improvmx.com/pricing/): one domain, 25 aliases, 500 forwards
per day and seven days of email logs at $0. It supplies incoming forwarding only
on the free tier, not a mailbox or outgoing SMTP. The owner explicitly resumed
this route after the diagnostic and completed normal signup. Billing shows Free
ACTIVE. The agent did not enter a password or submit account terms. The three
approved aliases were configured and persisted after reload. Personal contact
details stay outside Git. The initial automatic catch-all was renamed to `brian`
before DNS activation; no catch-all remains.

Configured exact recipients are `brian@table-us.com`, `privacy@table-us.com` and A's
existing `brian+tableus-p3-a@table-us.com`, all to the owner's base Gmail already
supplied privately. Keep the destination outside Git. This grants the forwarding
provider processing access to incoming mail, and sends the selected correspondence
to that inbox; the owner approved this specific scope. Public addresses remain unchanged.

The [alias guide](https://improvmx.com/guides/aliases/) describes explicit aliases,
but the reviewed official documentation does not confirm plus-address behavior.
The authenticated Free dashboard accepted the exact tagged recipient, which
persisted after reload alongside the two public aliases. No catch-all, wildcard
or paid rule remains, and A's identity was not changed.
Configuration acceptance alone is not delivery proof. Forwarding does not restore
old Workspace messages or a complete Workspace mailbox.

The [Squarespace DNS guide](https://improvmx.com/guides/squarespace/) and
[SPF combination guide](https://improvmx.com/guides/combining-spf-records/) support
this bounded DNS delta. The authenticated provider requirements matched it;
the owner reauthenticated and all three changes were saved and verified:

| Action | Host | Type | Priority | TTL | Value |
| --- | --- | --- | --- | --- | --- |
| Add | `@` | MX | 10 | 4 hours | `mx1.improvmx.com` |
| Add | `@` | MX | 20 | 4 hours | `mx2.improvmx.com` |
| Edit existing single record | `@` | TXT | — | retain 1 hour | `v=spf1 include:spf.improvmx.com include:_spf.google.com ~all` |

The last row replaces `v=spf1 include:_spf.google.com ~all`; do not create a
second SPF record. Read-only DNS validation found two SPF lookup terms on October 1, below the
ten-lookup limit; recheck before activation if the provider values change.
Preserve `send` MX/TXT, both DKIM records, DMARC, domain-connect, all website
records and nameservers. Do not follow a generic guide's broad instruction to
delete default DNS records. No catch-all, SMTP credentials, paid upgrade, domain
transfer or Workspace cancellation is proposed. Any different provider-required
change must be prepared and reviewed before applying it.

The owner handled account terms and reauthentication normally, without passwords
or codes in chat. All three recipients were configured before DNS activation,
with no mandatory catch-all or paid feature. The exact delta and retained DNS
were verified, and both provider statuses pass. Test the three routes only after
the separate probe allowance is approved.
Setup passed without rollback. The already-approved bounded rollback would remove
only the two newly added apex MX records and restore the original single SPF
value. That returns to the pre-change baseline with no inbound MX; it does not
restore a Workspace mailbox or authorize deletion of prior records.

A Workspace restoration is an alternative owner choice with its own subscription
and receiving-DNS requirements; no renewal, price or successful recovery is implied.

Prepare up to three clearly marked, non-sensitive delivery probes: public support,
public privacy, and A's exact existing tagged address if supported. Use the
already-verified sender and an origin other than the destination Gmail inbox.
Record provider outcome and owner receipt by label only. Wait for provider/DNS
readiness before sending; charge the supervised probe/receipt interval against
the proposed cumulative time (ten-minute maximum, then stop). Passive DNS
propagation while services are stopped is excluded. The [concrete delivery-test gate](p3-mail-route-delivery-test.md) proposes
three additional messages and ten additional supervised minutes. They are not
permission to spend the six remaining support-case messages. Each probe is sent once; no automatic resend. No live API is needed.

## Conditional remaining-case budget

Mail routing, the exact A recipient route and owner readiness must pass before
arming an API window. Current use is 131m45.950286s of 150m, leaving 18m14.049714s;
15m are reserved for the final phase. Counters are cumulative and never reset.

The following draft gives the unfinished manual cases a bounded first phase. It
is not yet execution-ready: DNS is active, but live route proof and owner readiness
are pending. The narrower delivery-test gate proposes 150 to 160 minutes only;
it does not approve the broader 195-minute ceiling or any API restart.

| Allowance | Current ceiling | Used | Draft ceiling | Reason |
| --- | ---: | ---: | ---: | --- |
| Live minutes | 150 | 131m45.950s | 195 | Add 45m; API first phase at most 45m, final 15m |
| Same-image API restarts | 9 | 6 | 10 | Add one first-phase resume; retain pause/final re-enable/final disable |
| Support/test mail messages | 14 | 8 | 17 | Three routing probes in addition to six remaining case messages |

After any route-probe interval, compute the API first phase as the smaller of
45 minutes and remaining cumulative time minus the 15-minute final reserve.
The unchanged cutoff supports at most 45 minutes per first-phase window; extra
cumulative headroom is not a spare restart.

Keep every other allowance: invitations 10 (8 used), accounts 4 (2 used), OTP
requests 11 (7 used), OTP deliveries 10 (6 reserved), verification submissions
20 (6 reserved), refresh/revoke 12, status reads 45 (19 operator reads recorded),
worker invocations 4 (1 used), Auth DELETE attempts 12 (0 used), Places 420
(72 observed), logical AI 3 (1 used), underlying AI 9 (3 conservatively reserved).
Keep $5 hosting, $15 providers, $20 combined and $0.25 AI ceilings. No new image,
web deployment, schema, secret, resource or source build is part of the rehearsal
extension. The exact mail-forwarding setup approval was granted and has been completed.
No spare recovery resume or OTP resend is available in this draft.

## Manual sequence after complete approval and prerequisites

1. Reconcile source/image/aliases, exact synthetic roster and empty queue; verify
   remaining billing/provider headroom. Prepare forms, messages and accounting
   before starting the first-phase clock. Arm the durable cutoff and resume the
   existing API image with the approved staging configuration and worker held.
2. Complete A's fresh returning sign-in using its unchanged identity. B owns the
   shared plan. Confirm A's supported pending deletion and exact private evidence
   before signing out only A's synthetic session. Preserve B's Preview session
   and all legacy sessions. Do not use the staging alias if it holds a legacy
   identity merely to obtain a third browser context.
3. Reuse A's links-origin tab for C after supported sign-out. Issue one fresh
   recipient-bound invite, complete normal signup, create/remove C's sole plan,
   then complete its pending deletion and evidence. Sign out only C afterward.
4. Reuse that tab for D. Issue its one remaining invite, complete normal signup,
   and establish the verified private support-case binding before losing D's
   session. Exercise the remaining challenge/reply, duplicate/ack and completion/
   receipt correspondence within the six reserved case messages. Complete D's
   supported pending deletion/status checks. The owner performs irreversible
   final confirmations in the visible account form where required.
5. Keep each unresolved OTP handoff to ten minutes, with no extension and no next
   signup while unresolved. A returning, C signup, D signup and B final returning
   consume all four remaining requests/deliveries. Stop on the first unexpected
   core/provider/auth/identity error rather than spending an unapproved resend.
6. Pause API admission, verify the supported refusal/status behavior, and drain
   only the verified synthetic queue through the existing worker. Check every
   row's exact completion, cleared subject and support binding. Four total worker
   invocations and 12 total Auth DELETE attempts remain hard limits; no manual
   queue insertion or admin deletion shortcut. Inspect the entire queue first.
7. Verify B's shared-content cleanup, metadata repair and sole-plan removal, then
   stop between phases. In the final 15m, re-enable and complete B's normal
   returning sign-in, self-service deletion and bounded drain. Disable intake,
   remove temporary Preview CORS and verify stopped/unscheduled services. Preserve
   tombstones, counters, invite-use history and all legacy records.

The normal UI does not provide a reliable hosted redemption replay/contention
harness, or a way to submit a server-side deletion refusal when its control is
disabled. Those hosted criteria remain untested; local/CI coverage is not relabeled
as hosted proof. Preparing a supported test path is separate work, without hidden
session-token extraction or an unapproved deployed test client. Completing the
manual sequence alone does not grant full P3 acceptance, production or real intake.

## Immediate next step

Approve the separate [three-message delivery test](p3-mail-route-delivery-test.md).
All approved account, alias and DNS work is complete and configuration checks
pass. Owner receipt remains unproven. The application stays stopped, and no mail
probe or rehearsal extension has been spent or approved.
