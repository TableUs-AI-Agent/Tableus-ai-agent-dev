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
