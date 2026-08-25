import type { AuthLinkMode } from "@tableus/domain";

import { AuthCard } from "../components/auth-card";

export default async function InvitePage({ searchParams }: { searchParams: Promise<{ mode?: string }> }) {
  const requestedMode = (await searchParams).mode;
  const mode: AuthLinkMode = requestedMode === "sign-in" ? "sign-in" : "join";
  return <div className="mx-auto flex min-h-full max-w-xl items-center px-6 py-16"><AuthCard initialMode={mode} /></div>;
}
