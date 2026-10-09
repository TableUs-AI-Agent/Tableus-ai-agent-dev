import { ApiError, withAuthTimeout } from "@tableus/api-client";
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
import type { AccountDeletionStatus } from "@/lib/account-controls";
import { applyAuthAppState, performSignOutCleanup, shouldClearQueryCache } from "@/lib/auth-lifecycle";
import { AuthIdentityMismatchError, confirmJoinIdentity, resolveApproval, startAuthTransaction } from "@/lib/auth-operations";
import {
  clearPendingTransaction,
  createPendingTransaction,
  loadPendingTransaction,
  savePendingTransaction,
  type AuthMode,
  type PendingAuthTransaction,
} from "@/lib/auth-transaction";
import { isSupabaseConfigured, secureAuthStorage, supabase } from "@/lib/supabase";
import { captureTelemetry } from "@/lib/telemetry";
import { pendingJoinStore } from "@/lib/pending-join";

export type AuthPhase = "loading" | "restore_failed" | "signed_out" | "pending_verification" | "redeem_pending" | "invite_required" | "approved" | "deletion";
type Profile = { id: string; display_name: string; share_taste: boolean };

type AuthContextValue = {
  phase: AuthPhase;
  approved: boolean;
  busy: boolean;
  error: string;
  pending: PendingAuthTransaction | null;
  profile: Profile | null;
  subject: string | null;
  deletionStatus: AccountDeletionStatus | null;
  beginDeletion: (subject: string) => void;
  setDeletionOutcome: (subject: string, status: AccountDeletionStatus) => void;
  refreshDeletionStatus: () => Promise<void>;
  beginJoin: (input: { invite: string; email: string; displayName: string }) => Promise<void>;
  beginSignIn: (email: string) => Promise<void>;
  verifyCode: (code: string) => Promise<void>;
  recoveryEmail: string | null;
  finishApproval: (input?: { invite: string; displayName: string }) => Promise<void>;
  retryRestore: () => void;
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
  const [recoveryEmail, setRecoveryEmail] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [deletionStatus, setDeletionStatus] = useState<AccountDeletionStatus | null>(null);
  const [deletionSubject, setDeletionSubject] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [restoreAttempt, setRestoreAttempt] = useState(0);
  const subjectRef = useRef<string | null>(null);
  const deletionSubjectRef = useRef<string | null>(null);
  const pendingRef = useRef<PendingAuthTransaction | null>(null);
  const approvalBusyRef = useRef(false);
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
    pendingJoinStore.setSubject(nextSubject);
    if (shouldClearQueryCache(subjectRef.current, nextSubject)) queryClient.clear();
    if (nextSubject && subjectRef.current !== nextSubject) {
      setDeletionStatus(null);
      setDeletionSubject(null);
      deletionSubjectRef.current = null;
    }
    if (subjectRef.current !== nextSubject) setRecoveryEmail(null);
    subjectRef.current = nextSubject;
    setSession(next);
  }, [queryClient]);

  const beginDeletion = useCallback((subject: string) => {
    if (subjectRef.current !== null && subjectRef.current !== subject) return;
    pendingJoinStore.clear();
    deletionSubjectRef.current = subject;
    setDeletionSubject(subject);
    setProfile(null);
    setDeletionStatus(null);
    queryClient.clear();
    updatePhase("deletion");
  }, [queryClient, updatePhase]);

  const setDeletionOutcome = useCallback((subject: string, status: AccountDeletionStatus) => {
    if (subjectRef.current !== subject && deletionSubjectRef.current !== subject) return;
    deletionSubjectRef.current = subject;
    setDeletionSubject(subject);
    setProfile(null);
    setDeletionStatus(status);
    setError("");
    queryClient.clear();
    updatePhase("deletion");
  }, [queryClient, updatePhase]);

  const refreshDeletionStatus = useCallback(async () => {
    const subject = subjectRef.current ?? deletionSubjectRef.current;
    if (!subject) return;
    try {
      const status = await api.get<AccountDeletionStatus>("/api/v1/me/deletion", { expectedSubject: subject });
      if (subjectRef.current !== subject && deletionSubjectRef.current !== subject) return;
      setDeletionOutcome(subject, status);
    } catch (caught) {
      if (subjectRef.current !== subject && deletionSubjectRef.current !== subject) return;
      if (caught instanceof ApiError && caught.status === 404) {
        try {
          const currentProfile = await api.get<Profile>("/api/v1/me", { expectedSubject: subject });
          if (subjectRef.current !== subject) return;
          setDeletionStatus(null);
          setDeletionSubject(null);
          deletionSubjectRef.current = null;
          setProfile(currentProfile);
          setError("");
          updatePhase("approved");
          return;
        } catch { /* A missing profile must never restore private routes. */ }
      }
      setError("Could not confirm deletion status. Reconnect with this session, or contact support if it has expired.");
      updatePhase("deletion");
    }
  }, [setDeletionOutcome, updatePhase]);

  const clearStoredPending = useCallback(async () => {
    await clearPendingTransaction(secureAuthStorage);
    updatePending(null);
  }, [updatePending]);

  const rejectUnapprovedSession = useCallback(async (message: string, isCurrent: () => boolean) => {
    const rejectedSubject = subjectRef.current;
    pendingJoinStore.clear();
    await clearStoredPending();
    if (!isCurrent()) return;
    const { error: signOutError } = await supabase.auth.signOut({ scope: "local" });
    if (subjectRef.current && subjectRef.current !== rejectedSubject) return;
    if (signOutError) {
      setError("Could not sign out on this device. Reconnect and try again.");
      updatePhase("redeem_pending");
      return;
    }
    observeSession(null);
    setProfile(null);
    setDeletionStatus(null);
    setDeletionSubject(null);
    deletionSubjectRef.current = null;
    setError(message);
    updatePhase("signed_out");
  }, [clearStoredPending, observeSession, updatePhase]);

  const completeApproval = useCallback(async (transaction: PendingAuthTransaction | null, isCurrent: () => boolean = () => true) => {
    const approvalSubject = subjectRef.current;
    if (!approvalSubject) return false;
    let verifiedIdentity: { subject: string; email: string } | undefined;
    if (transaction?.mode === "join") {
      try {
        verifiedIdentity = await confirmJoinIdentity(() => supabase.auth.getUser(), approvalSubject, transaction);
        if (!isCurrent()) return false;
        if (!transaction.subject) {
          transaction = { ...transaction, subject: approvalSubject };
          await savePendingTransaction(secureAuthStorage, transaction);
          if (!isCurrent()) return false;
          updatePending(transaction);
        }
      } catch (caught) {
        if (!isCurrent()) return false;
        if (!(caught instanceof AuthIdentityMismatchError)) {
          try {
            const deletion = await api.get<AccountDeletionStatus>("/api/v1/me/deletion", { expectedSubject: approvalSubject });
            if (!isCurrent()) return false;
            setDeletionOutcome(approvalSubject, deletion);
            return false;
          } catch { /* Auth uncertainty does not establish deletion or membership. */ }
          if (!isCurrent()) return false;
        }
        setError(caught instanceof AuthIdentityMismatchError ? caught.message : "Could not confirm your verified email. Reconnect and try again.");
        updatePhase("redeem_pending");
        return false;
      }
    }
    const result = await resolveApproval(transaction, {
      redeem: (body) => api.post<Profile>("/api/v1/access/redeem", body, { expectedSubject: approvalSubject ?? undefined }),
      getProfile: () => api.get<Profile>("/api/v1/me", { expectedSubject: approvalSubject ?? undefined }),
    });
    if (!isCurrent()) return false;
    if (result.kind === "approved") {
      await clearStoredPending();
      if (!isCurrent()) return false;
      setProfile(result.profile);
      setDeletionStatus(null);
      setDeletionSubject(null);
      deletionSubjectRef.current = null;
      setError("");
      updatePhase("approved");
      captureTelemetry("auth_approved", { mode: transaction?.mode === "join" ? "signup" : "sign_in" });
      await queryClient.invalidateQueries();
      return true;
    }
    if (result.kind === "unapproved" || result.kind === "invite_required") {
      try {
        const deletion = await api.get<AccountDeletionStatus>("/api/v1/me/deletion", { expectedSubject: approvalSubject ?? undefined });
        if (!isCurrent()) return false;
        setDeletionOutcome(subjectRef.current ?? "", deletion);
        return false;
      } catch (caught) {
        if (!isCurrent()) return false;
        if (!(caught instanceof ApiError && (caught.status === 403 || caught.status === 404))) {
          setProfile(null);
          queryClient.clear();
          setError("Could not confirm account status. Reconnect with this session, or contact support if it has expired.");
          updatePhase("restore_failed");
          return false;
        }
      }
    }
    if (result.kind === "invite_required" || (result.kind === "unapproved" && !transaction)) {
      try {
        const identity = verifiedIdentity ?? await confirmJoinIdentity(() => supabase.auth.getUser(), approvalSubject, transaction);
        if (!isCurrent()) return false;
        setRecoveryEmail(identity.email);
        setError("Re-enter a valid invite to finish joining with your verified email. No new email code is needed.");
        updatePhase("invite_required");
      } catch (caught) {
        if (!isCurrent()) return false;
        setError(caught instanceof AuthIdentityMismatchError ? caught.message : "Could not confirm your verified email. Reconnect and try again.");
        updatePhase("redeem_pending");
      }
      return false;
    }
    if (result.kind === "unapproved") {
      await rejectUnapprovedSession("This email has not joined the TableUs beta yet. Join with an invite first.", isCurrent);
      return false;
    }
    setError(safeMessage(result.error, "Could not finish authentication. Reconnect and try again."));
    updatePhase("redeem_pending");
    return false;
  }, [clearStoredPending, queryClient, rejectUnapprovedSession, setDeletionOutcome, updatePending, updatePhase]);

  const finishApproval = useCallback(async (input?: { invite: string; displayName: string }) => {
    if (!isSupabaseConfigured || approvalBusyRef.current) return;
    approvalBusyRef.current = true;
    let initiatingSubject = subjectRef.current;
    const isCurrent = () => subjectRef.current === initiatingSubject;
    setBusy(true);
    setError("");
    try {
      const currentSession = session ?? await withAuthTimeout(async () => {
        const { data, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        return data.session;
      });
      if (!isCurrent()) return;
      if (!currentSession) {
        updatePhase(pendingRef.current ? "pending_verification" : "signed_out");
        setError("Your verification session is missing. Enter a current email code or start again.");
        return;
      }
      observeSession(currentSession);
      initiatingSubject = currentSession.user.id;
      const sameSession = () => subjectRef.current === currentSession.user.id;
      const approved = await completeApproval(pendingRef.current, sameSession);
      if (!sameSession() || approved || !input || phaseRef.current !== "invite_required") return;
      // Re-entry is explicit and only follows membership/deletion reconciliation.
      const identity = await confirmJoinIdentity(() => supabase.auth.getUser(), currentSession.user.id, pendingRef.current);
      if (!isCurrent()) return;
      const validated = await api.post<{ redemption_token: string }>("/api/v1/access/validate", {
        code: input.invite.trim(), email: identity.email,
      }, { expectedSubject: identity.subject });
      if (!isCurrent()) return;
      const transaction = createPendingTransaction({ mode: "join", email: identity.email,
        displayName: pendingRef.current?.displayName ?? input.displayName.trim(),
        redemptionToken: validated.redemption_token, subject: identity.subject });
      await savePendingTransaction(secureAuthStorage, transaction);
      if (!isCurrent()) return;
      updatePending(transaction);
      updatePhase("redeem_pending");
      await completeApproval(transaction, sameSession);
    } catch (caught) {
      if (!isCurrent()) return;
      setError(caught instanceof AuthIdentityMismatchError ? caught.message : safeMessage(caught, "Could not finish authentication. Reconnect and try again."));
      if (phaseRef.current !== "invite_required") updatePhase(session ? "redeem_pending" : "restore_failed");
    } finally {
      approvalBusyRef.current = false;
      setBusy(false);
    }
  }, [completeApproval, observeSession, session, updatePending, updatePhase]);

  const retryRestore = useCallback(() => {
    updatePhase("loading");
    setError("");
    setRestoreAttempt((attempt) => attempt + 1);
  }, [updatePhase]);

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
      await completeApproval(transaction, () => subjectRef.current === data.session?.user.id);
    } finally {
      setBusy(false);
    }
  }, [completeApproval, observeSession, updatePhase]);

  const cancelPending = useCallback(async () => {
    setBusy(true);
    try {
      pendingJoinStore.clear();
      await clearStoredPending();
      if (session) {
        const { error: signOutError } = await supabase.auth.signOut({ scope: "local" });
        if (signOutError) throw signOutError;
      }
      observeSession(null);
      setProfile(null);
      setDeletionStatus(null);
      setDeletionSubject(null);
      deletionSubjectRef.current = null;
      setError("");
      updatePhase("signed_out");
    } catch {
      setError("Could not sign out on this device. Reconnect and try again.");
    } finally {
      setBusy(false);
    }
  }, [clearStoredPending, observeSession, session, updatePhase]);

  const signOut = useCallback(async () => {
    setBusy(true);
    try {
      await performSignOutCleanup({
        clearPending: clearStoredPending,
        signOut: async () => {
          const { error: signOutError } = await supabase.auth.signOut({ scope: "local" });
          if (signOutError) throw signOutError;
        },
        clearCache: () => queryClient.clear(),
      });
      pendingJoinStore.clear();
      observeSession(null);
      setProfile(null);
      setDeletionStatus(null);
      setDeletionSubject(null);
      deletionSubjectRef.current = null;
      setError("");
      updatePhase("signed_out");
    } catch {
      setError("Could not sign out on this device. Reconnect and try again.");
    } finally {
      setBusy(false);
    }
  }, [clearStoredPending, observeSession, queryClient, updatePhase]);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let active = true;
    let restorationCancelled = false;
    let eventVersion = 0;
    const isCurrent = () => active && !restorationCancelled;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!active) return;
      // The bounded read below owns INITIAL_SESSION. No async SDK work inside
      // this callback: Supabase holds its auth lock while notifying listeners.
      if (event === "INITIAL_SESSION") return;
      const version = ++eventVersion;
      const previousSubject = subjectRef.current;
      const previousDeletionSubject = deletionSubjectRef.current;
      observeSession(nextSession);
      if (event === "SIGNED_OUT") {
        pendingJoinStore.clear();
        restorationCancelled = true;
        void clearPendingTransaction(secureAuthStorage);
        updatePending(null);
        setProfile(null);
        if (phaseRef.current !== "deletion") {
          setDeletionStatus(null);
          setDeletionSubject(null);
          updatePhase("signed_out");
        } else {
          setError("This session has ended. If deletion is still pending or unconfirmed, contact support.");
        }
        queryClient.clear();
      } else if (event === "SIGNED_IN" && (phaseRef.current === "loading" || phaseRef.current === "restore_failed" || phaseRef.current === "signed_out" || (previousSubject && nextSession && previousSubject !== nextSession.user.id) || (previousDeletionSubject && nextSession && previousDeletionSubject !== nextSession.user.id))) {
        restorationCancelled = true;
        setProfile(null);
        updatePhase("loading");
        setTimeout(() => { if (active && version === eventVersion) retryRestore(); }, 0);
      }
    });

    void withAuthTimeout(async () => {
      const [storedPending, sessionResult] = await Promise.all([
        loadPendingTransaction(secureAuthStorage),
        supabase.auth.getSession(),
      ]);
      if (sessionResult.error) throw sessionResult.error;
      return { storedPending, restoredSession: sessionResult.data.session };
    }).then(async ({ storedPending, restoredSession }) => {
      if (!isCurrent()) return;
      updatePending(storedPending);
      observeSession(restoredSession);
      if (restoredSession) {
        updatePhase("redeem_pending");
        await completeApproval(storedPending, () => isCurrent() && subjectRef.current === restoredSession.user.id);
      } else {
        updatePhase(storedPending ? "pending_verification" : "signed_out");
      }
    }).catch(() => {
      if (!isCurrent()) return;
      setError("Could not restore your session. Reconnect and try again.");
      updatePhase("restore_failed");
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [completeApproval, observeSession, queryClient, restoreAttempt, retryRestore, updatePending, updatePhase]);

  useEffect(() => {
    if (!isSupabaseConfigured) pendingJoinStore.setSubject(process.env.EXPO_PUBLIC_DEMO_USER_ID ?? "demo-organizer");
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    void applyAuthAppState(AppState.currentState, supabase.auth);
    const subscription = AppState.addEventListener("change", (nextState) => {
      void applyAuthAppState(nextState, supabase.auth);
      if (nextState === "active") {
        // AppProviders owns query refresh on foreground. Auth only resumes
        // unfinished approval here, avoiding a second invalidation/refetch.
        if (phaseRef.current === "redeem_pending") void finishApproval();
      }
    });
    return () => {
      subscription.remove();
      void supabase.auth.stopAutoRefresh();
    };
  }, [finishApproval]);

  const value = useMemo<AuthContextValue>(() => ({
    phase,
    approved: phase === "approved",
    busy,
    error,
    pending,
    profile,
    recoveryEmail,
    subject: session?.user.id ?? profile?.id ?? deletionSubject,
    deletionStatus,
    beginDeletion,
    setDeletionOutcome,
    refreshDeletionStatus,
    beginJoin,
    beginSignIn,
    verifyCode,
    finishApproval,
    retryRestore,
    cancelPending,
    signOut,
    clearError: () => setError(""),
  }), [beginDeletion, beginJoin, beginSignIn, busy, cancelPending, deletionStatus, deletionSubject, error, finishApproval, pending, phase, profile, recoveryEmail, refreshDeletionStatus, retryRestore, session, setDeletionOutcome, signOut, verifyCode]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used within AuthProvider");
  return value;
}
