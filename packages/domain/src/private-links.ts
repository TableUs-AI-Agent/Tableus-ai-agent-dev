/** Private capabilities must never be used as router or persisted state. */
export const PENDING_JOIN_TTL_MS = 20 * 60 * 1000;

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

export type PendingJoin = Readonly<{
  handle: string;
  planId: string;
  expiresAt: number;
  subject: string | null;
}>;

type StoreOptions = {
  createHandle: () => string;
  now?: () => number;
  ttlMs?: number;
};

/** One process-local flow; snapshots deliberately never include the secret. */
export class PendingJoinStore {
  private snapshot: PendingJoin | null = null;
  private token: string | null = null;
  private subject: string | null = null;
  private listeners = new Set<() => void>();
  private timer: ReturnType<typeof setTimeout> | undefined;
  private readonly now: () => number;
  private readonly createHandle: () => string;
  private readonly ttlMs: number;

  constructor(options: StoreOptions) {
    this.now = options.now ?? Date.now;
    this.createHandle = options.createHandle;
    this.ttlMs = options.ttlMs ?? PENDING_JOIN_TTL_MS;
    if (!Number.isFinite(this.ttlMs) || this.ttlMs <= 0 || this.ttlMs > PENDING_JOIN_TTL_MS) {
      throw new Error("Invalid pending-link lifetime");
    }
  }

  getSnapshot = (): PendingJoin | null => this.snapshot;

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  };

  private emit(): void {
    for (const listener of this.listeners) listener();
  }

  capture(planId: string, token: string): PendingJoin {
    // Invalid new links must not leave an older capability available behind them.
    this.clear();
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(planId)) {
      throw new Error("This private link is invalid.");
    }
    const validToken = validateJoinToken(token);
    const handle = this.createHandle();
    if (!/^[A-Za-z0-9_-]{8,200}$/.test(handle)) throw new Error("Invalid local link handle");
    this.token = validToken;
    this.snapshot = Object.freeze({ handle, planId, expiresAt: this.now() + this.ttlMs, subject: this.subject });
    this.timer = setTimeout(() => { this.clear(handle); }, this.ttlMs);
    // Node test consumers must not be held open by a process-local expiry timer.
    (this.timer as unknown as { unref?: () => void }).unref?.();
    this.emit();
    return this.snapshot;
  }

  setSubject(subject: string | null): void {
    const current = this.snapshot;
    this.subject = subject;
    if (!current) return;
    if (current.expiresAt <= this.now() || (current.subject !== null && current.subject !== subject)) {
      this.clear(current.handle);
    } else if (current.subject === null && subject !== null) {
      this.snapshot = Object.freeze({ ...current, subject });
      this.emit();
    }
  }

  read(handle: string, subject: string): string | null {
    const current = this.snapshot;
    if (!current || current.handle !== handle) return null;
    if (current.expiresAt <= this.now()) {
      this.clear(handle);
      return null;
    }
    // Auth adapters bind the store before dispatch; stale callers cannot rebind it.
    if (!subject || current.subject !== subject || this.subject !== subject) return null;
    return this.token;
  }

  clear(handle?: string): void {
    if (handle !== undefined && this.snapshot?.handle !== handle) return;
    if (this.timer !== undefined) clearTimeout(this.timer);
    this.timer = undefined;
    this.token = null;
    if (this.snapshot === null) return;
    this.snapshot = null;
    this.emit();
  }
}
