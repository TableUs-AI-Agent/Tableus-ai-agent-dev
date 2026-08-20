# Native smoke evidence for `bc0d2f3`

Candidate: `bc0d2f3615bf9a07ec08a857e5e1d8980bdd7d28`

- iOS simulator build: `1bf458de-c223-4301-9e5f-f161a0f54917`
- Android APK build: `f1b0a632-0587-4d17-8405-b534bff13989`
- iOS runner: iPhone 17 Pro, iOS 26.5
- Android runner: `medium_phone`, API 36 ARM64
- Maestro: 2.8.0, analytics disabled

Both cloud builds finished and their downloaded archives passed integrity and
embedded-configuration checks. Device execution is not green. Both artifacts
embed `demo-organizer` while calling the Supabase-authenticated Railway staging
API, which correctly returns `Authentication required`.

The original flow's final `Beta dinner` assertion matched the unchanged title
input and produced a false-positive iOS result. The tightened flow explicitly
rejects the authentication error and requires navigation into `Your constraints`;
it fails both old artifacts at the authentication assertion.

Sanitized screenshots:

- [iOS authentication failure](ios-auth-failure.png)
- [Android authentication failure](android-auth-failure.png)

The local correction uses a localhost-only, in-memory deterministic backend and
test-profile-only network allowances. It requires new exact-SHA EAS artifacts and
device reruns before mobile evidence can be marked green.
