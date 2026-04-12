"use client";

import { DollarSign, MapPin, Sparkles, Star } from "lucide-react";
import { motion } from "framer-motion";

export type Restaurant = {
  id?: string;
  place_id?: string;
  name: string;
  cuisine: string;
  rating: number;
  user_ratings_total: number;
  price_level: number;
  atmosphere: string;
  address: string;
  description: string;
  match_score?: number;
  reasoning?: string;
  photo_url?: string;
  distance_meters?: number;
  distance_label?: string;
  latitude?: number;
  longitude?: number;
};

export function RestaurantCard({
  r,
  index,
  selected = false,
  onClick,
}: {
  r: Restaurant;
  index: number;
  selected?: boolean;
  onClick?: () => void;
}) {
  const scorePercent = Math.round((r.match_score ?? 0) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.35 }}
      onClick={onClick}
      className={`glass overflow-hidden rounded-[28px] transition-all ${
        onClick ? "cursor-pointer" : ""
      } ${
        selected
          ? "border-[var(--accent-light)]/70 shadow-[0_0_0_1px_rgba(17,181,164,0.24),0_16px_44px_rgba(17,181,164,0.1)]"
          : "hover:border-[var(--accent)]/40 hover:shadow-[0_14px_34px_rgba(255,138,61,0.1)]"
      }`}
    >
      {r.match_score != null && (
        <div className="h-1 bg-[var(--muted)]/80">
          <div
            className="h-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-light)] transition-all duration-700"
            style={{ width: `${scorePercent}%` }}
          />
        </div>
      )}

      <div className="p-5">
        {r.photo_url && (
          <div className="mb-4 overflow-hidden rounded-2xl border border-white/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={r.photo_url} alt={r.name} className="h-40 w-full object-cover" />
          </div>
        )}

        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-base font-semibold text-[var(--foreground)]">{r.name}</h3>
            <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">{r.cuisine}</p>
          </div>
          {r.match_score != null && (
            <div className="shrink-0 text-right">
              <span className="text-lg font-bold text-[var(--accent-light)]">{scorePercent}%</span>
              <p className="text-[10px] text-[var(--muted-foreground)]">match</p>
            </div>
          )}
        </div>

        <div className="mt-3 flex items-center gap-4 text-xs text-[var(--muted-foreground)]">
          <span className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
            {r.rating.toFixed(1)}
            <span className="opacity-60">({r.user_ratings_total})</span>
          </span>
          <span className="flex items-center gap-0.5">
            {Array.from({ length: r.price_level }).map((_, i) => (
              <DollarSign key={i} className="h-3 w-3" />
            ))}
          </span>
          <span className="truncate">{r.atmosphere}</span>
        </div>

        <p className="mt-2.5 line-clamp-2 text-xs text-[var(--muted-foreground)]">{r.description}</p>

        <div className="mt-2 flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate">
            {r.distance_label ? `${r.distance_label} - ` : ""}
            {r.address}
          </span>
        </div>

        {r.reasoning && (
          <div className="mt-3 flex items-start gap-2 rounded-2xl border border-[var(--accent)]/16 bg-[var(--accent)]/8 p-3">
            <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--accent-light)]" />
            <p className="text-xs text-[var(--accent-light)]">{r.reasoning}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

