"use client";

import { ApiError } from "@tableus/api-client";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { api } from "../lib/api";
import { isSupabaseConfigured, supabase } from "../lib/supabase-browser";
import { v1Api } from "../lib/v1-api";

type AppUser = { id: string; name: string; avatar: string };
type Profile = { id: string; display_name: string };
type Connection = { profile_id: string; display_name: string };
type UserState = "loading" | "approved" | "signed_out" | "error";

type UserContextValue = {
  currentUser: AppUser | null;
  userState: UserState;
  userError: string;
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

  useEffect(() => {
    let cancelled = false;
    if (isSupabaseConfigured) {
      let requestVersion = 0;
      const clearAuthenticatedUser = (nextState: UserState = "signed_out", message = "") => {
        requestVersion += 1;
        setCurrentUser(null);
        setAllUsers([]);
        setFriends([]);
        setUserState(nextState);
        setUserError(message);
      };
      const loadAuthenticatedUser = async () => {
        const version = ++requestVersion;
        setUserState("loading");
        setUserError("");
        try {
          const [profile, connections] = await Promise.all([
            v1Api.get<Profile>("/api/v1/me"),
            v1Api.get<Connection[]>("/api/v1/connections"),
          ]);
          if (cancelled || version !== requestVersion) return;
          const authenticatedUser = toAppUser(profile.id, profile.display_name);
          setCurrentUser(authenticatedUser);
          setAllUsers([authenticatedUser]);
          setFriends(connections.map((connection) => toAppUser(connection.profile_id, connection.display_name)));
          setUserState("approved");
        } catch (error) {
          if (cancelled || version !== requestVersion) return;
          if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
            clearAuthenticatedUser("signed_out");
          } else {
            clearAuthenticatedUser(
              "error",
              error instanceof Error ? error.message : "Unable to connect to TableUs.",
            );
          }
        }
      };

      void supabase.auth.getSession().then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          clearAuthenticatedUser("error", "Unable to restore this browser session.");
        } else if (data.session) {
          void loadAuthenticatedUser();
        } else {
          clearAuthenticatedUser("signed_out");
        }
      });
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!session) {
          clearAuthenticatedUser();
          return;
        }
        // Run after Supabase releases its auth-state callback lock so the API
        // client can safely read the newly persisted access token.
        setTimeout(() => {
          if (!cancelled) void loadAuthenticatedUser();
        }, 0);
      });
      return () => {
        cancelled = true;
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
  }, []);

  const loadFriends = useCallback((userId: string) => {
    api<AppUser[]>(`/api/friends/${userId}`)
      .then(setFriends)
      .catch(() => setFriends([]));
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
      v1Api.get<Connection[]>("/api/v1/connections")
        .then((connections) => setFriends(connections.map((connection) => toAppUser(connection.profile_id, connection.display_name))))
        .catch(() => setFriends([]));
    } else if (currentUser) {
      loadFriends(currentUser.id);
    }
  };

  return (
    <UserContext.Provider value={{ currentUser, userState, userError, allUsers, friends, canSwitchUser: !isSupabaseConfigured, switchUser, refreshFriends }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
