"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, PenSquare, Search, User, Users } from "lucide-react";
import { useState } from "react";
import { useUser } from "../context/user-context";

const NAV = [
  { href: "/discover", label: "Discover", icon: Search },
  { href: "/friends", label: "Friends", icon: Users },
  { href: "/review", label: "Review", icon: PenSquare },
  { href: "/profile", label: "Profile", icon: User },
];

export function Sidebar() {
  const pathname = usePathname();
  const { currentUser, allUsers, switchUser } = useUser();
  const [open, setOpen] = useState(false);

  return (
    <>
      <aside className="hidden h-full w-72 shrink-0 flex-col border-r border-[var(--border)] bg-white/70 shadow-[12px_0_40px_rgba(248,180,108,0.08)] backdrop-blur-xl lg:flex">
        <div className="p-7 pb-5">
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="bg-[linear-gradient(135deg,var(--accent),var(--accent-light))] bg-clip-text text-transparent">
              TableUs
            </span>
          </h1>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">Food plans, shared at the table.</p>
        </div>

        <nav className="flex-1 space-y-2 px-4">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href === "/discover" && pathname === "/");
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all ${
                  active
                    ? "bg-[linear-gradient(135deg,rgba(255,138,61,0.14),rgba(17,181,164,0.12))] text-[var(--foreground)] shadow-[0_10px_30px_rgba(255,138,61,0.1)]"
                    : "text-[var(--muted-foreground)] hover:bg-white/65 hover:text-[var(--foreground)]"
                }`}
              >
                <div className={`flex h-9 w-9 items-center justify-center rounded-full ${
                  active ? "bg-white/80 text-[var(--accent)]" : "bg-[var(--muted)]/80 text-[var(--muted-foreground)]"
                }`}>
                  <Icon className="h-4 w-4" />
                </div>
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-[var(--border)] p-4">
          <button
            onClick={() => setOpen((value) => !value)}
            className="flex w-full items-center gap-3 rounded-3xl bg-white/80 px-4 py-3 shadow-[0_12px_30px_rgba(244,186,114,0.12)] transition-colors hover:bg-white"
            aria-expanded={open}
          >
            {currentUser && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={currentUser.avatar} alt="" className="h-10 w-10 rounded-full bg-[var(--muted)]" />
            )}
            <div className="flex-1 text-left">
              <p className="truncate text-sm font-medium">{currentUser?.name ?? "Loading..."}</p>
              <p className="text-xs text-[var(--muted-foreground)]">Manage my account</p>
            </div>
            <ChevronDown className={`h-4 w-4 text-[var(--muted-foreground)] transition-transform ${open ? "rotate-180" : ""}`} />
          </button>

          {open && (
            <div className="mt-2 space-y-1 rounded-3xl bg-white/72 p-2">
              {allUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => {
                    switchUser(user.id);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-sm transition-colors ${
                    user.id === currentUser?.id
                      ? "bg-[linear-gradient(135deg,rgba(255,138,61,0.12),rgba(17,181,164,0.1))] text-[var(--foreground)]"
                      : "text-[var(--muted-foreground)] hover:bg-white/80 hover:text-[var(--foreground)]"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={user.avatar} alt="" className="h-6 w-6 rounded-full bg-[var(--muted)]" />
                  {user.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </aside>

      {open && (
        <div className="fixed inset-x-3 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-[72] rounded-[28px] border border-white/75 bg-white/95 p-3 shadow-[0_22px_70px_rgba(145,94,255,0.14)] backdrop-blur-2xl lg:hidden">
          <div className="mb-2 flex items-center gap-3 px-2">
            {currentUser && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={currentUser.avatar} alt="" className="h-9 w-9 rounded-full bg-[var(--muted)] object-cover" />
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[var(--foreground)]">{currentUser?.name ?? "Loading..."}</p>
              <p className="text-xs text-[var(--muted-foreground)]">Switch user</p>
            </div>
          </div>
          <div className="max-h-[42vh] space-y-1 overflow-y-auto pr-1">
            {allUsers.map((user) => (
              <button
                key={user.id}
                onClick={() => {
                  switchUser(user.id);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition-colors ${
                  user.id === currentUser?.id
                    ? "bg-[linear-gradient(135deg,rgba(255,138,61,0.12),rgba(17,181,164,0.1))] text-[var(--foreground)]"
                    : "text-[var(--muted-foreground)] hover:bg-[var(--background)] hover:text-[var(--foreground)]"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={user.avatar} alt="" className="h-7 w-7 rounded-full bg-[var(--muted)] object-cover" />
                <span className="truncate">{user.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <nav className="fixed inset-x-0 bottom-0 z-[70] border-t border-white/75 bg-white/92 px-2 pb-[calc(0.45rem+env(safe-area-inset-bottom))] pt-2 shadow-[0_-14px_40px_rgba(145,94,255,0.1)] backdrop-blur-2xl lg:hidden">
        <div className="mx-auto flex max-w-xl items-center gap-1">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href === "/discover" && pathname === "/");
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`flex min-w-0 flex-1 flex-col items-center gap-1 rounded-2xl px-1.5 py-1.5 text-[10px] font-semibold transition ${
                  active
                    ? "text-[var(--accent)]"
                    : "text-[var(--muted-foreground)] hover:bg-white/80 hover:text-[var(--foreground)]"
                }`}
              >
                <span className={`flex h-8 w-8 items-center justify-center rounded-full ${
                  active
                    ? "bg-[linear-gradient(135deg,rgba(255,138,61,0.16),rgba(17,181,164,0.12))]"
                    : "bg-[var(--muted)]/70"
                }`}>
                  <Icon className="h-4 w-4" />
                </span>
                <span className="w-full truncate text-center">{label}</span>
              </Link>
            );
          })}

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className={`flex min-w-0 flex-1 flex-col items-center gap-1 rounded-2xl px-1.5 py-1.5 text-[10px] font-semibold transition ${
              open
                ? "text-[var(--accent)]"
                : "text-[var(--muted-foreground)] hover:bg-white/80 hover:text-[var(--foreground)]"
            }`}
            aria-label="Switch user"
            aria-expanded={open}
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--muted)]/70">
              {currentUser ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={currentUser.avatar} alt="" className="h-8 w-8 rounded-full object-cover" />
              ) : (
                <User className="h-4 w-4" />
              )}
            </span>
            <span className="w-full truncate text-center">User</span>
          </button>
        </div>
      </nav>
    </>
  );
}
