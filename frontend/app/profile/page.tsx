"use client";

import { useEffect, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import {
  DollarSign,
  Loader2,
  Sparkles,
  Star,
  Thermometer,
  UtensilsCrossed,
  Wind,
} from "lucide-react";
import { useUser } from "../context/user-context";
import { api } from "../lib/api";

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

function TagGroup({
  title,
  icon,
  values,
  className,
}: {
  title: string;
  icon: ReactNode;
  values: string[];
  className: string;
}) {
  if (values.length === 0) return null;

  return (
    <div className="rounded-[28px] border border-[var(--border)] bg-white/72 p-5">
      <div className="flex items-center gap-2">
        {icon}
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted-foreground)]">
          {title}
        </p>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {values.map((value) => (
          <span key={value} className={className}>
            {value}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { currentUser } = useUser();
  const [profile, setProfile] = useState<TasteProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const userId = currentUser?.id;
    if (!userId) return;

    let active = true;

    async function loadProfile() {
      setLoading(true);
      const [profileResult, reviewResult] = await Promise.all([
        api<TasteProfile>(`/api/profile/${userId}/taste`).catch(() => null),
        api<Review[]>(`/api/reviews/${userId}`).catch(() => []),
      ]);

      if (!active) return;
      setProfile(profileResult);
      setReviews(reviewResult ?? []);
      setLoading(false);
    }

    void loadProfile();
    return () => {
      active = false;
    };
  }, [currentUser?.id]);

  if (!currentUser) {
    return (
      <div className="flex h-full items-center justify-center px-8">
        <div className="rounded-[28px] border border-[var(--border)] bg-white/76 px-6 py-5 text-sm text-[var(--muted-foreground)] shadow-[0_18px_44px_rgba(244,186,114,0.1)]">
          Loading your profile...
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-[var(--accent)]" />
      </div>
    );
  }

  const structured = profile?.structured ?? {
    cuisines: [],
    atmospheres: [],
    price_hints: [],
    flavor_tags: [],
  };

  return (
    <div className="min-h-full px-6 py-8 lg:px-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <motion.section
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-[36px] p-6 sm:p-8"
        >
          <div className="flex flex-col gap-6 md:flex-row md:items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentUser.avatar}
              alt=""
              className="h-24 w-24 rounded-[28px] border border-white/70 object-cover shadow-[0_18px_40px_rgba(244,186,114,0.14)]"
            />
            <div className="flex-1">
              <div className="inline-flex rounded-full bg-[linear-gradient(135deg,rgba(255,138,61,0.16),rgba(17,181,164,0.12))] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted-foreground)]">
                Personal dining summary
              </div>
              <h1 className="mt-4 text-4xl font-semibold text-[var(--foreground)]">{currentUser.name}</h1>
              <p className="mt-2 text-base text-[var(--muted-foreground)]">
                {reviews.length} reviews contributing to this summary.
              </p>
            </div>
          </div>
        </motion.section>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]">
          <motion.section
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="glass rounded-[36px] p-6">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-[var(--accent)]" />
                <h2 className="text-xl font-semibold text-[var(--foreground)]">Profile Summary</h2>
              </div>

              {profile?.preferences_text ? (
                <div className="mt-4 whitespace-pre-line text-sm leading-7 text-[var(--foreground)]/82">
                  {profile.preferences_text}
                </div>
              ) : (
                <p className="mt-4 text-sm text-[var(--muted-foreground)]">
                  No summary yet. Submit a review to generate one.
                </p>
              )}
            </div>

            <div className="glass rounded-[36px] p-6">
              <h2 className="text-xl font-semibold text-[var(--foreground)]">Review History</h2>
              {reviews.length === 0 ? (
                <div className="mt-4 rounded-[28px] border border-[var(--border)] bg-white/72 p-6 text-sm text-[var(--muted-foreground)]">
                  No reviews yet. Head to the Review tab and describe what you ate.
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {reviews.map((review, index) => (
                    <motion.div
                      key={review.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="rounded-[28px] border border-[var(--border)] bg-white/78 p-5 shadow-[0_12px_32px_rgba(244,186,114,0.08)]"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-base font-semibold text-[var(--foreground)]">
                            {review.restaurant_name}
                          </p>
                          {(review.cuisine || review.dish) && (
                            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                              {review.cuisine}
                              {review.dish ? ` - ${review.dish}` : ""}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${
                                star <= review.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-[var(--muted)]"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="mt-3 text-sm leading-7 text-[var(--foreground)]/78">
                        {review.review_text}
                      </p>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.section>

          <motion.aside
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <TagGroup
              title="Favorite Cuisines"
              icon={<UtensilsCrossed className="h-4 w-4 text-orange-500" />}
              values={structured.cuisines}
              className="rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-700"
            />
            <TagGroup
              title="Flavor Signals"
              icon={<Thermometer className="h-4 w-4 text-rose-500" />}
              values={structured.flavor_tags}
              className="rounded-full bg-rose-100 px-3 py-1 text-xs font-medium text-rose-700"
            />
            <TagGroup
              title="Atmosphere"
              icon={<Wind className="h-4 w-4 text-sky-500" />}
              values={structured.atmospheres}
              className="rounded-full bg-sky-100 px-3 py-1 text-xs font-medium text-sky-700"
            />
            <TagGroup
              title="Price Hints"
              icon={<DollarSign className="h-4 w-4 text-emerald-500" />}
              values={structured.price_hints}
              className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700"
            />
          </motion.aside>
        </div>
      </div>
    </div>
  );
}
