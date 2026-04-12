"use client";

import { useEffect, useRef, useState } from "react";
import {
  ChevronRight,
  Compass,
  ExternalLink,
  Loader2,
  MapPin,
  Navigation,
  Search,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useUser } from "../context/user-context";
import { api } from "../lib/api";
import { MentionInput } from "../components/mention-input";
import { Restaurant } from "../components/restaurant-card";

type DemoUser = { id: string; name: string; avatar: string };

type ActiveLocation = {
  label: string;
  latitude: number;
  longitude: number;
  radius_meters?: number;
};

type SearchResult = {
  status: string;
  query: string;
  search_summary: string;
  top_restaurants: Restaurant[];
  nearby_restaurants: Restaurant[];
  user_preferences?: string;
  merged_preferences?: string;
  user_count?: number;
  elapsed_ms?: number;
  location?: ActiveLocation;
};

const LOCATION_STORAGE_KEY = "tableus.activeLocation";
const DEFAULT_LOCATION: ActiveLocation = {
  label: "Boston, MA",
  latitude: 42.3601,
  longitude: -71.0589,
  radius_meters: 2000,
};

const SEARCH_SUGGESTIONS = [
  "Where should we eat tonight?",
  "Best sushi nearby",
  "Cute pasta spot for two",
  "Late-night noodles with friends",
  "Good brunch around here",
];

/** Matches backend MAX_RESTAURANT_CANDIDATES — show every venue in the orbit up to this cap. */
const MAX_ORBIT_RESTAURANTS = 20;

function uniqueUsers(users: DemoUser[]) {
  return [...new Map(users.map((user) => [user.id, user])).values()];
}

/** Deterministic 0..1 from a string — stable across renders so orbit layout does not flicker. */
function stableUnitFromId(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967296;
}

function restaurantKey(restaurant: Restaurant) {
  return restaurant.place_id || restaurant.id || restaurant.name;
}

function fallbackImage(restaurant: Restaurant) {
  const key = `${restaurant.cuisine} ${restaurant.name}`.toLowerCase();
  if (key.includes("sushi") || key.includes("japanese")) {
    return "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=400&fit=crop";
  }
  if (key.includes("italian") || key.includes("pizza") || key.includes("pasta")) {
    return "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=400&h=400&fit=crop";
  }
  if (key.includes("mexican") || key.includes("taco")) {
    return "https://images.unsplash.com/photo-1565299585323-38174c4a6471?w=400&h=400&fit=crop";
  }
  if (key.includes("thai") || key.includes("curry")) {
    return "https://images.unsplash.com/photo-1559314809-0d155014e29e?w=400&h=400&fit=crop";
  }
  if (key.includes("burger") || key.includes("american")) {
    return "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=400&fit=crop";
  }
  if (key.includes("seafood")) {
    return "https://images.unsplash.com/photo-1559847844-5315695dadae?w=400&h=400&fit=crop";
  }
  return "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=400&fit=crop";
}

function readStoredLocation() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(LOCATION_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ActiveLocation;
  } catch {
    return null;
  }
}

function persistLocation(location: ActiveLocation) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(location));
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong";
}

function getBrowserPosition() {
  return new Promise<GeolocationPosition>((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported in this browser."));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    });
  });
}

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

async function getGrantedBrowserLocation() {
  if (typeof window === "undefined" || !("navigator" in window)) return null;
  if (!navigator.permissions?.query) return null;

  try {
    const permission = await navigator.permissions.query({
      name: "geolocation" as PermissionName,
    });
    if (permission.state !== "granted") return null;

    const position = await getBrowserPosition();
    return {
      label: "Current location",
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      radius_meters: 2000,
    } satisfies ActiveLocation;
  } catch {
    return null;
  }
}
function CenterOrb({ orbitPhase }: { orbitPhase: "idle" | "searching" | "results" }) {
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });

  const searching = orbitPhase === "searching";
  const settled = orbitPhase === "results";

  return (
    <motion.div
      onMouseMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const x = (event.clientX - (rect.left + rect.width / 2)) / rect.width;
        const y = (event.clientY - (rect.top + rect.height / 2)) / rect.height;
        setTilt({
          rotateX: -y * 18,
          rotateY: x * 18,
        });
      }}
      onMouseLeave={() => setTilt({ rotateX: 0, rotateY: 0 })}
      animate={{
        rotateX: tilt.rotateX,
        rotateY: tilt.rotateY,
        scale: searching ? [1, 1.03, 0.985, 1.02, 1] : settled ? 1.01 : 1,
        x: searching ? [0, 3, -4, 2, 0] : 0,
        y: searching ? [0, -2, 4, -1, 0] : 0,
      }}
      transition={{
        rotateX: { type: "spring", stiffness: 140, damping: 18 },
        rotateY: { type: "spring", stiffness: 140, damping: 18 },
        scale: searching
          ? { duration: 1.6, repeat: Infinity, ease: "easeInOut" }
          : { duration: 0.4 },
        x: searching
          ? { duration: 1.2, repeat: Infinity, ease: "easeInOut" }
          : { duration: 0.4 },
        y: searching
          ? { duration: 1.45, repeat: Infinity, ease: "easeInOut" }
          : { duration: 0.4 },
      }}
      style={{ transformPerspective: 1100 }}
      className="relative h-[148px] w-[148px] sm:h-[176px] sm:w-[176px]"
    >
      <div className="absolute inset-[-28%] rounded-full bg-[radial-gradient(circle,rgba(145,94,255,0.22),rgba(255,255,255,0)_72%)] blur-3xl" />
      <div className="absolute inset-[-8%] rounded-full border border-white/35" />
      <div className="absolute inset-0 overflow-hidden rounded-full border border-white/45 bg-[radial-gradient(circle_at_32%_28%,rgba(255,255,255,0.92),rgba(255,255,255,0.48)_17%,rgba(190,170,255,0.36)_39%,rgba(145,94,255,0.18)_58%,rgba(255,255,255,0.12)_78%,rgba(255,255,255,0.34)_100%)] shadow-[0_26px_80px_rgba(145,94,255,0.18),inset_0_0_40px_rgba(255,255,255,0.5)] backdrop-blur-xl">
        <div className="absolute inset-[10%] rounded-full border border-white/24" />
        <div className="absolute left-[14%] top-[18%] h-12 w-20 rounded-full bg-white/35 blur-2xl" />
        <div className="absolute right-[12%] top-[30%] h-10 w-14 rounded-full bg-[rgba(145,94,255,0.22)] blur-2xl" />
        <div className="absolute inset-x-[20%] bottom-[18%] h-12 rounded-full bg-[rgba(255,255,255,0.18)] blur-2xl" />

        {[
          { left: "20%", top: "26%", delay: 0 },
          { left: "68%", top: "22%", delay: 0.2 },
          { left: "36%", top: "58%", delay: 0.4 },
          { left: "58%", top: "64%", delay: 0.6 },
          { left: "46%", top: "34%", delay: 0.8 },
        ].map((particle, index) => (
          <motion.span
            key={index}
            animate={{
              x: [0, 6, -4, 0],
              y: [0, -8, 4, 0],
              opacity: [0.35, 0.95, 0.55, 0.35],
              scale: [0.9, 1.2, 0.95, 0.9],
            }}
            transition={{
              duration: 3 + index * 0.3,
              delay: particle.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_18px_rgba(255,255,255,0.95)]"
            style={{ left: particle.left, top: particle.top }}
          />
        ))}

        <motion.div
          animate={{
            rotate: searching ? 360 : 0,
            opacity: searching ? [0.24, 0.5, 0.24] : settled ? 0.22 : 0.14,
          }}
          transition={{
            rotate: { duration: 7, repeat: Infinity, ease: "linear" },
            opacity: { duration: 2.2, repeat: Infinity, ease: "easeInOut" },
          }}
          className="absolute inset-[18%] rounded-full border border-white/30"
        />
      </div>
    </motion.div>
  );
}

function CompactResultCard({
  restaurant,
  index,
  selected,
  onClick,
}: {
  restaurant: Restaurant;
  index: number;
  selected: boolean;
  onClick: () => void;
}) {
  const scorePercent = Math.round((restaurant.match_score ?? 0) * 100);

  return (
    <motion.button
      id={`restaurant-rank-${restaurantKey(restaurant)}`}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.28 }}
      onClick={onClick}
      className={`min-w-[260px] rounded-[26px] border bg-white/88 p-3 text-left shadow-[0_14px_34px_rgba(145,94,255,0.08)] backdrop-blur-xl transition ${
        selected
          ? "border-[rgba(145,94,255,0.36)] shadow-[0_16px_38px_rgba(145,94,255,0.16)]"
          : "border-white/70 hover:border-[rgba(145,94,255,0.22)]"
      }`}
    >
      <div className="flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={restaurant.photo_url || fallbackImage(restaurant)}
          alt={restaurant.name}
          className="h-16 w-16 rounded-[18px] object-cover"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-sm font-semibold text-[var(--foreground)]">
              {restaurant.name}
            </p>
            <span className="rounded-full bg-[rgba(145,94,255,0.1)] px-2 py-1 text-[11px] font-semibold text-[rgba(117,76,207,1)]">
              #{index + 1}
            </span>
          </div>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            {restaurant.cuisine}
            {restaurant.distance_label ? ` • ${restaurant.distance_label}` : ""}
          </p>
          {restaurant.reasoning && (
            <p className="mt-1 line-clamp-2 text-xs text-[var(--muted-foreground)]">
              {restaurant.reasoning}
            </p>
          )}
        </div>
      </div>
      {restaurant.match_score != null && (
        <div className="mt-3">
          <div className="h-1.5 rounded-full bg-[rgba(145,94,255,0.08)]">
            <div
              className="h-full rounded-full bg-[linear-gradient(135deg,#915eff,var(--accent))]"
              style={{ width: `${scorePercent}%` }}
            />
          </div>
          <p className="mt-1 text-[11px] font-medium text-[var(--muted-foreground)]">
            {scorePercent}% match
          </p>
        </div>
      )}
    </motion.button>
  );
}

function RestaurantSidebar({
  restaurant,
  locationLabel,
  onClose,
}: {
  restaurant: Restaurant;
  locationLabel?: string;
  onClose: () => void;
}) {
  const mapX = restaurant.longitude != null
    ? Math.min(78, Math.max(22, 50 + ((restaurant.longitude + 71.06) * 26)))
    : 52;
  const mapY = restaurant.latitude != null
    ? Math.min(76, Math.max(24, 50 - ((restaurant.latitude - 42.36) * 38)))
    : 48;

  return (
    <motion.aside
      initial={{ opacity: 0, x: 36 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 36 }}
      transition={{ duration: 0.26, ease: "easeOut" }}
      className="fixed right-3 top-[4.5rem] z-[60] flex h-[min(calc(100vh-5rem),900px)] w-[min(480px,calc(100vw-18rem-2rem))] flex-col overflow-hidden rounded-[32px] border border-white/80 bg-white/92 shadow-[0_22px_60px_rgba(145,94,255,0.14)] backdrop-blur-2xl sm:right-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="restaurant-brief-title"
    >
      <div className="flex shrink-0 items-start justify-between gap-3 border-b border-[rgba(145,94,255,0.08)] bg-white/60 px-5 pb-4 pt-5 backdrop-blur-sm">
        <div className="min-w-0 pr-2">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted-foreground)]">
            Restaurant Brief
          </p>
          <h3
            id="restaurant-brief-title"
            className="mt-2 text-xl font-semibold leading-tight text-[var(--foreground)] sm:text-2xl"
          >
            {restaurant.name}
          </h3>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            {restaurant.cuisine}
            {restaurant.distance_label ? ` • ${restaurant.distance_label}` : ""}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-white/88 text-[var(--muted-foreground)] transition hover:text-[var(--foreground)]"
          aria-label="Close restaurant details"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-6 pt-4 [scrollbar-gutter:stable]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={restaurant.photo_url || fallbackImage(restaurant)}
          alt={restaurant.name}
          className="h-48 w-full rounded-[24px] object-cover sm:h-52"
        />

        <div className="mt-4 flex flex-wrap gap-2 text-xs text-[var(--muted-foreground)]">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[rgba(255,255,255,0.9)] px-3 py-1.5">
            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
            {restaurant.rating.toFixed(1)} ({restaurant.user_ratings_total})
          </span>
          <span className="rounded-full bg-[rgba(255,255,255,0.9)] px-3 py-1.5">
            {"$".repeat(Math.max(restaurant.price_level, 1))}
          </span>
          {restaurant.match_score != null && (
            <span className="rounded-full bg-[rgba(145,94,255,0.1)] px-3 py-1.5 text-[rgba(117,76,207,1)]">
              {Math.round(restaurant.match_score * 100)}% match
            </span>
          )}
        </div>

        <p className="mt-4 text-sm leading-relaxed text-[var(--muted-foreground)] sm:text-[15px]">
          {restaurant.reasoning || restaurant.description}
        </p>

        <div className="mt-5 rounded-[24px] border border-[rgba(145,94,255,0.12)] bg-[linear-gradient(180deg,rgba(242,237,255,0.9),rgba(255,255,255,0.92))] p-4">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted-foreground)]">
                Map
              </p>
              <p className="mt-1 text-sm text-[var(--foreground)]">
                {locationLabel || "Nearby area"}
              </p>
            </div>
            <Compass className="h-4 w-4 text-[var(--accent-light)]" />
          </div>

          <div className="relative h-44 overflow-hidden rounded-[20px] border border-white/70 bg-[linear-gradient(135deg,rgba(225,240,255,0.95),rgba(255,246,230,0.95))] sm:h-48">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.38)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.38)_1px,transparent_1px)] bg-[size:28px_28px]" />
            <div className="absolute inset-x-[12%] top-[28%] h-px rotate-[12deg] bg-[rgba(145,94,255,0.16)]" />
            <div className="absolute inset-x-[16%] top-[56%] h-px -rotate-[10deg] bg-[rgba(255,138,61,0.18)]" />
            <div className="absolute left-[34%] top-[18%] h-[46%] w-px rotate-[8deg] bg-[rgba(17,181,164,0.18)]" />
            <div className="absolute left-[64%] top-[12%] h-[54%] w-px -rotate-[8deg] bg-[rgba(145,94,255,0.18)]" />

            <motion.div
              animate={{ y: [0, -5, 0], scale: [1, 1.05, 1] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${mapX}%`, top: `${mapY}%` }}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[linear-gradient(135deg,#915eff,var(--accent))] shadow-[0_10px_24px_rgba(145,94,255,0.22)]">
                <MapPin className="h-4 w-4 text-white" />
              </div>
              <div className="mx-auto mt-1 h-2 w-2 rounded-full bg-[rgba(145,94,255,0.28)] blur-[1px]" />
            </motion.div>
          </div>
        </div>

        <div className="mt-5 rounded-[22px] bg-[rgba(255,255,255,0.8)] px-4 py-3.5 text-sm leading-relaxed text-[var(--foreground)]">
          <div className="flex items-start gap-2">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent)]" />
            <span>{restaurant.address}</span>
          </div>
        </div>

        <button
          type="button"
          className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-[rgba(117,76,207,1)] transition hover:text-[var(--foreground)]"
        >
          View route details
          <ChevronRight className="h-4 w-4" />
          <ExternalLink className="h-3.5 w-3.5" />
        </button>
      </div>
    </motion.aside>
  );
}

export default function DiscoverPage() {
  const { currentUser, friends, allUsers } = useUser();
  const [query, setQuery] = useState("");
  const [typedPlaceholder, setTypedPlaceholder] = useState("");
  const [selectedFriends, setSelectedFriends] = useState<DemoUser[]>([]);
  const [activeLocation, setActiveLocation] = useState<ActiveLocation | null>(null);
  const [locationInput, setLocationInput] = useState("");
  const [showLocationEditor, setShowLocationEditor] = useState(false);
  const [loadingNearby, setLoadingNearby] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [locationBusy, setLocationBusy] = useState(false);
  const [error, setError] = useState("");
  const [rotation, setRotation] = useState(0);
  const [orbitPhase, setOrbitPhase] = useState<"idle" | "searching" | "results">("idle");
  const [nearbyRestaurants, setNearbyRestaurants] = useState<Restaurant[]>([]);
  const [displayedOrbitRestaurants, setDisplayedOrbitRestaurants] = useState<Restaurant[]>([]);
  const [rankedRestaurants, setRankedRestaurants] = useState<Restaurant[]>([]);
  const [results, setResults] = useState<SearchResult | null>(null);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(null);
  const animationTokenRef = useRef(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      const speed = orbitPhase === "searching" ? 1.9 : orbitPhase === "results" ? 0.45 : 0.78;
      setRotation((prev) => (prev + speed) % 360);
    }, 32);

    return () => window.clearInterval(interval);
  }, [orbitPhase]);

  useEffect(() => {
    if (query.trim()) {
      setTypedPlaceholder("");
      return;
    }

    let active = true;
    let timer = 0;
    let suggestionIndex = 0;
    let charIndex = 0;
    let deleting = false;

    const tick = () => {
      if (!active) return;

      const current = SEARCH_SUGGESTIONS[suggestionIndex];
      if (!deleting) {
        charIndex += 1;
        setTypedPlaceholder(current.slice(0, charIndex));
        if (charIndex >= current.length) {
          deleting = true;
          timer = window.setTimeout(tick, 1450);
          return;
        }
        timer = window.setTimeout(tick, 52);
        return;
      }

      charIndex -= 1;
      setTypedPlaceholder(current.slice(0, Math.max(charIndex, 0)));
      if (charIndex <= 0) {
        deleting = false;
        suggestionIndex = (suggestionIndex + 1) % SEARCH_SUGGESTIONS.length;
        charIndex = 1;
        setTypedPlaceholder(SEARCH_SUGGESTIONS[suggestionIndex].slice(0, 1));
        timer = window.setTimeout(tick, 70);
        return;
      }
      timer = window.setTimeout(tick, 24);
    };

    timer = window.setTimeout(tick, 480);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [query]);

  useEffect(() => {
    setSelectedFriends([]);
    setResults(null);
    setRankedRestaurants([]);
    setSelectedRestaurantId(null);
    setOrbitPhase("idle");
  }, [currentUser?.id]);

  async function loadNearby(location: ActiveLocation, persist = false) {
    if (persist) persistLocation(location);

    setLoadingNearby(true);
    setError("");

    try {
      const data = await api<{
        restaurants: Restaurant[];
        radius_meters: number;
      }>("/api/restaurants/nearby", {
        method: "POST",
        body: JSON.stringify({
          latitude: location.latitude,
          longitude: location.longitude,
          radius_meters: location.radius_meters ?? 2000,
          limit: 20,
        }),
      });

      const hydratedRestaurants = data.restaurants.map((restaurant) => ({
        ...restaurant,
        photo_url: restaurant.photo_url || fallbackImage(restaurant),
      }));

      setActiveLocation({
        ...location,
        radius_meters: data.radius_meters || location.radius_meters || 2000,
      });
      setNearbyRestaurants(hydratedRestaurants);
      setDisplayedOrbitRestaurants(hydratedRestaurants);
      setRankedRestaurants([]);
      setResults(null);
      setSelectedRestaurantId(null);
      setOrbitPhase("idle");
    } catch (err) {
      setNearbyRestaurants([]);
      setDisplayedOrbitRestaurants([]);
      setRankedRestaurants([]);
      setError(getErrorMessage(err));
    } finally {
      setLoadingNearby(false);
    }
  }

  useEffect(() => {
    let active = true;

    async function initializeLocation() {
      const stored = readStoredLocation();
      if (stored && active) {
        await loadNearby(stored, false);
        return;
      }

      const grantedLocation = await getGrantedBrowserLocation();
      if (grantedLocation && active) {
        await loadNearby(grantedLocation, true);
        return;
      }

      if (!active) return;
      await loadNearby(DEFAULT_LOCATION, false);
    }

    void initializeLocation();
    return () => {
      active = false;
    };
  }, []);

  async function animateConvergence(response: SearchResult, token: number) {
    const topRestaurants = response.top_restaurants.map((restaurant) => ({
      ...restaurant,
      photo_url: restaurant.photo_url || fallbackImage(restaurant),
    }));
    const topIds = new Set(topRestaurants.map((restaurant) => restaurantKey(restaurant)));
    const startingPool = (response.nearby_restaurants.length
      ? response.nearby_restaurants
      : nearbyRestaurants
    ).map((restaurant) => ({
      ...restaurant,
      photo_url: restaurant.photo_url || fallbackImage(restaurant),
    }));

    setDisplayedOrbitRestaurants(startingPool);
    setRankedRestaurants([]);
    await wait(320);
    if (animationTokenRef.current !== token) return;

    let working = [...startingPool];
    const removals = working.filter((restaurant) => !topIds.has(restaurantKey(restaurant)));

    for (let index = 0; index < removals.length; index += 1) {
      if (animationTokenRef.current !== token) return;

      const restaurantToRemove = removals[index];
      working = working.filter(
        (restaurant) => restaurantKey(restaurant) !== restaurantKey(restaurantToRemove)
      );
      setDisplayedOrbitRestaurants([...working]);
      await wait(105);
    }

    if (animationTokenRef.current !== token) return;

    setDisplayedOrbitRestaurants(topRestaurants);
    setRankedRestaurants(topRestaurants);
    setSelectedRestaurantId(null);
    setOrbitPhase("results");
  }

  async function handleSearch() {
    if (!currentUser || !activeLocation || !query.trim()) return;

    const token = Date.now();
    animationTokenRef.current = token;
    setLoadingSearch(true);
    setError("");
    setOrbitPhase("searching");

    try {
      const cleanQuery = query.trim();
      const uniqueFriendIds = [...new Set(selectedFriends.map((friend) => friend.id))];
      const payload = {
        query: cleanQuery,
        latitude: activeLocation.latitude,
        longitude: activeLocation.longitude,
        location_label: activeLocation.label,
        radius_meters: activeLocation.radius_meters ?? 2000,
      };

      const response =
        uniqueFriendIds.length > 0
          ? await api<SearchResult>("/api/restaurants/search-group", {
              method: "POST",
              body: JSON.stringify({
                ...payload,
                user_ids: [currentUser.id, ...uniqueFriendIds],
              }),
            })
          : await api<SearchResult>("/api/restaurants/search", {
              method: "POST",
              body: JSON.stringify({
                ...payload,
                user_id: currentUser.id,
              }),
            });

      if (animationTokenRef.current !== token) return;

      setResults(response);
      const refreshedNearby = response.nearby_restaurants.map((restaurant) => ({
        ...restaurant,
        photo_url: restaurant.photo_url || fallbackImage(restaurant),
      }));
      setNearbyRestaurants(refreshedNearby);
      await animateConvergence(response, token);
    } catch (err) {
      if (animationTokenRef.current !== token) return;
      setOrbitPhase("idle");
      setError(getErrorMessage(err));
    } finally {
      if (animationTokenRef.current === token) {
        setLoadingSearch(false);
      }
    }
  }

  async function handleResolveLocation() {
    if (!locationInput.trim()) return;

    setLocationBusy(true);
    try {
      const resolved = await api<ActiveLocation>("/api/location/resolve", {
        method: "POST",
        body: JSON.stringify({ query: locationInput.trim() }),
      });
      await loadNearby({ ...resolved, radius_meters: 2000 }, true);
      setLocationInput("");
      setShowLocationEditor(false);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLocationBusy(false);
    }
  }

  async function handleUseCurrentLocation() {
    setLocationBusy(true);
    try {
      const position = await getBrowserPosition();
      await loadNearby(
        {
          label: "Current location",
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          radius_meters: 2000,
        },
        true
      );
      setShowLocationEditor(false);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLocationBusy(false);
    }
  }

  function addSelectedFriend(user: DemoUser) {
    setSelectedFriends((prev) => uniqueUsers([...prev, user]));
  }

  function toggleFriend(user: DemoUser) {
    setSelectedFriends((prev) => {
      if (prev.some((friend) => friend.id === user.id)) {
        return prev.filter((friend) => friend.id !== user.id);
      }
      return uniqueUsers([...prev, user]);
    });
  }

  function focusRestaurant(restaurant: Restaurant) {
    const id = restaurantKey(restaurant);
    setSelectedRestaurantId(id);
    const element = document.getElementById(`restaurant-rank-${id}`);
    element?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  const socialOrbitPool = friends.length > 0
    ? friends
    : allUsers.filter((user) => user.id !== currentUser?.id);
  const visibleSocialFriends = socialOrbitPool.slice(0, 6);
  const orbitRestaurants = displayedOrbitRestaurants.slice(0, MAX_ORBIT_RESTAURANTS);
  const selectedRestaurant = [
    ...rankedRestaurants,
    ...displayedOrbitRestaurants,
    ...nearbyRestaurants,
  ].find((restaurant) => restaurantKey(restaurant) === selectedRestaurantId);

  const absorbUnselectedFriends =
    loadingSearch || orbitPhase === "searching" || orbitPhase === "results";

  return (
    <div className="min-h-full overflow-x-hidden px-6 py-4 lg:px-10">
      <section className="relative mx-auto flex min-h-full w-full max-w-[1380px] flex-col">
        <div className="absolute right-0 top-2 z-40 sm:top-4">
          <div className="relative">
            <button
              onClick={() => setShowLocationEditor((prev) => !prev)}
              className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/88 px-4 py-2.5 text-sm font-semibold text-[var(--foreground)] shadow-[0_16px_40px_rgba(145,94,255,0.1)] backdrop-blur-xl transition hover:bg-white"
            >
              <MapPin className="h-4 w-4 text-[var(--accent)]" />
              {activeLocation?.label || "Setting location..."}
            </button>

            <AnimatePresence>
              {showLocationEditor && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 12, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.98 }}
                  className="absolute left-1/2 z-50 mt-2 w-[min(92vw,340px)] -translate-x-1/2 rounded-[28px] border border-white/70 bg-white/95 p-4 shadow-[0_22px_70px_rgba(145,94,255,0.12)] backdrop-blur-xl sm:left-auto sm:right-0 sm:translate-x-0"
                >
                  <p className="text-sm font-semibold text-[var(--foreground)]">Choose location</p>
                  <div className="mt-3 flex items-center gap-2 rounded-2xl border border-[var(--border)] bg-white px-3 py-3">
                    <Search className="h-4 w-4 text-[var(--muted-foreground)]" />
                    <input
                      value={locationInput}
                      onChange={(event) => setLocationInput(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          void handleResolveLocation();
                        }
                      }}
                      placeholder="Chicago, IL"
                      className="w-full bg-transparent text-sm text-[var(--foreground)] outline-none"
                    />
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button
                      onClick={() => void handleResolveLocation()}
                      disabled={locationBusy || !locationInput.trim()}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-105 disabled:opacity-40"
                    >
                      {locationBusy ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Search className="h-4 w-4" />
                      )}
                      Resolve
                    </button>
                    <button
                      onClick={() => void handleUseCurrentLocation()}
                      disabled={locationBusy}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--background)] disabled:opacity-40"
                    >
                      <Navigation className="h-4 w-4 text-[var(--accent-light)]" />
                      Use current
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="relative z-10 flex w-full flex-1 flex-col items-center justify-center pt-20 sm:pt-24">
          <div className="relative -mt-2 flex w-full min-h-[min(72vw,52vh,520px)] flex-1 items-center justify-center sm:-mt-3">
            <div className="pointer-events-none absolute inset-x-[14%] top-[8%] h-40 rounded-full bg-[radial-gradient(circle,rgba(145,94,255,0.16),rgba(255,255,255,0)_72%)] blur-3xl" />
            <div className="pointer-events-none absolute inset-x-[22%] bottom-[18%] h-28 rounded-full bg-[radial-gradient(circle,rgba(255,138,61,0.12),rgba(255,255,255,0)_78%)] blur-3xl" />

            <div
              className="relative flex items-center justify-center overflow-visible"
              style={{
                width: "min(86vw, 72vh, 880px)",
                height: "min(86vw, 72vh, 880px)",
                maxWidth: "100%",
              }}
            >
              <div className="pointer-events-none absolute inset-[8%] rounded-full border border-white/35" />
              <div className="pointer-events-none absolute inset-[23%] rounded-full border border-[rgba(145,94,255,0.14)]" />
              <div className="pointer-events-none absolute inset-[34%] rounded-full border border-[rgba(17,181,164,0.14)]" />

              <AnimatePresence>
                {orbitRestaurants.map((restaurant, index) => {
                  const angle =
                    ((index / Math.max(orbitRestaurants.length, 1)) * 360 + rotation) *
                    (Math.PI / 180);
                  const left = 50 + Math.cos(angle) * 45;
                  const top = 50 + Math.sin(angle) * 45;
                  const isSelected = selectedRestaurantId === restaurantKey(restaurant);
                  const imageUrl = restaurant.photo_url || fallbackImage(restaurant);

                  return (
                    <motion.button
                      key={restaurantKey(restaurant)}
                      onClick={() => focusRestaurant(restaurant)}
                      initial={{ opacity: 0, scale: 0.42 }}
                      animate={{
                        opacity: 1,
                        left: `${left}%`,
                        top: `${top}%`,
                        scale: isSelected ? 1.08 : 1,
                      }}
                      exit={{ opacity: 0, scale: 0.22, filter: "blur(8px)" }}
                      transition={{
                        left: { duration: 0.28, ease: "linear" },
                        top: { duration: 0.28, ease: "linear" },
                        opacity: { duration: 0.22 },
                        scale: { duration: 0.2 },
                      }}
                      className="absolute z-10 h-[102px] w-[102px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[28px] border border-white/90 bg-white/86 p-1.5 shadow-[0_16px_42px_rgba(145,94,255,0.12)] backdrop-blur-xl sm:h-[118px] sm:w-[118px]"
                      style={{
                        willChange: "left, top, transform, opacity",
                        boxShadow: isSelected
                          ? "0 0 0 2px rgba(145,94,255,0.16), 0 16px 42px rgba(145,94,255,0.18)"
                          : undefined,
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imageUrl}
                        alt={restaurant.name}
                        className="h-full w-full rounded-[22px] object-cover"
                      />
                      <div className="pointer-events-none absolute inset-x-2 bottom-2 rounded-full bg-black/58 px-2 py-1 text-[10px] font-semibold text-white">
                        <div className="truncate">{restaurant.name}</div>
                      </div>
                    </motion.button>
                  );
                })}
              </AnimatePresence>

              {visibleSocialFriends.map((friend, index) => {
                const selected = selectedFriends.some((item) => item.id === friend.id);
                const n = Math.max(visibleSocialFriends.length, 1);
                const baseAngleDeg = (index / n) * 360;
                const angleJitterDeg = (stableUnitFromId(`${friend.id}:orbitA`) - 0.5) * 32;
                const angleDeg = baseAngleDeg + angleJitterDeg - rotation * 0.58;
                const angle = angleDeg * (Math.PI / 180);
                const orbitRadiusPct =
                  19.5 + stableUnitFromId(`${friend.id}:orbitR`) * 16.5 + (selected ? 4.5 : 0);
                const left = 50 + Math.cos(angle) * orbitRadiusPct;
                const top = 50 + Math.sin(angle) * orbitRadiusPct;
                const suckedIn = !selected && absorbUnselectedFriends;

                return (
                  <motion.button
                    key={`social-${friend.id}`}
                    onClick={() => toggleFriend(friend)}
                    animate={
                      suckedIn
                        ? {
                            left: "50%",
                            top: "50%",
                            scale: 0.06,
                            opacity: 0,
                            zIndex: 38,
                          }
                        : {
                            left: `${left}%`,
                            top: `${top}%`,
                            scale: selected ? 1.08 : 0.98,
                            opacity: 1,
                            zIndex: selected ? 22 : 20,
                          }
                    }
                    transition={
                      suckedIn
                        ? {
                            duration: 0.52,
                            ease: [0.55, 0.06, 0.68, 0.19],
                          }
                        : {
                            left: { duration: 0.34, ease: "linear" },
                            top: { duration: 0.34, ease: "linear" },
                            scale: { duration: 0.35, ease: "easeOut" },
                            opacity: { duration: 0.35, ease: "easeOut" },
                            zIndex: { duration: 0 },
                          }
                    }
                    className={`absolute z-20 -translate-x-1/2 -translate-y-1/2 rounded-full p-2 ${
                      suckedIn ? "pointer-events-none" : ""
                    }`}
                    style={{
                      width: selected ? 84 : 76,
                      height: selected ? 84 : 76,
                      border: selected
                        ? "2px solid rgba(255, 207, 92, 0.92)"
                        : "2px solid rgba(148, 148, 148, 0.42)",
                      background: selected ? "rgba(255,255,255,0.96)" : "rgba(255,255,255,0.82)",
                      boxShadow: selected
                        ? "0 0 0 4px rgba(255,232,170,0.46), 0 0 32px rgba(255,204,92,0.52), 0 16px 40px rgba(255,190,92,0.24)"
                        : "0 0 0 4px rgba(255,255,255,0.38), 0 12px 28px rgba(140,140,140,0.14)",
                    }}
                  >
                    <motion.img
                      animate={{
                        filter: selected ? "grayscale(0%) saturate(1.08)" : "grayscale(100%) saturate(0)",
                        opacity: selected ? 1 : 0.86,
                      }}
                      transition={{ duration: 0.28, ease: "easeInOut" }}
                      src={friend.avatar}
                      alt={friend.name}
                      className="h-full w-full rounded-full object-cover"
                    />
                  </motion.button>
                );
              })}

              <div className="absolute left-1/2 top-1/2 z-30 -translate-x-1/2 -translate-y-1/2">
                <CenterOrb orbitPhase={orbitPhase} />
              </div>
            </div>
          </div>

          <AnimatePresence>
            {selectedRestaurant && (
              <RestaurantSidebar
                restaurant={selectedRestaurant}
                locationLabel={activeLocation?.label}
                onClose={() => setSelectedRestaurantId(null)}
              />
            )}
          </AnimatePresence>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              void handleSearch();
            }}
            className="relative z-40 mt-8 w-full max-w-[820px] shrink-0 sm:mt-10"
          >
            <div className="flex items-center gap-2.5 rounded-full border border-white/80 bg-white/90 px-4 py-2.5 shadow-[0_14px_40px_rgba(145,94,255,0.1)] backdrop-blur-xl sm:gap-3 sm:px-5 sm:py-3">
              <Search className="h-4 w-4 shrink-0 text-[var(--muted-foreground)]" />
              <div className="relative flex-1">
                {!query.trim() && typedPlaceholder && (
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center text-[var(--muted-foreground)]">
                    {typedPlaceholder}
                  </div>
                )}
                <MentionInput
                  value={query}
                  onChange={setQuery}
                  onMentionAdd={addSelectedFriend}
                  users={friends}
                  placeholder=""
                  onSubmit={() => void handleSearch()}
                />
              </div>
              <div className="hidden shrink-0 rounded-full bg-[rgba(145,94,255,0.08)] px-2.5 py-1 text-[11px] font-medium text-[rgba(117,76,207,1)] sm:inline-flex sm:px-3 sm:py-1.5 sm:text-xs">
                @ mention friends
              </div>
              <button
                type="submit"
                disabled={loadingSearch || !activeLocation || !query.trim()}
                className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-full bg-[linear-gradient(135deg,#915eff,var(--accent))] px-3.5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(145,94,255,0.22)] transition hover:brightness-105 disabled:opacity-40 sm:h-10 sm:gap-2 sm:px-4"
              >
                {loadingSearch ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                Search
              </button>
            </div>
          </form>

          {error && (
            <div className="mt-3 rounded-full border border-red-300/70 bg-red-50/90 px-5 py-3 text-sm text-red-700 shadow-[0_14px_32px_rgba(239,68,68,0.08)]">
              {error}
            </div>
          )}

          {(loadingSearch || rankedRestaurants.length > 0) && (
            <div className="mt-4 w-full max-w-[1080px] shrink-0 pb-10">
              <div className="rounded-[30px] border border-white/70 bg-white/70 px-4 py-3 shadow-[0_16px_40px_rgba(145,94,255,0.08)] backdrop-blur-xl">
                <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      {results?.search_summary || "Final ranked restaurants"}
                    </p>
                    {activeLocation && (
                      <p className="mt-1 text-xs uppercase tracking-[0.24em] text-[var(--muted-foreground)]/90">
                        {activeLocation.label}
                      </p>
                    )}
                  </div>
                  {loadingSearch && (
                    <div className="inline-flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                      <Loader2 className="h-4 w-4 animate-spin text-[var(--accent)]" />
                      Narrowing the orbit
                    </div>
                  )}
                </div>

                <div className="flex gap-3 overflow-x-auto pb-1">
                  {rankedRestaurants.length > 0 ? (
                    rankedRestaurants.map((restaurant, index) => {
                      return (
                        <CompactResultCard
                          key={restaurantKey(restaurant)}
                          restaurant={restaurant}
                          index={index}
                          selected={selectedRestaurantId === restaurantKey(restaurant)}
                          onClick={() => focusRestaurant(restaurant)}
                        />
                      );
                    })
                  ) : (
                    <div className="rounded-[24px] border border-dashed border-[rgba(145,94,255,0.16)] bg-white/75 px-4 py-5 text-sm text-[var(--muted-foreground)]">
                      AI is narrowing the nearby orbit down to the final set.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
