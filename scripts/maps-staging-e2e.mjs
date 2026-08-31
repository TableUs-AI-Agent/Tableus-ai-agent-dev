#!/usr/bin/env node

import { randomUUID } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { basename, resolve } from "node:path";
import { spawnSync } from "node:child_process";

import { assertSanitizedMapsSummary, validateMapsReadiness } from "./maps-evidence-utils.mjs";
import { promptSecret } from "./prompt-utils.mjs";
import { RELEASE_ORIGINS, requireReleaseOrigin } from "./release-origins.mjs";

function parseArgs(argv) {
  const values = {};
  for (let index = 0; index < argv.length; index += 2) {
    const key = argv[index];
    const value = argv[index + 1];
    if (!key?.startsWith("--") || !value) throw new Error(`Invalid argument near ${key ?? "end"}`);
    values[key.slice(2)] = value;
  }
  return values;
}

async function jsonRequest(url, options = {}) {
  const response = await fetch(url, { redirect: "error", ...options, signal: AbortSignal.timeout(20_000) });
  if (!response.ok) throw new Error(`Sanitized staging request failed (${response.status}).`);
  return response.json();
}

const args = parseArgs(process.argv.slice(2));
const apiUrl = String(args["api-url"] ?? "").replace(/\/$/, "");
const evidenceDir = resolve(args.evidence ?? "");
const supabaseUrl = String(process.env.TABLEUS_SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/\/$/, "");
const supabaseAnonKey = process.env.TABLEUS_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
if (!apiUrl || !args.evidence) throw new Error("--api-url and --evidence are required.");
requireReleaseOrigin(apiUrl, RELEASE_ORIGINS.stagingApi, "Maps staging API");
requireReleaseOrigin(supabaseUrl, RELEASE_ORIGINS.stagingSupabase, "Maps Supabase");
if (!supabaseUrl || !supabaseAnonKey) throw new Error("Supabase URL and public anon key must be provided through the environment.");

const git = spawnSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" });
if (git.status !== 0) throw new Error("Could not resolve the candidate SHA.");
const expectedSha = git.stdout.trim();
const readiness = await jsonRequest(`${apiUrl}/health/ready`);
validateMapsReadiness(readiness, expectedSha);

async function authenticate(label) {
  const email = (await promptSecret(`${label} approved account email: `)).trim().toLowerCase();
  if (!email) throw new Error("An approved account email is required.");
  await jsonRequest(`${supabaseUrl}/auth/v1/otp`, {
    method: "POST",
    headers: { apikey: supabaseAnonKey, "Content-Type": "application/json" },
    body: JSON.stringify({ email, create_user: false }),
  });
  const code = (await promptSecret(`${label} newest verification code: `)).trim();
  if (!code) throw new Error("A verification code is required.");
  const session = await jsonRequest(`${supabaseUrl}/auth/v1/verify`, {
    method: "POST",
    headers: { apikey: supabaseAnonKey, "Content-Type": "application/json" },
    body: JSON.stringify({ email, token: code, type: "email" }),
  });
  if (!session.access_token) throw new Error("Supabase did not return an authenticated session.");
  return session.access_token;
}

function api(token) {
  return async (path, { method = "GET", body } = {}) => {
    const headers = { Authorization: `Bearer ${token}` };
    if (body !== undefined) {
      headers["Content-Type"] = "application/json";
      if (method !== "GET") headers["Idempotency-Key"] = randomUUID();
    }
    const payload = await jsonRequest(`${apiUrl}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    return payload.data;
  };
}

let organizerToken;
let guestToken;
try {
  organizerToken = await authenticate("Organizer");
  guestToken = await authenticate("Guest");
  const organizer = api(organizerToken);
  const guest = api(guestToken);
  const locationQuery = "Madison, Wisconsin";
  const location = await organizer("/api/v1/locations/resolve", { method: "POST", body: { query: locationQuery } });
  const created = await organizer("/api/v1/plans", {
    method: "POST",
    body: { title: "Maps staging validation", location_label: locationQuery, location_place_id: location.place_id },
  });
  await guest(`/api/v1/plans/${created.plan.id}/join`, { method: "POST", body: { share_token: created.share_token } });
  const recommended = await organizer(`/api/v1/plans/${created.plan.id}/recommendations`, { method: "POST", body: { query: "group-friendly dinner" } });
  const refreshed = await organizer(`/api/v1/plans/${created.plan.id}`);
  const usage = await organizer("/api/v1/provider-usage/summary");
  const candidateCount = recommended.candidates.length;
  const distinctCandidates = new Set(recommended.candidates.map((candidate) => candidate.place.place_id)).size === candidateCount;
  const allGoogle = refreshed.candidates.every((candidate) => candidate.place.data_provider === "google_maps");
  const placesUsage = usage.filter((item) => item.provider === "google-places-new");
  const summary = assertSanitizedMapsSummary({
    git_sha: expectedSha,
    api_origin: new URL(apiUrl).origin,
    railway_deployment_id: args["railway-deployment"] || "operator-not-recorded",
    vercel_deployment_id: args["vercel-deployment"] || "operator-not-recorded",
    readiness_exact_sha: true,
    supabase_auth: true,
    places_live: true,
    ai_deterministic: true,
    location_resolved: Boolean(location.place_id),
    plan_created: Boolean(created.plan.id),
    participant_count: refreshed.participants.length,
    candidate_count: candidateCount,
    distinct_candidates: distinctCandidates,
    refreshed_google_details: allGoogle,
    usage_operation_count: placesUsage.reduce((sum, item) => sum + item.operation_count, 0),
    usage_input_units: placesUsage.reduce((sum, item) => sum + item.input_units, 0),
    usage_output_units: placesUsage.reduce((sum, item) => sum + item.output_units, 0),
    budget_alerts_confirmed: process.env.TABLEUS_MAPS_BUDGET_CONFIRMED === "true",
    key_restrictions_confirmed: process.env.TABLEUS_MAPS_KEY_RESTRICTIONS_CONFIRMED === "true",
  });
  if (candidateCount !== 4 || !distinctCandidates || !allGoogle || refreshed.participants.length !== 2 || placesUsage.length === 0) {
    throw new Error("Sanitized staging acceptance checks did not pass.");
  }
  mkdirSync(evidenceDir, { recursive: true });
  const output = resolve(evidenceDir, `${expectedSha.slice(0, 7)}-maps-staging-summary.json`);
  writeFileSync(output, `${JSON.stringify(summary, null, 2)}\n`, { mode: 0o600 });
  process.stdout.write(`Sanitized maps staging evidence written to ${basename(output)}.\n`);
} finally {
  organizerToken = undefined;
  guestToken = undefined;
}
