import { ApiError, withAuthTimeout, type createApiClient } from "@tableus/api-client";
import { isAuthSessionMissingError } from "@supabase/supabase-js";

type AuthUser = { id: string; email?: string; email_confirmed_at?: string };
type ReadUser = () => Promise<{ data: { user: AuthUser | null }; error: Error | null }>;
type Api = Pick<ReturnType<typeof createApiClient>, "get" | "post">;

// getUser validates with Auth; neither cached claims nor user metadata establish identity.
export async function confirmedSubject(readUser: ReadUser, email: string, expectedSubject?: string) {
  const { data, error } = await withAuthTimeout(readUser);
  if (isAuthSessionMissingError(error)) return null;
  if (error) throw error;
  if (!data.user) return null;
  const user = data.user;
  if (!user.email_confirmed_at || user.email?.toLowerCase() !== email.trim().toLowerCase()
    || (expectedSubject && user.id !== expectedSubject)) {
    throw new Error("This session does not match your verified email. Sign out before continuing with another account.");
  }
  return user.id;
}

export async function completeWebAuth(api: Api, input: {
  mode: "join" | "sign-in";
  subject: string;
  email: string;
  invite: string;
  name: string;
  redemption: string;
}) {
  const actor = { expectedSubject: input.subject };
  if (input.mode === "sign-in") {
    await api.get("/api/v1/me", actor);
    return;
  }
  const redeem = (token: string) => api.post("/api/v1/access/redeem", {
    redemption_token: token, display_name: input.name,
  }, actor);
  if (input.redemption) {
    try {
      await redeem(input.redemption);
      return;
    } catch (error) {
      // Only an invalid/expired grant can be replaced. Network/refusal errors stay visible.
      if (!(error instanceof ApiError) || error.status !== 400) throw error;
    }
  }
  try {
    // A lost response may have committed signup, even if its old grant has expired.
    await api.get("/api/v1/me", actor);
    return;
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 403) throw error;
  }
  const fresh = await api.post<{ redemption_token: string }>("/api/v1/access/validate", {
    code: input.invite, email: input.email,
  }, actor);
  await redeem(fresh.redemption_token);
}
