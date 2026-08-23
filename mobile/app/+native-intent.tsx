import { rewriteCanonicalSystemPath } from "@/lib/links";

export function redirectSystemPath({ path }: { path: string; initial: boolean }): string {
  return rewriteCanonicalSystemPath(path);
}
