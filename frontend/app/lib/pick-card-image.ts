import { price } from "./plan-links";

const cache = new Map<string, Promise<string>>();

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const image = new Image();
    // Google's photo host allows cross-origin reads, which keeps the canvas exportable.
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = src;
  });
}

/** Draws `image` to fill the box, cropping the overflow from the center. */
function cover(ctx: CanvasRenderingContext2D, image: HTMLImageElement, x: number, y: number, width: number, height: number) {
  const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
  const sw = width / scale;
  const sh = height / scale;
  ctx.drawImage(image, (image.naturalWidth - sw) / 2, (image.naturalHeight - sh) / 2, sw, sh, x, y, width, height);
}

/**
 * The face of a pick's card on the 3D table: the place's photo on top, its name
 * big enough to read below. Google requires its logo and the photo's authors
 * beside its photos, so both sit on the photo. The full reason stays in the list.
 * Butter marks the chosen place, as everywhere else in the app.
 */
export type CardPick = {
  id: string;
  name: string;
  cuisine: string;
  price_level: number;
  reasoning: string;
  /** Absolute photo URL, when the place has one. */
  photo?: string | null;
  photo_credits?: string[];
};

export function pickCardImage(pick: CardPick, chosen: boolean): Promise<string> {
  const key = `${pick.id}:${chosen}:${pick.photo ?? ""}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const drawn = draw(pick, chosen).catch(() => draw({ ...pick, photo: null }, chosen));
  cache.set(key, drawn);
  return drawn;
}

async function draw(pick: CardPick, chosen: boolean): Promise<string> {
  const width = 340;
  const height = 480;
  const canvas = document.createElement("canvas");
  canvas.width = width * 2;
  canvas.height = height * 2;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  ctx.scale(2, 2);
  const display = getComputedStyle(document.documentElement).getPropertyValue("--font-darker-grotesque").trim() || "sans-serif";
  const body = getComputedStyle(document.body).fontFamily || "sans-serif";
  const [photo, logo] = await Promise.all([
    pick.photo ? loadImage(pick.photo) : Promise.resolve(null),
    pick.photo ? loadImage("/google-maps-attribution.svg") : Promise.resolve(null),
  ]);

  ctx.fillStyle = chosen ? "#F4CF4A" : "#FFFFFF";
  ctx.fillRect(0, 0, width, height);

  let y: number;
  if (photo) {
    const photoHeight = 290;
    cover(ctx, photo, 0, 0, width, photoHeight);
    // A soft scrim keeps the attribution legible on any photo.
    const scrim = ctx.createLinearGradient(0, photoHeight - 56, 0, photoHeight);
    scrim.addColorStop(0, "rgba(255,255,255,0)");
    scrim.addColorStop(1, "rgba(255,255,255,0.92)");
    ctx.fillStyle = scrim;
    ctx.fillRect(0, photoHeight - 56, width, 56);
    if (logo) ctx.drawImage(logo, 12, photoHeight - 26, 98, 18);
    const credits = pick.photo_credits?.filter(Boolean) ?? [];
    if (credits.length) {
      ctx.font = `600 13px ${body}`;
      ctx.fillStyle = "#1F1F1F";
      ctx.textAlign = "right";
      const label = wrap(ctx, `Photo: ${credits.join(", ")}`, width - 140)[0] ?? "";
      ctx.fillText(label, width - 12, photoHeight - 12);
      ctx.textAlign = "left";
    }
    // The largest size that fits the whole name on two lines.
    ctx.fillStyle = "#17301F";
    let size = 60;
    let nameLines: string[] = [];
    for (; size >= 36; size -= 6) {
      ctx.font = `800 ${size}px ${display}`;
      nameLines = wrap(ctx, pick.name, width - 40);
      if (nameLines.length <= 2) break;
    }
    const leading = size * 0.84;
    y = photoHeight + 14 + leading;
    nameLines.slice(0, 2).forEach((line, index) => ctx.fillText(line, 20, y + index * leading));
    y += (Math.min(nameLines.length, 2) - 1) * leading + 36;
  } else {
    // No photo: the name carries the card, as large as it can be.
    ctx.fillStyle = "#17301F";
    ctx.font = `800 84px ${display}`;
    const nameLines = wrap(ctx, pick.name, width - 40).slice(0, 4);
    nameLines.forEach((line, index) => ctx.fillText(line, 20, 96 + index * 72));
    y = 96 + nameLines.length * 72 + 8;
  }
  ctx.font = `700 26px ${body}`;
  ctx.fillStyle = chosen ? "#17301F" : "#4C6652";
  ctx.fillText(`${pick.cuisine}, ${price(pick.price_level)}`, 20, Math.min(y, height - 24));

  return canvas.toDataURL("image/png");
}
