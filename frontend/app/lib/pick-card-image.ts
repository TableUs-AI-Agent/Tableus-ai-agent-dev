import { price } from "./plan-links";

const cache = new Map<string, string>();

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

/**
 * Draws a pick as the face of a 3D table card (we don't store Google photos).
 * Butter marks the chosen place, as everywhere else in the app.
 */
export type CardPick = { id: string; name: string; cuisine: string; price_level: number; reasoning: string };

export function pickCardImage(pick: CardPick, chosen: boolean): string {
  const key = `${pick.id}:${chosen}`;
  const hit = cache.get(key);
  if (hit) return hit;
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

  ctx.fillStyle = chosen ? "#F4CF4A" : "#FFFFFF";
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = "#17301F";
  ctx.font = `800 52px ${display}`;
  const nameLines = wrap(ctx, pick.name, width - 48).slice(0, 3);
  nameLines.forEach((line, index) => ctx.fillText(line, 24, 72 + index * 48));

  let y = 72 + nameLines.length * 48 + 4;
  ctx.font = `600 22px ${body}`;
  ctx.fillStyle = chosen ? "#17301F" : "#4C6652";
  ctx.fillText(`${pick.cuisine}, ${price(pick.price_level)}`, 24, y);

  y += 40;
  ctx.fillStyle = "#17301F";
  ctx.font = `400 22px ${body}`;
  wrap(ctx, pick.reasoning, width - 48).slice(0, 6).forEach((line, index) => ctx.fillText(line, 24, y + index * 30));

  const url = canvas.toDataURL("image/png");
  cache.set(key, url);
  return url;
}
