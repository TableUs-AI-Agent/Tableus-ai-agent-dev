# Mobile offline resilience evidence

Candidate `9acf4fe2a648d4226be028d947ca8d08d7fc7029` passed the cumulative
`make ready` gate, deterministic artifact inspection, and independent clean
fault-proxy journeys on iPhone 17 Pro/iOS 26.5 and the API 36 ARM64 Android
emulator.

## Artifacts

- iOS simulator archive: local build `local-ios-9acf4fe-20260822`, archive
  SHA-256 `48917e57418b2ad5fce9708901221a2418db92f8fdef0ea7223464fec3862520`.
  The inspected `TableUs.app` checksum recorded by the receipt and journey is
  `5d514cd1305d395d20461297d3406c90eb42a0e85225476e309d8cf5a9193ab5`.
- Android ARM64 APK: local build `local-android-9acf4fe-20260822`, SHA-256
  `59f6c9d2e770155fc1df90867bb54b6037962fef3ab0e08df263157ff07f1154`.
- Both artifacts embedded the exact candidate SHA, loopback API, demo auth,
  deterministic providers, and local connectivity control. Inspection found no
  Railway or production origin.

## Journey results

Both platforms independently recorded:

- two create requests with a same-key replay and exactly one plan;
- zero constraint requests while known offline and one after explicit retry;
- four deterministic recommendation candidates;
- two finalization requests with a same-key replay and exactly one finalized
  event.

The JSON summaries and screenshots under `offline/` are sanitized. Raw Maestro,
proxy, build, and runner logs are intentionally excluded.
