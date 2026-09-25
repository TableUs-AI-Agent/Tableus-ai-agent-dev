# Private-link handling

Local implementation authorized September 25, 2026. Brian owns current-stage
development; historical shared work remains shared. The earlier
[design review](capability-link-decision.md) is historical evidence, not current
implementation status. Its recommended sharing model is adopted.

## Product behavior

An invite-approved TableUs member may join through the current forwarded plan
link. Opening a link does not join; authentication does not join. A newcomer
needs a separate recipient-bound beta account invitation. Organizer rotation
invalidates the old capability for new joins but preserves existing membership.
Server links remain valid until rotation, subject to existing plan rules; a local
pending-flow timeout is not server link expiry. Existing finalized-plan and
2–8-person rules remain.

Both clients read legacy `?token=` and new `#token=` links. Exactly one token is
accepted, decoded once; malformed encoding, duplicate tokens, simultaneous query
and fragment tokens, malformed fragments and invalid UUID/length fail closed.
A malformed fragment never falls back to a query token. Synthetic plus, percent
and Unicode cases exercise the byte-preservation boundary.

A single process-local store retains the capability for at most 20 minutes.
Snapshots contain only plan ID, local handle, expiry and bound account ID. Web
replaces the visible URL with the plan path; native intent processing supplies
only a local handle to the router. The store is not browser storage, SecureStore,
a persisted query cache or an Auth callback parameter. Refresh/process death
loses the flow: reopen the original private link. A new link replaces the old
one. Cancellation, successful join, timeout, explicit sign-out or changing a
bound account clears it. Authentication may bind an anonymous pending link once;
approval is still enforced by the server. Timer suspension is handled by an
expiry check before token access.

Explicit Join posts the token in authenticated JSON through the existing client,
with expected-subject checks. If a response is ambiguous, explicit recovery first
reads `/api/v1/plans/{id}/revision`, which checks current membership without Places
or AI. Success permits ordinary detail loading even after link rotation. A failed
membership read must distinguish account approval before enabling another attempt.
There is no background retry or offline write queue. A normal new join resets
its active recommendation run and does not hydrate Places; an existing-member
retry can hydrate candidates and fail independently of membership.

## HTTP and memory limits

Join documents declare `Referrer-Policy: no-referrer` and private no-store cache
policy. Next development mode overrides cache policy; verify the production
server response rather than treating a development response as release proof. All `/api/v1/` application responses receive `Cache-Control: no-store`
and `Pragma: no-cache`, including capability creation/rotation, successful
idempotency replay, validation and early admission errors. These are application
controls; actual hosted proxies/headers/log retention need separate observation.

Legacy query links still expose the capability to the initial web request before
JavaScript scrubbing. Even fragment links remain visible to the receiving client,
message/clipboard copies, and same-page scripts before capture. This is not
protection against device compromise or XSS and does not promise memory
zeroization: a bounded in-flight request can retain its body until completion.
Existing bounded server idempotency replay memory is unchanged. No persistent
exchange-ticket service or database migration is introduced.

## Emission and release sequence

`NEXT_PUBLIC_JOIN_LINK_FORMAT` (web) and `EXPO_PUBLIC_JOIN_LINK_FORMAT` (mobile)
opt into `fragment` at build time. Unset, `query`, or other values preserve query
emission. The default remains query; no release configuration was changed.

1. Review/integrate the frozen local application and its source-bound checks.
2. Prepare one compatible cumulative candidate and impact review with the native
   task. Old installed mobile readers discard fragments; do not enable emission
   based on parser tests or Expo web export.
3. Obtain the remaining explicit external/native authority with concrete targets,
   attempt/time/disk budgets and first-failure stops. Verify cold/warm/signed-out
   fragment delivery, authentication return and explicit Join on accepted iOS/
   Android bytes, plus hosted document/API headers and logging policy.
4. Establish intended cohort client versions and observed adoption. The repository
   has no new minimum-version enforcement gate in this change.
5. Before wider beta activation, approve a dated legacy-reader transition/cutoff,
   active-plan inventory and organizer rotation/re-sharing scope. Disabling query
   parsing alone cannot revoke a token copied into a fragment. No bulk rotation
   or invitation is authorized by this implementation.

Rollback of fragment emission returns builders to query without removing either
reader. It does not remove already shared fragments; readers must stay available
while those capabilities are valid. Rotation remains the revocation action.

## Remaining gates

Native acceptance remains owned by `01a0c678-55c8-7cc0-a3cb-e3200776906a`
(Prepare native replacement validation). Its last inspected C7 result stopped
before UI; all recorded allowances were consumed and no C8 was authorized.
This objective grants no native retry, deadline extension or live-provider budget.
Hosted migrations/configuration, production deployment, distributed TestFlight/
Play acceptance, retention/support policy and beta activation remain separate.
Account deletion stays disabled; canceled security scans stay canceled.
