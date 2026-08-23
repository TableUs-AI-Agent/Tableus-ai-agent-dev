import NetInfo from "@react-native-community/netinfo";
import { onlineManager } from "@tanstack/react-query";
import { createContext, type PropsWithChildren, useContext, useEffect, useMemo, useState } from "react";

import {
  effectiveOnline,
  getConnectivityOverride,
  netInfoIsOnline,
  subscribeConnectivityOverride,
  type ConnectivityOverride,
} from "@/lib/connectivity";

type ConnectivityContextValue = {
  isOnline: boolean;
  override: ConnectivityOverride;
};

const ConnectivityContext = createContext<ConnectivityContextValue | null>(null);

export function ConnectivityProvider({ children }: PropsWithChildren) {
  const [systemOnline, setSystemOnline] = useState(true);
  const [override, setOverride] = useState(getConnectivityOverride);

  useEffect(() => {
    void NetInfo.fetch()
      .then((state) => setSystemOnline(netInfoIsOnline(state)))
      .catch(() => setSystemOnline(false));
    return NetInfo.addEventListener((state) => setSystemOnline(netInfoIsOnline(state)));
  }, []);

  useEffect(() => subscribeConnectivityOverride(() => setOverride(getConnectivityOverride())), []);

  const isOnline = effectiveOnline(systemOnline, override);
  useEffect(() => onlineManager.setOnline(isOnline), [isOnline]);

  const value = useMemo(() => ({ isOnline, override }), [isOnline, override]);
  return <ConnectivityContext.Provider value={value}>{children}</ConnectivityContext.Provider>;
}

export function useConnectivity() {
  const value = useContext(ConnectivityContext);
  if (!value) throw new Error("useConnectivity must be used within ConnectivityProvider");
  return value;
}
