"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { api, demoUser, isNotFound, setDemoUser } from "./api";
import { isSupabaseConfigured, supabase } from "./supabase-browser";

type Session = { status: "loading" } | { status: "signed-out" } | { status: "signed-in"; subject: string };

const SessionContext = createContext<{ session: Session; signOut: () => Promise<void>; refresh: () => void }>({
  session: { status: "loading" },
  signOut: async () => {},
  refresh: () => {},
});

export function SessionProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [session, setSession] = useState<Session>({ status: "loading" });

  const readDemo = useCallback(() => {
    const id = demoUser();
    setSession(id ? { status: "signed-in", subject: id } : { status: "signed-out" });
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      // The demo identity lives in localStorage, which only exists in the browser.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      readDemo();
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      const id = data.session?.user.id;
      setSession(id ? { status: "signed-in", subject: id } : { status: "signed-out" });
    });
    const { data } = supabase.auth.onAuthStateChange((_event, next) => {
      const id = next?.user.id;
      setSession((current) => {
        const changed = current.status !== "signed-in" || current.subject !== id;
        if (changed) queryClient.clear();
        return id ? { status: "signed-in", subject: id } : { status: "signed-out" };
      });
    });
    return () => data.subscription.unsubscribe();
  }, [queryClient, readDemo]);

  const signOut = useCallback(async () => {
    if (isSupabaseConfigured) await supabase.auth.signOut({ scope: "local" });
    else setDemoUser(null);
    queryClient.clear();
    setSession({ status: "signed-out" });
  }, [queryClient]);

  const refresh = useCallback(() => {
    queryClient.clear();
    if (!isSupabaseConfigured) readDemo();
  }, [queryClient, readDemo]);

  return <SessionContext.Provider value={{ session, signOut, refresh }}>{children}</SessionContext.Provider>;
}

export const useSession = () => useContext(SessionContext);

/** The signed-in person's profile; null means they still need to set one up. */
export function useMe() {
  const { session } = useSession();
  return useQuery({
    queryKey: ["me", session.status === "signed-in" ? session.subject : null],
    enabled: session.status === "signed-in",
    queryFn: async () => {
      try {
        return await api.me();
      } catch (error) {
        if (isNotFound(error)) return null;
        throw error;
      }
    },
  });
}

/**
 * Query keys scoped to the signed-in person. A request that finishes after an
 * account switch writes under the old person's keys, never into the new one's view.
 */
export function useKeys() {
  const { session } = useSession();
  const subject = session.status === "signed-in" ? session.subject : "signed-out";
  return useMemo(() => ({
    plans: ["plans", subject] as const,
    plan: (id: string) => ["plan", subject, id] as const,
  }), [subject]);
}
