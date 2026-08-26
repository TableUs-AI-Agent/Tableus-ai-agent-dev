import { ApiError } from "@tableus/api-client";
import type { Session } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";
import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AppState } from "react-native";

import { api } from "@/lib/api";
import { applyAuthAppState, performSignOutCleanup, shouldClearQueryCache } from "@/lib/auth-lifecycle";
import { resolveApproval, startAuthTransaction } from "@/lib/auth-operations";
import {
  clearPendingTransaction,
  loadPendingTransaction,
  savePendingTransaction,
  type AuthMode,
  type PendingAuthTransaction,
} from "@/lib/auth-transaction";
import { isSupabaseConfigured, secureAuthStorage, supabase } from "@/lib/supabase";
import { captureTelemetry } from "@/lib/telemetry";

export type AuthPhase = "loading" | "signed_out" | "pending_verification" | "redeem_pending" | "approved";
type Profile = { id: string; display_name: string; share_taste: boolean };

type AuthContextValue = {
  phase: AuthPhase;
  approved: boolean;
  busy: boolean;
  error: string;
  pending: PendingAuthTransaction | null;
  profile: Profile | null;
  beginJoin: (input: { invite: string; email: string; displayName: string }) => Promise<void>;
  beginSignIn: (email: string) => Promise<void>;
  verifyCode: (code: string) => Promise<void>;
  finishApproval: () => Promise<void>;
  cancelPending: () => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function safeMessage(error: unknown, fallback: string) {
  if (error instanceof ApiError && error.status > 0) return error.message;
  return fallback;
}

export function AuthProvider({ children }: PropsWithChildren) {
  const queryClient = useQueryClient();
  const [phase, setPhase] = useState<AuthPhase>(isSupabaseConfigured ? "loading" : "approved");
  const [session, setSession] = useState<Session | null>(null);
  const [pending, setPending] = useState<PendingAuthTransaction | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const subjectRef = useRef<string | null>(null);
  const pendingRef = useRef<PendingAuthTransaction | null>(null);
  const phaseRef = useRef<AuthPhase>(phase);

  const updatePhase = useCallback((next: AuthPhase) => {
    phaseRef.current = next;
    setPhase(next);
  }, []);

  const updatePending = useCallback((next: PendingAuthTransaction | null) => {
    pendingRef.current = next;
    setPending(next);
  }, []);

  const observeSession = useCallback((next: Session | null) => {
    const nextSubject = next?.user.id ?? null;
    if (shouldClearQueryCache(subjectRef.current, nextSubject)) queryClient.clear();
    subjectRef.current = nextSubject;
    setSession(next);
  }, [queryClient]);

  const clearStoredPending = useCallback(async () => {
    await clearPendingTransaction(secureAuthStorage);
    updatePending(null);
  }, [updatePending]);

  const rejectUnapprovedSession = useCallback(async (message: string) => {
    await clearStoredPending();
    await supabase.auth.signOut({ scope: "local" });
    observeSession(null);
    setProfile(null);
    setError(message);
    updatePhase("signed_out");
  }, [clearStoredPending, observeSession, updatePhase]);

  const completeApproval = useCallback(async (transaction: PendingAuthTransaction | null) => {
    const result = await resolveApproval(transaction, {
      redeem: (body) => api.post<Profile>("/api/v1/access/redeem", body),
      getProfile: () => api.get<Profile>("/api/v1/me"),
    });
    if (result.kind === "approved") {
      await clearStoredPending();
      setProfile(result.profile);
      setError("");
      updatePhase("approved");
      captureTelemetry("auth_approved", { mode: transaction?.mode === "join" ? "signup" : "sign_in" });
      await queryClient.invalidateQueries();
      return true;
    }
    if (result.kind === "unapproved") {
      await rejectUnapprovedSession("This email has not joined the TableUs beta yet. Join with an invite first.");
      return false;
    }
    if (result.kind === "invalid_invite") {
      await rejectUnapprovedSession("Invite validation expired or can no longer be used. Start again with a valid invite.");
      return false;
    }
    setError(safeMessage(result.error, "Could not finish authentication. Reconnect and try again."));
    updatePhase("redeem_pending");
    return false;
  }, [clearStoredPending, queryClient, rejectUnapprovedSession, updatePhase]);

  const finishApproval = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    setBusy(true);
    setError("");
    try {
      const currentSession = session ?? (await supabase.auth.getSession()).data.session;
      if (!currentSession) {
        updatePhase(pendingRef.current ? "pending_verification" : "signed_out");
        setError("Your verification session is missing. Enter a current email code or start again.");
        return;
      }
      observeSession(currentSession);
      await completeApproval(pendingRef.current);
    } finally {
      setBusy(false);
    }
  }, [completeApproval, observeSession, session, updatePhase]);

  const begin = useCallback(async (mode: AuthMode, input: { invite?: string; email: string; displayName?: string }) => {
    setBusy(true);
    setError("");
    try {
      const transaction = await startAuthTransaction(mode, input, {
        validateInvite: (body) => api.post<{ redemption_token: string }>("/api/v1/access/validate", body),
        sendCode: async ({ email, shouldCreateUser }) => {
          const { error: otpError } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser } });
          if (otpError) throw otpError;
        },
      });
      await savePendingTransaction(secureAuthStorage, transaction);
      updatePending(transaction);
      updatePhase("pending_verification");
    } catch (caught) {
      setError(safeMessage(caught, "Could not send a verification code. Check the details and try again."));
    } finally {
      setBusy(false);
    }
  }, [updatePending, updatePhase]);

  const beginJoin = useCallback(
    (input: { invite: string; email: string; displayName: string }) => begin("join", input),
    [begin],
  );
  const beginSignIn = useCallback((email: string) => begin("sign-in", { email }), [begin]);

  const verifyCode = useCallback(async (code: string) => {
    const transaction = pendingRef.current;
    if (!transaction) {
      setError("Verification details expired. Start again.");
      updatePhase("signed_out");
      return;
    }
    setBusy(true);
    setError("");
    const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email: transaction.email,
        token: code.trim(),
        type: "email",
      });
    if (verifyError || !data.session) {
      setError("The verification code is invalid or expired. Check the newest email and try again.");
      updatePhase("pending_verification");
      setBusy(false);
      return;
    }
    observeSession(data.session);
    updatePhase("redeem_pending");
    try {
      await completeApproval(transaction);
    } finally {
      setBusy(false);
    }
  }, [completeApproval, observeSession, updatePhase]);

  const cancelPending = useCallback(async () => {
    setBusy(true);
    try {
      await clearStoredPending();
      if (session) await supabase.auth.signOut({ scope: "local" });
      observeSession(null);
      setProfile(null);
      setError("");
      updatePhase("signed_out");
    } finally {
      setBusy(false);
    }
  }, [clearStoredPending, observeSession, session, updatePhase]);

  const signOut = useCallback(async () => {
    setBusy(true);
    try {
      await performSignOutCleanup({
        clearPending: clearStoredPending,
        signOut: async () => { await supabase.auth.signOut(); },
        clearCache: () => queryClient.clear(),
      });
      observeSession(null);
      setProfile(null);
      setError("");
      updatePhase("signed_out");
    } finally {
      setBusy(false);
    }
  }, [clearStoredPending, observeSession, queryClient, updatePhase]);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let active = true;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!active) return;
      observeSession(nextSession);
      if (event === "SIGNED_OUT") {
        void clearPendingTransaction(secureAuthStorage);
        updatePending(null);
        setProfile(null);
        updatePhase("signed_out");
        queryClient.clear();
      }
    });

    void (async () => {
      const [storedPending, sessionResult] = await Promise.all([
        loadPendingTransaction(secureAuthStorage),
        supabase.auth.getSession(),
      ]);
      if (!active) return;
      updatePending(storedPending);
      const restoredSession = sessionResult.data.session;
      observeSession(restoredSession);
      if (restoredSession) {
        updatePhase("redeem_pending");
        await completeApproval(storedPending);
      } else {
        updatePhase(storedPending ? "pending_verification" : "signed_out");
      }
    })();

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [completeApproval, observeSession, queryClient, updatePending, updatePhase]);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    void applyAuthAppState(AppState.currentState, supabase.auth);
    const subscription = AppState.addEventListener("change", (nextState) => {
      void applyAuthAppState(nextState, supabase.auth);
      if (nextState === "active") {
        if (phaseRef.current === "approved") void queryClient.invalidateQueries();
        else if (phaseRef.current === "redeem_pending") void finishApproval();
      }
    });
    return () => {
      subscription.remove();
      void supabase.auth.stopAutoRefresh();
    };
  }, [finishApproval, queryClient]);

  const value = useMemo<AuthContextValue>(() => ({
    phase,
    approved: !isSupabaseConfigured || phase === "approved",
    busy,
    error,
    pending,
    profile,
    beginJoin,
    beginSignIn,
    verifyCode,
    finishApproval,
    cancelPending,
    signOut,
    clearError: () => setError(""),
  }), [beginJoin, beginSignIn, busy, cancelPending, error, finishApproval, pending, phase, profile, signOut, verifyCode]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used within AuthProvider");
  return value;
}
