export function validateMapsReadiness(payload, expectedSha) {
  if (payload?.auth_mode !== "supabase") throw new Error("Staging must use Supabase authentication.");
  if (payload?.places_provider_mode !== "live") throw new Error("Staging must use live Places.");
  if (payload?.ai_provider_mode !== "deterministic") throw new Error("Staging AI must remain deterministic.");
  if (payload?.provider_mode !== "mixed") throw new Error("Staging compatibility mode must be mixed.");
  if (!expectedSha || payload?.build_sha !== expectedSha) throw new Error("Staging readiness is not pinned to the exact candidate SHA.");
  return true;
}

export function assertSanitizedMapsSummary(summary) {
  const serialized = JSON.stringify(summary);
  const forbiddenKeys = ["email", "otp", "token", "place_id", "query", "latitude", "longitude", "name", "address", "response"];
  for (const key of forbiddenKeys) {
    if (new RegExp(`"[^\"]*${key}[^\"]*"\\s*:`, "i").test(serialized)) {
      throw new Error(`Maps evidence contains prohibited field: ${key}`);
    }
  }
  return summary;
}
