# Pilot completion measurement

Priority 2 implements the roadmap's read-only retained-plan observation. This is
not a quorum rule: organizers can still finalize with zero or partial votes.

Each new `plan.finalized` event records `distinct_voter_count`, the number of
unique voting profiles in its active recommendation run, from 0 through 8.
Updating a vote does not add a diner; regenerating recommendations starts a new
run. There are no voter identities in the event payload. During account deletion,
the strict authored-event allowlist retains this field only if its JSON value is
an integer in range (booleans, floats, strings, null and out-of-range values are
rejected). Count retention is independent of the candidate/run's survival.
Other members' content cleanup removes references to affected results while
preserving the count. No historical count is reconstructed from current votes.

## Read-only report

Use `backend/scripts/pilot_measurement.py` against an approved read-only database
connection. It changes no schema, data or resources, uses a PostgreSQL read-only
repeatable-read transaction, and emits only aggregate counts. Local and CI tests
use synthetic accounts and deterministic providers. Running it against hosted
pilot data belongs to the later approved pilot operation.

Brian supplies a private JSON array of plan UUIDs reviewed against the real pilot
roster. Exclude owner-only and synthetic groups. Include every known pilot plan,
even one later deleted; duplicate IDs count once. The file must stay outside Git.
The database cannot establish whether a person is real or whether two plans belong
to the same group. Confirm the five distinct groups and organizer follow-up
separately in the private pilot roster.

From `backend/`, with `DATABASE_URL` supplied through the approved environment:

```sh
.venv/bin/python scripts/pilot_measurement.py \
  --plan-ids-file /private/path/pilot-plan-ids.json \
  --start '2026-10-01T00:00:00+00:00' \
  --end '2026-10-22T00:00:00+00:00'
```

These are example dates, not a scheduled pilot. Use the actual first invitation
and a cutoff no more than 21 days later. The interval includes its start and
excludes its end. Scope is limited to 100 distinct plan IDs and 10,000 retained
join/finalization events before the cutoff. An oversized result fails without
printing a partial report; narrow the roster into disjoint batches if needed and
combine raw counts, never average percentages.

- Eligibility is the first retained `participant.joined` event in the window.
  Plan creation already adds the organizer; joining again as an existing member
  does not emit this event. Later joins cannot re-qualify a pre-window group.
- Each eligible retained plan counts once. Any finalization after eligibility and
  before cutoff with a valid count of at least two makes it successful, including
  an earlier finalization before reopen, regeneration or member deletion.
- Outcomes are disjoint: successful; all observed finalizations below two voters;
  unknown because a missing/invalid count could hide success; or no observed
  finalization. Missing counts are reported even if another event proves success.
- The report includes raw counts, `observed_retained_success_rate` (successful /
  eligible retained; null for an empty denominator), and plans with under 24 hours
  before cutoff. Report unknown outcomes alongside the rate; it is not a complete
  cohort conversion rate.

## Accepted coverage limits

Whole-plan deletion cascades to events. A formerly eligible plan can become
sole-participant after every other member deletes their account and then be
removed. Missing roster IDs are counted as missing/deleted, but cannot be assigned
an eligibility date or outcome. Plans omitted from the roster are unobservable.
Missing join history cannot prove eligibility; plans without a join event before
the cutoff may be solo, join later, or have incomplete history. Old finalizations
without a valid voter count have unknown outcomes. These gaps are accepted in the
roadmap; there is no new deletion-surviving aggregate store or persistent analytics
identity. Retention/history coverage must accompany every report.
