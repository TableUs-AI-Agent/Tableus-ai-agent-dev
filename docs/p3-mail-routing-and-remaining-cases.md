# P3: mail-route recovery and remaining manual cases

Prepared October 1, 2026, from `8fecf04b8cfa57808692e959a27447fd418fb906`.
**Preparation only. Routing changes and revised rehearsal allowances are not
approved.** The owner's instruction to continue authorizes investigation and
preparation; do not infer permission to create a forward, migrate mail, renew a
subscription or extend the stopped campaign.

## Verified routing state

Public authoritative DNS uses `nse1`–`nse4.squarespacedns.com`. The apex has **no
MX answer**, confirmed directly against the authoritative server and independently
against Cloudflare and Google resolvers. The earlier Google routing evidence is
historical; this check does not establish when or why records changed. Apex SPF
still names Google. Resend reports the existing sending domain verified, sending
enabled, receiving disabled. Outgoing OTP delivery to Gmail does not prove public
support/privacy receipt.

The [public DNS baseline](evidence/mail-routing-2026-10-01/dns-baseline.json) records
website, mail and authentication answers before any edit. The existing Resend
`send` MX/TXT, `resend._domainkey` TXT and DMARC answers are present. No DNS,
forwarding, sender, SMTP, public contact or subscription change has occurred.
The in-app Squarespace Domains tab is open at sign-in; authenticated Email settings
and actual forwarding eligibility are still unavailable.

[Squarespace forwarding documentation](https://support.squarespace.com/hc/en-us/articles/19000909092237-Email-forwarding-with-a-Squarespace-domain)
describes free forwarding for eligible managed domains and automatic mail DNS
records. Existing custom-email service can prevent eligibility. It also says
plus-addressing is unavailable. A uses an existing tagged address, so do not infer
that a base-address forward restores its OTP route. The destination must be a
working inbox, and forwarding tests must originate elsewhere. Activation may take
24–48 hours after destination verification; keep application services stopped.

## Prepare a concrete mail change after dashboard access

Inspect the domain's Email and DNS settings, including any Workspace association
and existing rules, without changing them. Prepare exact additions and any
conflicts for owner review. The preferred bounded candidate is two explicit
aliases—`brian@table-us.com` and `privacy@table-us.com`—to the owner's base Gmail
inbox already supplied privately. Personal destination addresses remain outside
Git. This is a candidate, not authorization to forward private correspondence.

Before saving, obtain approval for those exact recipients/destination and the
provider-generated DNS changes. Preserve website routing and Resend sending
records. Do not introduce a catch-all, change nameservers, remove authentication
records, cancel Workspace or buy a service to work around eligibility. If these
become necessary, return a separately prepared choice. Keep public contact
addresses unchanged.

A's original tagged identity requires a proven exact-address receiving route.
Inspect whether a narrowly scoped supported rule is possible; if it is not,
record A's returning sign-in as blocked rather than repointing its identity or
using another address. Forwarding does not restore old Workspace message history.
After approval, the owner handles provider reauthentication/destination verification
normally; no password or OTP is requested in chat.

Prepare up to three clearly marked, non-sensitive delivery probes: public support,
public privacy, and A's exact existing tagged address if supported. Use the
already-verified sender and an origin other than the destination Gmail inbox.
Record provider outcome and owner receipt by label only. Wait for provider/DNS
readiness before sending; charge the supervised probe/receipt interval against
the proposed cumulative time (ten-minute maximum, then stop). Passive DNS
propagation while services are stopped is excluded. These are **additional
proposed test messages**, not permission to spend the six remaining support-case
messages. Each probe is sent once; no automatic resend. No live API is needed.

## Conditional remaining-case budget

Mail routing, the exact A recipient route and owner readiness must pass before
arming an API window. Current use is 131m45.950286s of 150m, leaving 18m14.049714s;
15m are reserved for the final phase. Counters are cumulative and never reset.

The following draft gives the unfinished manual cases a bounded first phase. It
is not yet presented as execution-ready because mail eligibility is unknown.

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
extension. Mail forwarding itself requires the separate exact-change approval.
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

Brian signs into the already-open Squarespace tab. Inspect Email settings and
finish the exact forwarding proposal before asking to save it. No DNS changes,
mail probes, account operations or API restart occurred during this preparation;
the stopped clock and all current allowances are unchanged.
