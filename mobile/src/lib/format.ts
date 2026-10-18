import type { PlaceDetails } from "@tableus/api-client";

export const price = (level: number) => "$".repeat(Math.max(1, Math.min(level, 4)));

export function mapsUrl(place: PlaceDetails): string {
  const query = encodeURIComponent(`${place.name} ${place.address}`);
  const id = place.data_provider === "google_maps" ? `&query_place_id=${encodeURIComponent(place.place_id)}` : "";
  return `https://www.google.com/maps/search/?api=1&query=${query}${id}`;
}

export function initials(name: string): string {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "?";
}

/** Place photos are API paths, so they load from the same API the app talks to. */
export const photoUrl = (place: PlaceDetails) =>
  place.photo_url ? `${process.env.EXPO_PUBLIC_API_URL ?? ""}${place.photo_url}` : null;

/** "Just now", "5m", "3h", "2d", then a short date, like a messages list. */
export function since(iso: string, now = Date.now()): string {
  const minutes = Math.round((now - new Date(iso).getTime()) / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (minutes < 60 * 24) return `${Math.round(minutes / 60)}h ago`;
  if (minutes < 60 * 24 * 7) return `${Math.round(minutes / 1440)}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

/** Straight-line distance from the plan's spot, the way restaurant apps show it: "0.4 mi", "12 mi". */
export function distance(
  from: { latitude: number | null; longitude: number | null },
  to: { latitude: number; longitude: number },
): string | null {
  if (from.latitude === null || from.longitude === null) return null;
  const rad = (value: number) => (value * Math.PI) / 180;
  const dLat = rad(to.latitude - from.latitude);
  const dLng = rad(to.longitude - from.longitude);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(rad(from.latitude)) * Math.cos(rad(to.latitude)) * Math.sin(dLng / 2) ** 2;
  const miles = 3958.8 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return miles < 10 ? `${miles.toFixed(1)} mi` : `${Math.round(miles)} mi`;
}
