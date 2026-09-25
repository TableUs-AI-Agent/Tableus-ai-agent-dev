import { createIdempotencyKey } from "@tableus/api-client";
import { PendingJoinStore } from "@tableus/domain";

// Process memory only. The handle is a router reference, never server authority.
export const pendingJoinStore = new PendingJoinStore({ createHandle: createIdempotencyKey });
