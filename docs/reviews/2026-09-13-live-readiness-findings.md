# Live readiness findings for c5b041c

Application source: `c5b041c85f4f7b959436c13bef48c959622c624f`.
These findings do not change the frozen candidate or establish a completed
native, telemetry or cumulative acceptance run.

## Device sign-out affects other sessions

`mobile/app/account.tsx` describes sign-out as applying to this device.
`mobile/src/providers/auth-provider.tsx` calls `supabase.auth.signOut()` without
a scope. Supabase documents that the default is global and signs out the
account's other sessions; an explicit local scope targets the current session.
[Official sign-out reference](https://supabase.com/docs/reference/javascript/auth-signout).

The owner switched away from the organizer account on mobile. A subsequent
web tab required sign-in. Global sign-out is a plausible explanation, but the
specific revocation was not independently traced. Preserve the earlier passing
web-session observations and the later sign-in requirement as separate facts.

Before the next client candidate, align the device-only promise with behavior
and verify that signing out one device preserves another device's approved
session. Any all-device option should state its scope explicitly.

## Repeated plan responses consume Places allowance

At the 2026-09-13 06:46:19 UTC observation, the run used 36 Places attempts:
two for plan setup, six for one generation, and 28 for seven subsequent
restaurant-detail batches. Each of the eight total detail batches returned
four results using four attempts. No provider retry or second generation was
recorded. One complete ranked vote had been saved.

`backend/tableus/api.py` hydrates plan reads and vote/finalize/reopen responses
through `get_places`; `backend/tableus/providers/google_live.py` requests each
restaurant's details. The mobile query setup refreshes stale queries on focus,
and its auth provider invalidates queries on foreground. These are possible
sources of repeated reads; the trigger of each observed call is not proven.

Before the next client candidate, reproduce foreground/inactive-screen query
behavior with deterministic providers and remove unnecessary detail reads while
preserving fresh plan state. Do not infer a retry loop from these successful
batches or repeat paid generation to investigate them.

The owner approved increasing this run's totals from 50 to 100 Places attempts
and from four to six returning sign-in messages. The $0.25 estimated Gemini
ceiling, single generation and existing runtime configuration are unchanged.
See [live progress](../evidence/c5b041c/native/live-journey-progress.json).
