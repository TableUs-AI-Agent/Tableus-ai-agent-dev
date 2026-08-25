# Gemini live-evaluation failure evidence

- Candidate SHA: `e89d5c4f1664ab0ec0e7d5bec3dd196439283aeb`
- Model: `gemini-2.5-flash-lite`
- Result: 0 of 6 cases passed before inference; zero reported tokens and `$0`
  estimated cost.
- The isolated project was imported into Google AI Studio and the existing
  authorization key remained restricted to the three Railway staging IPs after
  diagnostics.
- Model listing succeeded, but generation returned `404` because the newly
  created project did not have generation access to Gemini 2.5 Flash-Lite.
- No provider response, prompt, output, image, review, Place ID, credential,
  email, code, or temporary caller address is retained here.
- Staging remained on deterministic AI; Railway, Vercel, and authentication
  email delivery were not changed.
