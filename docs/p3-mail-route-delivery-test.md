# P3 mail-route delivery test: receipt unresolved

The owner approved the exact three-message delivery test at
`1c42ca9a1ce5ed4875c413fe12b839868e591add`. SUPPORT, PRIVACY and A were each sent
once; all three Resend metadata checks reported **delivered**. Owner inbox receipt
is not confirmed for all three labels.
Hold the rehearsal; provider delivery alone does not prove owner receipt.

The supervised window ran from `2026-10-01T07:20:44.036274+00:00` to its
`2026-10-01T07:30:44.036274+00:00` deadline, charging 600 seconds. Ledger closeout
was recorded at `07:30:57.419244Z`; no provider action occurred after the deadline.
Cumulative use is **141m45.950286s of 160 minutes**, leaving
**18m14.049714s**, including the unchanged 15-minute final reserve.
Mail use is **11/17**, leaving six reserved rehearsal-case messages. Operator
status reads are **22/45**. The API/worker stayed stopped; no OTP, invitation,
restart, account, deletion or AI/Places operation occurred. All other limits and
counters are unchanged. The broader 195-minute/restart-10 scope remains unapproved.

[Structured test evidence](evidence/mail-routing-2026-10-01/delivery-test.json).

## Approved messages

Use the existing verified Resend sender `Brian <brian@table-us.com>` and plain
text only. The owner confirmed this sender with the scope approval. No CC,
BCC, attachment, reply-to override, tracking change, secret or OTP is included.
All three routes forward to the already-approved private base Gmail; keep that
destination outside Git. This is a routing test, not an Auth request.

| Label | Recipient | Subject |
| --- | --- | --- |
| SUPPORT | `brian@table-us.com` | `TableUs P3 TEST — mail route SUPPORT — 2026-10-01` |
| PRIVACY | `privacy@table-us.com` | `TableUs P3 TEST — mail route PRIVACY — 2026-10-01` |
| A | `brian+tableus-p3-a@table-us.com` | `TableUs P3 TEST — mail route A — 2026-10-01` |

Each body uses the corresponding label:

> TableUs P3 TEST — mail route LABEL. This is a non-sensitive delivery check for
> the approved forwarding setup. No action in TableUs is needed. Please report
> the received label in the Codex chat; do not send email contents or codes.

Send each once with a distinct stable idempotency key. Record provider IDs only
in the private ledger. No resend or replacement message is authorized by this
scope. Stop on an unexpected send failure; an ambiguous response is not proof
that a message failed to send.

## Approved allowance changes

| Allowance | Previous ceiling | Approved ceiling | Added scope |
| --- | ---: | ---: | --- |
| Support/test mail messages | 14 | 17 | One probe for each of three routes |
| Cumulative supervised minutes | 150 | 160 | One probe/receipt window, at most 10 minutes |

Before this test, eight support messages and 131m45.950286s had been used.
The three messages were reserved before sending; actual supervised time was
charged without resetting prior use. The six remaining support-case messages stay
reserved for the rehearsal. No API/worker start, restart, resource, deployment,
Auth request, account deletion or other provider evaluation is included.

Keep the $5 hosting, $15 provider and $20 combined caps, as well as all other
allowances. At most one metadata status lookup per message (three total) is
allowed within the existing 45-read limit; this test increased recorded operator
reads from 19 to 22.
Configuration DNS/provider verification is separately recorded, not relabeled as
rehearsal progress. No account inbox, email body or authentication code is read.

The wider rehearsal draft remains unapproved: 195 cumulative minutes and restart
ceiling 10 are separate from this narrower 160-minute, zero-restart test gate.

## Execution and completion

1. Start only after owner approval/readiness and current DNS/provider readiness.
   Start a single supervised clock immediately before the first send, with a
   ten-minute hard stop. Keep application services stopped throughout.
2. Send the three prepared messages once. Record accepted/delivered/bounced
   metadata separately from the owner's report. Do not infer Gmail inbox receipt
   from provider status or domain activation.
3. Ask the owner to report SUPPORT, PRIVACY and A as received or missing, checking
   Spam if needed. Confirmation by label is sufficient. Do not request message
   contents, headers, OTPs or credentials.
4. Stop by ten minutes or earlier when all results are known. Record actual time,
   exact counters and each route's outcome. If any is missing or ambiguous, hold
   the rehearsal and diagnose within a new concrete scope rather than resending.
5. Only after all three routes pass, prepare the remaining manual rehearsal
   sequence and any required allowances for owner approval. This test does not
   resume the application or grant full P3 acceptance.
