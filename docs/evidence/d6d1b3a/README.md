# Mobile staging authentication evidence

Candidate: `d6d1b3a99318aff5c904029328e6395a6e4236e4`

## Builds

- iOS simulator build: `8bbf7822-ffa7-4a61-9670-2ebc6e16cad7`
  - EAS source SHA matched the candidate.
  - Downloaded archive SHA-256:
    `1efc249da4a75bae84b5f3a6d0fac70b49e40955cd5266fdbfc71de58707de57`.
- Android APK build: `3d6d40ad-43ed-45c6-ab8c-ad254c076322`
  - EAS source SHA matched the candidate.
  - Downloaded APK SHA-256:
    `17974a9dfb8ea26c6cd47204472fc6ee9a9616737c215928a8a425d9910ca760`.

Both artifacts passed `make inspect-mobile-auth`: they embed the exact SHA,
HTTPS Railway staging API, Supabase staging URL, `authE2E=true`, and
`localE2E=false`. Neither contains a demo identity, TableUs loopback endpoint,
service-role marker, or configured production origin.

## Commands and targets

```text
make mobile-auth-e2e PLATFORM=ios DEVICE=CBA2F87D-A080-4898-83A2-748B600225D6 APP=<TableUs.app> BUILD_ID=8bbf7822-ffa7-4a61-9670-2ebc6e16cad7 EVIDENCE=<sanitized-dir> API_URL=https://api-staging-3795.up.railway.app
make mobile-auth-e2e PLATFORM=android DEVICE=emulator-5554 APP=<tableus.apk> BUILD_ID=3d6d40ad-43ed-45c6-ab8c-ad254c076322 EVIDENCE=<sanitized-dir> API_URL=https://api-staging-3795.up.railway.app
```

The iOS target was iPhone 17 Pro/iOS 26.5. The Android target was the API 36
ARM64 `TableUs_API_36` emulator. The runner required staging readiness to report
Supabase authentication and deterministic providers, passed interactive values
through redacted environment variables, and removed each raw Maestro workspace.

## Result

One fresh account and one fresh one-use invite per platform passed invalid-invite
rejection, invite signup, OTP verification, approved-profile routing,
join-intent restoration, relaunch persistence, explicit refresh, foreground
recovery, sign-out, and returning sign-in. The retained screenshots show only
the final authenticated Plans state.

The read-only database aggregates show one invite use and one redemption per
platform with no active pending validation. Android records three historical
validations because the operator corrected the destination address and retried
after the provider cooldown; exactly one validation was redeemed. The evidence
contains no email, invite code, OTP, hash, access token, or share token.
