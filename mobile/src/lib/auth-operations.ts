import { ApiError } from "@tableus/api-client";

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
  | { kind: "invalid_invite" }
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
    if (error instanceof ApiError && (error.status === 400 || error.status === 409)) return { kind: "invalid_invite" };
    return { kind: "retryable", error };
  }
}
