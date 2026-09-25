import { pendingJoinStore } from "./pending-join.ts";

export type PendingJoinAttempt = Readonly<{
  handle: string;
  planId: string;
  subject: string;
  idempotencyKey: string;
  status: "joining" | "unknown" | "checking" | "retry_ready" | "blocked";
  message: string;
}>;

let attempt: PendingJoinAttempt | null = null;
const listeners = new Set<() => void>();
const emit = () => { for (const listener of listeners) listener(); };

// This metadata contains no capability. It lasts only while the process-local
// pending link exists, so remounting cannot turn an uncertain POST into a new one.
export const pendingJoinAttempt = {
  getSnapshot: () => attempt,
  subscribe: (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; },
  start: (next: Omit<PendingJoinAttempt, "status" | "message">) => {
    attempt = Object.freeze({ ...next, status: "joining" as const, message: "" });
    emit();
  },
  update: (handle: string, status: PendingJoinAttempt["status"], message: string) => {
    if (attempt?.handle !== handle) return;
    attempt = Object.freeze({ ...attempt, status, message });
    emit();
  },
  clear: (handle?: string) => {
    if (handle !== undefined && attempt?.handle !== handle) return;
    if (attempt === null) return;
    attempt = null;
    emit();
  },
};

pendingJoinStore.subscribe(() => {
  if (attempt && pendingJoinStore.getSnapshot()?.handle !== attempt.handle) pendingJoinAttempt.clear();
});
