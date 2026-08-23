# Two-user mobile lifecycle evidence

Candidate: `a78a6d27229bc464d4998bdf3c3593f4167a831b`

## Builds

- iOS simulator: `d192d04a-73e8-401c-98ac-b6c7a3a9c551`
  - EAS source SHA matched the candidate.
  - Downloaded archive SHA-256:
    `b010051a053619500aedafc4efecec40125f1200fbc623461278ea5e961fc867`.
- Android APK: `6dba0079-72fe-4c23-aa03-95028a7506c4`
  - EAS source SHA matched the candidate.
  - Downloaded APK SHA-256:
    `4ee054a6271e3147cb132ca4e4a24276b01bf8ebd99f52649d933be406391492`.

Both bundles contain `127.0.0.1:8000`, `demo-organizer`, and `demo-guest` and
contain no Railway hostname. The iOS app enables local networking; the Android
app config records `localE2E=true` and cleartext traffic for the loopback test
artifact. These are internal test builds, not preview or production builds.

## Commands

```text
make mobile-e2e PLATFORM=ios DEVICE=FE2B33EB-D5F9-427D-98D9-3E7FB4A975E8 APP=<TableUs.app> BUILD_ID=d192d04a-73e8-401c-98ac-b6c7a3a9c551 EVIDENCE=docs/evidence/a78a6d2
make mobile-e2e PLATFORM=android DEVICE=emulator-5554 APP=<tableus-android.apk> BUILD_ID=6dba0079-72fe-4c23-aa03-95028a7506c4 EVIDENCE=docs/evidence/a78a6d2
```

The iOS target was iPhone 17 Pro/iOS 26.5. The Android target was the API 36
ARM64 `medium_phone` emulator. Each command started a fresh in-memory backend,
required deterministic/demo readiness, and cleaned backend processes and raw
Maestro results afterward. Android also removed its temporary `adb reverse`.

## Result

Both platforms passed the two-user journey: UI plan creation, guest join,
per-user constraints, exactly four deterministic candidates, persisted 3/2/1
votes, guest finalization denial, 5/5/2 scores, organizer finalization to Sakura
Table through provider-rank tie-breaking, reopening, rotated-link rejection, and
constraint-driven stale-run clearing. JSON summaries and final/rotated-link
screenshots are sanitized; no share token is retained.
