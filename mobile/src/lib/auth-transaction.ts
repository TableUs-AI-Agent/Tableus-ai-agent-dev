export const authTransactionKey = "tableus.auth-transaction.v1";
export const authTransactionTtlMs = 20 * 60 * 1000;

export type AuthMode = "join" | "sign-in";

export type PendingAuthTransaction = {
  version: 1;
  mode: AuthMode;
  email: string;
  displayName?: string;
  redemptionToken?: string;
  expiresAt: number;
};

export type AuthTransactionStorage = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
};

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function maskEmail(value: string) {
  const [local, domain] = normalizeEmail(value).split("@");
  if (!local || !domain) return "your email";
  return `${local.slice(0, 1)}${"•".repeat(Math.min(Math.max(local.length - 1, 2), 6))}@${domain}`;
}

export function createPendingTransaction(
  input: Omit<PendingAuthTransaction, "version" | "expiresAt">,
  now = Date.now(),
): PendingAuthTransaction {
  return { version: 1, ...input, email: normalizeEmail(input.email), expiresAt: now + authTransactionTtlMs };
}

export function parsePendingTransaction(value: string | null, now = Date.now()): PendingAuthTransaction | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as Partial<PendingAuthTransaction>;
    if (
      parsed.version !== 1
      || (parsed.mode !== "join" && parsed.mode !== "sign-in")
      || typeof parsed.email !== "string"
      || !parsed.email.includes("@")
      || typeof parsed.expiresAt !== "number"
      || parsed.expiresAt <= now
      || (parsed.mode === "join" && (typeof parsed.displayName !== "string" || typeof parsed.redemptionToken !== "string"))
    ) return null;
    return {
      version: 1,
      mode: parsed.mode,
      email: normalizeEmail(parsed.email),
      displayName: parsed.mode === "join" ? parsed.displayName : undefined,
      redemptionToken: parsed.mode === "join" ? parsed.redemptionToken : undefined,
      expiresAt: parsed.expiresAt,
    };
  } catch {
    return null;
  }
}

export async function loadPendingTransaction(storage: AuthTransactionStorage, now = Date.now()) {
  const raw = await storage.getItem(authTransactionKey);
  const pending = parsePendingTransaction(raw, now);
  if (raw && !pending) await storage.removeItem(authTransactionKey);
  return pending;
}

export async function savePendingTransaction(storage: AuthTransactionStorage, pending: PendingAuthTransaction) {
  await storage.setItem(authTransactionKey, JSON.stringify(pending));
}

export async function clearPendingTransaction(storage: AuthTransactionStorage) {
  await storage.removeItem(authTransactionKey);
}
