import { ApiError, withAuthTimeout } from "@tableus/api-client";

import { createPendingTransaction, normalizeEmail, type AuthMode, type PendingAuthTransaction } from "./auth-transaction.ts";

type Profile = { id: string; display_name: string; share_taste: boolean };

export async function startAuthTransaction(
  mode: AuthMode,
  input: { invite?: string; email: string; displayName?: string },
  dependencies: {
    validateInvite: (input: { code: string; email: string }) => Promise<{ redemption_token: string }>;
    sendCode: (input: { email: string; shouldCreateUser: boolean }) => Promise<void>;
  },
) {
  const email = normalizeEmail(input.email);
  let redemptionToken: string | undefined;
  if (mode === "join") {
    const validated = await dependencies.validateInvite({ code: input.invite?.trim() ?? "", email });
    redemptionToken = validated.redemption_token;
  }
  await dependencies.sendCode({ email, shouldCreateUser: mode === "join" });
  return createPendingTransaction({
    mode,
    email,
    displayName: mode === "join" ? input.displayName?.trim() : undefined,
    redemptionToken,
  });
}

export type ApprovalResult =
  | { kind: "approved"; profile: Profile }
  | { kind: "unapproved" }
  | { kind: "invite_required" }
  | { kind: "retryable"; error: unknown };

export async function resolveApproval(
  transaction: PendingAuthTransaction | null,
  dependencies: {
    redeem: (input: { redemption_token: string | undefined; display_name: string | undefined }) => Promise<Profile>;
    getProfile: () => Promise<Profile>;
  },
): Promise<ApprovalResult> {
  try {
    const profile = transaction?.mode === "join"
      ? await dependencies.redeem({ redemption_token: transaction.redemptionToken, display_name: transaction.displayName })
      : await dependencies.getProfile();
    return { kind: "approved", profile };
  } catch (error) {
    if (error instanceof ApiError && error.status === 403) return { kind: "unapproved" };
    if (transaction?.mode === "join" && error instanceof ApiError && (error.status === 400 || error.status === 409)) {
      // The server may have committed signup before a response was lost. Its
      // grant decoder runs before that idempotent check, so reconcile /me first.
      try {
        return { kind: "approved", profile: await dependencies.getProfile() };
      } catch (profileError) {
        if (profileError instanceof ApiError && profileError.status === 403) return { kind: "invite_required" };
        return { kind: "retryable", error: profileError };
      }
    }
    return { kind: "retryable", error };
  }
}

export class AuthIdentityMismatchError extends Error {
  constructor() {
    super("This session does not match your verified email. Sign out before continuing with another account.");
  }
}

// Validate with Auth, not cached session claims or user-editable metadata.
export async function confirmJoinIdentity(
  readUser: () => Promise<{ data: { user: { id: string; email?: string; email_confirmed_at?: string } | null }; error: Error | null }>,
  subject: string,
  transaction: PendingAuthTransaction | null,
) {
  const { data, error } = await withAuthTimeout(readUser);
  if (error) throw error;
  const user = data.user;
  if (!user?.email_confirmed_at || !user.email || user.id !== subject
    || (transaction && (normalizeEmail(user.email) !== transaction.email
      || (transaction.subject && transaction.subject !== subject)))) {
    throw new AuthIdentityMismatchError();
  }
  return { subject: user.id, email: normalizeEmail(user.email) };
}
