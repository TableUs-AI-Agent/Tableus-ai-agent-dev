export function validateJoinToken(value: string): string {
  if (value.length < 20 || value.length > 200 || /[\u0000-\u001f\u007f]/u.test(value)) {
    throw new Error("This private link is invalid.");
  }
  // Reject lone surrogates rather than allowing URL encoders to repair them.
  try { encodeURIComponent(value); } catch { throw new Error("This private link is invalid."); }
  return value;
}

function tokenField(fields: string): string | null {
  let result: string | null = null;
  for (const field of fields.split("&")) {
    if (!field) continue;
    const separator = field.indexOf("=");
    const key = decodeURIComponent((separator < 0 ? field : field.slice(0, separator)).replace(/\+/g, " "));
    const value = decodeURIComponent((separator < 0 ? "" : field.slice(separator + 1)).replace(/\+/g, " "));
    if (key !== "token") continue;
    if (result !== null) throw new Error("Duplicate capability");
    result = validateJoinToken(value);
  }
  return result;
}

/** Inspect raw URL bytes before a router/URLSearchParams can decode or repair them. */
export function parseJoinToken(input: string): string | null {
  try {
    if (input.length > 4096) throw new Error("Oversized link");
    const hash = input.indexOf("#");
    const beforeFragment = hash < 0 ? input : input.slice(0, hash);
    const query = beforeFragment.indexOf("?");
    const queryToken = tokenField(query < 0 ? "" : beforeFragment.slice(query + 1));
    if (hash < 0) return queryToken;
    const fragmentToken = tokenField(input.slice(hash + 1));
    // No legacy fallback if a fragment is supplied, even if the two values match.
    if (queryToken !== null || fragmentToken === null) throw new Error("Ambiguous capability");
    return fragmentToken;
  } catch {
    throw new Error("This private link is invalid.");
  }
}
