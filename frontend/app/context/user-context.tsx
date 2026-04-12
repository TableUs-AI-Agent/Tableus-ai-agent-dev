"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { api } from "../lib/api";

type DemoUser = { id: string; name: string; avatar: string };

type UserContextValue = {
  currentUser: DemoUser | null;
  allUsers: DemoUser[];
  friends: DemoUser[];
  switchUser: (id: string) => void;
  refreshFriends: () => void;
};

const UserContext = createContext<UserContextValue>({
  currentUser: null,
  allUsers: [],
  friends: [],
  switchUser: () => {},
  refreshFriends: () => {},
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [allUsers, setAllUsers] = useState<DemoUser[]>([]);
  const [currentUser, setCurrentUser] = useState<DemoUser | null>(null);
  const [friends, setFriends] = useState<DemoUser[]>([]);

  useEffect(() => {
    api<DemoUser[]>("/api/users")
      .then((users) => {
        setAllUsers(users);
        if (users.length > 0) setCurrentUser(users[0]);
      })
      .catch(() => {
        const fallback: DemoUser[] = [
          { id: "user-sam", name: "Sam Kwak", avatar: "https://randomuser.me/api/portraits/men/32.jpg" },
          { id: "user-bob", name: "Bob Martinez", avatar: "https://randomuser.me/api/portraits/men/41.jpg" },
          { id: "user-carol", name: "Carol Washington", avatar: "https://randomuser.me/api/portraits/women/52.jpg" },
          { id: "user-william", name: "William Kang", avatar: "https://randomuser.me/api/portraits/men/68.jpg" },
          { id: "user-maya", name: "Maya Patel", avatar: "https://randomuser.me/api/portraits/women/64.jpg" },
          { id: "user-nina", name: "Nina Okonkwo", avatar: "https://randomuser.me/api/portraits/women/89.jpg" },
        ];
        setAllUsers(fallback);
        setCurrentUser(fallback[0]);
      });
  }, []);

  const loadFriends = useCallback((userId: string) => {
    api<DemoUser[]>(`/api/friends/${userId}`)
      .then(setFriends)
      .catch(() => setFriends([]));
  }, []);

  useEffect(() => {
    if (currentUser) loadFriends(currentUser.id);
  }, [currentUser, loadFriends]);

  const switchUser = (id: string) => {
    const user = allUsers.find((item) => item.id === id);
    if (user) setCurrentUser(user);
  };

  const refreshFriends = () => {
    if (currentUser) loadFriends(currentUser.id);
  };

  return (
    <UserContext.Provider value={{ currentUser, allUsers, friends, switchUser, refreshFriends }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);

