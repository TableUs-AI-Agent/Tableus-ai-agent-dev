# Production release configuration specification

Prepared 2026-09-25. Brian owns development and the release decision at this stage;
historical work remains shared. This is a reviewed preparation artifact, not
production acceptance or permission to create resources, deploy or submit builds.

September 26 sequencing: production/store work follows the staging pilot in the
[roadmap](roadmap.md). Source identities and inventory below are historical
snapshots, not fresh readback or pilot gates. Preserve this specification for later
target selection; the [pilot checklist](release-readiness-checklist.md) owns the
immediate support, migration and device requirements.

Base: `a79fd60ad7bbed397ad325caef1c2313ef29c80c`.
Original snapshot application: `484632517345e7858f48caf8fa7b128f9d9dab80`.
Later recorded application `72c592b511bba6b74bba2521524c6111b9cf5916` adds
[approved deletion-content behavior](handoffs/2026-09-25-deletion-content.md).
Rebind acceptance before execution; environment/OTA recommendations remain pending.
Branch: `codex/production-release-spec`.
See [source and inventory evidence](evidence/production-release-spec-2026-09-25/README.md)
and the [cumulative staging acceptance plan](cumulative-release-acceptance.md).

## Recommendation and current blockers

Prepare separate production API/Auth/data resources and keep staging for testing.
Keep OTA updates disabled for the initial distributed beta; ship signed binary
updates through the selected store channels. These are recommendations pending
the owner's environment choice, not newly adopted architecture decisions.
Production code must remain fail-closed until actual approved origins and signing
identities are bound. Do not substitute guessed domains, staging credentials or
a Railway environment's name for a production configuration.

Three concrete gaps precede production:
1. Confirm production targets and the staging/production link-host transition.
2. Roll out and accept implemented authored-content cleanup, resolve historical
   attribution gaps, and finalize retention/support promises;
   [the companion specification](retention-support-spec.md) identifies the release gap.
3. Accept the cumulative application in its intended environments and distributed
   artifacts. Existing native diagnostics do not accept these application bytes.

## What is real today

| Surface | Evidence-backed state | Missing information / consequence |
| --- | --- | --- |
| API | Source pins `https://api-staging-3795.up.railway.app`. Read-only Railway domain inventory agrees. Staging service `api` latest deployment `24eefe75-9583-4a90-8d3e-48450818dec0` reports SUCCESS, created September 21 | Status is not a health check or fresh application-SHA attestation |
| Railway | Project `93dcd3f4-7c47-4010-9431-fc28638813d2`, staging environment `0f546dbc-222f-48b8-a27b-ff008af4fec9`; one API service, no separate worker listed | The same project's environment named production (`659afbbb-d2b5-4716-bf49-1eba42132aac`) has no services. No worker schedule was established by this read |
| Auth/database | Visible TableUs project is Staging, ref `mrwdhdeubdiiydmmvlda`, us-east-1, ACTIVE_HEALTHY | No separate TableUs production project appears in this connection's inventory; this does not prove none exists elsewhere. Grants, hooks, backup schedules and credentials were not read |
| Web/domains | Source and prior Phase W evidence bind `tableus-staging.vercel.app` and `links.table-us.com` to staging; apex/www were excluded | Current Vercel connection exposes no TableUs project. Current alias bindings, ownership and production bytes cannot be re-attested here |
| Mobile | EAS project `0601c3b9-0082-454c-b636-45a1fe377f7b`; iOS/Android ID `com.tableus.app`; version `0.2.0`; runtime follows app version | No Apple team, distribution certificate/provisioning profile, Play signing certificate, uploaded version or store access was read |
| Updates | `updates.enabled=false`, automatic check NEVER; production profile intentionally throws | EAS production channel/environment declarations alone do not enable a production build or OTA |
| Distribution | Android submission profile currently says `internal` | Do not describe that as a configured closed-testing track or approved submission |

Sources: [public policy constants](../packages/domain/src/public-info.ts),
[mobile config](../mobile/app.config.ts), [EAS profiles](../mobile/eas.json),
[web config](../frontend/next.config.ts), [Phase W](handoffs/2026-09-21-phase-w-complete.md),
[sanitized inventory](evidence/production-release-spec-2026-09-25/hosted-metadata.json).

## Configuration contract to implement after target selection

Use an explicit TableUs data-environment selector and source-controlled per-environment
records. The selector is a proposed interface, not an existing variable. Staging
also uses optimized production builds, so `NODE_ENV=production` cannot select the
production data environment. Vercel deployment labels likewise must not implicitly
change trust. Unknown/missing hosted selectors and cross-environment combinations
must fail before network traffic; keep local deterministic behavior intact.

| Binding | Known source / proposed production requirement | Readback or completion evidence |
| --- | --- | --- |
| Client and server API | Web `NEXT_PUBLIC_API_URL`, `TABLEUS_API_ORIGIN`; mobile `EXPO_PUBLIC_API_URL`. Match the selected exact HTTPS origin | Approved actual production API origin and resource IDs; reject suffix lookalikes, credentials, port, path, query, fragment and staging/production mixing |
| Auth issuer | Web `NEXT_PUBLIC_SUPABASE_URL`, mobile `EXPO_PUBLIC_SUPABASE_URL`, server `SUPABASE_URL`; all same selected project | Project ref, issuer/audience, permitted callbacks/site URL and before-user-created invite hook; do not broaden redirects to wildcards |
| Browser and app links | Web `NEXT_PUBLIC_LINK_ORIGIN`; mobile `EXPO_PUBLIC_LINK_HOST`; backend CORS exact web origins | Approved web/link host ownership and bindings, association responses and matching signed entitlements/intents |
| Data privileges | Restricted runtime DB identity, separate migration identity, private `app` schema; browser roles no product-data access | Target-specific schema/migration/grant readback. Local PostgreSQL evidence is insufficient |
| Lifecycle | Full deletion defaults off. API **and worker** require `SUPABASE_SERVICE_ROLE_KEY` and deletion capability when enabled | Private credential delivery and per-process flag readback, queue recovery/attention evidence; never put admin credentials in public/EAS extras or web bundles |
| Worker | Existing bounded runner and [operations procedure](account-lifecycle-operations.md) | Actual scheduler, one-minute cadence proposal, limit 3 / 55-second deadline / 70-second process watchdog; alert owner Brian; no worker deployment presently verified |
| Providers/budgets | Existing production backend requires live Places/AI plus production telemetry; retain single-process coordination | Approved production provider credentials, cohort cap and bounded spend; do not start a production-configured service during a provider-free rehearsal |
| Telemetry | Production-specific Sentry/PostHog configuration with existing privacy filtering; source-bound release IDs | Project/environment IDs and artifact map/symbol association; private upload token only in build environment. No canary call authorized here |
| Rollout flags | Full deletion defaults off; pilot activation is now required after lifecycle gates. Fragment emission stays off for the pilot | Verify API/worker flags independently for each environment; pilot acceptance does not activate production. Compatible installed link readers before fragment emission |
| Version/signing | Source app ID/EAS project preserved unless an explicit decision changes them | Apple team/profile/cert identity and expiry, App Store app ID, Play package/app-signing SHA-256, upload key identity, highest assigned versions; no private keys in evidence |

Current [backend config](../backend/tableus/config.py) enforces hosted credentials
and production providers but does not bind all values to an exact production
record. [Web runtime checks](../frontend/app/lib/runtime-config.ts) and mobile
checks currently accept the staging record only. The implementation must update
these together, not simply remove the production exception.

### Link-host transition

`links.table-us.com` currently serves the staging purpose, including native
validation; do not repoint it while that task relies on it. Recommended design:
dedicated staging link host, with the canonical host reserved for production after
a coordinated transition. The new staging hostname is deliberately unspecified
until domain ownership and the environment choice are confirmed.

Before any cutover, inventory installed app identities/versions, issued links and
Auth callbacks; decide how old staging links remain available or are retired.
Changing the web alias alone can send an old app or link to the wrong data
environment. Never infer environment from a private token or redirect old staging
capabilities into production. If coexistence is required on one device, existing
staging and production `com.tableus.app` identities also need an explicit design;
separate data backends alone do not create side-by-side app installs.

Completion: each environment's web fallback, auth return, `/join/*`,
`/.well-known/apple-app-site-association` and `/.well-known/assetlinks.json`
resolve to its intended application only. Preserve `/auth/confirm` as web-only.
Physical tap acceptance belongs to the native owner after exact targets are frozen.

### Signing and updates

Association documents are generated by **Next.js routes**, not the FastAPI API:
[association helpers](../frontend/app/lib/site-association.ts),
[Apple route](../frontend/app/api/site-association/apple/route.ts),
[Android route](../frontend/app/api/site-association/android/route.ts).
Bind Apple team plus bundle ID to the actual signed entitlement identity.
Bind Android SHA-256 to the certificate of the app users actually install.
Google Play distinguishes the upload key from the app-signing key used to deliver
installs; record both roles and do not assume an upload certificate accepts Play
installs. [Android signing documentation](https://developer.android.com/studio/publish/app-signing).

Recommended initial update policy: OTA disabled, store-signed binary releases only,
with exact source/artifact/version receipts and usable symbols/maps. A rollback
means halting rollout, disabling affected server capabilities safely, or issuing
a compatible corrective binary; it is not an automatic downgrade of installed
clients. Preserve database/old-client compatibility and pending deletion recovery.
Enabling signed OTA later is a separate design: certificate, private-key custody,
rotation/revocation, channel/environment isolation and runtime compatibility.
Expo requires a new build/runtime for signing configuration. Its documented code
signing tier requirement must be checked before budgeting; no purchase is proposed.
[Expo code signing](https://docs.expo.dev/eas-update/code-signing/).

## Concrete implementation and verification sequence

1. **Now: resolve target inventory and data environment choice.** Obtain TableUs
   Vercel project access/IDs and actual production API/Auth target IDs, or prepare
   a priced resource proposal if they do not exist. Select link-host transition.
   Done when an exact non-secret binding matrix can be approved; no provisioning
   or domain mutation is implied by answering the design question.
2. **Next: implement production trust configuration in one isolated objective.**
   Change shared public records, web runtime/rewrites, mobile config/profile
   guards and backend target checks together. Add focused deterministic cases
   for environment mismatch, missing values, malformed origins, E2E/demo flags,
   association identities, source SHA and disabled updates. One appropriate
   full readiness run after implementation; none is run for this specification.
   Done when approved values are pinned and cheap checks pass, with production
   still gated from external execution.
3. **In parallel: close retention/support behavior.** Resolve authored-content
   erasure, retention periods, support recovery and external deletion route using
   [the companion spec](retention-support-spec.md). Public web/mobile copy and store
   declarations must agree with actual enabled behavior. Copy alone cannot close
   a behavioral deletion gap.
4. **Then: request one finite release campaign.** Bind app/operator/artifact SHAs,
   target resources, migrations/grants/hook/worker, flags, device inventory,
   recipients, store track, time/attempt/provider budgets, stop conditions and
   rollback. Cumulative staging acceptance precedes production promotion;
   distributed TestFlight/Play evidence remains required. Native work stays in
   task `01a0c678-55c8-7cc0-a3cb-e3200776906a`.

Latest bounded native read: `246853f219b4567be12f1cd949a517c4a41ba5e7`
prepares C9, **not approved or executed**. C8 is a collector diagnostic pass,
not application acceptance; its allowance is closed. This specification adds no
native run or provider allowance. September 30 remains unextended.

## Consequential decisions and limits

The environment-choice question is pending. Proposed default is separate
production/staging with OTA off. Remaining decisions: actual target resources and
link transition; release track/version/signing identities; authored-content
handling and retention periods; support completion target and cohort/spend cap.
Ask for non-secret identifiers or access, never credentials in chat. Device
availability remains the existing native campaign's prerequisite.

No implementation, builds, tests, services, simulator/device use, Auth/provider
calls, provisioning, secrets, deployment, store submission, merge/push, real
invitations, Notion/Notes edits or cleanup occurred. This specification preserves
the exact application and reuses its existing local readiness evidence.
