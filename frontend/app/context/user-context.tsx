"use client";

import { ApiError, withAuthTimeout } from "@tableus/api-client";
import type { AccountDeletionStatus } from "@tableus/domain";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { api } from "../lib/api";
import { isSupabaseConfigured, supabase } from "../lib/supabase-browser";
import { v1Api } from "../lib/v1-api";

type AppUser = { id: string; name: string; avatar: string };
type Profile = { id: string; display_name: string };
type Connection = { profile_id: string; display_name: string };
export type { AccountDeletionStatus } from "@tableus/domain";
type UserState = "loading" | "approved" | "deleting" | "signed_out" | "error";

type UserContextValue = {
  currentUser: AppUser | null;
  userState: UserState;
  userError: string;
  refreshUser: (subject: string) => Promise<void>;
  deletionStatus: AccountDeletionStatus | null;
  deletionSubject: string | null;
  deletionRequestKey: string | null;
  deletionRequestInFlight: boolean;
  deletionSessionAvailable: boolean;
  recordDeletion: (subject: string, status: AccountDeletionStatus | null, key?: string, inFlight?: boolean) => void;
  refreshDeletion: () => Promise<void>;
  allUsers: AppUser[];
  friends: AppUser[];
  canSwitchUser: boolean;
  switchUser: (id: string) => void;
  refreshFriends: () => void;
};

const UserContext = createContext<UserContextValue>({
  currentUser: null,
  userState: "loading",
  userError: "",
  refreshUser: async () => {},
  deletionStatus: null,
  deletionSubject: null,
  deletionRequestKey: null,
  deletionRequestInFlight: false,
  deletionSessionAvailable: false,
  recordDeletion: () => {},
  refreshDeletion: async () => {},
  allUsers: [],
  friends: [],
  canSwitchUser: false,
  switchUser: () => {},
  refreshFriends: () => {},
});

const toAppUser = (id: string, name: string): AppUser => ({ id, name, avatar: "/icon.svg" });

export function UserProvider({ children }: { children: ReactNode }) {
  const [allUsers, setAllUsers] = useState<AppUser[]>([]);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [friends, setFriends] = useState<AppUser[]>([]);
  const [userState, setUserState] = useState<UserState>("loading");
  const [userError, setUserError] = useState("");
  const [deletionStatus, setDeletionStatus] = useState<AccountDeletionStatus | null>(null);
  const [deletionSubject, setDeletionSubject] = useState<string | null>(null);
  const [deletionRequestKey, setDeletionRequestKey] = useState<string | null>(null);
  const [deletionRequestInFlight, setDeletionRequestInFlight] = useState(false);
  const [deletionSessionAvailable, setDeletionSessionAvailable] = useState(false);
  const sessionSubject = useRef<string | null>(null);
  const knownDeletion = useRef<{ subject: string; status: AccountDeletionStatus | null; key: string | null } | null>(null);
  const requestVersion = useRef(0);
  const loadUser = useRef<((subject: string) => Promise<void>) | null>(null);

  const refreshUser = useCallback(async (subject: string) => {
    if (!loadUser.current || sessionSubject.current !== subject) throw new Error("Session changed during sign-in. Please try again.");
    await loadUser.current(subject);
    if (sessionSubject.current !== subject) throw new Error("Session changed during sign-in. Please try again.");
  }, []);

  const recordDeletion = useCallback((subject: string, status: AccountDeletionStatus | null, key?: string, inFlight = false) => {
    if (isSupabaseConfigured && sessionSubject.current !== subject
      && !(sessionSubject.current === null && knownDeletion.current?.subject === subject)) return;
    const retainedKey = key ?? (knownDeletion.current?.subject === subject ? knownDeletion.current.key : null) ?? null;
    knownDeletion.current = { subject, status, key: retainedKey };
    requestVersion.current += 1;
    setCurrentUser(null);
    setAllUsers([]);
    setFriends([]);
    setDeletionStatus(status);
    setDeletionSubject(subject);
    setDeletionRequestKey(retainedKey);
    setDeletionRequestInFlight(inFlight);
    setDeletionSessionAvailable(!isSupabaseConfigured || sessionSubject.current === subject);
    setUserState("deleting");
    setUserError("");
  }, []);

  const refreshDeletion = useCallback(async () => {
    const subject = knownDeletion.current?.subject;
    if (!subject || deletionRequestInFlight || (isSupabaseConfigured && sessionSubject.current !== subject)) return;
    const version = ++requestVersion.current;
    try {
      const status = await v1Api.get<AccountDeletionStatus>("/api/v1/me/deletion", { expectedSubject: subject });
      if (version !== requestVersion.current || (isSupabaseConfigured && sessionSubject.current !== subject)) return;
      knownDeletion.current = { subject, status, key: knownDeletion.current?.key ?? null };
      setDeletionStatus(status);
      setUserError("");
    } catch (error) {
      if (version !== requestVersion.current || (isSupabaseConfigured && sessionSubject.current !== subject)) return;
      setUserError(error instanceof ApiError && error.status === 404 && knownDeletion.current?.status === null
        ? "No deletion request is recorded. Return to account settings to retry your original request."
        : "Unable to confirm deletion status. Reconnect and retry, or contact support.");
    }
  }, [deletionRequestInFlight]);

  useEffect(() => {
    let cancelled = false;
    if (isSupabaseConfigured) {
      const clearAuthenticatedUser = (nextState: UserState = "signed_out", message = "") => {
        requestVersion.current += 1;
        setCurrentUser(null);
        setAllUsers([]);
        setFriends([]);
        setUserState(nextState);
        setUserError(message);
      };
      const loadAuthenticatedUser = async (subject: string) => {
        const version = ++requestVersion.current;
        setUserState("loading");
        setUserError("");
        try {
          const [profile, connections] = await Promise.all([
            v1Api.get<Profile>("/api/v1/me", { expectedSubject: subject }),
            v1Api.get<Connection[]>("/api/v1/connections", { expectedSubject: subject }),
          ]);
          if (cancelled || version !== requestVersion.current || sessionSubject.current !== subject) return;
          knownDeletion.current = null;
          setDeletionStatus(null);
          setDeletionSubject(null);
          setDeletionRequestKey(null);
          setDeletionRequestInFlight(false);
          setDeletionSessionAvailable(false);
          const authenticatedUser = toAppUser(profile.id, profile.display_name);
          setCurrentUser(authenticatedUser);
          setAllUsers([authenticatedUser]);
          setFriends(connections.map((connection) => toAppUser(connection.profile_id, connection.display_name)));
          setUserState("approved");
        } catch (error) {
          if (cancelled || version !== requestVersion.current || sessionSubject.current !== subject) return;
          if (error instanceof ApiError && error.status === 403) {
            try {
              const status = await v1Api.get<AccountDeletionStatus>("/api/v1/me/deletion", { expectedSubject: subject });
              if (cancelled || version !== requestVersion.current || sessionSubject.current !== subject) return;
              recordDeletion(subject, status);
            } catch (statusError) {
              if (cancelled || version !== requestVersion.current || sessionSubject.current !== subject) return;
              if (knownDeletion.current?.subject === subject) {
                recordDeletion(subject, knownDeletion.current.status);
                setUserError("Unable to confirm deletion status. Reconnect and retry, or contact support.");
              } else if (statusError instanceof ApiError && (statusError.status === 403 || statusError.status === 404)) {
                clearAuthenticatedUser("signed_out");
              } else {
                clearAuthenticatedUser("error", "Unable to confirm account status. Reconnect and retry.");
              }
            }
          } else if (error instanceof ApiError && error.status === 401) {
            clearAuthenticatedUser("signed_out");
          } else {
            clearAuthenticatedUser(
              "error",
              error instanceof Error ? error.message : "Unable to connect to TableUs.",
            );
          }
        }
      };

      // Invitation redemption can finish after the SIGNED_IN membership read.
      // Reuse its version/subject guards when auth explicitly reloads approval.
      loadUser.current = loadAuthenticatedUser;

      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        // The bounded startup read owns INITIAL_SESSION and its failure state.
        if (cancelled || event === "INITIAL_SESSION") return;
        const version = ++requestVersion.current;
        const nextSubject = session?.user.id ?? null;
        if (nextSubject && nextSubject !== sessionSubject.current) {
          knownDeletion.current = null;
          setDeletionStatus(null);
          setDeletionSubject(null);
          setDeletionRequestKey(null);
          setDeletionRequestInFlight(false);
          setUserError("");
        }
        sessionSubject.current = nextSubject;
        if (!session) {
          if (knownDeletion.current) {
            clearAuthenticatedUser("deleting");
            setDeletionStatus(knownDeletion.current.status);
            setDeletionSessionAvailable(false);
          } else clearAuthenticatedUser();
          return;
        }
        if (knownDeletion.current?.subject === session.user.id) {
          setDeletionSessionAvailable(true);
          setUserState("deleting");
          return;
        }
        // Run after Supabase releases its auth-state callback lock so the API
        // client can safely read the newly persisted access token.
        setTimeout(() => {
          if (!cancelled && version === requestVersion.current) void loadAuthenticatedUser(session.user.id);
        }, 0);
      });
      const restorationVersion = ++requestVersion.current;
      void withAuthTimeout(async () => {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        return data.session;
      }).then((session) => {
        if (cancelled || restorationVersion !== requestVersion.current) return;
        sessionSubject.current = session?.user.id ?? null;
        if (session) void loadAuthenticatedUser(session.user.id);
        else clearAuthenticatedUser("signed_out");
      }).catch(() => {
        if (cancelled || restorationVersion !== requestVersion.current) return;
        clearAuthenticatedUser("error", "Unable to restore this browser session. Reconnect and retry.");
      });
      return () => {
        cancelled = true;
        loadUser.current = null;
        subscription.unsubscribe();
      };
    }

    api<AppUser[]>("/api/users")
      .then((users) => {
        if (cancelled) return;
        setAllUsers(users);
        if (users.length > 0) {
          setCurrentUser(users[0]);
          setUserState("approved");
        }
      })
      .catch(() => {
        if (cancelled) return;
        const fallback: AppUser[] = [
          { id: "user-sam", name: "Sam Kwak", avatar: "https://randomuser.me/api/portraits/men/32.jpg" },
          { id: "user-bob", name: "Bob Martinez", avatar: "https://randomuser.me/api/portraits/men/41.jpg" },
          { id: "user-carol", name: "Carol Washington", avatar: "https://randomuser.me/api/portraits/women/52.jpg" },
          { id: "user-william", name: "William Kang", avatar: "https://randomuser.me/api/portraits/men/68.jpg" },
          { id: "user-maya", name: "Maya Patel", avatar: "https://randomuser.me/api/portraits/women/64.jpg" },
          { id: "user-nina", name: "Nina Okonkwo", avatar: "https://randomuser.me/api/portraits/women/89.jpg" },
        ];
        setAllUsers(fallback);
        setCurrentUser(fallback[0]);
        setUserState("approved");
      });
    return () => {
      cancelled = true;
    };
  }, [recordDeletion]);

  const loadFriends = useCallback((userId: string) => {
    const version = requestVersion.current;
    api<AppUser[]>(`/api/friends/${userId}`)
      .then((next) => { if (version === requestVersion.current) setFriends(next); })
      .catch(() => { if (version === requestVersion.current) setFriends([]); });
  }, []);

  useEffect(() => {
    if (currentUser && !isSupabaseConfigured) loadFriends(currentUser.id);
  }, [currentUser, loadFriends]);

  const switchUser = (id: string) => {
    if (isSupabaseConfigured) return;
    const user = allUsers.find((item) => item.id === id);
    if (user) setCurrentUser(user);
  };

  const refreshFriends = () => {
    if (isSupabaseConfigured) {
      const subject = sessionSubject.current;
      const version = requestVersion.current;
      v1Api.get<Connection[]>("/api/v1/connections", subject ? { expectedSubject: subject } : undefined)
        .then((connections) => { if (version === requestVersion.current && subject === sessionSubject.current && userState === "approved") setFriends(connections.map((connection) => toAppUser(connection.profile_id, connection.display_name))); })
        .catch(() => { if (version === requestVersion.current && subject === sessionSubject.current && userState === "approved") setFriends([]); });
    } else if (currentUser) {
      loadFriends(currentUser.id);
    }
  };

  return (
    <UserContext.Provider value={{ currentUser, userState, userError, refreshUser, deletionStatus, deletionSubject, deletionRequestKey, deletionRequestInFlight, deletionSessionAvailable, recordDeletion, refreshDeletion, allUsers, friends, canSwitchUser: !isSupabaseConfigured, switchUser, refreshFriends }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
