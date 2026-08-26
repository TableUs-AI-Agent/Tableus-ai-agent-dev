# Gemini live evaluation — superseded candidate

- Candidate SHA: `90691b1c53812fc140da465e1b5e362c781f1139`
- Model: `gemini-2.5-flash-lite`
- Frozen cases: 6
- Passed: 0
- Attempts: 6
- Reported input/output tokens: 0/0
- Reported estimated cost: `$0`

The exact SHA passed public credential-free CI. The live evaluator then failed
every case before inference with terminal provider `400` schema errors. A
metadata-only model lookup succeeded, isolating the failure to the generated
structured-output schema rather than the model, key, billing, or network path.
Google's live endpoint rejected generated string `minLength`, `maxLength`, and
`pattern` keywords. No prompts, outputs, images, reviews, Place IDs, provider
responses, credentials, or sessions are retained.

The first generated authorization key appeared in Google CLI operation output
and was revoked before use or storage. Its replacement is service-account-bound,
Gemini-only, Railway-IP-only after diagnostics, and stored in Railway staging and
the operator Keychain. No Railway/Vercel deployment or OTP message followed this
failed evaluation. A replacement exact-SHA candidate and checkpoint namespace
are required.
