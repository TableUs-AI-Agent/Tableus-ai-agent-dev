# Device session and plan refresh correction

Reviewed 2026-09-14 by the primary GPT-6 Astra development agent.
Branch: `codex/device-session-plan-refresh`.
Base: `1c65f68c6cba9bb675bb898b13b7080f6f97a925`; the runtime base is
`c5b041c85f4f7b959436c13bef48c959622c624f`.
Replacement source: `6b9719b4e63e34803f2e7c2598e45851790df661`.
[Local validation](../evidence/device-session-plan-refresh/local-validation.json)
binds the checks to this source. Subsequent evidence binding changes docs only.

This is an ordinary review of the changed source and adjacent auth/query
boundaries. It is not an automated scan, independent audit, hosted/device
acceptance, or a passing cumulative security report.

## Changes and observable evidence

1. The Account action promised device-only sign-out, while its SDK invocation
   omitted scope. The regression failed on the old invocation. The correction
   explicitly passes local scope. Tests use a modeled two-session SDK boundary
   to verify the requested scope, local cache/profile/pending cleanup, and
   preservation of the modeled other session. Returned SDK errors are now
   handled as failures with a sanitized message and a working retry.
2. Mounted hidden plan screens previously remained query observers. A component
   test with the real plan screen, AppProviders, AuthProvider and TanStack Query
   reproduced three detail GETs through mount, hidden foreground/invalidation
   and reconnect. The corrected sequence performs one GET (the initial visible
   load) and zero hidden GETs. Re-entering performs one fresh read and displays
   an externally changed finalized plan.
3. Duplicate native active notifications previously triggered auth invalidation
   and another full detail GET. The corrected sequence performs initial load
   plus one foreground GET, with no GET for the duplicate active notification.
   A quick foreground return still refreshes, even inside the default 30 seconds.
4. Additional regressions cover initially hidden routes, quick navigation back
   to saved votes, cached offline rendering, zero offline pull-to-refresh reads,
   reconnect and manual refresh, and saved mutation responses without another GET.

All fixtures are synthetic. These request counts are client calls to a mocked
API, not newly measured Places usage. Backend inspection confirms every actual
full plan response with four stored candidates hydrates four Place IDs. The
historical individual UI triggers remain unproven.

## Source review

- Local scope narrows the intended SDK revocation request; successful local
  session clearing still uses existing subject observation and query clearing.
  No tokens, email, profile content or provider errors are added to telemetry.
- Error handling checks the SDK's returned error, not just promise rejection.
  Account shows a generic alert. Failure is not represented as completed sign-out.
- Auth retains its approval/profile checks, startup deadline, event supersession,
  token-refresh lifecycle and pending-approval continuation. Only the redundant
  approved-foreground query invalidation is removed.
- Plan subscription follows the installed Expo Router focus hook. Returning
  routes refetch immediately; offline network gating and memory-only cache
  behavior remain. Existing mutation idempotency/retry handling is unchanged.
- No backend authorization, session storage, provider budgets/caching, API
  contracts, dependencies, compiled environment, association or security-validator
  controls are changed. The existing exact-candidate gate stays fail closed.

No unresolved critical/high runtime finding was identified in this narrow
source delta. This is not a whole-repository finding count or scan disposition.

## Validation

Eleven focused auth/refresh component tests and mobile type checking passed.
Full `make ready` passed (exit 0): 204 JavaScript tests (74 scripts, 19 web,
56 mobile unit, 16 mobile component, 25 API-client and 14 domain), 98 Python
tests with three Postgres-only tests skipped locally, lint, type checks, contract
generation, web/Expo-web builds, deterministic smoke and the report-only web
bundle check (2,820,354 bytes). OpenAPI/lockfiles were unchanged. The first attempt caught a test harness purity
violation, corrected by exposing its query client from an effect. The next
attempt was prevented from binding the localhost fault-proxy fixture by the
sandbox. Validation was restarted with approved local execution permissions.

## Limitations and next acceptance

Real device navigation/focus and a real second Supabase session have not been
retested for the replacement. Existing c5b041c native/live/telemetry evidence
retains its source. Necessary full visible reads and mutation responses still
hydrate provider data. This change intentionally avoids new provider storage,
backend caching, API changes or a background poll. The existing revision endpoint
could support later measured optimization; it is not required to remove the
reproduced hidden-query and duplicate-notification triggers.

Freeze the validated source and agree exact-candidate scan scope/usage before
starting another scanner. The Codex Security plugin is not callable in this
session; installation and inspection of its supported controls must precede a
concrete execution approval. Do not invent a scan ID, report hash or usage cap.
No new push/deployment/build, live evaluation/message or scan has occurred.
Native glyph polish and production privacy/distribution remain later work.

## Reviewed runtime file digests

| File | SHA-256 |
| --- | --- |
| `mobile/app/account.tsx` | `736aaebabfa3042e22e7630ae09fdc951ed1b76e07f8df6a2f868bcd3b145a5f` |
| `mobile/app/plans/[id].tsx` | `c610fb42a1aa638e45af2fc8611cb2f5128ab9c6d0849b00cdb0aaea01c80434` |
| `mobile/src/providers/app-providers.tsx` | `c7c75e9783f2c5473f370d7ec93cf662b268c8425ce6e599e7e63e1632da3195` |
| `mobile/src/providers/auth-provider.tsx` | `f1ad8763d32aa807e2a327cf7c129da570b5282f9589f0d626ec44442b633c51` |

## Primary sources

- [Supabase JavaScript sign-out](https://supabase.com/docs/reference/javascript/auth-signout):
  explicit local scope targets the current session; the default is global.
  The changelog was checked for relevant changes (the markdown endpoint failed;
  the official HTML changelog was available).
- [TanStack Query React Native](https://tanstack.com/query/latest/docs/framework/react/react-native):
  AppState supplies app focus and `subscribed` can suspend out-of-focus queries.
  The installed Expo Router export and TanStack implementation were also inspected.
