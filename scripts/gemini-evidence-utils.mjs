export function validateGeminiReadiness(payload, expectedSha) {
  if (payload?.auth_mode !== "supabase") throw new Error("Staging must use Supabase authentication.");
  if (payload?.places_provider_mode !== "live") throw new Error("Staging must use live Places.");
  if (payload?.ai_provider_mode !== "live") throw new Error("Staging must use live Gemini.");
  if (payload?.provider_mode !== "live") throw new Error("Staging compatibility mode must be live.");
  if (!expectedSha || payload?.build_sha !== expectedSha) {
    throw new Error("Staging readiness is not pinned to the exact candidate SHA.");
  }
  return true;
}

export function assertSanitizedGeminiSummary(summary) {
  const serialized = JSON.stringify(summary);
  const forbiddenKeys = [
    "email",
    "otp",
    "token",
    "place_id",
    "query",
    "latitude",
    "longitude",
    "name",
    "address",
    "prompt",
    "response",
    "reasoning",
  ];
  for (const key of forbiddenKeys) {
    if (new RegExp(`"[^"]*${key}[^"]*"\\s*:`, "i").test(serialized)) {
      throw new Error(`Gemini evidence contains prohibited field: ${key}`);
    }
  }
  return summary;
}
