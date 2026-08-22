export type ConnectivityOverride = "system" | "online" | "offline";

type NetInfoLike = {
  isConnected: boolean | null;
  isInternetReachable: boolean | null;
};

let connectivityOverride: ConnectivityOverride = "system";
const listeners = new Set<() => void>();

export function netInfoIsOnline(state: NetInfoLike) {
  return state.isConnected === true && state.isInternetReachable !== false;
}

export function effectiveOnline(systemOnline: boolean, override: ConnectivityOverride) {
  if (override === "online") return true;
  if (override === "offline") return false;
  return systemOnline;
}

export function getConnectivityOverride() {
  return connectivityOverride;
}

export function setConnectivityOverride(next: ConnectivityOverride) {
  connectivityOverride = next;
  for (const listener of listeners) listener();
}

export function subscribeConnectivityOverride(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

export function isConnectivityOverride(value: unknown): value is ConnectivityOverride {
  return value === "system" || value === "online" || value === "offline";
}
