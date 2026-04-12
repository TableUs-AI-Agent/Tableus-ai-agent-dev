# TableUs

🏆 **2nd place — Cursor Hackathon 2026**

TableUs is a location-aware restaurant planning demo for small groups.

The project centers on a straightforward flow: choose a location, describe what the group wants in plain language, and turn a nearby restaurant pool into a short ranked list with concise reasoning. The app uses demo users, in-memory data, Google Maps, and Gemini to prototype that decision-making loop.

---

## What TableUs focuses on

- Small-group meal planning rather than long-term social networking
- Nearby restaurant discovery grounded in real geocoding and Places data
- Natural-language search with explainable recommendations
- Demo-friendly preference summaries that make solo and multi-person search easier to test
- Fast local setup with no database required

## Current demo scope

The repository includes lightweight user connections, demo profiles, and review-derived preference text, but those pieces exist to support the planning flow in a no-login prototype. The main product question in this repo is simple: how can a group narrow choices faster when location, cuisine, price, and atmosphere all matter at once?

---

## Main flow

1. Pick a demo user from the sidebar.
2. Set a location by searching for a place name.
3. Browse nearby restaurants pulled from Google Places.
4. Enter a natural-language search such as `casual ramen near downtown` or `quiet dinner spot for three`.
5. Optionally include additional demo users to run a multi-person search across several preference summaries.
6. Review the ranked results and the short AI reasoning attached to each result.

You can also submit a natural-language review or upload a food photo to test the supporting profile and analysis flows.

---

## Features in the current build

- Location resolve via geocoding before search
- Nearby restaurant candidate pool from Google Places
- Solo restaurant ranking from query plus taste summary
- Group ranking from combined demo-user preferences
- Natural-language reviews that refresh stored preference text
- Food photo analysis through Gemini Vision
- Demo friends management for testing group scenarios
- In-memory demo data so the app runs without a database

---

## Product shape

TableUs is best understood as a planning tool prototype.

- It is location-first: recommendations are tied to a real place and a live nearby pool.
- It is decision-oriented: the goal is to narrow options, not build a permanent foodie identity layer.
- It is explainable: each top result comes back with short reasoning rather than a black-box score alone.
- It is intentionally lightweight: demo users and in-memory state keep the build easy to run and easy to iterate on.

---

## Tech stack

| Layer | Choice |
|-------|--------|
| Frontend | Next.js 16, React 19, Tailwind CSS 4, Framer Motion |
| Backend | FastAPI, Python |
| AI | Google Gemini for vision, ranking, and preference merging |
| Maps | Google Maps Geocoding API and Places Nearby Search |

---

## Repo structure

- `frontend/` - Next.js app for discover, connections, review, and profile flows
- `backend/` - FastAPI API for maps lookup, search, reviews, food analysis, and demo data access

Main frontend routes:

- `/discover` - location-aware restaurant search
- `/friends` - demo connections and combined planning state
- `/review` - natural-language review submission
- `/profile` - current demo user's preference summary

