import type { PlaceDetails } from "@tableus/api-client";

import { createCanonicalJoinUrl } from "./links";

export function joinUrl(planId: string, shareToken: string): string {
  // Local development has no universal-link host, so links point at this server.
  if (process.env.NODE_ENV !== "production" && !process.env.NEXT_PUBLIC_LINK_ORIGIN) {
    const url = new URL(`/join/${planId}`, window.location.origin);
    url.searchParams.set("token", shareToken);
    return url.toString();
  }
  return createCanonicalJoinUrl(planId, shareToken);
}

export function mapsUrl(place: PlaceDetails): string {
  const url = new URL("https://www.google.com/maps/search/");
  url.searchParams.set("api", "1");
  url.searchParams.set("query", `${place.name} ${place.address}`);
  if (place.data_provider === "google_maps") url.searchParams.set("query_place_id", place.place_id);
  return url.toString();
}

export const price = (level: number) => "$".repeat(Math.max(1, Math.min(level, 4)));
