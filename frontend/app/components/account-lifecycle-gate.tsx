"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "./sidebar";
import { useUser } from "../context/user-context";

export function AccountLifecycleGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { userState } = useUser();
  const deleting = userState === "deleting";
  const allowed = pathname === "/account" || pathname === "/account-deletion" || pathname === "/privacy" || pathname === "/terms";

  useEffect(() => {
    if (deleting && !allowed) router.replace("/account");
  }, [allowed, deleting, router]);

  return (
    <>
      {!deleting ? <Sidebar /> : null}
      <main className="flex-1 overflow-y-auto">
        {deleting && !allowed
          ? <p className="p-8" role="status">Opening account deletion status…</p>
          : children}
      </main>
    </>
  );
}
