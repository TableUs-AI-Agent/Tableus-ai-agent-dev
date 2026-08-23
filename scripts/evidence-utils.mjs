import { createHash } from "node:crypto";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

export function artifactChecksum(path) {
  const root = statSync(path);
  if (!root.isDirectory()) return createHash("sha256").update(readFileSync(path)).digest("hex");

  const hash = createHash("sha256");
  const visit = (current, relative = "") => {
    const stat = statSync(current);
    if (stat.isDirectory()) {
      for (const entry of readdirSync(current).sort()) visit(join(current, entry), join(relative, entry));
      return;
    }
    hash.update(relative);
    hash.update("\0");
    hash.update(readFileSync(current));
  };
  visit(path);
  return hash.digest("hex");
}
