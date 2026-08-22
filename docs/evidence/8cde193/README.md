# Account-control staging prerequisites

The account-control candidate was frozen and publicly pushed at exact source SHA
`8cde19309fa43787b04d2792d96c1cfc11c21317` on branch
`codex/account-controls`.

## Staging migration and deployments

- Supabase project `mrwdhdeubdiiydmmvlda` applied migration
  `nullable_plan_event_actor_on_profile_deletion`, tracked by Supabase as
  `20260822053151`. `public.alembic_version` is `161b86fcb7f4`,
  `app.plan_events.actor_id` is nullable, and its profile foreign key uses
  `ON DELETE SET NULL`.
- Railway deployment `fb204f7d-5b7a-4117-a4c8-ac620e659098` succeeded from
  the exact SHA. Its image digest is
  `sha256:4dbd39315678d2c03e5437791166390bdb72db1026d750a1511d14981788e527`.
  Liveness passed and readiness reported `deterministic` providers with
  `supabase` authentication at `https://api-staging-3795.up.railway.app`.
- Vercel deployment `dpl_4U6nTGJ5WXar7b3q3TomYnwpSTuJ` is `READY` from the
  exact SHA. The dedicated staging project's stable
  `https://tableus-staging.vercel.app` alias is active. Its pre-existing
  `table-us.com` and `www.table-us.com` aliases were not changed in this packet.

## Auth-test artifacts

- iOS simulator build `13b30209-50a4-4101-a63a-053abf8b5c79`
  (`auth-test-ios`) has archive SHA-256
  `19049f6e11bfc081884f2ec9e2316198646edba7825db0683ab57326bba59d46`.
- Android APK build `cd1be5d0-4c0a-4037-9c16-15f95e2633cc`
  (`auth-test-android`) has SHA-256
  `fbb7ac2b11066eb4cd7496932f545e4d6568c276094dfaffec0665a3add77bca`.

Both EAS records identify the exact source SHA. Bundle inspection confirmed the
HTTPS Railway staging endpoint, Supabase staging configuration, and
`authE2E=true`; it also confirmed `localE2E=false` and the absence of demo
identities, loopback endpoints, Railway alternatives, service-role markers, and
production endpoints.

## Remaining evidence

The approved evidence run subsequently requested one returning-sign-in OTP per
platform. Android completed returning sign-in and the aggregate-only account
control check on `emulator-5554`; its sanitized summary and screenshots are in
`account-controls/`.

The iOS returning sign-in also passed, and the product displayed a successful
aggregate account check, but Maestro asserted the rendered copy instead of the
screen's explicit `Account control passed` accessibility label. The Android
preflight also exposed that the returning-sign-in segment did not normalize a
previously authenticated device. The runner's file checksum included a leading
separator byte instead of recording a standard file SHA-256. These are evidence
harness defects, so the packet's exact-SHA rule invalidates the partial evidence
despite the product responses being green.

A replacement candidate now uses the semantic accessibility label, prepares a
known signed-out state through the normal Account action, and emits standard
SHA-256 for file artifacts. It requires replacement builds and fresh evidence
before this gate can close. No application profile or Supabase Auth identity was
deleted. Run the replacement artifacts with:

```bash
make mobile-account-e2e PLATFORM=ios DEVICE=<simulator-udid> APP=<replacement-TableUs.app> BUILD_ID=<replacement-ios-build-id> EVIDENCE=<sanitized-dir> API_URL=https://api-staging-3795.up.railway.app
make mobile-account-e2e PLATFORM=android DEVICE=<emulator-serial> APP=<replacement-tableus.apk> BUILD_ID=<replacement-android-build-id> EVIDENCE=<sanitized-dir> API_URL=https://api-staging-3795.up.railway.app
```

The replacement evidence must remain read-only: do not type `DELETE`, invoke the
delete endpoint, or remove either retained Supabase identity.
