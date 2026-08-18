# Changelog

## Hackathon submission (baseline)

This is the state of the repo **as submitted for judging** (Cursor Hackathon 2026). Everything below was done **after** judging finished.

---

## Post-hackathon updates

### Backend (`backend/`)

- **Gemini responses:** Safer handling when the model returns empty or non-JSON text (`_response_text`, retries across models, resilient `parse_gemini_json`, clearer errors). Search and related endpoints no longer 500 on bad parses; food analysis returns a consistent JSON shape with defaults.
- **Search pipeline:** Natural-language query is applied **first** via Gemini (`filter_restaurants_by_user_query`), then quality sort and top-4 ranking. Removed the old heuristic cuisine pre-filter that ran ahead of the user’s wording.
- **Candidate cap:** Nearby/search candidate pool capped at **20** venues (constant `MAX_RESTAURANT_CANDIDATES`); `/api/restaurants/nearby` clamps request limits accordingly.
- **Google Places:** Nearby Search **pagination** (`next_page_token`) so the app can fill the candidate cap when the API returns more than one page.
- **Search API responses:** `nearby_restaurants` in search results reflects the **query-filtered** pool (up to the cap), not a fixed smaller slice.

### Frontend (`frontend/app/discover/`)

- **Nearby load:** Requests `limit: 20` to match the backend cap.
- **Orbit:** Shows up to **20** restaurant thumbnails (was fewer before).
- **Friends on orbit:** Each friend uses a **stable pseudo-random** angle offset and **orbit radius** so they are not all on one ring; **larger** avatar buttons and ring spacing adjusted.
- **Friend list in orbit:** Up to **6** friends shown in the social orbit (was 4) so the expanded demo roster fits.

### Demo data (`backend/data.py`)

- Added demo users **Derek Chen** and **Elena Ruiz**, wired into the **friend graph** with the core group (and Nina linked to Derek and Elena). Seeded **reviews** for both.

### Documentation

- **README:** 🏆 note for **2nd place — Cursor Hackathon 2026**.

### Reverted / not shipped

- **Spoke lines** from the orbit center to top restaurant cards were implemented, iterated (thickness), then **removed**; restaurant orbit went back to a **single radius** (45%) for all venues.

# 2026-08-16 — Closed-beta foundation

- Added Expo Router mobile development for iOS and Android.
- Added the persistent authenticated `/api/v1` shared-plan API and ranked voting.
- Added deterministic providers, generated contracts, CI/EAS workflows, tests,
  privacy/telemetry controls, and Vercel/Railway deployment configuration.
- Split the web Three.js scene into a client-only dynamic chunk and upgraded
  Next.js to the patched 16.3.1 release.

# 2026-08-17 — Release hardening

- Separated privileged Alembic and least-privilege runtime database credentials,
  moved application data into a private schema, and added an invite-only
  Supabase pre-signup hook plus hashed invite administration commands.
- Bound OTP invite validation to the authenticated email and made verified-link
  manifests fail closed until real Apple and Android identifiers are supplied.
- Added Railway port handling, Expo verified-link/update configuration, live
  Google Maps attribution, expanded beta privacy/terms disclosures, and a
  staging-aware closed-beta browser journey.
- Added an operator runbook that preserves explicit approval gates for external
  resources, secrets, migrations, paid providers, deployments, and submissions.

# 2026-08-17 — Staging bootstrap

- Created and linked the isolated `tableus-staging` Vercel project, configured
  for Node 22, Next.js, frozen npm installs, and the web workspace output. No
  environment secrets or deployment were added.
- Created and linked the isolated `TableUs Staging` Supabase project in East US.
  Its database owner password is stored in macOS Keychain; no remote migration,
  runtime role, Auth hook, SMTP, or client environment was configured.
