import { rewriteIncomingLink } from "@/lib/links";

export function redirectSystemPath({ path }: { path: string; initial: boolean }): string {
  return rewriteIncomingLink(path);
}
