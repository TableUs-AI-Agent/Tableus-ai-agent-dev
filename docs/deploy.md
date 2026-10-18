# Deploying TableUs

Two hosted environments, each with its own services and data. Nothing is
shared between them except the code, the EAS project, the Resend account and
the Sentry project (tagged by environment).

| | Staging | Production |
| --- | --- | --- |
| Web (Vercel) | `tableus-staging` at staging.table-us.com | `tableus-production` at www.table-us.com, table-us.com, links.table-us.com |
| API (Railway) | project `tableus-staging`, env `staging`, service `api` at api-staging-3795.up.railway.app | project `tableus-production`, env `production`, service `api` at api.table-us.com |
| Database and sign-in (Supabase) | "TableUs Staging" (Free, pauses when idle; kept awake daily by `staging-keepalive.yml`) | "TableUs Production" in the "TableUs" org (Pro, daily backups) |
| Places and Gemini | staging keys | production keys, with a Google Cloud budget alert |
| Phone builds (EAS) | profiles `staging` and `testflight` | profile `production` |

The public origins for each environment live in `HOSTED_ENVIRONMENTS`
(`packages/domain/src/public-info.ts`). A hosted web build sets
`TABLEUS_DEPLOY_ENV` and refuses to build unless its API, Supabase and link
origins match that environment exactly.

## Promoting a change

1. Merge to `main`.
2. If the change adds a migration, run `scripts/migrate.sh staging` from that
   commit to read the SQL, then `scripts/migrate.sh staging --apply`.
3. `scripts/deploy.sh staging`, then try the change on staging.
4. When staging looks right, run `scripts/migrate.sh production` (and
   `--apply`), then `scripts/deploy.sh production`.

`deploy.sh production` deploys the commit staging reports on `/health`, and only
if that commit is on `main`. Both scripts deploy from a clean `git archive`
export, never the working tree. Pass `api` or `web` to deploy one part.

Migrations run before the API that needs them, so each one must still work with
the API version that is already running: add columns and tables first, and
remove old ones in a later change.

## Rolling back

- **API:** redeploy the previous build from the Railway dashboard.
- **Web:** promote the previous deployment in the Vercel dashboard
  (`vercel rollback`).
- **Database:** write a forward migration. For a bad data change, restore the
  daily backup from the Supabase dashboard.

## Production variables

The API reads only what `backend/tableus/config.py` defines. Production sets:

- `ENVIRONMENT=production`, `TABLEUS_AUTH_MODE=supabase`,
  `TABLEUS_PROVIDER_MODE=live`
- `DATABASE_URL` as the restricted runtime role through the Supabase pooler,
  and `TABLEUS_RUNTIME_DB_ROLE=tableus_runtime`
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- `GOOGLE_MAPS_API_KEY`, `GEMINI_API_KEY`
- `ALLOWED_ORIGINS=https://www.table-us.com,https://table-us.com,https://links.table-us.com`
- `TABLEUS_PLAN_CREATOR_EMAILS` (empty lets anyone signed in start a plan)
- `SENTRY_DSN`

The Vercel project sets `TABLEUS_DEPLOY_ENV=production`, `NEXT_PUBLIC_API_URL`
and `TABLEUS_API_ORIGIN` (`https://api.table-us.com`), `NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_LINK_ORIGIN=https://links.table-us.com`,
`APPLE_TEAM_ID`, the two telemetry modes (`production`) and the Sentry DSN.
The EAS `production` environment sets `EXPO_PUBLIC_API_URL`,
`EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`.

## Setting up production once

1. Create the "TableUs" Supabase org on Pro and the "TableUs Production"
   project in the same region as staging. Copy staging's Auth settings: email
   code sign-in, Resend SMTP with a production API key, the code-based Confirm
   signup and Magic Link templates, and the site and redirect URLs for
   www.table-us.com and links.table-us.com.
2. Add the project's origin to `HOSTED_ENVIRONMENTS.production` and its ref to
   `scripts/migrate.sh`.
3. Create the runtime role with `backend/scripts/provision_runtime_role.py`,
   then run `scripts/migrate.sh production --apply`.
4. Create the Railway project `tableus-production` (environment `production`,
   service `api`), set the variables above, and add the api.table-us.com custom
   domain.
5. Create the Vercel project `tableus-production` with the variables above.
6. Run `scripts/deploy.sh production` and check it on the `.vercel.app` URL.
7. Cut over: in Vercel, move www.table-us.com, table-us.com and
   links.table-us.com from `tableus-staging` to `tableus-production`, and add
   staging.table-us.com to `tableus-staging`. Set staging's
   `NEXT_PUBLIC_LINK_ORIGIN` to `https://staging.table-us.com`, add
   `TABLEUS_DEPLOY_ENV=staging`, and redeploy staging. Add DNS records for
   `staging` (Vercel) and `api` (Railway).
8. Build new `staging` phone builds; older ones still open links on
   www.table-us.com, which is now production.
