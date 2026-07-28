"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import type { Restaurant } from "./restaurant-card";
import {
  defaultLookFor,
  jerseyNumberFor,
  lookKeyOf,
  OUTFIT_SPECS,
  plushStorageKey,
  SPECIES_SPECS,
  type OutfitSpec,
  type PlushLook,
  type PlushOutfit,
  type PlushSpecies,
  type SpeciesSpec,
} from "../lib/plush-avatar";

type ScenePerson = {
  id: string;
  name: string;
  avatar: string;
  look?: PlushLook;
};

type OrbitPhase = "idle" | "searching" | "results";
type CharacterMode = "idle" | "walk" | "wave" | "look" | "think" | "phone" | "cheer" | "surprise";

type CharacterHandle = {
  group: THREE.Group;
  body: THREE.Group;
  head: THREE.Object3D;
  leftArm: THREE.Object3D;
  rightArm: THREE.Object3D;
  phone: THREE.Object3D;
  phoneMaterial: THREE.MeshStandardMaterial;
  phoneScreenMaterial: THREE.MeshStandardMaterial;
  phoneDetailMaterial: THREE.MeshBasicMaterial;
  baseMouth: THREE.Object3D;
  surpriseMouth: THREE.Object3D;
  shadow: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
  spawnRing: THREE.Mesh<THREE.TorusGeometry, THREE.MeshBasicMaterial>;
  shadowMaterial: THREE.MeshBasicMaterial;
  materials: THREE.Material[];
  eyeMeshes: THREE.Mesh[];
  pupilMeshes: THREE.Mesh[];
  baseScale: number;
  homeTarget: THREE.Vector2;
  seed: number;
  walkPhase: number;
  walkBlend: number;
  nextBlinkAt: number;
  blinkStartedAt: number;
  nextSaccadeAt: number;
  saccadeEndAt: number;
  saccadeX: number;
  saccadeY: number;
  nextHeadShiftAt: number;
  headShiftX: number;
  headShiftY: number;
  headShiftCurrentX: number;
  headShiftCurrentY: number;
  target: THREE.Vector2;
  focusTargetId: string | null;
  nextTargetAt: number;
  mode: CharacterMode;
  lastActionMode: CharacterMode | null;
  modeStartedAt: number;
  modeUntil: number;
  hasLookedAround: boolean;
  popProgress: number;
  exitProgress: number;
  exiting: boolean;
  isUser: boolean;
};

type RestaurantCardHandle = {
  id: string;
  restaurant: Restaurant;
  group: THREE.Group;
  cardHinge: THREE.Group;
  cardBody: THREE.Group;
  hitArea: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
  frameMaterial: THREE.MeshStandardMaterial;
  photoMaterial: THREE.MeshBasicMaterial;
  glossMaterial: THREE.MeshBasicMaterial;
  glowMaterial: THREE.MeshBasicMaterial;
  materials: THREE.Material[];
  slotIndex: number;
  slotCount: number;
  popProgress: number;
  exitProgress: number;
  exiting: boolean;
  selected: boolean;
  disposed: boolean;
  photoUrl: string;
  imageReady: boolean;
  imageFailed: boolean;
};

type SceneApi = {
  reconcile: () => void;
  reconcileRestaurants: () => void;
  characters: Map<string, CharacterHandle>;
  restaurantCards: Map<string, RestaurantCardHandle>;
};

const PLATFORM_RADIUS = 1.96;
const WALK_RADIUS = 1.08;
const CHARACTER_RADIUS = 0.78;
const USER_ID_PREFIX = "tabletop-user";
const RESTAURANT_CARD_WIDTH = 0.68;
const RESTAURANT_CARD_HEIGHT = 0.96;
const RESTAURANT_CARD_RADIUS = 0.09;
const RESTAURANT_ORBIT_RADIUS_X = 3.54;
const RESTAURANT_ORBIT_RADIUS_Z = 3.12;
const RESTAURANT_CARD_BASE_Y = 0.62;
const RESTAURANT_CARD_PIVOT_LIFT = (RESTAURANT_CARD_HEIGHT + 0.1) / 2;
const RESTAURANT_CARD_PETAL_TILT = -0.72;
const RESTAURANT_ORBIT_TILT_X = 0.16;
const RESTAURANT_CARD_REVEAL_SETTLE_DELAY = 0.08;
const RESTAURANT_CARD_REVEAL_STAGGER = 0.095;
const STAGE_BASE_ROTATION_X = -0.08;
const STAGE_BASE_POSITION_Y = 0.08;
const PLANET_BACKWARD_TILT_X = 0.12;
const RESULT_CARD_ROW_Y = 1.04;
const RESULT_CARD_ROW_Z = -1.32;
const RESULT_CARD_ROW_SPACING = 0.9;
const RESULT_CARD_SCALE = 1.04;
const PLANET_RADIUS = 3.34;
const PLANET_VERTICAL_SCALE = 0.64;
const PLANET_VERTICAL_RADIUS = PLANET_RADIUS * PLANET_VERTICAL_SCALE;
const PLANET_TOP_Y = 0.286;
const PLANET_CENTER_Y = PLANET_TOP_Y - PLANET_VERTICAL_RADIUS;

function crowdCharacterScale(count: number) {
  if (count <= 1) return 1;
  return Math.max(0.74, 0.88 - Math.min(count - 2, 4) * 0.055);
}

function characterHomePosition(index: number, count: number, isUser: boolean, seed: number) {
  if (count <= 1) return new THREE.Vector2(0, -0.12);

  if (isUser) return new THREE.Vector2(count === 2 ? 0.55 : 0, -0.5);

  const friendIndex = Math.max(0, index - 1);
  const slots = [
    new THREE.Vector2(count === 2 ? -0.86 : -0.78, count === 2 ? -0.05 : 0.02),
    new THREE.Vector2(0.78, 0.02),
    new THREE.Vector2(-0.46, 0.62),
    new THREE.Vector2(0.46, 0.62),
    new THREE.Vector2(0, 0.42),
    new THREE.Vector2(-0.84, 0.46),
    new THREE.Vector2(0.84, 0.46),
  ];
  const slot = slots[friendIndex % slots.length].clone();
  if (friendIndex < slots.length) return slot;

  const ringIndex = friendIndex - slots.length;
  const angle = -0.9 + (ringIndex % 8) * 0.26 + seed * 0.08;
  const radius = 0.84 + Math.floor(ringIndex / 8) * 0.08;
  return clampToWalkRadius(new THREE.Vector2(Math.sin(angle) * radius, Math.cos(angle) * radius * 0.64));
}

function planetSurfaceY(x: number, z: number) {
  const horizontalRadiusSq = PLANET_RADIUS * PLANET_RADIUS;
  const distanceSq = x * x + z * z;
  const normalizedDistance = Math.min(1, distanceSq / horizontalRadiusSq);
  return PLANET_CENTER_Y + PLANET_VERTICAL_RADIUS * Math.sqrt(Math.max(0, 1 - normalizedDistance));
}

function planetNormalAt(x: number, z: number) {
  const y = planetSurfaceY(x, z) - PLANET_CENTER_Y;
  return new THREE.Vector3(
    x / (PLANET_RADIUS * PLANET_RADIUS),
    y / (PLANET_VERTICAL_RADIUS * PLANET_VERTICAL_RADIUS),
    z / (PLANET_RADIUS * PLANET_RADIUS)
  ).normalize();
}

function updateCharacterContactShadow(
  handle: CharacterHandle,
  surfaceY: number,
  contactLift: number,
  opacity: number
) {
  const contactNormal = planetNormalAt(handle.group.position.x, handle.group.position.z);
  const shadowScale = Math.max(0.2, handle.group.scale.x || handle.baseScale);
  const liftFade = 1 - Math.min(0.82, contactLift * 2.8);
  handle.shadow.position
    .set(handle.group.position.x, surfaceY, handle.group.position.z)
    .addScaledVector(contactNormal, 0.026);
  handle.shadow.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), contactNormal);
  handle.shadow.rotateZ(handle.group.rotation.y);
  handle.shadow.scale.set(
    shadowScale * (0.42 + contactLift * 0.36),
    shadowScale * (0.25 + contactLift * 0.18),
    1
  );
  handle.shadowMaterial.opacity = opacity * 0.18 * liftFade;
}

function restaurantKey(restaurant: Restaurant) {
  return restaurant.place_id || restaurant.id || restaurant.name;
}

function stableUnit(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967296;
}


function pointInWalkRadius(seed: number, offset: number) {
  const angle = (seed * 8.13 + offset * 2.41) % (Math.PI * 2);
  const radius = 0.32 + ((seed * 3.77 + offset * 0.39) % 1) * WALK_RADIUS;
  return new THREE.Vector2(Math.cos(angle) * radius, Math.sin(angle) * radius);
}

function smallStepTarget(position: THREE.Vector2, seed: number, elapsed: number) {
  const angle = (seed * 9.7 + elapsed * 1.37) % (Math.PI * 2);
  const distance = 0.34 + ((seed * 5.1 + elapsed * 0.41) % 1) * 0.46;
  return clampToWalkRadius(
    position.clone().add(new THREE.Vector2(Math.cos(angle) * distance, Math.sin(angle) * distance))
  );
}

function clampToWalkRadius(position: THREE.Vector2) {
  const maxRadius = WALK_RADIUS - 0.16;
  if (position.length() <= maxRadius) return position;
  return position.normalize().multiplyScalar(maxRadius);
}

function easeOutBack(t: number) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

function easeInCubic(t: number) {
  return t * t * t;
}

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

function easeInOutSine(t: number) {
  return -(Math.cos(Math.PI * t) - 1) / 2;
}

function makeToonGradientMap() {
  return makeCanvasTextureWithSize(64, 1, (ctx, width) => {
    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    gradient.addColorStop(0, "#96a0b4");
    gradient.addColorStop(0.3, "#a3adc0");
    gradient.addColorStop(0.42, "#dde3ec");
    gradient.addColorStop(0.62, "#f4f6f9");
    gradient.addColorStop(0.8, "#ffffff");
    gradient.addColorStop(1, "#ffffff");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, 1);
  });
}

function createToonMaterial({
  color,
  map,
  opacity = 0,
  emissive,
  emissiveIntensity,
  transparent = true,
}: {
  color: THREE.ColorRepresentation;
  map?: THREE.Texture | null;
  opacity?: number;
  emissive?: THREE.ColorRepresentation;
  emissiveIntensity?: number;
  transparent?: boolean;
}) {
  const gradientMap = makeToonGradientMap();
  if (gradientMap) {
    gradientMap.minFilter = THREE.LinearFilter;
    gradientMap.magFilter = THREE.LinearFilter;
    gradientMap.generateMipmaps = false;
    gradientMap.needsUpdate = true;
  }
  const parameters: THREE.MeshToonMaterialParameters = {
    color,
    gradientMap: gradientMap || null,
    transparent,
    opacity,
  };
  if (map) parameters.map = map;
  if (emissive !== undefined) parameters.emissive = emissive;
  if (emissiveIntensity !== undefined) parameters.emissiveIntensity = emissiveIntensity;
  return new THREE.MeshToonMaterial(parameters);
}

function chooseNextMode(
  handle: CharacterHandle,
  elapsed: number,
  position: THREE.Vector2,
  socialTargets: Array<{ id: string; position: THREE.Vector2 }>
) {
  const roll = stableUnit(`${handle.seed}:${Math.floor(elapsed * 1.35)}`);
  const targetRoll = stableUnit(`${handle.seed}:target:${Math.floor(elapsed * 1.2)}`);
  const socialTarget =
    socialTargets.length > 0 ? socialTargets[Math.floor(targetRoll * socialTargets.length) % socialTargets.length] : null;

  const canUseMode = (mode: CharacterMode) =>
    mode === "idle" || mode !== handle.lastActionMode;

  const commit = (mode: CharacterMode, focusTargetId: string | null = null) => {
    handle.modeStartedAt = elapsed;
    handle.mode = mode;
    handle.focusTargetId = focusTargetId;
    handle.target = mode === "walk" ? smallStepTarget(position, handle.seed, elapsed) : position.clone();
    if (mode === "walk") handle.modeUntil = elapsed + 1.25 + handle.seed * 0.75;
    else if (mode === "phone") handle.modeUntil = elapsed + 3.0 + handle.seed * 0.9;
    else if (mode === "think") handle.modeUntil = elapsed + 2.4 + handle.seed * 0.65;
    else if (mode === "look") handle.modeUntil = elapsed + 2.8 + handle.seed * 0.5;
    else if (mode === "surprise") handle.modeUntil = elapsed + 1.15 + handle.seed * 0.2;
    else if (mode === "wave") handle.modeUntil = elapsed + 1.35 + handle.seed * 0.25;
    else handle.modeUntil = elapsed + 2.4 + handle.seed * 2.6;
    if (mode === "look") handle.hasLookedAround = true;
    if (mode !== "idle") handle.lastActionMode = mode;
  };

  const canLook = !handle.hasLookedAround;
  let proposed: CharacterMode = "idle";
  let proposedFocusTargetId: string | null = null;
  if (socialTarget && roll < 0.07) {
    proposed = "wave";
    proposedFocusTargetId = socialTarget.id;
  } else if (roll < 0.18) proposed = "walk";
  else if (!socialTarget && roll < 0.23) proposed = "wave";
  else if (roll < 0.31) proposed = "think";
  else if (roll < 0.39) proposed = "phone";
  else if (roll < 0.56) proposed = "surprise";
  else if (roll < 0.69 && canLook) proposed = "look";

  if (canUseMode(proposed) && (proposed !== "look" || canLook)) {
    commit(proposed, proposedFocusTargetId);
    return;
  }

  const fallbackModes: CharacterMode[] = socialTarget
    ? ["walk", "think", "surprise", "phone", "wave", "look", "idle"]
    : ["walk", "surprise", "think", "phone", "wave", "look", "idle"];
  const offset = Math.floor(stableUnit(`${handle.seed}:fallback:${Math.floor(elapsed * 1.7)}`) * fallbackModes.length);
  for (let i = 0; i < fallbackModes.length; i += 1) {
    const mode = fallbackModes[(offset + i) % fallbackModes.length];
    if (!canUseMode(mode)) continue;
    if (mode === "look" && !canLook) continue;
    commit(mode, mode === "wave" && socialTarget ? socialTarget.id : null);
    return;
  }

  commit("idle");
}

function makeCanvasTextureWithSize(
  width: number,
  height: number,
  painter: (ctx: CanvasRenderingContext2D, width: number, height: number) => void
) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  painter(ctx, width, height);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function makeCanvasTexture(size: number, painter: (ctx: CanvasRenderingContext2D) => void) {
  return makeCanvasTextureWithSize(size, size, (ctx) => painter(ctx));
}

function makeSoftContactShadowTexture() {
  return makeCanvasTextureWithSize(256, 256, (ctx, width, height) => {
    ctx.clearRect(0, 0, width, height);
    const gradient = ctx.createRadialGradient(
      width / 2,
      height / 2,
      width * 0.08,
      width / 2,
      height / 2,
      width * 0.48
    );
    gradient.addColorStop(0, "rgba(28,47,64,0.42)");
    gradient.addColorStop(0.38, "rgba(28,47,64,0.22)");
    gradient.addColorStop(0.72, "rgba(28,47,64,0.06)");
    gradient.addColorStop(1, "rgba(28,47,64,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  });
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function makeRestaurantGlossTexture() {
  return makeCanvasTextureWithSize(512, 640, (ctx, width, height) => {
    ctx.clearRect(0, 0, width, height);
    const gloss = ctx.createLinearGradient(0, 0, width, height * 0.66);
    gloss.addColorStop(0, "rgba(255,255,255,0.48)");
    gloss.addColorStop(0.28, "rgba(255,255,255,0.12)");
    gloss.addColorStop(0.5, "rgba(255,255,255,0)");
    ctx.fillStyle = gloss;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(width * 0.52, 0);
    ctx.lineTo(width * 0.25, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();

    const edge = ctx.createLinearGradient(0, 0, 0, height);
    edge.addColorStop(0, "rgba(255,255,255,0.34)");
    edge.addColorStop(0.16, "rgba(255,255,255,0)");
    ctx.fillStyle = edge;
    ctx.fillRect(0, 0, width, height);
  });
}

function makeRestaurantGlowTexture() {
  return makeCanvasTextureWithSize(512, 704, (ctx, width, height) => {
    ctx.clearRect(0, 0, width, height);
    const glow = ctx.createRadialGradient(width / 2, height / 2, width * 0.16, width / 2, height / 2, width * 0.58);
    glow.addColorStop(0, "rgba(255,255,255,0)");
    glow.addColorStop(0.48, "rgba(255,255,255,0.08)");
    glow.addColorStop(0.74, "rgba(255,255,255,0.44)");
    glow.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = glow;
    drawRoundedRect(ctx, 12, 12, width - 24, height - 24, 76);
    ctx.fill();
  });
}

function createRoundedCardGeometry(width: number, height: number, radius: number, depth: number) {
  const x = -width / 2;
  const y = -height / 2;
  const shape = new THREE.Shape();
  shape.moveTo(x + radius, y);
  shape.lineTo(x + width - radius, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + radius);
  shape.lineTo(x + width, y + height - radius);
  shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  shape.lineTo(x + radius, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - radius);
  shape.lineTo(x, y + radius);
  shape.quadraticCurveTo(x, y, x + radius, y);

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelSegments: 5,
    bevelSize: 0.014,
    bevelThickness: 0.014,
    curveSegments: 10,
    steps: 1,
  });
  geometry.center();
  return geometry;
}

const CLOTHES_V = 0.61;

function drawSpeciesPattern(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  species: PlushSpecies,
  spec: SpeciesSpec,
  id: string
) {
  const clothesY = CLOTHES_V * height;

  if (spec.kind === "animal") {
    ctx.fillStyle = spec.belly;
    ctx.beginPath();
    ctx.ellipse(0.25 * width, 0.47 * height, 0.125 * width, 0.17 * height, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  if (species === "cat") {
    const patchColors = ["#e8a25e", "#8a6242"];
    [
      [0.13, 0.08, 0.075, 0.05, 0],
      [0.38, 0.05, 0.06, 0.045, 1],
      [0.62, 0.12, 0.085, 0.055, 0],
      [0.87, 0.07, 0.065, 0.05, 1],
    ].forEach(([x, y, rx, ry, c]) => {
      ctx.fillStyle = patchColors[c];
      ctx.beginPath();
      ctx.ellipse(x * width, y * height, rx * width, ry * height, 0.4, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  if (species === "bear") {
    ctx.fillStyle = spec.belly;
    ctx.beginPath();
    ctx.ellipse(0.25 * width, 0.295 * height, 0.085 * width, 0.052 * height, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  if (species === "pineapple") {
    ctx.strokeStyle = "#d79e2c";
    ctx.lineWidth = Math.max(3, 0.008 * width);
    const step = 0.085 * width;
    for (let offset = -width; offset < width * 2; offset += step) {
      ctx.beginPath();
      ctx.moveTo(offset, 0);
      ctx.lineTo(offset + height, height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(offset + height, 0);
      ctx.lineTo(offset, height);
      ctx.stroke();
    }
    ctx.fillStyle = "#fbe39a";
    for (let row = 0; row < 7; row += 1) {
      for (let col = 0; col < 13; col += 1) {
        const x = ((col + (row % 2) * 0.5) * step) % width;
        const y = row * step * 0.95 + step * 0.4;
        ctx.beginPath();
        ctx.arc(x, y, 0.006 * width, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  if (species === "strawberry") {
    ctx.fillStyle = "#fdf2d4";
    for (let i = 0; i < 34; i += 1) {
      const u = stableUnit(`${id}:seed:${i}`);
      const x = ((u * 977 + i * 67) % 1000) / 1000;
      const y = 0.06 + (((u * 613 + i * 41) % 1000) / 1000) * (CLOTHES_V - 0.12);
      ctx.save();
      ctx.translate(x * width, y * height);
      ctx.rotate((u - 0.5) * 0.8);
      ctx.beginPath();
      ctx.ellipse(0, 0, 0.0055 * width, 0.009 * width, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  ctx.save();
  ctx.globalAlpha = 0.08;
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, clothesY - 0.012 * height, width, 0.012 * height);
  ctx.restore();
}

function drawOutfit(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  outfit: PlushOutfit,
  spec: OutfitSpec,
  jerseyNumber: number
) {
  const top = CLOTHES_V * height;
  const frontX = 0.25 * width;
  const backX = 0.75 * width;

  ctx.fillStyle = spec.main;
  ctx.fillRect(0, top, width, height - top);

  if (spec.kind === "kit") {
    ctx.fillStyle = spec.side;
    const panel = 0.075 * width;
    [0, 0.5 * width, width].forEach((x) => {
      ctx.fillRect(x - panel / 2, top, panel, height - top);
    });
    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    ctx.lineWidth = 0.008 * width;
    [0, 0.5 * width, width].forEach((x) => {
      for (let i = 0; i < 3; i += 1) {
        const y = top + (0.1 + i * 0.12) * height;
        ctx.beginPath();
        ctx.moveTo(x - panel / 2, y);
        ctx.lineTo(x, y + 0.045 * height);
        ctx.lineTo(x + panel / 2, y);
        ctx.stroke();
      }
    });

    ctx.font = `800 ${Math.round(0.165 * height)}px ui-sans-serif, system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = spec.text;
    ctx.strokeStyle = "rgba(0,0,0,0.18)";
    ctx.lineWidth = 0.008 * width;
    [frontX, backX].forEach((x) => {
      ctx.strokeText(String(jerseyNumber), x, 0.745 * height);
      ctx.fillText(String(jerseyNumber), x, 0.745 * height);
    });

    ctx.fillStyle = spec.trim;
    ctx.beginPath();
    ctx.arc(frontX + 0.085 * width, 0.63 * height, 0.018 * width, 0, Math.PI * 2);
    ctx.fill();
  }

  if (outfit === "tee-stripe") {
    ctx.fillStyle = spec.side;
    const stripe = 0.052 * height;
    for (let y = top + stripe; y < height; y += stripe * 2) {
      ctx.fillRect(0, y, width, stripe);
    }
  }

  if (outfit === "tee-plain") {
    ctx.fillStyle = spec.side;
    const hx = frontX;
    const hy = 0.68 * height;
    const r = 0.02 * width;
    ctx.beginPath();
    ctx.arc(hx - r * 0.95, hy - r * 0.6, r, 0, Math.PI * 2);
    ctx.arc(hx + r * 0.95, hy - r * 0.6, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(hx - r * 1.9, hy - r * 0.35);
    ctx.lineTo(hx, hy + r * 2);
    ctx.lineTo(hx + r * 1.9, hy - r * 0.35);
    ctx.closePath();
    ctx.fill();
  }

  if (outfit === "hoodie") {
    ctx.fillStyle = spec.side;
    drawRoundedRect(ctx, frontX - 0.09 * width, 0.74 * height, 0.18 * width, 0.13 * height, 0.025 * width);
    ctx.fill();
    ctx.strokeStyle = spec.trim;
    ctx.lineWidth = 0.0085 * width;
    [-0.028, 0.028].forEach((dx) => {
      ctx.beginPath();
      ctx.moveTo(frontX + dx * width, top + 0.012 * height);
      ctx.lineTo(frontX + dx * width, top + 0.09 * height);
      ctx.stroke();
    });
    ctx.fillStyle = spec.side;
    ctx.beginPath();
    ctx.ellipse(backX, top + 0.05 * height, 0.13 * width, 0.06 * height, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  if (outfit === "overalls") {
    const bibW = 0.15 * width;
    const bibTop = top - 0.055 * height;
    const strapTop = top - 0.095 * height;
    ctx.fillStyle = spec.main;
    drawRoundedRect(ctx, frontX - bibW / 2, bibTop, bibW, 0.105 * height, 0.02 * width);
    ctx.fill();
    const strapW = 0.028 * width;
    ctx.fillRect(frontX - bibW / 2, strapTop, strapW, bibTop - strapTop + 0.02 * height);
    ctx.fillRect(frontX + bibW / 2 - strapW, strapTop, strapW, bibTop - strapTop + 0.02 * height);
    ctx.fillStyle = spec.trim;
    [frontX - bibW / 2 + strapW / 2, frontX + bibW / 2 - strapW / 2].forEach((x) => {
      ctx.beginPath();
      ctx.arc(x, bibTop + 0.018 * height, 0.009 * width, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.strokeStyle = spec.side;
    ctx.lineWidth = 0.006 * width;
    drawRoundedRect(ctx, frontX - 0.045 * width, bibTop + 0.04 * height, 0.09 * width, 0.055 * height, 0.012 * width);
    ctx.stroke();
  }

  if (spec.kind === "kit" || outfit === "tee-stripe" || outfit === "tee-plain") {
    ctx.fillStyle = spec.trim;
    ctx.fillRect(0, top, width, 0.018 * height);
    ctx.beginPath();
    ctx.moveTo(frontX - 0.05 * width, top);
    ctx.lineTo(frontX, top + 0.045 * height);
    ctx.lineTo(frontX + 0.05 * width, top);
    ctx.closePath();
    ctx.fill();
  }
}

function makePlushBodyTexture(person: ScenePerson, look: PlushLook) {
  const speciesSpec = SPECIES_SPECS[look.species];
  const outfitSpec = OUTFIT_SPECS[look.outfit];
  return makeCanvasTextureWithSize(1024, 1024, (ctx, width, height) => {
    ctx.fillStyle = speciesSpec.body;
    ctx.fillRect(0, 0, width, height);
    drawSpeciesPattern(ctx, width, height, look.species, speciesSpec, person.id);
    drawOutfit(ctx, width, height, look.outfit, outfitSpec, jerseyNumberFor(person.id));
  });
}

function createPlatform() {
  const group = new THREE.Group();

  const planetTexture = makeCanvasTextureWithSize(2048, 1024, (ctx, width, height) => {
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    const oceanGradient = ctx.createLinearGradient(0, 0, 0, height);
    oceanGradient.addColorStop(0, "#31c9ff");
    oceanGradient.addColorStop(0.55, "#139fec");
    oceanGradient.addColorStop(1, "#1699e5");
    ctx.fillStyle = oceanGradient;
    ctx.fillRect(0, 0, width, height);

    const lonShift = -115;
    const project = (lon: number, lat: number) => ({
      x: ((lon + 180 + lonShift) / 360) * width,
      y: ((90 - lat) / 180) * height,
    });
    const drawPolygon = (points: Array<[number, number]>, fill: CanvasGradient | string) => {
      [-360, 0, 360].forEach((wrap) => {
        const projected = points.map(([lon, lat]) => project(lon + wrap, lat));
        if (projected.length < 3) return;
        const first = projected[0];
        const last = projected[projected.length - 1];
        const start = {
          x: (first.x + last.x) / 2,
          y: (first.y + last.y) / 2,
        };
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        projected.forEach((point, index) => {
          const next = projected[(index + 1) % projected.length];
          const midpoint = {
            x: (point.x + next.x) / 2,
            y: (point.y + next.y) / 2,
          };
          ctx.quadraticCurveTo(point.x, point.y, midpoint.x, midpoint.y);
        });
        ctx.closePath();
        ctx.fillStyle = fill;
        ctx.fill();
      });
    };
    const drawIsland = (lon: number, lat: number, rx: number, ry: number, rotation = 0) => {
      [-360, 0, 360].forEach((wrap) => {
        const point = project(lon + wrap, lat);
        ctx.beginPath();
        ctx.ellipse(point.x, point.y, rx * width, ry * height, rotation, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    const landGradient = ctx.createLinearGradient(width * 0.1, 0, width * 0.9, height);
    landGradient.addColorStop(0, "#ffe033");
    landGradient.addColorStop(0.35, "#d8e63b");
    landGradient.addColorStop(1, "#7fbe35");

    drawPolygon(
      [
        [-17, 36],
        [-6, 37],
        [7, 36],
        [22, 33],
        [31, 31],
        [34, 24],
        [35, 12],
        [43, 12],
        [51, 9],
        [44, -10],
        [35, -24],
        [26, -35],
        [13, -35],
        [5, -24],
        [-3, -13],
        [-12, 4],
        [-17, 20],
      ],
      landGradient
    );
    drawPolygon(
      [
        [-11, 36],
        [-9, 43],
        [-4, 47],
        [2, 44],
        [8, 46],
        [14, 45],
        [18, 49],
        [10, 54],
        [5, 60],
        [17, 66],
        [31, 70],
        [46, 64],
        [62, 61],
        [74, 66],
        [92, 64],
        [116, 56],
        [139, 50],
        [153, 43],
        [144, 34],
        [124, 33],
        [111, 22],
        [101, 11],
        [89, 8],
        [78, 21],
        [69, 22],
        [57, 27],
        [49, 37],
        [39, 40],
        [31, 41],
        [25, 39],
        [20, 42],
        [12, 41],
        [4, 39],
      ],
      landGradient
    );
    drawPolygon(
      [
        [-168, 70],
        [-144, 72],
        [-126, 62],
        [-114, 51],
        [-97, 49],
        [-84, 38],
        [-80, 27],
        [-94, 16],
        [-110, 23],
        [-121, 33],
        [-133, 41],
        [-146, 54],
        [-160, 58],
      ],
      landGradient
    );
    drawPolygon(
      [
        [-81, 12],
        [-68, 5],
        [-55, -8],
        [-47, -22],
        [-53, -38],
        [-66, -55],
        [-74, -37],
        [-79, -18],
        [-84, -2],
      ],
      landGradient
    );
    drawPolygon(
      [
        [112, -12],
        [130, -10],
        [154, -24],
        [146, -39],
        [122, -36],
        [110, -24],
      ],
      landGradient
    );
    drawPolygon(
      [
        [-52, 61],
        [-42, 72],
        [-27, 78],
        [-20, 68],
        [-34, 58],
      ],
      landGradient
    );

    ctx.fillStyle = landGradient;
    drawIsland(-3, 54, 0.009, 0.026, -0.24);
    drawIsland(138, 38, 0.012, 0.034, 0.55);
    drawIsland(122, 12, 0.011, 0.026, -0.5);
    drawIsland(80, 7, 0.011, 0.018, -0.28);
    drawIsland(48, -19, 0.012, 0.04, 0.25);

    ctx.fillStyle = "#138ed8";
    drawPolygon(
      [
        [-6, 36],
        [6, 39],
        [18, 38],
        [31, 36],
        [36, 33],
        [31, 30],
        [18, 31],
        [7, 32],
        [-5, 33],
      ],
      "#138ed8"
    );
    drawPolygon(
      [
        [32, 30],
        [40, 30],
        [43, 18],
        [39, 13],
        [34, 20],
      ],
      "#138ed8"
    );

    const gloss = ctx.createRadialGradient(width * 0.42, height * 0.12, 12, width * 0.42, height * 0.12, width * 0.58);
    gloss.addColorStop(0, "rgba(255,255,255,0.24)");
    gloss.addColorStop(0.52, "rgba(255,255,255,0.08)");
    gloss.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = gloss;
    ctx.fillRect(0, 0, width, height);

    ctx.globalAlpha = 1;
  });
  if (planetTexture) {
    planetTexture.wrapS = THREE.RepeatWrapping;
    planetTexture.wrapT = THREE.ClampToEdgeWrapping;
    planetTexture.anisotropy = 8;
  }

  const planetMaterial = planetTexture
    ? new THREE.ShaderMaterial({
        uniforms: {
          map: { value: planetTexture },
          lightDirection: { value: new THREE.Vector3(-0.45, 0.74, 0.5).normalize() },
          radius: { value: PLANET_RADIUS },
          rimColor: { value: new THREE.Color("#20baff") },
          crownColor: { value: new THREE.Color("#ffffff") },
        },
        vertexShader: `
          varying vec2 vUv;
          varying vec3 vLocalPosition;
          varying vec3 vWorldNormal;
          varying vec3 vViewNormal;

          void main() {
            vUv = uv;
            vLocalPosition = position;
            vWorldNormal = normalize(normalMatrix * normal);
            vViewNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform sampler2D map;
          uniform vec3 lightDirection;
          uniform vec3 rimColor;
          uniform vec3 crownColor;
          uniform float radius;
          varying vec2 vUv;
          varying vec3 vLocalPosition;
          varying vec3 vWorldNormal;
          varying vec3 vViewNormal;

          void main() {
            vec4 texel = texture2D(map, vUv);
            vec3 normal = normalize(vWorldNormal);
            float day = 0.82 + max(dot(normal, normalize(lightDirection)), 0.0) * 0.28;
            float crown = pow(clamp(normal.y, 0.0, 1.0), 3.0);
            float viewEdge = 1.0 - clamp(abs(normalize(vViewNormal).z), 0.0, 1.0);
            float rim = smoothstep(0.36, 0.9, viewEdge);
            float bottomShade = smoothstep(-radius * 0.05, -radius * 0.9, vLocalPosition.y);
            vec3 color = texel.rgb * day;
            color = mix(color, color * vec3(0.78, 0.88, 0.98), bottomShade * 0.18);
            color = mix(color, crownColor, crown * 0.07);
            color = mix(color, rimColor, rim * 0.56);
            float bottomFade = smoothstep(-radius * 1.02, -radius * 0.74, vLocalPosition.y);
            gl_FragColor = vec4(color, bottomFade);
          }
        `,
        transparent: true,
        depthWrite: false,
      })
    : new THREE.MeshStandardMaterial({
        color: "#bfe7e9",
        roughness: 0.86,
        metalness: 0,
        transparent: true,
        opacity: 0.9,
      });
  const planet = new THREE.Mesh(new THREE.SphereGeometry(PLANET_RADIUS, 192, 96), planetMaterial);
  planet.position.y = PLANET_CENTER_Y;
  planet.scale.y = PLANET_VERTICAL_SCALE;
  planet.receiveShadow = false;
  group.add(planet);

  const atmosphereMaterial = new THREE.MeshBasicMaterial({
    color: "#dffcff",
    transparent: true,
    opacity: 0.08,
    side: THREE.BackSide,
    depthWrite: false,
  });
  const atmosphere = new THREE.Mesh(new THREE.SphereGeometry(PLANET_RADIUS * 1.015, 128, 64), atmosphereMaterial);
  atmosphere.position.y = PLANET_CENTER_Y;
  atmosphere.scale.y = PLANET_VERTICAL_SCALE;
  atmosphere.renderOrder = -1;
  group.add(atmosphere);

  return group;
}

const PLUSH_EGG_RADIUS = 0.46;
const PLUSH_EGG_Y_SCALE = 1.18;
const PLUSH_EGG_LIFT = PLUSH_EGG_RADIUS * PLUSH_EGG_Y_SCALE;

function plushBulge(ny: number) {
  return 1 + 0.16 * Math.pow(Math.max(0, -ny), 1.35);
}

function createPlushEggGeometry() {
  const geometry = new THREE.SphereGeometry(PLUSH_EGG_RADIUS, 48, 36);
  const position = geometry.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < position.count; i += 1) {
    const x = position.getX(i);
    const y = position.getY(i);
    const z = position.getZ(i);
    const ny = y / PLUSH_EGG_RADIUS;
    const bulge = plushBulge(ny);
    position.setXYZ(i, x * bulge, y * PLUSH_EGG_Y_SCALE + PLUSH_EGG_LIFT, z * bulge);
  }
  position.needsUpdate = true;
  geometry.computeVertexNormals();
  return geometry;
}

function plushSurfaceRadius(y: number) {
  const ny = THREE.MathUtils.clamp((y - PLUSH_EGG_LIFT) / PLUSH_EGG_LIFT, -1, 1);
  const radial = PLUSH_EGG_RADIUS * Math.sqrt(Math.max(0.0001, 1 - ny * ny));
  return radial * plushBulge(ny);
}

function plushSurfaceZ(x: number, y: number) {
  const r = plushSurfaceRadius(y);
  return Math.sqrt(Math.max(0.0001, r * r - x * x));
}

function buildSpeciesParts(
  tilt: THREE.Group,
  species: PlushSpecies,
  partMaterial: THREE.Material,
  innerMaterial: THREE.Material,
  noseMaterial: THREE.Material,
  partOutlineMaterial: THREE.Material
) {
  const add = (mesh: THREE.Mesh, outline = true, outlineScale = 1.08) => {
    if (outline) {
      const outlineMesh = new THREE.Mesh(mesh.geometry, partOutlineMaterial);
      outlineMesh.scale.setScalar(outlineScale);
      mesh.add(outlineMesh);
    }
    mesh.castShadow = true;
    tilt.add(mesh);
    return mesh;
  };

  if (species === "cat" || species === "bat") {
    const sharp = species === "bat";
    [-1, 1].forEach((side) => {
      const ear = add(new THREE.Mesh(new THREE.ConeGeometry(sharp ? 0.1 : 0.115, sharp ? 0.2 : 0.17, 4), partMaterial));
      ear.position.set(side * 0.21, sharp ? 1.05 : 1.02, -0.01);
      ear.rotation.y = Math.PI / 4;
      ear.rotation.z = side * (sharp ? 0.3 : 0.24);
      ear.scale.set(1, 1, 0.55);
      const inner = add(new THREE.Mesh(new THREE.ConeGeometry(0.055, sharp ? 0.11 : 0.09, 4), innerMaterial), false);
      inner.position.set(side * 0.205, sharp ? 1.03 : 1.0, 0.045);
      inner.rotation.y = Math.PI / 4;
      inner.rotation.z = side * (sharp ? 0.3 : 0.24);
      inner.scale.set(1, 1, 0.4);
    });
  }

  if (species === "bat") {
    [-1, 1].forEach((side) => {
      const wing = add(new THREE.Mesh(new THREE.SphereGeometry(0.17, 18, 12), innerMaterial));
      wing.position.set(side * 0.48, 0.5, -0.06);
      wing.scale.set(0.22, 0.75, 1.1);
      wing.rotation.z = side * 0.55;
    });
  }

  if (species === "bunny") {
    [-1, 1].forEach((side) => {
      const ear = add(new THREE.Mesh(new THREE.CapsuleGeometry(0.075, 0.2, 8, 14), partMaterial));
      ear.position.set(side * 0.155, 1.13, -0.02);
      ear.rotation.z = side * 0.17;
      ear.scale.set(1, 1, 0.6);
      const inner = add(new THREE.Mesh(new THREE.CapsuleGeometry(0.042, 0.13, 8, 12), innerMaterial), false);
      inner.position.set(side * 0.158, 1.13, 0.03);
      inner.rotation.z = side * 0.17;
      inner.scale.set(1, 1, 0.45);
    });
  }

  if (species === "koala" || species === "bear") {
    const big = species === "koala";
    [-1, 1].forEach((side) => {
      const ear = add(new THREE.Mesh(new THREE.SphereGeometry(big ? 0.135 : 0.105, 20, 14), partMaterial));
      ear.position.set(side * (big ? 0.33 : 0.245), big ? 0.9 : 1.0, -0.02);
      ear.scale.set(1, 0.95, 0.55);
      const inner = add(new THREE.Mesh(new THREE.SphereGeometry(big ? 0.082 : 0.058, 16, 12), innerMaterial), false);
      inner.position.set(side * (big ? 0.335 : 0.25), big ? 0.895 : 0.995, 0.035);
      inner.scale.set(1, 0.9, 0.4);
    });
  }

  if (species === "koala") {
    const nose = add(new THREE.Mesh(new THREE.SphereGeometry(0.08, 18, 14), noseMaterial), false);
    nose.position.set(0, 0.7, plushSurfaceZ(0, 0.7) - 0.005);
    nose.scale.set(0.62, 1, 0.45);
  }

  if (species === "bear") {
    const nose = add(new THREE.Mesh(new THREE.SphereGeometry(0.034, 14, 10), noseMaterial), false);
    nose.position.set(0, 0.715, plushSurfaceZ(0, 0.715) + 0.008);
    nose.scale.set(1.15, 0.8, 0.5);
  }

  if (species === "cat" || species === "bunny") {
    const nose = add(new THREE.Mesh(new THREE.ConeGeometry(species === "cat" ? 0.026 : 0.022, 0.042, 3), noseMaterial), false);
    nose.position.set(0, 0.708, plushSurfaceZ(0, 0.708) + 0.01);
    nose.rotation.z = Math.PI;
    nose.scale.set(1, 0.85, 0.5);
  }

  if (species === "bat") {
    const nose = add(new THREE.Mesh(new THREE.SphereGeometry(0.02, 12, 8), noseMaterial), false);
    nose.position.set(0, 0.71, plushSurfaceZ(0, 0.71) + 0.006);
    nose.scale.set(1.2, 0.85, 0.5);
  }

  if (species === "duck") {
    const beak = add(new THREE.Mesh(new THREE.SphereGeometry(0.085, 20, 14), noseMaterial));
    beak.position.set(0, 0.675, plushSurfaceZ(0, 0.675) + 0.025);
    beak.scale.set(1.15, 0.5, 0.7);
    const curl = add(new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.12, 12), partMaterial));
    curl.position.set(0.035, 1.06, -0.02);
    curl.rotation.z = -0.55;
    curl.scale.set(0.85, 1, 0.7);
  }

  if (species === "pineapple") {
    const leaves: Array<[number, number, number, number, number]> = [
      [0, 1.19, 0, 0, 0],
      [-0.095, 1.13, 0, 0, 0.52],
      [0.095, 1.13, 0, 0, -0.52],
      [0, 1.12, -0.085, -0.5, 0],
      [0, 1.12, 0.085, 0.5, 0],
    ];
    leaves.forEach(([x, y, z, rx, rz]) => {
      const leaf = add(new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.26, 10), innerMaterial));
      leaf.position.set(x, y, z);
      leaf.rotation.set(rx, 0, rz);
      leaf.scale.set(0.85, 1, 0.6);
    });
  }

  if (species === "strawberry") {
    for (let k = 0; k < 5; k += 1) {
      const angle = (k / 5) * Math.PI * 2;
      const leaf = add(new THREE.Mesh(new THREE.SphereGeometry(0.095, 14, 10), innerMaterial));
      leaf.position.set(Math.sin(angle) * 0.165, 1.0, Math.cos(angle) * 0.165);
      leaf.rotation.y = angle;
      leaf.rotation.x = 0.42;
      leaf.scale.set(0.55, 0.22, 1.15);
    }
    const stem = add(new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.032, 0.1, 10), innerMaterial));
    stem.position.set(0, 1.08, 0);
    stem.rotation.z = 0.15;
  }
}

function createCharacter(
  person: ScenePerson,
  look: PlushLook,
  index: number,
  totalCount: number,
  isUser: boolean
): CharacterHandle {
  const seed = stableUnit(`${person.id}:character`);
  const speciesSpec = SPECIES_SPECS[look.species];
  const outfitSpec = OUTFIT_SPECS[look.outfit];
  const hasMouth = look.species !== "duck";
  const root = new THREE.Group();
  const body = new THREE.Group();
  const tilt = new THREE.Group();
  const baseScale = isUser ? 1.08 : 0.95;
  const bodyTexture = makePlushBodyTexture(person, look);

  const bodyMaterial = createToonMaterial({
    color: "#ffffff",
    map: bodyTexture || undefined,
    transparent: true,
    opacity: 0,
  });
  const bodyOutlineMaterial = new THREE.MeshBasicMaterial({
    color: "#6f8198",
    side: THREE.BackSide,
    transparent: true,
    opacity: 0,
  });
  const partMaterial = createToonMaterial({
    color: speciesSpec.body,
    transparent: true,
    opacity: 0,
  });
  const partOutlineMaterial = new THREE.MeshBasicMaterial({
    color: "#61758f",
    side: THREE.BackSide,
    transparent: true,
    opacity: 0,
  });
  const innerMaterial = createToonMaterial({
    color: speciesSpec.inner,
    transparent: true,
    opacity: 0,
  });
  const noseColors: Record<PlushSpecies, string> = {
    cat: "#f293a8",
    bunny: "#f293a8",
    koala: "#454552",
    bear: "#5f4530",
    bat: "#33333d",
    duck: "#f2b53c",
    pineapple: "#f2b53c",
    strawberry: "#f293a8",
  };
  const noseMaterial = createToonMaterial({
    color: noseColors[look.species],
    transparent: true,
    opacity: 0,
  });
  const eyeMaterial = createToonMaterial({
    color: "#2b2424",
    transparent: true,
    opacity: 0,
  });
  const highlightMaterial = createToonMaterial({
    color: "#ffffff",
    transparent: true,
    opacity: 0,
  });
  const mouthMaterial = createToonMaterial({
    color: "#7a4a3f",
    transparent: true,
    opacity: 0,
  });
  const cheekMaterial = createToonMaterial({
    color: "#f9a8a8",
    transparent: true,
    opacity: 0,
  });
  const armOutlineMaterial = new THREE.MeshBasicMaterial({
    color: "#69819e",
    side: THREE.BackSide,
    transparent: true,
    opacity: 0,
  });
  const phoneMaterial = new THREE.MeshStandardMaterial({
    color: "#18233a",
    roughness: 0.36,
    metalness: 0.12,
    transparent: true,
    opacity: 0,
  });
  const phoneScreenMaterial = new THREE.MeshStandardMaterial({
    color: "#a7f3ff",
    roughness: 0.22,
    metalness: 0.02,
    emissive: "#67e8f9",
    emissiveIntensity: 0.25,
    transparent: true,
    opacity: 0,
  });
  const phoneDetailMaterial = new THREE.MeshBasicMaterial({
    color: "#eef6ff",
    transparent: true,
    opacity: 0,
  });
  const shadowMaterial = new THREE.MeshBasicMaterial({
    color: "#2d5068",
    map: makeSoftContactShadowTexture() || undefined,
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });
  const ringMaterial = new THREE.MeshBasicMaterial({
    color: outfitSpec.main,
    transparent: true,
    opacity: 0,
  });
  const materials = [
    bodyMaterial,
    bodyOutlineMaterial,
    partMaterial,
    partOutlineMaterial,
    innerMaterial,
    noseMaterial,
    eyeMaterial,
    highlightMaterial,
    mouthMaterial,
    cheekMaterial,
    armOutlineMaterial,
    phoneDetailMaterial,
    ringMaterial,
  ];

  const eggGeometry = createPlushEggGeometry();
  const bodyOutline = new THREE.Mesh(eggGeometry.clone(), bodyOutlineMaterial);
  bodyOutline.scale.set(1.028, 1.026, 1.028);
  tilt.add(bodyOutline);
  const egg = new THREE.Mesh(eggGeometry, bodyMaterial);
  egg.castShadow = true;
  tilt.add(egg);

  const eyeMeshes: THREE.Mesh[] = [];
  const pupilMeshes: THREE.Mesh[] = [];
  [-0.135, 0.135].forEach((x) => {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.044, 20, 14), eyeMaterial);
    eye.position.set(x, 0.74, plushSurfaceZ(x, 0.74) - 0.008);
    eye.scale.set(1, 1.3, 0.5);
    tilt.add(eye);

    const highlight = new THREE.Mesh(new THREE.SphereGeometry(0.015, 10, 8), highlightMaterial);
    highlight.position.set(x - 0.013, 0.756, plushSurfaceZ(x, 0.756) + 0.018);
    highlight.scale.set(1, 1.1, 0.4);
    tilt.add(highlight);

    [eye, highlight].forEach((mesh) => {
      mesh.userData.baseScaleY = mesh.scale.y;
      eyeMeshes.push(mesh);
      mesh.userData.baseX = mesh.position.x;
      mesh.userData.baseY = mesh.position.y;
      pupilMeshes.push(mesh);
    });
  });

  [-0.235, 0.235].forEach((x) => {
    const cheek = new THREE.Mesh(new THREE.SphereGeometry(0.046, 14, 10), cheekMaterial);
    cheek.position.set(x, 0.665, plushSurfaceZ(x, 0.665) - 0.004);
    cheek.scale.set(1.25, 0.85, 0.22);
    cheek.rotation.y = x < 0 ? -0.35 : 0.35;
    tilt.add(cheek);
  });

  const makeCurveMouth = (width: number, drop: number, tube: number) => {
    const mouthZ = plushSurfaceZ(width, 0.66);
    const mouthCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-width, 0.668, mouthZ),
      new THREE.Vector3(0, 0.668 - drop, mouthZ + 0.014),
      new THREE.Vector3(width, 0.668, mouthZ)
    );
    return new THREE.Mesh(new THREE.TubeGeometry(mouthCurve, 14, tube, 8), mouthMaterial);
  };
  const baseMouth = hasMouth ? makeCurveMouth(0.05, 0.03, 0.0085) : new THREE.Group();
  if (hasMouth) tilt.add(baseMouth);
  const surpriseMouth = hasMouth
    ? new THREE.Mesh(new THREE.TorusGeometry(0.026, 0.008, 10, 24), mouthMaterial)
    : new THREE.Group();
  if (hasMouth) {
    surpriseMouth.position.set(0, 0.653, plushSurfaceZ(0, 0.653) + 0.018);
    surpriseMouth.scale.set(0.82, 1.08, 0.32);
    surpriseMouth.visible = false;
    tilt.add(surpriseMouth);
  }

  buildSpeciesParts(tilt, look.species, partMaterial, innerMaterial, noseMaterial, partOutlineMaterial);

  const buildNub = (side: number) => {
    const nub = new THREE.Group();
    nub.position.set(side * 0.39, 0.5, 0.12);
    nub.rotation.z = side * 0.5;
    const outlineMesh = new THREE.Mesh(new THREE.SphereGeometry(0.087, 24, 18), armOutlineMaterial);
    outlineMesh.position.y = -0.055;
    outlineMesh.scale.set(1.02, 1.08, 0.82);
    nub.add(outlineMesh);
    const nubMesh = new THREE.Mesh(new THREE.SphereGeometry(0.078, 24, 18), partMaterial);
    nubMesh.position.y = -0.055;
    nubMesh.scale.set(0.95, 1.02, 0.74);
    nubMesh.castShadow = true;
    nub.add(nubMesh);
    return nub;
  };
  const leftArm = buildNub(-1);
  tilt.add(leftArm);
  const rightArm = buildNub(1);
  tilt.add(rightArm);

  const phone = new THREE.Group();
  phone.position.set(0, 0.52, 0.61);
  phone.rotation.set(0.08, 0, 0);
  const phoneBody = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.2, 0.026), phoneMaterial);
  phoneBody.castShadow = true;
  phone.add(phoneBody);
  const phoneScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.102, 0.148), phoneScreenMaterial);
  phoneScreen.position.z = -0.014;
  phoneScreen.rotation.y = Math.PI;
  phone.add(phoneScreen);
  const cameraDot = new THREE.Mesh(new THREE.CircleGeometry(0.012, 12), phoneDetailMaterial);
  cameraDot.position.set(0.038, 0.07, 0.014);
  phone.add(cameraDot);
  phone.visible = false;
  tilt.add(phone);

  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), shadowMaterial);
  shadow.renderOrder = 2;
  shadow.scale.set(0.42, 0.25, 1);

  const spawnRing = new THREE.Mesh(new THREE.TorusGeometry(0.46, 0.014, 8, 52), ringMaterial);
  spawnRing.position.y = 0.018;
  spawnRing.rotation.x = Math.PI / 2;
  root.add(spawnRing);

  body.position.y = 0.035;
  body.add(tilt);
  root.add(body);
  root.scale.setScalar(0.01);

  const start = characterHomePosition(index, totalCount, isUser, seed);
  root.position.set(start.x, 0, start.y);
  root.rotation.y = isUser ? 0 : seed * Math.PI * 2;
  root.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      object.castShadow = false;
      object.receiveShadow = false;
    }
  });

  return {
    group: root,
    body,
    head: tilt,
    leftArm,
    rightArm,
    phone,
    phoneMaterial,
    phoneScreenMaterial,
    phoneDetailMaterial,
    baseMouth,
    surpriseMouth,
    shadow,
    spawnRing,
    shadowMaterial,
    materials,
    eyeMeshes,
    pupilMeshes,
    baseScale,
    homeTarget: start.clone(),
    seed,
    walkPhase: seed * Math.PI * 2,
    walkBlend: 0,
    nextBlinkAt: 0.8 + seed * 3.2,
    blinkStartedAt: -10,
    nextSaccadeAt: 1.2 + seed * 2.4,
    saccadeEndAt: 0,
    saccadeX: 0,
    saccadeY: 0,
    nextHeadShiftAt: 0.6 + seed * 2,
    headShiftX: 0,
    headShiftY: 0,
    headShiftCurrentX: 0,
    headShiftCurrentY: 0,
    target: start.clone(),
    focusTargetId: null,
    nextTargetAt: 0,
    mode: "idle",
    lastActionMode: null,
    modeStartedAt: 0,
    modeUntil: 0,
    hasLookedAround: false,
    popProgress: 0,
    exitProgress: 0,
    exiting: false,
    isUser,
  } satisfies CharacterHandle;
}

function createRestaurantCard(
  restaurant: Restaurant,
  index: number,
  count: number,
  loader: THREE.TextureLoader
) {
  const id = restaurantKey(restaurant);
  const group = new THREE.Group();
  const cardHinge = new THREE.Group();
  const cardBody = new THREE.Group();
  group.name = `restaurant-card-${id}`;
  group.position.set(0, RESTAURANT_CARD_BASE_Y, 0);
  group.scale.setScalar(0.02);
  cardBody.position.y = RESTAURANT_CARD_PIVOT_LIFT;
  cardHinge.add(cardBody);
  group.add(cardHinge);

  const glossTexture = makeRestaurantGlossTexture();
  const glowTexture = makeRestaurantGlowTexture();
  const frameMaterial = new THREE.MeshStandardMaterial({
    color: "#fffaf2",
    roughness: 0.34,
    metalness: 0.04,
    transparent: true,
    opacity: 0,
  });
  const photoMaterial = new THREE.MeshBasicMaterial({
    color: "#ffffff",
    side: THREE.FrontSide,
    transparent: true,
    opacity: 0,
  });
  const glossMaterial = new THREE.MeshBasicMaterial({
    map: glossTexture || undefined,
    side: THREE.FrontSide,
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: "#d8fbff",
    map: glowTexture || undefined,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const hitMaterial = new THREE.MeshBasicMaterial({
    color: "#ffffff",
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });

  const photoWidth = RESTAURANT_CARD_WIDTH - 0.055;
  const photoHeight = RESTAURANT_CARD_HEIGHT - 0.055;
  const photoY = 0;

  const glow = new THREE.Mesh(
    new THREE.PlaneGeometry(RESTAURANT_CARD_WIDTH + 0.28, RESTAURANT_CARD_HEIGHT + 0.3),
    glowMaterial
  );
  glow.position.z = -0.09;
  glow.renderOrder = -1;
  cardBody.add(glow);

  const frame = new THREE.Mesh(
    createRoundedCardGeometry(
      RESTAURANT_CARD_WIDTH + 0.12,
      RESTAURANT_CARD_HEIGHT + 0.12,
      RESTAURANT_CARD_RADIUS + 0.015,
      0.068
    ),
    frameMaterial
  );
  frame.castShadow = false;
  frame.receiveShadow = true;
  cardBody.add(frame);

  const imageMat = new THREE.Mesh(
    createRoundedCardGeometry(photoWidth + 0.03, photoHeight + 0.03, 0.062, 0.012),
    frameMaterial
  );
  imageMat.position.set(0, photoY, 0.061);
  imageMat.renderOrder = 1;
  cardBody.add(imageMat);

  // Front = inward-facing side toward the character/globe center. Back = clean card body only.
  const photo = new THREE.Mesh(
    new THREE.PlaneGeometry(photoWidth, photoHeight),
    photoMaterial
  );
  photo.position.set(0, photoY, 0.092);
  photo.renderOrder = 3;
  cardBody.add(photo);

  const gloss = new THREE.Mesh(
    new THREE.PlaneGeometry(photoWidth, photoHeight),
    glossMaterial
  );
  gloss.position.set(0, photoY, 0.096);
  gloss.renderOrder = 4;
  cardBody.add(gloss);

  const hitArea = new THREE.Mesh(
    new THREE.PlaneGeometry(RESTAURANT_CARD_WIDTH + 0.22, RESTAURANT_CARD_HEIGHT + 0.22),
    hitMaterial
  );
  hitArea.position.z = 0.096;
  hitArea.userData.restaurantId = id;
  cardBody.add(hitArea);

  const handle: RestaurantCardHandle = {
    id,
    restaurant,
    group,
    cardHinge,
    cardBody,
    hitArea,
    frameMaterial,
    photoMaterial,
    glossMaterial,
    glowMaterial,
    materials: [
      frameMaterial,
      photoMaterial,
      glossMaterial,
      glowMaterial,
      hitMaterial,
    ],
    slotIndex: index,
    slotCount: count,
    popProgress: 0,
    exitProgress: 0,
    exiting: false,
    selected: false,
    disposed: false,
    photoUrl: "",
    imageReady: false,
    imageFailed: false,
  };

  loadRestaurantCardPhoto(handle, restaurant.photo_url || "", loader);

  return handle;
}

function loadRestaurantCardPhoto(
  handle: RestaurantCardHandle,
  photoUrl: string,
  loader: THREE.TextureLoader
) {
  const nextPhotoUrl = photoUrl.trim();
  if (handle.photoUrl === nextPhotoUrl && handle.imageReady) return;

  handle.photoUrl = nextPhotoUrl;
  handle.imageReady = false;
  handle.imageFailed = false;
  handle.popProgress = 0;

  const previousTexture = handle.photoMaterial.map;
  handle.photoMaterial.map = null;
  handle.photoMaterial.needsUpdate = true;
  if (previousTexture) previousTexture.dispose();
  if (!nextPhotoUrl) {
    handle.imageFailed = true;
    return;
  }

  loader.load(
    nextPhotoUrl,
    (texture) => {
      if (handle.disposed || handle.photoUrl !== nextPhotoUrl) {
        texture.dispose();
        return;
      }
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = 8;
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.magFilter = THREE.LinearFilter;
      handle.photoMaterial.map = texture;
      handle.photoMaterial.needsUpdate = true;
      handle.imageReady = true;
      handle.imageFailed = false;
      handle.popProgress = 0;
    },
    undefined,
    () => {
      if (handle.photoUrl !== nextPhotoUrl) return;
      handle.imageReady = false;
      handle.imageFailed = true;
      handle.photoMaterial.needsUpdate = true;
    }
  );
}

function restaurantSlot(index: number, count: number) {
  const safeCount = Math.max(count, 1);
  const theta = Math.PI + (index / safeCount) * Math.PI * 2;
  const x = Math.sin(theta) * RESTAURANT_ORBIT_RADIUS_X;
  const z = Math.cos(theta) * RESTAURANT_ORBIT_RADIUS_Z;
  const y = RESTAURANT_CARD_BASE_Y;
  const yaw = Math.atan2(-x, -z);

  return {
    position: new THREE.Vector3(x, y, z),
    rotation: new THREE.Euler(0, yaw, 0),
  };
}

function restaurantFacingCenterYaw(position: THREE.Vector3, fallbackYaw: number) {
  const distanceSq = position.x * position.x + position.z * position.z;
  if (distanceSq < 0.0001) return fallbackYaw;
  return Math.atan2(-position.x, -position.z);
}

function restaurantResultSlot(index: number, count: number) {
  const safeCount = Math.max(1, Math.min(count, 4));
  const centered = index - (safeCount - 1) / 2;
  const yOffset = index % 2 === 0 ? 0.04 : -0.025;
  return new THREE.Vector3(
    centered * RESULT_CARD_ROW_SPACING,
    RESULT_CARD_ROW_Y + yOffset,
    RESULT_CARD_ROW_Z - Math.abs(centered) * 0.035
  );
}

function setCharacterOpacity(handle: CharacterHandle, opacity: number) {
  handle.materials.forEach((material) => {
    material.opacity = opacity;
    material.transparent = opacity < 0.995;
  });
}

function setRestaurantCardOpacity(handle: RestaurantCardHandle, opacity: number) {
  handle.frameMaterial.opacity = opacity;
  handle.photoMaterial.opacity = opacity;
  handle.glossMaterial.opacity = opacity * 0.72;
  handle.glowMaterial.opacity = 0;
  handle.hitArea.visible = opacity > 0.18 && !handle.exiting;
  handle.materials.forEach((material) => {
    material.transparent = true;
  });
}

function disposeMaterial(material: THREE.Material | THREE.Material[]) {
  if (Array.isArray(material)) {
    material.forEach(disposeMaterial);
    return;
  }
  Object.values(material).forEach((value) => {
    if (value instanceof THREE.Texture) value.dispose();
  });
  material.dispose();
}

function disposeObject(root: THREE.Object3D) {
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  const disposeMaterialOnce = (material: THREE.Material | THREE.Material[]) => {
    if (Array.isArray(material)) {
      material.forEach(disposeMaterialOnce);
      return;
    }
    if (materials.has(material)) return;
    materials.add(material);
    disposeMaterial(material);
  };

  root.traverse((object) => {
    const maybeMesh = object as THREE.Mesh;
    if (maybeMesh.geometry && !geometries.has(maybeMesh.geometry)) {
      geometries.add(maybeMesh.geometry);
      maybeMesh.geometry.dispose();
    }
    if (maybeMesh.material) disposeMaterialOnce(maybeMesh.material);
  });
}

export function ProfilePlushPreview3D({
  look,
  userId,
  className = "",
}: {
  look: PlushLook;
  userId: string;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const lookKey = lookKeyOf(look);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });
    } catch {
      return;
    }

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.className = "absolute inset-0 h-full w-full";
    renderer.domElement.setAttribute("aria-hidden", "true");
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 30);
    camera.position.set(0, 1.36, 4.6);
    camera.lookAt(0, 0.68, 0);

    const ambient = new THREE.HemisphereLight(0xffffff, 0xcfe6ff, 2.25);
    scene.add(ambient);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.8);
    keyLight.position.set(2.6, 4.2, 3.2);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.left = -2.5;
    keyLight.shadow.camera.right = 2.5;
    keyLight.shadow.camera.top = 2.5;
    keyLight.shadow.camera.bottom = -2.5;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 10;
    scene.add(keyLight);

    const fillLight = new THREE.PointLight(0xffd0a6, 1.25, 6);
    fillLight.position.set(-2.4, 1.2, 2.8);
    scene.add(fillLight);

    const previewRoot = new THREE.Group();
    scene.add(previewRoot);

    const stage = new THREE.Group();
    stage.rotation.x = -0.05;
    previewRoot.add(stage);

    const previewPerson: ScenePerson = {
      id: `profile-preview:${userId}:${lookKey}`,
      name: "Profile preview",
      avatar: "",
      look,
    };
    const handle = createCharacter(previewPerson, look, 0, 1, true);
    handle.group.position.set(0, 0, 0);
    handle.group.rotation.y = 0;
    handle.popProgress = 1;
    handle.mode = "wave";
    handle.modeStartedAt = 0;
    handle.modeUntil = 2.2;
    handle.lastActionMode = "wave";
    setCharacterOpacity(handle, 1);
    handle.spawnRing.visible = false;
    handle.shadowMaterial.opacity = 0.22;
    handle.shadow.position.set(0, 0.035, 0.02);
    handle.shadow.rotation.x = -Math.PI / 2;
    handle.shadow.scale.set(0.44, 0.26, 1);
    stage.add(handle.shadow);
    stage.add(handle.group);

    const baseEyeData = handle.pupilMeshes.map((mesh) => ({
      mesh,
      x: mesh.userData.baseX as number,
      y: mesh.userData.baseY as number,
    }));

    let frameId = 0;
    let disposed = false;
    const startedAt = performance.now();
    const resize = () => {
      const width = Math.max(1, container.clientWidth);
      const height = Math.max(1, container.clientHeight);
      renderer.setSize(width, height, false);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();

    const animate = () => {
      if (disposed) return;
      const elapsed = (performance.now() - startedAt) / 1000;
      const waveProgress = clamp01(elapsed / 2.1);
      const waveIn = waveProgress < 0.22 ? easeInOutSine(waveProgress / 0.22) : 1;
      const waveOut = waveProgress > 0.86 ? easeInOutSine((1 - waveProgress) / 0.14) : 1;
      const waveAmount = Math.min(waveIn, waveOut);
      const waveSwing = Math.sin(elapsed * 9.5) * waveAmount;
      const breathe = Math.sin(elapsed * 2) * 0.012;

      handle.group.scale.setScalar(handle.baseScale * (1.08 + breathe));
      handle.body.position.y = 0.03 + Math.sin(elapsed * 2.7) * 0.008;
      handle.body.rotation.z = Math.sin(elapsed * 1.9) * 0.018;
      handle.head.rotation.x = -0.08 * waveAmount + Math.sin(elapsed * 1.4) * 0.018;
      handle.head.rotation.y = 0.28 * waveAmount + Math.sin(elapsed * 1.2) * 0.025;
      handle.head.rotation.z = 0.1 * waveAmount + Math.sin(elapsed * 1.8) * 0.018;

      handle.leftArm.position.set(-0.39, 0.5, 0.12);
      handle.leftArm.rotation.x = -0.02;
      handle.leftArm.rotation.y = 0.04;
      handle.leftArm.rotation.z = -0.48;

      handle.rightArm.position.set(0.38, 0.58 + waveAmount * 0.08, 0.14 + waveAmount * 0.06);
      handle.rightArm.rotation.x = -0.18 + waveSwing * 0.08;
      handle.rightArm.rotation.y = -0.16 - waveAmount * 0.12;
      handle.rightArm.rotation.z = 0.96 + waveAmount * (0.72 + waveSwing * 0.34);

      baseEyeData.forEach(({ mesh, x, y }) => {
        mesh.position.x = x + 0.018 * waveAmount;
        mesh.position.y = y + 0.008 * waveAmount;
      });
      handle.eyeMeshes.forEach((eye) => {
        const baseScaleY = eye.userData.baseScaleY as number;
        eye.scale.y = baseScaleY;
      });

      renderer.render(scene, camera);
      frameId = window.requestAnimationFrame(animate);
    };
    animate();

    return () => {
      disposed = true;
      window.cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      disposeObject(scene);
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [look, lookKey, userId]);

  return (
    <div
      ref={containerRef}
      className={`relative h-56 w-52 overflow-visible ${className}`}
      aria-label="Animated preview of your tabletop avatar"
    />
  );
}

export function DiscoverTabletopScene({
  currentUser,
  friends,
  phase,
  restaurants = [],
  selectedRestaurantId = null,
  onRestaurantSelect,
  className = "",
}: {
  currentUser: ScenePerson | null;
  friends: ScenePerson[];
  phase: OrbitPhase;
  restaurants?: Restaurant[];
  selectedRestaurantId?: string | null;
  onRestaurantSelect?: (restaurant: Restaurant) => void;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const apiRef = useRef<SceneApi | null>(null);
  const desiredPeopleRef = useRef<ScenePerson[]>([]);
  const desiredRestaurantsRef = useRef<Restaurant[]>([]);
  const phaseRef = useRef(phase);
  const selectedRestaurantIdRef = useRef<string | null>(selectedRestaurantId);
  const onRestaurantSelectRef = useRef<typeof onRestaurantSelect>(onRestaurantSelect);
  const reconcileNeededRef = useRef(true);
  const restaurantReconcileNeededRef = useRef(true);
  const [webglFailed, setWebglFailed] = useState(false);
  const [userLook, setUserLook] = useState<PlushLook | null>(null);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    let cancelled = false;
    window.queueMicrotask(() => {
      if (cancelled) return;
      if (!currentUser) {
        setUserLook(null);
        return;
      }
      try {
        const raw = window.localStorage.getItem(plushStorageKey(currentUser.id));
        if (raw) {
          const parsed = JSON.parse(raw) as PlushLook;
          if (parsed && SPECIES_SPECS[parsed.species] && OUTFIT_SPECS[parsed.outfit]) {
            setUserLook(parsed);
            return;
          }
        }
      } catch {
        // ignore unreadable storage and fall back to the derived default
      }
      setUserLook(currentUser.look ?? defaultLookFor(currentUser.id));
    });
    return () => {
      cancelled = true;
    };
  }, [currentUser]);

  useEffect(() => {
    selectedRestaurantIdRef.current = selectedRestaurantId;
    restaurantReconcileNeededRef.current = true;
  }, [selectedRestaurantId]);

  useEffect(() => {
    onRestaurantSelectRef.current = onRestaurantSelect;
  }, [onRestaurantSelect]);

  useEffect(() => {
    desiredPeopleRef.current = currentUser
      ? [
          {
            ...currentUser,
            id: `${USER_ID_PREFIX}:${currentUser.id}`,
            look: userLook ?? currentUser.look ?? defaultLookFor(currentUser.id),
          },
          ...friends.map((friend) => ({ ...friend, id: friend.id })),
        ]
      : friends;
    reconcileNeededRef.current = true;
  }, [currentUser, friends, userLook]);

  useEffect(() => {
    desiredRestaurantsRef.current = restaurants;
    restaurantReconcileNeededRef.current = true;
  }, [restaurants]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });
    } catch {
      window.requestAnimationFrame(() => setWebglFailed(true));
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(33, 1, 0.1, 100);
    camera.position.set(0, 4.35, 10.45);
    camera.lookAt(0, 0.38, 0);

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.16;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.className = "absolute inset-0 h-full w-full";
    renderer.domElement.setAttribute("aria-hidden", "true");
    renderer.domElement.style.cursor = "grab";
    container.appendChild(renderer.domElement);

    const stage = new THREE.Group();
    stage.rotation.x = STAGE_BASE_ROTATION_X;
    stage.position.y = STAGE_BASE_POSITION_Y;
    scene.add(stage);

    const cardOrbitTilt = new THREE.Group();
    cardOrbitTilt.rotation.x = STAGE_BASE_ROTATION_X + RESTAURANT_ORBIT_TILT_X;
    cardOrbitTilt.position.y = STAGE_BASE_POSITION_Y + 0.02;
    scene.add(cardOrbitTilt);

    const cardOrbit = new THREE.Group();
    cardOrbitTilt.add(cardOrbit);

    const platformPivot = new THREE.Group();
    platformPivot.position.y = PLANET_TOP_Y;
    platformPivot.rotation.x = PLANET_BACKWARD_TILT_X;
    stage.add(platformPivot);

    const platform = createPlatform();
    platform.position.y = -PLANET_TOP_Y;
    platformPivot.add(platform);

    const ambient = new THREE.HemisphereLight(0xfff4e6, 0xb6d7ff, 2.1);
    scene.add(ambient);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.8);
    keyLight.position.set(3.2, 5.2, 4.6);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.left = -4.4;
    keyLight.shadow.camera.right = 4.4;
    keyLight.shadow.camera.top = 4.4;
    keyLight.shadow.camera.bottom = -4.4;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 16;
    keyLight.shadow.bias = -0.0003;
    keyLight.shadow.normalBias = 0.025;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xbfe3ff, 1.05);
    rimLight.position.set(-2.6, 3.4, -4.2);
    scene.add(rimLight);

    const fillLight = new THREE.PointLight(0xffb985, 1.45, 8);
    fillLight.position.set(-2.4, 1.5, 2.8);
    scene.add(fillLight);

    const textureLoader = new THREE.TextureLoader();
    textureLoader.setCrossOrigin("anonymous");
    const characters = new Map<string, CharacterHandle>();
    const restaurantCards = new Map<string, RestaurantCardHandle>();
    let restaurantRevealBatchKey = "";
    let restaurantRevealStartedAt = 0;
    const timer = new THREE.Timer();
    timer.connect(document);
    const raycaster = new THREE.Raycaster();
    const pointerVector = new THREE.Vector2();
    const pointer = {
      x: 0,
      y: 0,
      down: false,
      previousX: 0,
      startX: 0,
      startY: 0,
      targetYaw: 0,
      moved: false,
    };
    const size = new THREE.Vector2();
    let hoveredRestaurantId: string | null = null;
    let lastPhase: OrbitPhase = phaseRef.current;
    let phaseStartedAt = 0;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const width = Math.max(1, rect.width);
      const height = Math.max(1, rect.height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(width, height, false);
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();

    const reconcile = () => {
      const desired = desiredPeopleRef.current.map((person) => {
        const look = person.look ?? defaultLookFor(person.id);
        return { person, look, key: `${person.id}::${lookKeyOf(look)}` };
      });
      const desiredKeys = new Set(desired.map((entry) => entry.key));

      characters.forEach((handle, key) => {
        if (desiredKeys.has(key)) {
          handle.exiting = false;
          handle.exitProgress = 0;
          return;
        }
        if (!handle.exiting) {
          handle.exiting = true;
          handle.exitProgress = 0;
          handle.target = new THREE.Vector2(handle.group.position.x, handle.group.position.z);
        }
      });

      desired.forEach(({ person, look, key }, index) => {
        const existing = characters.get(key);
        if (existing) {
          const home = characterHomePosition(index, desired.length, existing.isUser, existing.seed);
          existing.homeTarget.copy(home);
          existing.exiting = false;
          existing.exitProgress = 0;
          const currentPosition = new THREE.Vector2(existing.group.position.x, existing.group.position.z);
          if (currentPosition.distanceTo(home) > 0.06 && existing.mode !== "cheer") {
            existing.mode = "walk";
            existing.focusTargetId = null;
            existing.target = home.clone();
            existing.modeStartedAt = timer.getElapsed();
            existing.modeUntil = existing.modeStartedAt + 1.25;
          }
          return;
        }
        const handle = createCharacter(person, look, index, desired.length, person.id.startsWith(USER_ID_PREFIX));
        const now = timer.getElapsed();
        const spawnPosition = new THREE.Vector2(handle.group.position.x, handle.group.position.z);
        const firstSocialTarget = [...characters.entries()].find(([, other]) => !other.exiting)?.[0] ?? null;
        handle.modeStartedAt = now;
        handle.mode = "wave";
        handle.lastActionMode = "wave";
        handle.focusTargetId = firstSocialTarget;
        handle.target = spawnPosition.clone();
        handle.modeUntil = now + 1.2 + handle.seed * 0.25;
        characters.set(key, handle);
        if (firstSocialTarget) {
          const other = characters.get(firstSocialTarget);
          if (other && !other.exiting) {
            other.mode = "wave";
            other.lastActionMode = "wave";
            other.focusTargetId = key;
            other.target = new THREE.Vector2(other.group.position.x, other.group.position.z);
            other.modeStartedAt = now;
            other.modeUntil = now + 1.2 + other.seed * 0.25;
          }
        }
        stage.add(handle.shadow);
        stage.add(handle.group);
      });
    };

    const disposeRestaurantCard = (handle: RestaurantCardHandle) => {
      handle.disposed = true;
      disposeObject(handle.group);
    };

    const reconcileRestaurants = () => {
      const desired = desiredRestaurantsRef.current.slice(0, 20);
      const selectedId = selectedRestaurantIdRef.current;
      const desiredIds = new Set(desired.map((restaurant) => restaurantKey(restaurant)));
      const nextRevealBatchKey = desired
        .map((restaurant, index) => `${index}:${restaurantKey(restaurant)}:${restaurant.photo_url || ""}`)
        .join("|");

      if (nextRevealBatchKey !== restaurantRevealBatchKey) {
        restaurantRevealBatchKey = nextRevealBatchKey;
        restaurantRevealStartedAt = 0;
        restaurantCards.forEach((handle, id) => {
          if (!desiredIds.has(id)) return;
          handle.popProgress = 0;
        });
      }

      restaurantCards.forEach((handle, id) => {
        if (desiredIds.has(id)) {
          handle.exiting = false;
          handle.exitProgress = 0;
          return;
        }
        if (!handle.exiting) {
          handle.exiting = true;
          handle.exitProgress = 0;
        }
      });

      desired.forEach((restaurant, index) => {
        const id = restaurantKey(restaurant);
        const existing = restaurantCards.get(id);
        if (existing) {
          existing.restaurant = restaurant;
          existing.slotIndex = index;
          existing.slotCount = Math.max(desired.length, 1);
          existing.selected = id === selectedId;
          existing.exiting = false;
          existing.exitProgress = 0;
          if (existing.photoUrl !== (restaurant.photo_url || "")) {
            loadRestaurantCardPhoto(existing, restaurant.photo_url || "", textureLoader);
          }
          return;
        }

        const handle = createRestaurantCard(restaurant, index, Math.max(desired.length, 1), textureLoader);
        handle.selected = id === selectedId;
        restaurantCards.set(id, handle);
        cardOrbit.add(handle.group);
      });
    };

    apiRef.current = { reconcile, reconcileRestaurants, characters, restaurantCards };
    reconcile();
    reconcileRestaurants();

    const setPointerFromEvent = (event: PointerEvent) => {
      renderer.getSize(size);
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / Math.max(rect.width, 1) - 0.5) * 2;
      pointer.y = ((event.clientY - rect.top) / Math.max(rect.height, 1) - 0.5) * 2;
      pointerVector.set(pointer.x, -pointer.y);
    };

    const pickRestaurant = (event: PointerEvent) => {
      setPointerFromEvent(event);
      raycaster.setFromCamera(pointerVector, camera);
      const hitTargets = [...restaurantCards.values()]
        .filter((handle) => !handle.exiting && handle.hitArea.visible)
        .map((handle) => handle.hitArea);
      const [hit] = raycaster.intersectObjects(hitTargets, false);
      const restaurantId = hit?.object.userData.restaurantId;
      if (typeof restaurantId !== "string") return false;
      const handle = restaurantCards.get(restaurantId);
      if (!handle || handle.exiting) return false;
      onRestaurantSelectRef.current?.(handle.restaurant);
      return true;
    };

    const updateHover = () => {
      raycaster.setFromCamera(pointerVector, camera);
      const hitTargets = [...restaurantCards.values()]
        .filter((handle) => !handle.exiting && handle.hitArea.visible)
        .map((handle) => handle.hitArea);
      const [hit] = raycaster.intersectObjects(hitTargets, false);
      const restaurantId = hit?.object.userData.restaurantId;
      hoveredRestaurantId = typeof restaurantId === "string" ? restaurantId : null;
      renderer.domElement.style.cursor = pointer.down
        ? "grabbing"
        : hoveredRestaurantId
          ? "pointer"
          : "grab";
    };

    const handlePointerMove = (event: PointerEvent) => {
      setPointerFromEvent(event);
      if (!pointer.down) {
        updateHover();
        return;
      }
      const moveX = event.clientX - pointer.startX;
      const moveY = event.clientY - pointer.startY;
      if (Math.hypot(moveX, moveY) > 6) pointer.moved = true;
      pointer.targetYaw += (event.clientX - pointer.previousX) * 0.0014;
      pointer.previousX = event.clientX;
    };

    const handlePointerDown = (event: PointerEvent) => {
      setPointerFromEvent(event);
      pointer.down = true;
      pointer.previousX = event.clientX;
      pointer.startX = event.clientX;
      pointer.startY = event.clientY;
      pointer.moved = false;
      pointer.targetYaw = stage.rotation.y;
      renderer.domElement.style.cursor = "grabbing";
      renderer.domElement.setPointerCapture(event.pointerId);
    };

    const handlePointerUp = (event: PointerEvent) => {
      const shouldPick = pointer.down && !pointer.moved;
      pointer.down = false;
      if (renderer.domElement.hasPointerCapture(event.pointerId)) {
        renderer.domElement.releasePointerCapture(event.pointerId);
      }
      if (shouldPick) {
        pickRestaurant(event);
      }
      updateHover();
    };

    renderer.domElement.addEventListener("pointermove", handlePointerMove);
    renderer.domElement.addEventListener("pointerdown", handlePointerDown);
    renderer.domElement.addEventListener("pointerup", handlePointerUp);
    renderer.domElement.addEventListener("pointercancel", handlePointerUp);

    renderer.setAnimationLoop(() => {
      if (reconcileNeededRef.current) {
        reconcile();
        reconcileNeededRef.current = false;
      }
      if (restaurantReconcileNeededRef.current) {
        reconcileRestaurants();
        restaurantReconcileNeededRef.current = false;
      }

      timer.update();
      const delta = Math.min(timer.getDelta(), 0.04);
      const elapsed = timer.getElapsed();
      const currentPhase = phaseRef.current;
      if (currentPhase !== lastPhase) {
        phaseStartedAt = elapsed;
      }
      if (currentPhase === "results" && lastPhase !== "results") {
        characters.forEach((handle) => {
          if (handle.exiting) return;
          handle.mode = "cheer";
          handle.lastActionMode = "cheer";
          handle.focusTargetId = null;
          handle.target = new THREE.Vector2(handle.group.position.x, handle.group.position.z);
          handle.modeStartedAt = elapsed;
          handle.modeUntil = elapsed + 1.55 + handle.seed * 0.55;
        });
      }
      lastPhase = currentPhase;
      const phaseAge = elapsed - phaseStartedAt;
      if (!pointer.down) {
        const returnSmooth = 1 - Math.pow(0.035, delta);
        const tiltReturnSmooth = 1 - Math.pow(0.02, delta);
        pointer.targetYaw += (0 - pointer.targetYaw) * returnSmooth;
        pointer.x += (0 - pointer.x) * tiltReturnSmooth;
        pointer.y += (0 - pointer.y) * tiltReturnSmooth;
      }
      const tiltX = STAGE_BASE_ROTATION_X + pointer.y * 0.105;
      const tiltZ = pointer.x * 0.075;
      const searchRush = currentPhase === "searching" ? clamp01(phaseAge / 3.4) : 0;
      const cardOrbitSpeed =
        currentPhase === "searching" ? 0.95 + searchRush * 1.75 : currentPhase === "results" ? 0 : 0.3;
      const crowdCount = desiredPeopleRef.current.length;
      const crowdAmount = crowdCount <= 1 ? 0 : clamp01(0.55 + (crowdCount - 2) * 0.18);
      const characterCrowdScale = crowdCharacterScale(crowdCount);
      const searchingCameraAmount = currentPhase === "searching" ? 0.34 + searchRush * 0.22 : 0;
      const resultsCameraAmount = currentPhase === "results" ? 1 : 0;
      const targetCameraY =
        4.35 + crowdAmount * 0.28 - searchingCameraAmount * 0.22 - resultsCameraAmount * 0.82;
      const targetCameraZ =
        10.45 + crowdAmount * 1.05 - searchingCameraAmount * 0.72 - resultsCameraAmount * 2.28;

      camera.position.y += (targetCameraY - camera.position.y) * 0.035;
      camera.position.z += (targetCameraZ - camera.position.z) * 0.035;
      const targetFov = 33 + crowdAmount * 1.8 - searchingCameraAmount * 1.1 - resultsCameraAmount * 4.6;
      if (Math.abs(camera.fov - targetFov) > 0.01) {
        camera.fov += (targetFov - camera.fov) * 0.04;
        camera.updateProjectionMatrix();
      }
      camera.lookAt(0, 0.38 + resultsCameraAmount * 0.24, 0);

      stage.rotation.y += (pointer.targetYaw - stage.rotation.y) * (pointer.down ? 0.24 : 0.1);
      stage.rotation.x += (tiltX - stage.rotation.x) * 0.07;
      stage.rotation.z += (tiltZ - stage.rotation.z) * 0.07;
      if (currentPhase === "results") {
        cardOrbit.rotation.y += (0 - cardOrbit.rotation.y) * (1 - Math.pow(0.0004, delta));
      } else {
        cardOrbit.rotation.y += delta * cardOrbitSpeed;
      }
      platform.position.y = -PLANET_TOP_Y;

      const removedRestaurantIds: string[] = [];
      const cardSmooth = 1 - Math.pow(0.00006, delta);
      const activeRestaurantCards = [...restaurantCards.values()].filter((handle) => !handle.exiting);
      const waitingForRestaurantPhotos = activeRestaurantCards.some(
        (handle) => !handle.imageReady && !handle.imageFailed
      );
      if (activeRestaurantCards.length === 0 || waitingForRestaurantPhotos) {
        restaurantRevealStartedAt = 0;
      } else if (restaurantRevealStartedAt === 0) {
        restaurantRevealStartedAt = elapsed + RESTAURANT_CARD_REVEAL_SETTLE_DELAY;
      }
      const restaurantRevealOrder = new Map<string, number>();
      activeRestaurantCards
        .filter((handle) => handle.imageReady)
        .sort((a, b) => a.slotIndex - b.slotIndex)
        .forEach((handle, index) => {
          restaurantRevealOrder.set(handle.id, index);
        });

      restaurantCards.forEach((handle, id) => {
        if (!handle.exiting) {
          handle.selected = id === selectedRestaurantIdRef.current;
        }

        const revealIndex = restaurantRevealOrder.get(id) ?? handle.slotIndex;
        const revealAt = restaurantRevealStartedAt + revealIndex * RESTAURANT_CARD_REVEAL_STAGGER;
        const canReveal =
          handle.imageReady && restaurantRevealStartedAt > 0 && elapsed >= revealAt;

        if (canReveal || handle.exiting) {
          handle.popProgress = Math.min(1, handle.popProgress + delta * 3.1);
        }
        if (handle.exiting) {
          handle.exitProgress = Math.min(1, handle.exitProgress + delta * 2.75);
        }

        const visibleResultCount = Math.min(handle.slotCount, 4);
        const isResultLayout = currentPhase === "results" && handle.slotIndex < 4;
        const slot = restaurantSlot(handle.slotIndex, handle.slotCount);
        const resultSlot = restaurantResultSlot(handle.slotIndex, visibleResultCount);
        const exitEase = handle.exiting ? easeInCubic(handle.exitProgress) : 0;
        const hovered = handle.id === hoveredRestaurantId && !handle.exiting;
        const selectedLift = handle.selected && !handle.exiting ? 0.16 : hovered ? 0.07 : 0;
        const selectedScale = handle.selected && !handle.exiting ? 1.1 : hovered ? 1.05 : 1;
        const floatLift = Math.sin(elapsed * 1.65 + handle.slotIndex * 0.51) * 0.007;
        const resultFloat = Math.sin(elapsed * 1.55 + handle.slotIndex * 0.72) * 0.018;
        const targetPosition = handle.exiting
          ? currentPhase === "searching"
            ? slot.position.clone().add(new THREE.Vector3(0, 0.1 + floatLift, 0))
            : new THREE.Vector3(0, RESTAURANT_CARD_BASE_Y + 0.04, 0)
          : isResultLayout
            ? resultSlot.clone().add(new THREE.Vector3(0, selectedLift * 0.35 + resultFloat, 0))
            : slot.position.clone().add(new THREE.Vector3(0, selectedLift + floatLift, 0));

        handle.group.position.lerp(targetPosition, cardSmooth);
        if (isResultLayout) {
          handle.group.rotation.x += (0 - handle.group.rotation.x) * cardSmooth;
          handle.group.rotation.y += (0 - handle.group.rotation.y) * cardSmooth;
          handle.group.rotation.z += (0 - handle.group.rotation.z) * cardSmooth;
        } else {
          handle.group.rotation.x = 0;
          handle.group.rotation.y = restaurantFacingCenterYaw(handle.group.position, slot.rotation.y);
          handle.group.rotation.z = 0;
        }
        const targetHingeX = isResultLayout ? 0 : RESTAURANT_CARD_PETAL_TILT;
        handle.cardHinge.rotation.x += (targetHingeX - handle.cardHinge.rotation.x) * cardSmooth;
        handle.cardHinge.rotation.y += (0 - handle.cardHinge.rotation.y) * cardSmooth;
        handle.cardHinge.rotation.z += (0 - handle.cardHinge.rotation.z) * cardSmooth;

        const pop = easeOutBack(handle.popProgress);
        const exitFlash = handle.exiting ? Math.sin(clamp01(handle.exitProgress) * Math.PI) : 0;
        const exitScale = Math.max(0.04, 1 - exitEase);
        const layoutScale = isResultLayout ? RESULT_CARD_SCALE : 1;
        const scale = pop * exitScale * selectedScale * layoutScale * (1 + exitFlash * 0.2);
        handle.group.scale.setScalar(scale);
        const opacity =
          (!canReveal || !handle.imageReady) && !handle.exiting
            ? 0
            : handle.exiting
              ? Math.max(0, 1 - easeOutCubic(handle.exitProgress))
              : Math.min(1, handle.popProgress * 1.8);
        setRestaurantCardOpacity(handle, opacity);

        const brightness = handle.selected ? 1.12 : hovered ? 1.06 : 1;
        handle.photoMaterial.color.setRGB(brightness, brightness, brightness);
        handle.frameMaterial.emissive.set(handle.selected ? "#ffe7a8" : hovered ? "#dff7ff" : "#000000");
        handle.frameMaterial.emissiveIntensity =
          exitFlash > 0 ? 0.48 * exitFlash : handle.selected ? 0.22 : hovered ? 0.12 : 0;
        handle.glossMaterial.opacity = opacity * (handle.selected ? 0.92 : hovered ? 0.82 : 0.62);
        handle.glowMaterial.color.set(exitFlash > 0 ? "#ffffff" : handle.selected ? "#ffe5a8" : "#bdf6ff");
        handle.glowMaterial.opacity =
          exitFlash > 0
            ? Math.max(opacity * 0.18, exitFlash * 0.72)
            : opacity * (handle.selected ? 0.38 : hovered ? 0.2 : isResultLayout ? 0.1 : 0);

        if (handle.exitProgress >= 1) {
          removedRestaurantIds.push(id);
        }
      });

      const removedCharacterIds: string[] = [];

      characters.forEach((handle, id) => {
        const position = new THREE.Vector2(handle.group.position.x, handle.group.position.z);
        if (!handle.exiting && elapsed >= handle.modeUntil) {
          const socialTargets = [...characters.entries()]
            .filter(([otherId, other]) => otherId !== id && !other.exiting)
            .map(([otherId, other]) => ({
              id: otherId,
              position: new THREE.Vector2(other.group.position.x, other.group.position.z),
            }));
          chooseNextMode(handle, elapsed, position, socialTargets);
        }
        if (handle.mode === "walk" && position.distanceTo(handle.target) < 0.045) {
          handle.mode = "idle";
          handle.focusTargetId = null;
          handle.target = position.clone();
          handle.modeStartedAt = elapsed;
          handle.modeUntil = elapsed + 3.0 + handle.seed * 3.2;
        }

        const direction = handle.target.clone().sub(position);
        const distance = direction.length();
        const wantsToWalk = !handle.exiting && handle.mode === "walk" && distance > 0.035;
        const actionAge = Math.max(0, elapsed - handle.modeStartedAt);
        const actionLength = Math.max(0.1, handle.modeUntil - handle.modeStartedAt);
        const actionProgress = clamp01(actionAge / actionLength);
        const walkReadiness = handle.mode === "walk" ? easeInOutSine(clamp01(actionAge / 0.2)) : 1;
        const actionHold =
          actionProgress < 0.22
            ? easeInOutSine(actionProgress / 0.22)
            : actionProgress > 0.84
              ? easeInOutSine((1 - actionProgress) / 0.16)
              : 1;
        const waveRaise =
          handle.mode === "wave"
            ? actionProgress < 0.32
              ? easeInOutSine(actionProgress / 0.32)
              : actionProgress > 0.84
                ? easeInOutSine((1 - actionProgress) / 0.16)
                : 1
            : 0;
        const thinkRaise = handle.mode === "think" ? actionHold : 0;
        const phoneRaise = handle.mode === "phone" ? actionHold : 0;
        const cheerRaise = handle.mode === "cheer" ? actionHold : 0;
        const surpriseRaise = handle.mode === "surprise" ? actionHold : 0;
        const waveSwing = Math.sin(actionProgress * Math.PI * 4);
        const lookProgress = handle.mode === "look" ? easeInOutSine(actionProgress) : 0;
        const lookDirection = handle.seed > 0.5 ? 1 : -1;
        const lookSweep = handle.mode === "look" ? Math.sin((lookProgress - 0.5) * Math.PI) : 0;
        const orbitLookYaw =
          handle.mode === "look"
            ? lookDirection * lookSweep * (1.45 + handle.seed * 0.55)
            : 0;
        const moveYaw = wantsToWalk ? Math.atan2(direction.x, direction.y) : handle.group.rotation.y;
        const focusHandle = handle.focusTargetId ? characters.get(handle.focusTargetId) : null;
        const focusDirection =
          focusHandle && !focusHandle.exiting
            ? new THREE.Vector2(
                focusHandle.group.position.x - handle.group.position.x,
                focusHandle.group.position.z - handle.group.position.z
              )
            : null;
        const focusYaw =
          focusDirection && focusDirection.length() > 0.03
            ? Math.atan2(focusDirection.x, focusDirection.y)
            : null;
        const targetRotation = wantsToWalk ? moveYaw : focusYaw ?? orbitLookYaw;
        const rotationDelta = Math.atan2(
          Math.sin(targetRotation - handle.group.rotation.y),
          Math.cos(targetRotation - handle.group.rotation.y)
        );
        const turningToWalk = wantsToWalk && Math.abs(rotationDelta) > 0.3;
        handle.group.rotation.y += rotationDelta * (wantsToWalk ? 0.18 : 0.11);
        const isWalking = wantsToWalk && !turningToWalk && walkReadiness > 0.12;
        if (isWalking) {
          direction.normalize();
          const speed = handle.isUser ? 0.42 : 0.38 + handle.seed * 0.16;
          const step = Math.min(distance, speed * delta * walkReadiness);
          position.addScaledVector(direction, step);
          handle.group.position.x = position.x;
          handle.group.position.z = position.y;
          handle.walkPhase += (step / 0.3) * Math.PI * 2;
        } else if (handle.walkBlend > 0.01) {
          const settledPhase = Math.round(handle.walkPhase / Math.PI) * Math.PI;
          handle.walkPhase += (settledPhase - handle.walkPhase) * Math.min(1, delta * 10);
        }
        handle.walkBlend += ((isWalking ? 1 : 0) - handle.walkBlend) * Math.min(1, delta * 9);

        handle.popProgress = Math.min(1, handle.popProgress + delta * 2.8);
        if (handle.exiting) {
          handle.exitProgress = Math.min(1, handle.exitProgress + delta * 2.45);
        }

        const pop = easeOutBack(handle.popProgress);
        const exitEase = handle.exiting ? easeInCubic(handle.exitProgress) : 0;
        const opacity = handle.exiting
          ? Math.max(0, 1 - easeOutCubic(handle.exitProgress))
          : Math.min(1, handle.popProgress * 1.9);
        const breathe = 1 + Math.sin(elapsed * 2 + handle.seed * 5) * 0.018;
        const exitScale = Math.max(0.04, 1 - exitEase);
        const cheerJump = cheerRaise * Math.abs(Math.sin(actionAge * 6.2)) * 0.07;
        const spawnSquash = Math.sin(clamp01(handle.popProgress) * Math.PI) * 0.14;
        const landSquash = cheerRaise * Math.max(0, 0.3 - Math.abs(Math.sin(actionAge * 6.2))) * 0.55;
        const squash = spawnSquash + landSquash;
        const uniformScale = handle.baseScale * characterCrowdScale * pop * breathe * exitScale;
        handle.group.scale.set(
          uniformScale * (1 + squash * 0.55),
          uniformScale * (1 - squash),
          uniformScale * (1 + squash * 0.55)
        );
        const walkCycle = Math.sin(handle.walkPhase) * handle.walkBlend;
        const hop = Math.abs(walkCycle);
        const surfaceY = planetSurfaceY(handle.group.position.x, handle.group.position.z);
        const verticalLift =
          (1 - Math.min(1, handle.popProgress)) * 0.18 +
          (handle.exiting ? exitEase * 0.34 : 0) +
          cheerJump;
        handle.group.position.y = surfaceY + verticalLift;
        setCharacterOpacity(handle, opacity);
        const contactLift = verticalLift + hop * 0.075 * handle.walkBlend;
        handle.group.userData.verticalLift = verticalLift;
        handle.group.userData.contactLift = contactLift;
        handle.group.userData.opacity = opacity;
        updateCharacterContactShadow(handle, surfaceY, contactLift, opacity);

        const ringLife = handle.exiting
          ? 1 - handle.exitProgress
          : Math.max(0, 1 - handle.popProgress);
        handle.spawnRing.visible = ringLife > 0.02;
        handle.spawnRing.scale.setScalar(handle.exiting ? 0.9 + handle.exitProgress * 1.4 : 0.5 + handle.popProgress * 1.7);
        handle.spawnRing.material.opacity = ringLife * 0.42;

        const idleWeight = 1 - handle.walkBlend;
        const idleCycle = Math.sin(elapsed * 2.4 + handle.seed * 6);
        const waveNod = waveRaise * Math.sin(actionAge * 7) * 0.05;
        const cheerSwing = Math.sin(actionAge * 7.2) * 0.14;
        const cheerNod = cheerRaise * (-0.12 + Math.sin(actionAge * 6.2) * 0.05);
        if (!handle.exiting && elapsed >= handle.nextBlinkAt) {
          handle.blinkStartedAt = elapsed;
          const doubleBlink = stableUnit(`${handle.seed}:blink:${Math.floor(elapsed * 7)}`) < 0.2;
          handle.nextBlinkAt =
            elapsed + (doubleBlink ? 0.34 : 2.6 + stableUnit(`${handle.seed}:gap:${Math.floor(elapsed)}`) * 3.4);
        }
        const blinkAge = elapsed - handle.blinkStartedAt;
        const blinkAmount = blinkAge >= 0 && blinkAge < 0.14 ? Math.sin((blinkAge / 0.14) * Math.PI) : 0;
        handle.eyeMeshes.forEach((eye) => {
          const baseScaleY = eye.userData.baseScaleY as number;
          eye.scale.y = baseScaleY * Math.max(0.08, 1 - blinkAmount * 0.92 + surpriseRaise * 0.32);
        });
        if (!handle.exiting && elapsed >= handle.nextSaccadeAt) {
          const slice = Math.floor(elapsed * 5);
          handle.saccadeX = (stableUnit(`${handle.seed}:sacx:${slice}`) - 0.5) * 0.026;
          handle.saccadeY = (stableUnit(`${handle.seed}:sacy:${slice}`) - 0.5) * 0.012;
          handle.saccadeEndAt = elapsed + 0.09 + stableUnit(`${handle.seed}:sach:${slice}`) * 0.12;
          handle.nextSaccadeAt = handle.saccadeEndAt + 1.15 + stableUnit(`${handle.seed}:sacg:${slice}`) * 2.9;
          if (blinkAmount === 0 && stableUnit(`${handle.seed}:sacb:${slice}`) < 0.3) {
            handle.blinkStartedAt = elapsed;
          }
        }
        const saccadeFade = elapsed < handle.saccadeEndAt ? 1 : Math.max(0, 1 - (elapsed - handle.saccadeEndAt) / 0.18);
        if (!handle.exiting && elapsed >= handle.nextHeadShiftAt) {
          const slice = Math.floor(elapsed * 3);
          const wideGlance = stableUnit(`${handle.seed}:hswide:${slice}`) < 0.28;
          handle.headShiftX = (stableUnit(`${handle.seed}:hsx:${slice}`) - 0.5) * (wideGlance ? 0.28 : 0.07);
          handle.headShiftY = (stableUnit(`${handle.seed}:hsy:${slice}`) - 0.5) * (wideGlance ? 0.09 : 0.035);
          handle.nextHeadShiftAt = elapsed + 1.9 + stableUnit(`${handle.seed}:hsg:${slice}`) * 3.1;
        }
        handle.headShiftCurrentX += (handle.headShiftX - handle.headShiftCurrentX) * Math.min(1, delta * 3.1);
        handle.headShiftCurrentY += (handle.headShiftY - handle.headShiftCurrentY) * Math.min(1, delta * 3.1);
        const lookHeadYaw =
          handle.mode === "look"
            ? lookDirection * lookSweep * 0.5
            : 0;
        const lookHeadPitch =
          handle.mode === "look"
            ? -Math.sin(lookProgress * Math.PI) * 0.24
            : 0;
        const thinkNod = Math.sin(actionAge * 2.1 + handle.seed * 4) * thinkRaise;
        const thinkHeadPitch = thinkRaise * (0.12 + thinkNod * 0.025);
        const phoneGlance = Math.sin(actionAge * 2.4 + handle.seed * 3) * phoneRaise;
        const phoneHeadPitch = phoneRaise * 0.17;
        const phoneReveal =
          handle.mode === "phone" ? phoneRaise * easeInOutSine(clamp01((actionProgress - 0.2) / 0.08)) : 0;
        const expressionAmount = surpriseRaise;
        handle.baseMouth.visible = expressionAmount < 0.35 && opacity > 0.02;
        handle.surpriseMouth.visible = surpriseRaise >= 0.18 && opacity > 0.02;
        handle.surpriseMouth.scale.set(0.72 + surpriseRaise * 0.22, 0.94 + surpriseRaise * 0.2, 0.32);
        const lookEyeX = handle.mode === "look" ? lookDirection * lookSweep * 0.018 : 0;
        const expressionEyeY = thinkRaise * 0.006 - phoneRaise * 0.016 + surpriseRaise * 0.006;
        handle.pupilMeshes.forEach((pupilMesh) => {
          pupilMesh.position.x = (pupilMesh.userData.baseX as number) + handle.saccadeX * saccadeFade + lookEyeX;
          pupilMesh.position.y = (pupilMesh.userData.baseY as number) + handle.saccadeY * saccadeFade + expressionEyeY;
        });
        handle.phone.visible = phoneReveal > 0.02 && opacity > 0.02;
        handle.phoneMaterial.opacity = opacity * phoneReveal;
        handle.phoneScreenMaterial.opacity = opacity * phoneReveal;
        handle.phoneDetailMaterial.opacity = opacity * phoneReveal;
        handle.phoneMaterial.transparent = true;
        handle.phoneScreenMaterial.transparent = true;
        handle.phoneDetailMaterial.transparent = true;
        const phoneBob = Math.sin(actionAge * 4.2 + handle.seed * 3) * phoneRaise * 0.004;
        handle.phone.position.set(0, 0.52 + phoneRaise * 0.012 + phoneBob, 0.61 + phoneRaise * 0.018);
        handle.phone.rotation.x = 0.08 + phoneRaise * 0.08;
        handle.phone.rotation.y = Math.sin(actionAge * 3.4) * 0.018 * phoneRaise;
        handle.phone.rotation.z = Math.sin(actionAge * 2.6 + handle.seed * 2) * 0.01 * phoneRaise;
        const armHoldY = 0.572 + phoneBob * 0.5;
        const armHoldZ = 0.682;
        const waveHandLift = waveRaise * (0.15 + Math.max(0, waveSwing) * 0.025);
        handle.leftArm.position.set(
          THREE.MathUtils.lerp(-0.39, -0.108, phoneRaise),
          THREE.MathUtils.lerp(0.5, armHoldY, phoneRaise),
          THREE.MathUtils.lerp(0.12, armHoldZ, phoneRaise)
        );
        handle.rightArm.position.set(
          THREE.MathUtils.lerp(0.39, 0.108, phoneRaise) - waveRaise * 0.025,
          THREE.MathUtils.lerp(0.5, armHoldY, phoneRaise) + waveHandLift,
          THREE.MathUtils.lerp(0.12, armHoldZ, phoneRaise) + waveRaise * 0.025
        );

        const leftNubBaseX = -hop * 0.3 + idleCycle * 0.05 * idleWeight;
        const leftNubBaseZ = -0.5 - hop * 0.55 - idleCycle * 0.03 * idleWeight;
        const rightNubBaseX = -hop * 0.3 - idleCycle * 0.05 * idleWeight;
        const rightNubBaseZ = 0.5 + hop * 0.55 + idleCycle * 0.03 * idleWeight;
        const nubPhoneX = -0.12 + Math.sin(actionAge * 4.4) * 0.01;
        const nubPhoneZ = 0.02 + Math.sin(actionAge * 3.6 + handle.seed * 2) * 0.005;
        handle.body.position.y =
          0.035 + hop * 0.075 + idleCycle * 0.006 * idleWeight;
        handle.body.position.x = Math.sin(elapsed * 0.7 + handle.seed * 9) * 0.012 * idleWeight;
        handle.body.rotation.x =
          handle.walkBlend * 0.12 +
          (wantsToWalk ? (1 - walkReadiness) * 0.08 : 0) +
          thinkRaise * 0.05 -
          cheerRaise * 0.1 -
          surpriseRaise * 0.04;
        const turnLean = wantsToWalk
          ? -Math.max(-0.18, Math.min(0.18, rotationDelta * 0.24))
          : 0;
        handle.body.rotation.z =
          turnLean +
          walkCycle * 0.07 +
          (idleCycle * 0.016 + thinkRaise * 0.03 - phoneRaise * 0.015) *
            idleWeight;
        handle.body.rotation.y = 0;
        handle.head.rotation.y =
          Math.sin(elapsed * 0.9 + handle.seed * 4) * 0.06 +
          handle.headShiftCurrentX +
          lookHeadYaw +
          phoneGlance * 0.08 -
          thinkRaise * 0.1;
        handle.head.rotation.x =
          Math.sin(elapsed * 0.8 + handle.seed * 5) * 0.03 +
          handle.headShiftCurrentY +
          lookHeadPitch +
          waveNod +
          thinkHeadPitch * 0.8 +
          phoneHeadPitch * 0.6 -
          surpriseRaise * 0.09 +
          cheerNod;
        handle.head.rotation.z =
          waveRaise * Math.sin(actionAge * 5) * 0.06 + walkCycle * 0.05 + thinkRaise * 0.14;

        const hopStretch = (hop - 0.45) * 0.16 * handle.walkBlend;
        const landImpact = Math.max(0, 0.25 - hop) * 4 * 0.09 * handle.walkBlend;
        const breath = Math.sin(elapsed * 2.1 + handle.seed * 5) * 0.014 * idleWeight;
        const plushScaleY = 1 + hopStretch - landImpact + breath + cheerRaise * 0.04;
        const plushScaleXZ = 1 - (hopStretch - landImpact) * 0.6 - breath * 0.7;
        handle.head.scale.set(plushScaleXZ, plushScaleY, plushScaleXZ);

        handle.leftArm.rotation.x =
          leftNubBaseX + phoneRaise * (nubPhoneX - leftNubBaseX) - cheerRaise * 0.3;
        handle.leftArm.rotation.y = phoneRaise * 0.28;
        handle.leftArm.rotation.z =
          leftNubBaseZ * (1 - Math.max(phoneRaise * 0.7, cheerRaise)) +
          phoneRaise * (-nubPhoneZ) -
          waveRaise * 0.1 -
          cheerRaise * (1.45 + cheerSwing * 0.6);
        handle.rightArm.rotation.x =
          rightNubBaseX +
          waveRaise * (-0.18 + waveSwing * 0.12) +
          phoneRaise * (nubPhoneX - rightNubBaseX) +
          thinkRaise * (-0.9) -
          cheerRaise * 0.3;
        handle.rightArm.rotation.y =
          waveRaise * (-0.1 + waveSwing * 0.18) - phoneRaise * 0.28 - thinkRaise * 0.2;
        handle.rightArm.rotation.z =
          rightNubBaseZ * (1 - Math.max(phoneRaise * 0.7, Math.max(cheerRaise, thinkRaise * 0.7))) -
          phoneRaise * nubPhoneZ +
          waveRaise * (1.05 + waveSwing * 0.38) +
          thinkRaise * 0.5 +
          cheerRaise * (1.45 - cheerSwing * 0.6);

        if (handle.exitProgress >= 1) {
          removedCharacterIds.push(id);
        }
      });

      const activeCharacters = [...characters.values()].filter((handle) => handle.exitProgress < 0.85);
      for (let pass = 0; pass < 3; pass += 1) {
        for (let i = 0; i < activeCharacters.length; i += 1) {
          for (let j = i + 1; j < activeCharacters.length; j += 1) {
            const first = activeCharacters[i];
            const second = activeCharacters[j];
            const firstPosition = new THREE.Vector2(first.group.position.x, first.group.position.z);
            const secondPosition = new THREE.Vector2(second.group.position.x, second.group.position.z);
            const deltaPosition = secondPosition.clone().sub(firstPosition);
            const distance = deltaPosition.length();
            const minDistance =
              (first.isUser || second.isUser ? CHARACTER_RADIUS * 1.42 : CHARACTER_RADIUS * 1.22) *
              characterCrowdScale *
              (first.exiting || second.exiting ? 0.82 : 1);

            if (distance >= minDistance) continue;

            const direction =
              distance > 0.0001
                ? deltaPosition.multiplyScalar(1 / distance)
                : new THREE.Vector2(
                    Math.cos((first.seed + second.seed) * Math.PI * 2),
                    Math.sin((first.seed + second.seed) * Math.PI * 2)
                  );
            const push = (minDistance - Math.max(distance, 0.0001)) * 0.5;
            firstPosition.addScaledVector(direction, -push);
            secondPosition.addScaledVector(direction, push);
            clampToWalkRadius(firstPosition);
            clampToWalkRadius(secondPosition);
            first.group.position.x = firstPosition.x;
            first.group.position.z = firstPosition.y;
            second.group.position.x = secondPosition.x;
            second.group.position.z = secondPosition.y;
          }
        }
      }

      activeCharacters.forEach((handle) => {
        const surfaceY = planetSurfaceY(handle.group.position.x, handle.group.position.z);
        const verticalLift = Number(handle.group.userData.verticalLift || 0);
        const contactLift = Number(handle.group.userData.contactLift || verticalLift);
        const opacity = Number(handle.group.userData.opacity || 0);
        handle.group.position.y = surfaceY + verticalLift;
        updateCharacterContactShadow(handle, surfaceY, contactLift, opacity);
      });

      removedCharacterIds.forEach((id) => {
        const handle = characters.get(id);
        if (!handle) return;
        stage.remove(handle.group);
        stage.remove(handle.shadow);
        disposeObject(handle.group);
        disposeObject(handle.shadow);
        characters.delete(id);
      });

      removedRestaurantIds.forEach((id) => {
        const handle = restaurantCards.get(id);
        if (!handle) return;
        cardOrbit.remove(handle.group);
        disposeRestaurantCard(handle);
        restaurantCards.delete(id);
      });

      renderer.render(scene, camera);
    });

    return () => {
      renderer.setAnimationLoop(null);
      resizeObserver.disconnect();
      timer.dispose();
      renderer.domElement.removeEventListener("pointermove", handlePointerMove);
      renderer.domElement.removeEventListener("pointerdown", handlePointerDown);
      renderer.domElement.removeEventListener("pointerup", handlePointerUp);
      renderer.domElement.removeEventListener("pointercancel", handlePointerUp);
      apiRef.current = null;
      restaurantCards.forEach((handle) => {
        handle.disposed = true;
      });
      disposeObject(scene);
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      data-tabletop-characters={currentUser ? friends.length + 1 : friends.length}
      className={`relative h-full w-full touch-none ${className}`}
      aria-label="Animated tabletop scene with the current user and selected friends"
    >
      <div className="pointer-events-none absolute -inset-x-[8vw] bottom-[6%] h-[42%] rounded-full bg-[radial-gradient(circle,rgba(42,160,210,0.24),rgba(42,160,210,0.08)_44%,rgba(42,160,210,0)_78%)] blur-2xl" />
      <div
        className="pointer-events-none absolute -inset-x-[8vw] bottom-0 z-10 h-[34%]"
        style={{
          background:
            "linear-gradient(to bottom, rgba(247,244,239,0), rgba(247,244,239,0.58) 62%, rgba(247,244,239,0.96))",
        }}
      />
      {webglFailed && (
        <div className="absolute inset-[10%] rounded-full border border-white/70 bg-[radial-gradient(circle_at_40%_30%,#fff8ef,#e8d7c4)] shadow-[0_26px_60px_rgba(145,94,255,0.12)]" />
      )}
    </div>
  );
}
