# Account lifecycle client evidence

Worktree: `/Users/brianchei/.codex/worktrees/account-lifecycle-clients/Tableus-ai-agent-dev`

Branch: `codex/account-lifecycle-clients`

Base: `6ed12793253a285b0890d6358ab5f60c551b3615`

This objective is local implementation and deterministic verification. Brian owns
the current stage. Historical shared contributions remain shared; this change
does not establish individual authorship of the original TableUs application.

## Local evidence

Fresh local verification passes: 314 JavaScript tests (including 82 mobile
components), 121 Python tests with four PostgreSQL-only skips, lint/type checks,
contracts, Next production build, Expo web export, deterministic smoke and a
report-only 2,772,474-byte web JavaScript baseline. The initial make-ready stopped
on two obsolete source assertions about legacy deletion/auth routing; those were
replaced/updated and the complete rerun passed. No measured performance claim.

Seven separate Chrome checks pass: three management-flow tests and four hosted
Auth-mode tests with local cookie/HTTP mocks. They cover transfer, sole-plan
removal, feature unavailability, ambiguous deletion, cold missing-profile status,
unapproved sign-in, local sign-out and a same-page account switch with a delayed
prior-subject response. Hosted mode here means SDK configuration with mocked
localhost responses, not actual hosted Auth acceptance. Root inspected final
account overview, plan confirmation and pending-status screenshots; an earlier
paint-incomplete screenshot is retained but superseded.

Shared client regressions reject changed credentials on initial dispatch and
401 replay, and cover non-browser base64 decoding. Backend tests deny unrelated
organizer reads and prove management reads/transfers never invoke Places.
Native validation remains with `Prepare native replacement validation`; its
candidate is unchanged here. Exact source binding is in the final handoff and
verification manifest.

Private local logs/screenshots are retained at
`/Users/brianchei/.codex/artifacts/tableus/account-lifecycle-clients-2026-09-24`.

## Release checks still required

These are acceptance criteria for a separately approved affected release, not
authorization to run against staging, production or a device:

1. With deletion disabled, web/iOS/Android clearly show unavailability and make
   no legacy `DELETE /me` fallback. Export and local sign-out remain usable.
2. A shared plan transfers only to an existing approved participant. Verify the
   recipient can organize it, the former organizer remains a participant, and
   recommendations, votes and shared contributions survive. A sole plan requires
   exact confirmation before removal. Neither management read nor transfer may
   generate Places requests.
3. With an enabled disposable cohort and trusted worker, request full deletion.
   Observe pending/completed truth, subject-scoped recovery after a lost response,
   and approved-profile denial while deletion is pending. Exercise an intentional
   transient provider failure only within its own approved allowance.
4. Restore the same valid session after app/browser restart and recover status
   without an invite. Confirm expired sessions offer support without claiming
   completion. Another subject must never see the prior account's private data
   or receive a late prior-subject result.
5. Check private-route and join/auth deep-link gates while deletion is pending;
   verify explicit refresh, loss of connectivity and local sign-out on the
   affected distributed web/iOS/Android artifacts.

Before enabling, PostgreSQL advisory-lock races and migration/runtime privileges
must pass, the server-only credential and recovery runner need approved setup,
and retention/support policy must be reviewed. The local SQLite and mocked
client results cannot establish these facts. Merge, hosted migration/deployment,
native acceptance, stores and beta activation keep their separate gates.
