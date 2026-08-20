# Closed-beta release runbook

This is the operator sequence for clearing the remaining TableUs release gates.
It does not authorize cloud creation, secret changes, paid provider calls,
migrations, deployments, EAS builds, or store submissions. Obtain explicit user
approval immediately before each such action.

## 1. Establish the release candidate

1. Work from a clean `codex/<objective>` branch.
2. Run `make ready` with deterministic providers and no production secrets.
3. Record the candidate SHA with `git rev-parse HEAD`.
4. Require CI to pass for that exact SHA. Do not accept evidence from a newer or
   older commit.

## 2. Collect owner-controlled inputs

The owner supplies these through the target platform's encrypted environment or
secret manager, never in source control:

- Final HTTPS domain and support/privacy contact.
- Supabase project URL, anon key, database migration URL, and a separate runtime
  database URL.
- A pre-created PostgreSQL runtime login role name for
  `TABLEUS_RUNTIME_DB_ROLE`.
- Railway, Vercel, Expo/EAS, Apple, and Google Play project ownership.
- Apple Team ID, iOS bundle identifier, Android package name, and SHA-256
  fingerprints for every production/preview Android signing certificate.
- Google Maps, pinned Gemini, Sentry, and PostHog credentials and agreed budgets.

Use unique staging and production values. Never copy production database or
provider secrets into preview builds or CI.

## 3. Provision Supabase staging

After cloud-resource and secret approval:

1. Create the staging project in the intended US region.
2. Create a least-privilege login role for the API runtime. Keep the privileged
   migration credential separate. Set `DATABASE_URL` to the runtime connection,
   `MIGRATION_DATABASE_URL` to the migration connection, and
   `TABLEUS_RUNTIME_DB_ROLE` to the quoted-safe role name.
   `backend/scripts/provision_runtime_role.py` performs the role creation or
   credential update when those variables plus the process-only
   `TABLEUS_RUNTIME_DB_PASSWORD` are present; it never prints the password.
3. Keep the `app` schema private; do not expose it through the Supabase Data API.
4. With explicit staging-migration approval, run from `backend/`:

   ```bash
   uv run alembic upgrade head
   ```

5. In Supabase Authentication Hooks, configure **Before User Created** to call
   the Postgres function `app.hook_restrict_signup_to_validated_invite`. The
   migration grants the Auth administrator access when that built-in role is
   present.
6. Configure custom SMTP and an email OTP template that presents the OTP token.
   Configure approved redirect URLs only for the final HTTPS `/auth` and `/join`
   routes plus intentionally supported staging URLs.
7. Configure short OTP expiry and platform rate limits, then verify that an
   unvalidated email cannot create an Auth user.

Joining and returning sign-in are distinct. A new account validates and redeems
one invite before product access. A returning account requests OTP without a new
invite, then must pass the authenticated `/api/v1/me` profile check.

Create an invite only after the migration and hook are active:

```bash
cd backend
uv run python scripts/invites.py create --max-uses 1 --expires-hours 168
uv run python scripts/invites.py list
```

The plaintext invite is printed once. Transfer it through an approved secure
channel. Revoke a compromised invite with:

```bash
uv run python scripts/invites.py revoke <invite-id>
```

## 4. Configure the staging services

### Railway API

Set the backend variables from `backend/.env.example`, with at least:

- `ENVIRONMENT=staging`
- `DATABASE_URL`, `TABLEUS_RUNTIME_DB_ROLE`
- `TABLEUS_AUTH_MODE=supabase`
- `TABLEUS_PROVIDER_MODE=deterministic` initially
- `TABLEUS_DEMO_MODE=false`
- a generated `TABLEUS_APP_SECRET`
- `SUPABASE_URL`, `SUPABASE_JWT_AUDIENCE=authenticated`
- exact `ALLOWED_ORIGINS` and `BACKEND_PUBLIC_URL`

Do not store `MIGRATION_DATABASE_URL` in Railway. Apply each approved migration
from the trusted operator environment with the owner credential held outside the
service, then deploy the runtime with only the least-privilege application role.
Railway supplies `PORT`; the container reads it automatically. Confirm
`/health/live` and `/health/ready` after an approved staging deployment.

### Vercel web

Set the frontend variables from `frontend/.env.local.example`. For association
files, set `APPLE_TEAM_ID`, `IOS_BUNDLE_IDENTIFIER`, `ANDROID_PACKAGE_NAME`, and
comma-separated `ANDROID_SHA256_CERT_FINGERPRINTS`. The two endpoints return 503
until the values are structurally valid.

After an approved staging deployment, verify:

```bash
curl --fail https://<domain>/.well-known/apple-app-site-association
curl --fail https://<domain>/.well-known/assetlinks.json
```

### Expo/EAS mobile

Link the Expo project and set the values from `mobile/.env.example`, including
the final link host and EAS project ID. Ensure the iOS associated domain and
Android HTTPS intent filters produced by `mobile/app.config.ts` match the web
manifests. Preview and production use different EAS channels and credentials.

Use Expo Go for normal local work. Verified HTTPS links, credentials, native
configuration, and telemetry must be validated with a real development or
preview build. EAS Update is only for JavaScript-compatible changes whose
runtime version matches; native dependency or configuration changes require a
new store build.

## 5. Produce exact-SHA staging evidence

Deploy all three deliverables from the same candidate SHA. Record deployment/build
IDs alongside that SHA. Do not reuse a Supabase account or plan from prior
evidence.

For the web journey, create an authenticated Playwright storage-state file in
the ignored `playwright/.auth/` directory, then run:

```bash
PLAYWRIGHT_BASE_URL=https://<staging-domain> \
PLAYWRIGHT_AUTH_STORAGE=playwright/.auth/staging.json \
npm run test:e2e
```

Confirm manually or with captured test evidence:

- invalid invite and unvalidated signup are rejected;
- approved email OTP creates and redeems exactly one profile;
- two users join one plan, receive exactly four deterministic candidates, rank
  votes, and allow only the organizer to finalize/reopen;
- constraint or participant changes invalidate stale recommendations and votes;
- rotated or expired links fail;
- export/deletion, foreground refresh, token refresh, and recoverable offline
  mutation errors behave as disclosed;
- AASA and asset links open the installed iOS/Android app and fall back to web.

Run the checked-in EAS build-artifact workflow on both test profiles only after
an approved build. Install the resulting iOS simulator `.app` and Android `.apk`
locally, then run `.maestro/smoke.yml` against each platform. EAS-hosted Maestro
jobs require a paid plan and are not part of the default closed-beta workflow.
Store sanitized screenshots/logs with the candidate SHA and deployment/build
IDs; do not retain OTPs, invite codes, emails, full share tokens, precise
locations, photos, prompts, or provider responses.

## 6. Enable providers incrementally

Keep deterministic providers green while each integration is added:

1. Enable staging Google Maps with a restricted server key, Places API New field
   masks, and billing alerts. Confirm four valid Place IDs or the honest
   no-result state, refresh-only display data, and production attribution.
2. Review privacy/terms and Google Maps attribution with the responsible owner
   before external beta use.
3. With explicit paid-live-evaluation approval, run the pinned Gemini fixture
   subset under the agreed cost ceiling:

   ```bash
   make ai-eval-live
   ```

4. Inspect only the sanitized aggregate report. Do not enable silent fallback or
   raise the budget to make a failing evaluation pass.
5. Enable Sentry/PostHog last and verify that prohibited personal, location,
   photo, prompt, provider-response, and token data never reaches telemetry.

## 7. Release decision

The closed beta may advance only when deterministic CI, exact-SHA staging web,
iOS, and Android evidence are green; the security/privacy checklist is signed;
legal and attribution review is complete; rollback owners are named; and all
residual risks are recorded in `docs/current-state.md`.

Production migration, deployment, EAS production build, TestFlight/Play closed
testing submission, and invitations to the cohort are separate explicit
approval gates. Record the approved action, exact SHA, time, operator, result,
and rollback reference for each gate.
