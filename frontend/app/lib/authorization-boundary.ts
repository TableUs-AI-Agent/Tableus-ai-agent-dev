type AuthorizationBoundaryListener = (status: 401 | 403) => void;

const listeners = new Set<AuthorizationBoundaryListener>();

export function notifyAuthorizationBoundary(status: 401 | 403) {
  for (const listener of listeners) listener(status);
}

export function subscribeAuthorizationBoundary(listener: AuthorizationBoundaryListener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
