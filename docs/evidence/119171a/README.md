# Account-control replacement artifacts

The account-control evidence-harness corrections were frozen and publicly
pushed at exact source SHA
`119171a2d9370b0929bc8d19da819538864745f0` on branch
`codex/account-controls`.

## Auth-test artifacts

- iOS simulator build `e64bb9a4-0fff-48f7-abae-235ec860b7af`
  (`auth-test-ios`) finished from the exact SHA. Its downloaded archive has
  standard SHA-256
  `529e042a1ea6eef5234e50f62244894e463ac83b80c921dbc6024b180b3407b8`.
- Android APK build `5dd01949-47bd-4485-874b-1cd19a1c7c39`
  (`auth-test-android`) finished from the exact SHA. Its downloaded APK has
  standard SHA-256
  `7f0a80c7e6e5f3083d38f9fbe27c7d90450482b35ce1167ebe723ab735aa87e8`.

Both EAS records use internal distribution and the preview channel. Bundle
inspection confirmed the HTTPS Railway staging endpoint, Supabase staging
configuration, and `authE2E=true`; it also confirmed the absence of demo
identities, loopback endpoints, local-E2E enablement, service-role markers,
Railway alternatives, and production endpoints.

## Remaining read-only evidence

Run one returning-sign-in account-control journey per platform using the two
retained approved accounts. These journeys require a separately approved OTP
email to each account and must not create invites or request deletion.

```bash
make mobile-account-e2e PLATFORM=ios DEVICE=FE2B33EB-D5F9-427D-98D9-3E7FB4A975E8 APP=/private/tmp/tableus-account-artifacts-119171a/ios/TableUs.app BUILD_ID=e64bb9a4-0fff-48f7-abae-235ec860b7af EVIDENCE=docs/evidence/119171a/account-controls/ios API_URL=https://api-staging-3795.up.railway.app
make mobile-account-e2e PLATFORM=android DEVICE=emulator-5554 APP=/private/tmp/tableus-account-artifacts-119171a/tableus.apk BUILD_ID=5dd01949-47bd-4485-874b-1cd19a1c7c39 EVIDENCE=docs/evidence/119171a/account-controls/android API_URL=https://api-staging-3795.up.railway.app
```

The retained test accounts are `brianchei411@gmail.com` for iOS and
`bchei@wisc.edu` for Android. Raw OTP values must not be written to evidence or
subprocess logs. The replacement evidence remains read-only: do not type
`DELETE`, invoke the deletion endpoint, or remove either retained Supabase
identity.
