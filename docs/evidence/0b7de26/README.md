# Gemini Agent Platform gate evidence

- Candidate: `0b7de266d4b053d49267b2ac22bd85052ab3ab8f`
- Public CI: GitHub Actions run `32911321560`, passed all jobs
- Backend/model: `agent-platform` / `gemini-3.1-flash-lite`
- Frozen fixture SHA-256:
  `9e5ded7c55cb3183400ee325274428b0412761497600cb43de25c02fa9feccd8`
- Live evaluation: 0 of 6 passed, six attempts, zero input tokens, zero output
  tokens, and `$0` estimated cost
- Sanitized diagnostic: the Agent Platform endpoint returned HTTP `401` for the
  standard Agent Platform-only key
- Rollback: the unused standard key was revoked; its Railway and Keychain copies
  were removed; the prior Developer API credential was restored with deploy
  suppression
- Staging after rollback: HTTP 200 readiness from SHA `4a790b4`, Supabase auth,
  live Places, deterministic AI, compatibility mode `mixed`

No prompts, outputs, images, reviews, Place IDs, API-key values, provider
responses, emails, OTPs, sessions, or tokens are retained here. Railway/Vercel
were not deployed and no returning-sign-in email was sent.
