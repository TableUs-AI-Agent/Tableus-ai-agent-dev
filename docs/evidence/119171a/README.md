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

## Completed read-only evidence

One returning-sign-in account-control journey passed per platform using the two
retained approved accounts:

- iPhone 17 Pro/iOS 26.5 accepted the returning OTP, reached the protected Plans
  route, validated the aggregate-only account response, and matched the explicit
  `Account control passed` accessibility label.
- The API 36 ARM64 Android emulator accepted the returning OTP, reached the
  protected Plans route, and passed the same aggregate-only account check. An
  emulator `System UI` ANR covered the first pre-OTP launch; selecting its
  non-destructive `Wait` action restored the device, and the unchanged flow then
  passed. No OTP was sent during the covered attempt.

The runner removed both raw Maestro workspaces. The retained summaries and four
screenshots contain no email address, OTP, access token, invite, share token,
review, constraint, or location data. Both summaries identify exact source SHA
`119171a2d9370b0929bc8d19da819538864745f0`, Supabase authentication,
deterministic staging providers, and their corresponding EAS build IDs.

Reproduction commands:

```bash
make mobile-account-e2e PLATFORM=ios DEVICE=FE2B33EB-D5F9-427D-98D9-3E7FB4A975E8 APP=/private/tmp/tableus-account-artifacts-119171a/ios/TableUs.app BUILD_ID=e64bb9a4-0fff-48f7-abae-235ec860b7af EVIDENCE=docs/evidence/119171a/account-controls/ios API_URL=https://api-staging-3795.up.railway.app
make mobile-account-e2e PLATFORM=android DEVICE=emulator-5554 APP=/private/tmp/tableus-account-artifacts-119171a/tableus.apk BUILD_ID=5dd01949-47bd-4485-874b-1cd19a1c7c39 EVIDENCE=docs/evidence/119171a/account-controls/android API_URL=https://api-staging-3795.up.railway.app
```

Raw OTP values were not written to evidence or subprocess logs. The replacement
evidence remained read-only: it did not type `DELETE`, invoke the deletion
endpoint, remove an application profile, or remove either retained Supabase
identity.

## Evidence SHA-256

- iOS summary: `60285a63d6b2581374354bd9586a193686acb29cd31232067ada0180b8bfd7c8`
- iOS returning-session screenshot: `d3a4adc7fd48105aeac628fddd5e95d13dbbe991103d0f32c7152dd91c020946`
- iOS account-control screenshot: `182e0f591098db483e87d3db76255f3c9be36629094648910a1c07c852733839`
- Android summary: `68238a95aa144249919826ea3738e01ca69392c7c65ce7b6a21189058dab141e`
- Android returning-session screenshot: `6fe721b5717a54ad5282656c3d7e97a29914faa3166c1c970268e7ec137ca524`
- Android account-control screenshot: `41848ea2f7675676339f74a13322d556f5a62a15579e27324c9b315daa2e4b24`
