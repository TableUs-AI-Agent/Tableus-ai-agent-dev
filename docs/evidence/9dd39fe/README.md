# Native smoke evidence for `9dd39fe`

Candidate app source: `9dd39fe9db72c52f96db4cf596401d32493a510f`

- iOS simulator build: `8d5ffefb-28ad-42a1-966d-426af059046b`
- Android APK build: `41e5ece8-58d9-4d5f-84ff-a67dd2dfa607`
- iOS runner: iPhone 17 Pro, iOS 26.5
- Android runner: `medium_phone`, API 36 ARM64 (`emulator-5554`)
- Maestro: 2.8.0, analytics disabled
- Backend: localhost-only, in-memory, deterministic providers, demo auth

EAS reports both builds as finished from the exact candidate commit. Downloaded
artifact checksums:

- iOS archive: `487701aa9d6745aeed24aaf3a98dda69a64f97d2e9b0b149a3a3f9c9971b02bf`
- Android APK: `7d99fac6a83c1f06e8e3be05c56c85dbe00cf1993d4041009ab1c3e876b5eebf`

Both bundles contain `http://127.0.0.1:8000` and `demo-organizer`, with no
Railway hostname match. The iOS artifact has the expected test-only local-
network allowance. Android reached the same host through `adb reverse`.

The first corrected-artifact iOS run exposed two remaining harness false
positives: the keyboard consumed the create interaction, and React Native
exposed the plan card as a combined accessibility label. The flow now dismisses
the keyboard, requires the title field to reset to `Friday dinner` after the
successful POST, matches the combined plan-card label, rejects authentication
errors, and requires navigation to `Your constraints`.

The final flow passed on both platforms from separate clean backend processes.
FastAPI recorded `GET plans`, `POST plan`, refreshed `GET plans`, and `GET plan`
with HTTP 200 on iOS; Android completed the same visible assertions.

Sanitized final frames:

- [iOS smoke pass](ios-smoke-pass.png)
- [Android smoke pass](android-smoke-pass.png)

No OTPs, invite codes, emails, share tokens, precise user locations, photos,
prompts, or provider responses are present in this evidence.
