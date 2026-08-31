"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
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

const DiscoverTabletopScene = dynamic(
  () => import("../components/discover-tabletop-scene").then((module) => module.DiscoverTabletopScene),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[420px] items-center justify-center rounded-[2rem] bg-stone-100 text-sm text-stone-600">
        Preparing the tabletop…
      </div>
    ),
  },
);

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

function friendChipLabel(user: DemoUser) {
  const parts = user.name.trim().split(/\s+/);
  if (parts.length <= 1) return parts[0] || user.name;
  return `${parts[0]} ${parts[parts.length - 1][0]?.toUpperCase()}.`;
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

function safeRestaurantImage(restaurant: Restaurant) {
  const imageUrl = restaurant.photo_url || "";
  const lower = imageUrl.toLowerCase();
  if (!imageUrl || lower.includes("key=") || lower.includes("maps.googleapis.com/maps/api/place/photo")) {
    return fallbackImage(restaurant);
  }
  return imageUrl;
}

function hydrateRestaurant(restaurant: Restaurant) {
  return {
    ...restaurant,
    photo_url: safeRestaurantImage(restaurant),
  };
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
      className={`group min-w-[300px] rounded-[24px] border bg-white/90 p-2.5 text-left shadow-[0_16px_38px_rgba(63,84,104,0.08)] backdrop-blur-xl transition ${
        selected
          ? "border-[rgba(145,94,255,0.38)] bg-white shadow-[0_18px_44px_rgba(145,94,255,0.16)]"
          : "border-white/75 hover:border-[rgba(17,181,164,0.26)] hover:shadow-[0_18px_44px_rgba(17,181,164,0.1)]"
      }`}
    >
      <div className="flex items-center gap-3.5">
        <div className="relative h-[76px] w-[76px] shrink-0 overflow-hidden rounded-[20px] border border-white/80 bg-[var(--muted)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.45)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={safeRestaurantImage(restaurant)}
            alt={restaurant.name}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-black/42 to-transparent" />
          <span className="absolute bottom-1.5 left-1.5 rounded-full bg-white/92 px-2 py-0.5 text-[10px] font-extrabold text-[rgba(117,76,207,1)] shadow-sm">
            #{index + 1}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-sm font-semibold text-[var(--foreground)]">
              {restaurant.name}
            </p>
            {restaurant.match_score != null && (
              <span className="shrink-0 rounded-full bg-[linear-gradient(135deg,rgba(145,94,255,0.12),rgba(17,181,164,0.1))] px-2.5 py-1 text-[11px] font-bold text-[rgba(117,76,207,1)]">
                {scorePercent}%
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            {restaurant.cuisine}
            {restaurant.distance_label ? ` • ${restaurant.distance_label}` : ""}
          </p>
          {restaurant.reasoning && (
            <p className="mt-2 line-clamp-2 rounded-2xl bg-[rgba(17,181,164,0.07)] px-3 py-2 text-xs leading-relaxed text-[var(--muted-foreground)]">
              {restaurant.reasoning}
            </p>
          )}
        </div>
      </div>
      {restaurant.match_score != null && (
        <div className="mt-2.5 px-1">
          <div className="h-1.5 overflow-hidden rounded-full bg-[rgba(145,94,255,0.08)]">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,#915eff,var(--accent),var(--accent-light))] transition-all duration-700"
              style={{ width: `${scorePercent}%` }}
            />
          </div>
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
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[75] bg-[rgba(31,41,55,0.18)] backdrop-blur-[2px] lg:hidden"
        onClick={onClose}
      />
      <motion.aside
        initial={{ opacity: 0, x: 36 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 36 }}
        transition={{ duration: 0.26, ease: "easeOut" }}
        className="fixed inset-x-3 bottom-[calc(1rem+env(safe-area-inset-bottom))] top-3 z-[80] flex w-auto flex-col overflow-hidden rounded-[28px] border border-white/80 bg-white/92 shadow-[0_22px_60px_rgba(145,94,255,0.14)] backdrop-blur-2xl sm:inset-x-5 sm:top-5 lg:inset-x-auto lg:bottom-auto lg:right-5 lg:top-[4.5rem] lg:h-[min(calc(100vh-5rem),900px)] lg:w-[min(480px,calc(100vw-18rem-2rem))] lg:rounded-[32px]"
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
          src={safeRestaurantImage(restaurant)}
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
    </>
  );
}

export default function DiscoverPage() {
  const { currentUser, friends } = useUser();
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
  const [orbitPhase, setOrbitPhase] = useState<"idle" | "searching" | "results">("idle");
  const [nearbyRestaurants, setNearbyRestaurants] = useState<Restaurant[]>([]);
  const [displayedOrbitRestaurants, setDisplayedOrbitRestaurants] = useState<Restaurant[]>([]);
  const [rankedRestaurants, setRankedRestaurants] = useState<Restaurant[]>([]);
  const [results, setResults] = useState<SearchResult | null>(null);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(null);
  const [compactOrbit, setCompactOrbit] = useState(false);
  const animationTokenRef = useRef(0);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 639px)");
    const syncCompactOrbit = () => setCompactOrbit(mediaQuery.matches);
    syncCompactOrbit();
    mediaQuery.addEventListener("change", syncCompactOrbit);
    return () => mediaQuery.removeEventListener("change", syncCompactOrbit);
  }, []);

  useEffect(() => {
    if (query.trim()) return;

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
    const resetTimer = window.setTimeout(() => {
      setSelectedFriends([]);
      setResults(null);
      setRankedRestaurants([]);
      setSelectedRestaurantId(null);
      setOrbitPhase("idle");
    }, 0);

    return () => window.clearTimeout(resetTimer);
  }, [currentUser?.id]);

  async function loadNearby(location: ActiveLocation) {
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

      const hydratedRestaurants = data.restaurants.map(hydrateRestaurant);

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
      const grantedLocation = await getGrantedBrowserLocation();
      if (grantedLocation && active) {
        await loadNearby(grantedLocation);
        return;
      }

      if (!active) return;
      await loadNearby(DEFAULT_LOCATION);
    }

    void initializeLocation();
    return () => {
      active = false;
    };
  }, [currentUser?.id]);

  async function animateConvergence(response: SearchResult, token: number) {
    const topRestaurants = response.top_restaurants.map(hydrateRestaurant);
    const topIds = new Set(topRestaurants.map((restaurant) => restaurantKey(restaurant)));
    const startingPool = (response.nearby_restaurants.length
      ? response.nearby_restaurants
      : nearbyRestaurants
    ).map(hydrateRestaurant);

    setDisplayedOrbitRestaurants(startingPool);
    setRankedRestaurants([]);
    await wait(260);
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
      await wait(68);
    }

    if (animationTokenRef.current !== token) return;

    setDisplayedOrbitRestaurants([]);
    await wait(520);
    if (animationTokenRef.current !== token) return;

    setDisplayedOrbitRestaurants(topRestaurants.slice(0, 4));
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
      const refreshedNearby = response.nearby_restaurants.map(hydrateRestaurant);
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
      await loadNearby({ ...resolved, radius_meters: 2000 });
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
        }
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

  function removeSelectedFriend(id: string) {
    setSelectedFriends((prev) => prev.filter((friend) => friend.id !== id));
  }

  function focusRestaurant(restaurant: Restaurant) {
    const id = restaurantKey(restaurant);
    setSelectedRestaurantId(id);
    const element = document.getElementById(`restaurant-rank-${id}`);
    element?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  const orbitRestaurants =
    orbitPhase === "results"
      ? displayedOrbitRestaurants.slice(0, 4)
      : displayedOrbitRestaurants.slice(0, MAX_ORBIT_RESTAURANTS);
  const selectedRestaurant = [
    ...rankedRestaurants,
    ...displayedOrbitRestaurants,
    ...nearbyRestaurants,
  ].find((restaurant) => restaurantKey(restaurant) === selectedRestaurantId);
  const orbitCenterX = 50;
  const orbitCenterY = compactOrbit ? 52 : 53;

  return (
    <div className="min-h-full overflow-x-clip">
      <section className="relative mx-auto flex min-h-full w-full max-w-none flex-col">
        <AnimatePresence>
          {orbitPhase === "searching" && (
            <motion.div
              key="search-wave-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.42, ease: "easeOut" }}
              className="search-wave-backdrop pointer-events-none fixed inset-0 z-0 overflow-hidden"
            />
          )}
        </AnimatePresence>
        <div className="absolute right-6 top-4 z-40 lg:right-10">
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

        <div className="relative z-10 flex w-full flex-1 flex-col items-center justify-start">
          <div className="relative h-[100svh] w-full flex-none overflow-hidden pt-6 sm:pt-8 lg:pt-10">
            <div className="relative flex h-[calc(100svh+240px)] min-h-[980px] w-full flex-none items-center justify-center">
              <div className="pointer-events-none absolute inset-x-[14%] top-[8%] h-40 rounded-full bg-[radial-gradient(circle,rgba(145,94,255,0.16),rgba(255,255,255,0)_72%)] blur-3xl" />
              <div className="pointer-events-none absolute inset-x-[22%] bottom-[18%] h-28 rounded-full bg-[radial-gradient(circle,rgba(255,138,61,0.12),rgba(255,255,255,0)_78%)] blur-3xl" />

              <div
                className="relative flex items-center justify-center overflow-visible"
                style={{
                  width: "100%",
                  height: "calc(100svh + 240px)",
                  minHeight: "980px",
                  maxWidth: "100%",
                  perspective: compactOrbit ? "720px" : "980px",
                  transformStyle: "preserve-3d",
                }}
              >
                <div
                  className="absolute z-30 h-full w-full"
                  style={{
                    left: `${orbitCenterX}%`,
                    top: `${orbitCenterY}%`,
                    transform: compactOrbit ? "translate(-50%, -55%)" : "translate(-50%, -56%)",
                  }}
                >
                  <DiscoverTabletopScene
                    currentUser={currentUser}
                    friends={selectedFriends}
                    phase={orbitPhase}
                    restaurants={orbitRestaurants}
                    selectedRestaurantId={selectedRestaurantId}
                    onRestaurantSelect={focusRestaurant}
                  />
                </div>
              </div>
            </div>

            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 z-40 h-[30vh]"
              style={{
                background:
                  "linear-gradient(to bottom, rgba(247,244,239,0), rgba(247,244,239,0.58) 58%, rgba(247,244,239,0.98))",
              }}
            />

            <form
              onSubmit={(event) => {
                event.preventDefault();
                void handleSearch();
              }}
              className="absolute bottom-[calc(6.5rem+env(safe-area-inset-bottom))] left-1/2 z-50 shrink-0 -translate-x-1/2 lg:bottom-[calc(1.75rem+env(safe-area-inset-bottom))]"
              style={{
                width: "min(820px, calc(100vw - 2rem))",
                maxWidth: "calc(100% - 2rem)",
              }}
            >
              <div className="flex min-h-[58px] items-center gap-2.5 rounded-full border border-white/80 bg-white/90 px-4 py-2 shadow-[0_18px_52px_rgba(145,94,255,0.14)] backdrop-blur-xl sm:gap-3 sm:px-5">
                <Search className="h-4 w-4 shrink-0 text-[var(--muted-foreground)]" />
                <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5 py-1">
                  {selectedFriends.map((friend) => (
                    <span
                      key={friend.id}
                      className="inline-flex h-8 max-w-[150px] items-center gap-1.5 rounded-full bg-[rgba(145,94,255,0.1)] px-2.5 text-xs font-semibold text-[rgba(103,68,190,1)]"
                    >
                      <span className="truncate">{friendChipLabel(friend)}</span>
                      <button
                        type="button"
                        onClick={() => removeSelectedFriend(friend.id)}
                        className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[rgba(103,68,190,0.72)] transition hover:bg-white/80 hover:text-[rgba(103,68,190,1)]"
                        aria-label={`Remove ${friend.name}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  <div className="relative min-w-[170px] flex-1">
                    {!query.trim() && selectedFriends.length === 0 && typedPlaceholder && (
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center text-[var(--muted-foreground)]">
                        {typedPlaceholder}
                      </div>
                    )}
                    <MentionInput
                      value={query}
                      onChange={setQuery}
                      onMentionAdd={addSelectedFriend}
                      users={friends.filter((friend) => !selectedFriends.some((selected) => selected.id === friend.id))}
                      placeholder={selectedFriends.length > 0 ? "Add more or search..." : ""}
                      onSubmit={() => void handleSearch()}
                    />
                  </div>
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
