#!/usr/bin/env node

import { randomUUID } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { basename, resolve } from "node:path";
import { createInterface } from "node:readline/promises";
import { spawnSync } from "node:child_process";

import {
  assertSanitizedGeminiSummary,
  validateGeminiReadiness,
} from "./gemini-evidence-utils.mjs";

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
  const response = await fetch(url, { ...options, signal: AbortSignal.timeout(30_000) });
  if (!response.ok) throw new Error(`Sanitized staging request failed (${response.status}).`);
  return response.json();
}

const args = parseArgs(process.argv.slice(2));
const apiUrl = String(args["api-url"] ?? "").replace(/\/$/, "");
const expectedSha = String(args.sha ?? "");
const evidenceDir = resolve(args.evidence ?? "");
const supabaseUrl = String(
  process.env.TABLEUS_SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
).replace(/\/$/, "");
const supabaseAnonKey =
  process.env.TABLEUS_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
if (!apiUrl || !expectedSha || !args.evidence) {
  throw new Error("--api-url, --sha, and --evidence are required.");
}
if (!/^[0-9a-f]{40}$/.test(expectedSha)) throw new Error("--sha must be an exact commit SHA.");
if (new URL(apiUrl).protocol !== "https:") throw new Error("Gemini staging evidence requires HTTPS.");
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and public anon key must be provided through the environment.");
}
const git = spawnSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" });
if (git.status !== 0 || git.stdout.trim() !== expectedSha) {
  throw new Error("The checked-out commit does not match --sha.");
}

const readiness = await jsonRequest(`${apiUrl}/health/ready`);
validateGeminiReadiness(readiness, expectedSha);

const terminal = createInterface({ input: process.stdin, output: process.stdout });
async function authenticate(label) {
  const email = (await terminal.question(`${label} approved account email: `)).trim().toLowerCase();
  if (!email) throw new Error("An approved account email is required.");
  await jsonRequest(`${supabaseUrl}/auth/v1/otp`, {
    method: "POST",
    headers: { apikey: supabaseAnonKey, "Content-Type": "application/json" },
    body: JSON.stringify({ email, create_user: false }),
  });
  const code = (await terminal.question(`${label} newest verification code: `)).trim();
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
  terminal.close();
  const organizer = api(organizerToken);
  const guest = api(guestToken);
  const locationLabel = "Madison, Wisconsin";
  const location = await organizer("/api/v1/locations/resolve", {
    method: "POST",
    body: { query: locationLabel },
  });
  const created = await organizer("/api/v1/plans", {
    method: "POST",
    body: {
      title: "Gemini staging validation",
      location_label: locationLabel,
      location_place_id: location.place_id,
    },
  });
  await guest(`/api/v1/plans/${created.plan.id}/join`, {
    method: "POST",
    body: { share_token: created.share_token },
  });
  const constraints = {
    cuisines: [],
    dietary_notes: ["vegetarian options"],
    max_price_level: 3,
    notes: "Prefer a relaxed group setting",
  };
  await organizer(`/api/v1/plans/${created.plan.id}/constraints`, {
    method: "PATCH",
    body: constraints,
  });
  await guest(`/api/v1/plans/${created.plan.id}/constraints`, {
    method: "PATCH",
    body: constraints,
  });
  const recommended = await organizer(`/api/v1/plans/${created.plan.id}/recommendations`, {
    method: "POST",
    body: { query: "group-friendly dinner" },
  });
  const refreshed = await organizer(`/api/v1/plans/${created.plan.id}`);
  const usage = await organizer("/api/v1/provider-usage/summary");
  const candidateCount = recommended.candidates.length;
  const distinctCandidates =
    new Set(recommended.candidates.map((candidate) => candidate.place.place_id)).size ===
    candidateCount;
  const geminiUsage = usage.filter((item) => item.provider === "gemini");
  const summary = assertSanitizedGeminiSummary({
    git_sha: expectedSha,
    api_origin: new URL(apiUrl).origin,
    railway_deployment_id: args["railway-deployment"] || "operator-not-recorded",
    vercel_deployment_id: args["vercel-deployment"] || "operator-not-recorded",
    readiness_exact_sha: true,
    supabase_auth: true,
    places_live: true,
    ai_live: true,
    agent_platform_live: true,
    participant_count: refreshed.participants.length,
    candidate_count: candidateCount,
    distinct_candidates: distinctCandidates,
    usage_operation_count: geminiUsage.reduce((sum, item) => sum + item.operation_count, 0),
    usage_input_units: geminiUsage.reduce((sum, item) => sum + item.input_units, 0),
    usage_output_units: geminiUsage.reduce((sum, item) => sum + item.output_units, 0),
    usage_estimated_cost_usd: Number(
      geminiUsage.reduce((sum, item) => sum + item.estimated_cost_usd, 0).toFixed(8),
    ),
    persistent_candidate_shape_verified: process.env.TABLEUS_GEMINI_DB_SHAPE_CONFIRMED === "true",
    budget_alerts_confirmed: process.env.TABLEUS_GEMINI_BUDGET_CONFIRMED === "true",
    key_restrictions_confirmed: process.env.TABLEUS_GEMINI_KEY_RESTRICTIONS_CONFIRMED === "true",
  });
  if (
    candidateCount !== 4 ||
    !distinctCandidates ||
    refreshed.participants.length !== 2 ||
    geminiUsage.length === 0 ||
    summary.usage_input_units <= 0 ||
    summary.usage_output_units <= 0 ||
    summary.usage_estimated_cost_usd <= 0 ||
    !summary.persistent_candidate_shape_verified ||
    !summary.budget_alerts_confirmed ||
    !summary.key_restrictions_confirmed
  ) {
    throw new Error("Sanitized Gemini staging acceptance checks did not pass.");
  }
  mkdirSync(evidenceDir, { recursive: true });
  const output = resolve(evidenceDir, `${expectedSha.slice(0, 7)}-gemini-staging-summary.json`);
  writeFileSync(output, `${JSON.stringify(summary, null, 2)}\n`, { mode: 0o600 });
  process.stdout.write(`Sanitized Gemini staging evidence written to ${basename(output)}.\n`);
} finally {
  organizerToken = undefined;
  guestToken = undefined;
  terminal.close();
}
