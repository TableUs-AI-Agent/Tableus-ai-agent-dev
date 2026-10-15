"use client";

export type PlushSpecies =
  | "cat"
  | "bunny"
  | "koala"
  | "bear"
  | "bat"
  | "duck"
  | "pineapple"
  | "strawberry";

export type PlushOutfit =
  | "kit-red"
  | "kit-blue"
  | "kit-green"
  | "kit-yellow"
  | "tee-stripe"
  | "tee-plain"
  | "hoodie"
  | "overalls";

export type PlushLook = {
  species: PlushSpecies;
  outfit: PlushOutfit;
};

export type SpeciesSpec = {
  label: string;
  kind: "animal" | "fruit";
  body: string;
  belly: string;
  inner: string;
  swatch: string;
};

export type OutfitSpec = {
  label: string;
  kind: "kit" | "casual";
  main: string;
  side: string;
  trim: string;
  text: string;
  swatch: string;
};

export const SPECIES_SPECS: Record<PlushSpecies, SpeciesSpec> = {
  cat: { label: "Cat", kind: "animal", body: "#f6e7d3", belly: "#fff8ec", inner: "#f5b3c0", swatch: "#f6e7d3" },
  bunny: { label: "Bunny", kind: "animal", body: "#e6d6f4", belly: "#f9f2ff", inner: "#f2bcd3", swatch: "#e6d6f4" },
  koala: { label: "Koala", kind: "animal", body: "#b7bfcc", belly: "#eaeef3", inner: "#f0b8c2", swatch: "#b7bfcc" },
  bear: { label: "Bear", kind: "animal", body: "#c99a6a", belly: "#ecd2ae", inner: "#8a5f3c", swatch: "#c99a6a" },
  bat: { label: "Bat", kind: "animal", body: "#7fb4e6", belly: "#d9ecff", inner: "#4a7cb3", swatch: "#7fb4e6" },
  duck: { label: "Duck", kind: "animal", body: "#63b163", belly: "#d2ecc9", inner: "#f2b53c", swatch: "#63b163" },
  pineapple: { label: "Pineapple", kind: "fruit", body: "#f4c44a", belly: "#f4c44a", inner: "#4f9a48", swatch: "#f4c44a" },
  strawberry: { label: "Strawberry", kind: "fruit", body: "#ee5e72", belly: "#f88b9b", inner: "#4f9a48", swatch: "#ee5e72" },
};

export const OUTFIT_SPECS: Record<PlushOutfit, OutfitSpec> = {
  "kit-red": { label: "Red Kit", kind: "kit", main: "#d9402f", side: "#9c241b", trim: "#ffffff", text: "#ffffff", swatch: "#d9402f" },
  "kit-blue": { label: "Blue Kit", kind: "kit", main: "#2f5fb3", side: "#1d3c78", trim: "#ffffff", text: "#ffffff", swatch: "#2f5fb3" },
  "kit-green": { label: "Green Kit", kind: "kit", main: "#2f8a4f", side: "#1d5c33", trim: "#ffffff", text: "#ffffff", swatch: "#2f8a4f" },
  "kit-yellow": { label: "Yellow Kit", kind: "kit", main: "#f1c83b", side: "#d3992a", trim: "#33312c", text: "#33312c", swatch: "#f1c83b" },
  "tee-stripe": { label: "Striped Tee", kind: "casual", main: "#f6f1e6", side: "#36506e", trim: "#36506e", text: "#36506e", swatch: "#f6f1e6" },
  "tee-plain": { label: "Pastel Tee", kind: "casual", main: "#ffd9e2", side: "#f3a8bd", trim: "#ffffff", text: "#c25e7d", swatch: "#ffd9e2" },
  hoodie: { label: "Hoodie", kind: "casual", main: "#8fa0b6", side: "#74859c", trim: "#dde5ee", text: "#dde5ee", swatch: "#8fa0b6" },
  overalls: { label: "Overalls", kind: "casual", main: "#5577a8", side: "#41608d", trim: "#f6f1e6", text: "#f6f1e6", swatch: "#5577a8" },
};

export const PLUSH_SPECIES_OPTIONS = (Object.keys(SPECIES_SPECS) as PlushSpecies[]).map((id) => ({
  id,
  label: SPECIES_SPECS[id].label,
  kind: SPECIES_SPECS[id].kind,
  swatch: SPECIES_SPECS[id].swatch,
}));

export const PLUSH_OUTFIT_OPTIONS = (Object.keys(OUTFIT_SPECS) as PlushOutfit[]).map((id) => ({
  id,
  label: OUTFIT_SPECS[id].label,
  kind: OUTFIT_SPECS[id].kind,
  swatch: OUTFIT_SPECS[id].swatch,
}));

export function plushStorageKey(userId: string) {
  return `tableus:plush-look:${userId}`;
}

export function stablePlushUnit(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967296;
}

export function defaultLookFor(id: string): PlushLook {
  const speciesIds = Object.keys(SPECIES_SPECS) as PlushSpecies[];
  const outfitIds = Object.keys(OUTFIT_SPECS) as PlushOutfit[];
  return {
    species: speciesIds[Math.floor(stablePlushUnit(`${id}:species`) * speciesIds.length) % speciesIds.length],
    outfit: outfitIds[Math.floor(stablePlushUnit(`${id}:outfit`) * outfitIds.length) % outfitIds.length],
  };
}

export function lookKeyOf(look: PlushLook) {
  return `${look.species}/${look.outfit}`;
}

export function jerseyNumberFor(id: string) {
  return 1 + (Math.floor(stablePlushUnit(`${id}:number`) * 12) % 12);
}
