export type AuthRefreshLifecycle = {
  startAutoRefresh: () => Promise<unknown>;
  stopAutoRefresh: () => Promise<unknown>;
};

export function applyAuthAppState(state: string, lifecycle: AuthRefreshLifecycle) {
  return state === "active" ? lifecycle.startAutoRefresh() : lifecycle.stopAutoRefresh();
}

export function shouldClearQueryCache(previousSubject: string | null, nextSubject: string | null) {
  return previousSubject !== null && previousSubject !== nextSubject;
}

export async function performSignOutCleanup(dependencies: {
  clearPending: () => Promise<void>;
  signOut: () => Promise<void>;
  clearCache: () => void;
}) {
  await dependencies.clearPending();
  await dependencies.signOut();
  dependencies.clearCache();
}
