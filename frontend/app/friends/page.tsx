"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Search, Sparkles, UserMinus, UserPlus, Users } from "lucide-react";
import { useUser } from "../context/user-context";
import { api } from "../lib/api";

type DemoUser = { id: string; name: string; avatar: string };

type BlendResult = {
  blended_text: string;
  top_cuisines: string[];
  atmosphere_preferences: string[];
  price_range: string;
};

type TasteProfile = {
  preferences_text: string;
  structured: {
    cuisines: string[];
    atmospheres: string[];
    price_hints: string[];
    flavor_tags: string[];
  };
};

type Review = {
  id: string;
  restaurant_name: string;
  review_text: string;
  rating: number;
  dish?: string;
  cuisine?: string;
};

type FriendDetails = {
  user: DemoUser;
  profile: TasteProfile | null;
  reviews: Review[];
};

export default function FriendsPage() {
  const { currentUser, friends, allUsers, refreshFriends } = useUser();
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [blendResult, setBlendResult] = useState<BlendResult | null>(null);
  const [blending, setBlending] = useState(false);
  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null);
  const [friendDetails, setFriendDetails] = useState<FriendDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const nonFriends = allUsers.filter(
    (user) => user.id !== currentUser?.id && !friends.some((friend) => friend.id === user.id)
  );
  const activeFriendId =
    selectedFriendId && friends.some((friend) => friend.id === selectedFriendId)
      ? selectedFriendId
      : friends[0]?.id ?? null;
  const activeFriendDetails =
    friendDetails && friendDetails.user.id === activeFriendId ? friendDetails : null;

  useEffect(() => {
    if (!activeFriendId) return;
    const friend = friends.find((item) => item.id === activeFriendId);
    if (!friend) return;
    const selectedFriend = friend;
    const friendId = friend.id;

    let active = true;
    async function loadDetails() {
      setDetailsLoading(true);
      const [profile, reviews] = await Promise.all([
        api<TasteProfile>(`/api/profile/${friendId}/taste`).catch(() => null),
        api<Review[]>(`/api/reviews/${friendId}`).catch(() => []),
      ]);

      if (!active) return;
      setFriendDetails({
        user: selectedFriend,
        profile,
        reviews: reviews ?? [],
      });
      setDetailsLoading(false);
    }

    void loadDetails();
    return () => {
      active = false;
    };
  }, [activeFriendId, friends]);

  const handleAdd = async (friendId: string) => {
    if (!currentUser) return;
    setActionLoading(friendId);
    try {
      await api("/api/friends/add", {
        method: "POST",
        body: JSON.stringify({ user_id: currentUser.id, friend_id: friendId }),
      });
      refreshFriends();
    } catch {
      // ignore in local demo mode
    }
    setActionLoading(null);
  };

  const handleRemove = async (friendId: string) => {
    if (!currentUser) return;
    setActionLoading(friendId);
    try {
      await api("/api/friends/remove", {
        method: "POST",
        body: JSON.stringify({ user_id: currentUser.id, friend_id: friendId }),
      });
      refreshFriends();
      setBlendResult(null);
      if (activeFriendId === friendId) {
        setSelectedFriendId(null);
      }
    } catch {
      // ignore in local demo mode
    }
    setActionLoading(null);
  };

  const handleBlend = async () => {
    if (!currentUser || friends.length === 0) return;
    setBlending(true);
    setBlendResult(null);
    try {
      const userIds = [currentUser.id, ...friends.map((friend) => friend.id)];
      const result = await api<BlendResult>("/api/preferences/blend", {
        method: "POST",
        body: JSON.stringify({ user_ids: userIds }),
      });
      setBlendResult(result);
    } catch {
      // ignore in local demo mode
    }
    setBlending(false);
  };

  return (
    <div className="min-h-full px-6 py-8 lg:px-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <motion.section
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-[36px] p-6 sm:p-8"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex rounded-full bg-[linear-gradient(135deg,rgba(255,138,61,0.16),rgba(17,181,164,0.12))] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted-foreground)]">
                Connections
              </div>
              <h1 className="mt-4 text-4xl font-semibold text-[var(--foreground)]">Friends</h1>
              <p className="mt-2 max-w-2xl text-base text-[var(--muted-foreground)]">
                Review saved connections, combine preference notes, and inspect the summary
                used for shared search results.
              </p>
            </div>

            {friends.length > 0 && (
              <button
                onClick={handleBlend}
                disabled={blending}
                className="inline-flex items-center justify-center gap-2 rounded-[24px] bg-[linear-gradient(135deg,var(--accent),#ffb347)] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(255,138,61,0.22)] transition hover:brightness-105 disabled:opacity-45"
              >
                {blending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Combine Notes
              </button>
            )}
          </div>
        </motion.section>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(340px,1.05fr)]">
          <div className="space-y-6">
            <section className="glass rounded-[36px] p-6">
              <div className="mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-[var(--accent-light)]" />
                <h2 className="text-xl font-semibold text-[var(--foreground)]">Your Friends</h2>
                <span className="text-sm text-[var(--muted-foreground)]">({friends.length})</span>
              </div>

              {friends.length === 0 ? (
                <div className="rounded-[28px] border border-[var(--border)] bg-white/72 p-8 text-center text-sm text-[var(--muted-foreground)]">
                  No friends yet. Add someone below and they will appear here with a viewable profile.
                </div>
              ) : (
                <div className="space-y-3">
                  {friends.map((friend, index) => {
                    const selected = activeFriendId === friend.id;
                    return (
                      <motion.div
                        key={friend.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`w-full rounded-[28px] border px-4 py-4 text-left transition ${
                          selected
                            ? "border-[rgba(17,181,164,0.34)] bg-[linear-gradient(135deg,rgba(17,181,164,0.08),rgba(255,138,61,0.08))] shadow-[0_14px_34px_rgba(17,181,164,0.08)]"
                            : "border-[var(--border)] bg-white/78 hover:bg-white"
                        }`}
                      >
                        <div
                          role="button"
                          tabIndex={0}
                          onClick={() => setSelectedFriendId(friend.id)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              setSelectedFriendId(friend.id);
                            }
                          }}
                          className="flex items-center gap-4"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={friend.avatar} alt="" className="h-11 w-11 rounded-full object-cover" />
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-[var(--foreground)]">{friend.name}</p>
                            <p className="text-xs text-[var(--muted-foreground)]">
                              Tap to view summary
                            </p>
                          </div>
                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              void handleRemove(friend.id);
                            }}
                            disabled={actionLoading === friend.id}
                            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-rose-600 transition hover:bg-rose-50 disabled:opacity-45"
                          >
                            {actionLoading === friend.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <UserMinus className="h-3 w-3" />
                            )}
                            Remove
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </section>

            <section className="glass rounded-[36px] p-6">
              <div className="mb-4 flex items-center gap-2">
                <Search className="h-5 w-5 text-[var(--muted-foreground)]" />
                <h2 className="text-xl font-semibold text-[var(--foreground)]">Add Friends</h2>
              </div>

              {nonFriends.length === 0 ? (
                <div className="rounded-[28px] border border-[var(--border)] bg-white/72 p-6 text-sm text-[var(--muted-foreground)]">
                  Everyone in the demo is already connected to this user.
                </div>
              ) : (
                <div className="space-y-3">
                  {nonFriends.map((user, index) => (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="rounded-[28px] border border-[var(--border)] bg-white/78 p-4"
                    >
                      <div className="flex items-center gap-4">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={user.avatar} alt="" className="h-11 w-11 rounded-full object-cover" />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-[var(--foreground)]">{user.name}</p>
                          <p className="text-xs text-[var(--muted-foreground)]">Not connected yet</p>
                        </div>
                        <button
                          onClick={() => void handleAdd(user.id)}
                          disabled={actionLoading === user.id}
                          className="inline-flex items-center gap-1.5 rounded-full bg-[rgba(255,138,61,0.12)] px-3 py-1.5 text-xs font-semibold text-[var(--foreground)] transition hover:bg-[rgba(255,138,61,0.18)] disabled:opacity-45"
                        >
                          {actionLoading === user.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <UserPlus className="h-3 w-3" />
                          )}
                          Add
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </section>
          </div>

          <div className="space-y-6">
            <section className="glass rounded-[36px] p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted-foreground)]">
                    Friend profile
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-[var(--foreground)]">
                    {activeFriendDetails?.user.name || "Select a friend"}
                  </h2>
                </div>
                {activeFriendDetails?.user && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={activeFriendDetails.user.avatar}
                    alt=""
                    className="h-14 w-14 rounded-2xl border border-white/70 object-cover"
                  />
                )}
              </div>

              {detailsLoading ? (
                <div className="mt-6 flex items-center gap-2 rounded-[24px] border border-[var(--border)] bg-white/75 px-4 py-4 text-sm text-[var(--muted-foreground)]">
                  <Loader2 className="h-4 w-4 animate-spin text-[var(--accent)]" />
                  Loading profile...
                </div>
              ) : activeFriendDetails ? (
                <div className="mt-6 space-y-5">
                  <div className="rounded-[28px] border border-[var(--border)] bg-white/72 p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted-foreground)]">
                      Profile summary
                    </p>
                    <p className="mt-3 whitespace-pre-line text-sm leading-7 text-[var(--foreground)]/82">
                      {activeFriendDetails.profile?.preferences_text || "No summary yet."}
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {activeFriendDetails.profile?.structured.cuisines?.length ? (
                      <div className="rounded-[24px] border border-[var(--border)] bg-orange-50/80 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-700">
                          Cuisines
                        </p>
                        <p className="mt-2 text-sm text-orange-900">
                          {activeFriendDetails.profile.structured.cuisines.join(", ")}
                        </p>
                      </div>
                    ) : null}
                    {activeFriendDetails.profile?.structured.atmospheres?.length ? (
                      <div className="rounded-[24px] border border-[var(--border)] bg-sky-50/80 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">
                          Vibes
                        </p>
                        <p className="mt-2 text-sm text-sky-900">
                          {activeFriendDetails.profile.structured.atmospheres.join(", ")}
                        </p>
                      </div>
                    ) : null}
                  </div>

                  <div className="rounded-[28px] border border-[var(--border)] bg-white/72 p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted-foreground)]">
                      Recent reviews
                    </p>

                    {activeFriendDetails.reviews.length === 0 ? (
                      <p className="mt-3 text-sm text-[var(--muted-foreground)]">
                        No reviews yet.
                      </p>
                    ) : (
                      <div className="mt-3 space-y-3">
                        {activeFriendDetails.reviews.slice(0, 3).map((review) => (
                          <div key={review.id} className="rounded-[22px] border border-[var(--border)] bg-white p-4">
                            <p className="text-sm font-semibold text-[var(--foreground)]">
                              {review.restaurant_name}
                            </p>
                            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                              {review.cuisine}
                              {review.dish ? ` - ${review.dish}` : ""}
                            </p>
                            <p className="mt-2 text-sm leading-6 text-[var(--foreground)]/78">
                              {review.review_text}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="mt-6 rounded-[28px] border border-[var(--border)] bg-white/75 p-6 text-sm text-[var(--muted-foreground)]">
                  Select a person on the left to view their saved summary and recent reviews.
                </div>
              )}
            </section>

            <AnimatePresence>
              {blendResult && (
                <motion.section
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="glass rounded-[36px] p-6"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-[var(--accent)]" />
                    <h3 className="text-lg font-semibold text-[var(--foreground)]">Combined Summary</h3>
                  </div>
                  <p className="mt-3 whitespace-pre-line text-sm leading-7 text-[var(--foreground)]/82">
                    {blendResult.blended_text}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-3 text-sm">
                    {blendResult.top_cuisines.map((cuisine) => (
                      <span key={cuisine} className="rounded-full bg-orange-100 px-3 py-1 text-orange-700">
                        {cuisine}
                      </span>
                    ))}
                    {blendResult.atmosphere_preferences.map((atmosphere) => (
                      <span key={atmosphere} className="rounded-full bg-sky-100 px-3 py-1 text-sky-700">
                        {atmosphere}
                      </span>
                    ))}
                    {blendResult.price_range && (
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700">
                        {blendResult.price_range}
                      </span>
                    )}
                  </div>
                </motion.section>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
