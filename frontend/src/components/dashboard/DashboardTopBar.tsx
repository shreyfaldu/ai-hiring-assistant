"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import type { MeResponse } from "@/lib/api";

function initials(name: string, email: string) {
  const n = name.trim();
  if (n) {
    const parts = n.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return n.slice(0, 2).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

export default function DashboardTopBar({
  user,
  searchQuery,
  onSearchChange,
  onCreateJob
}: {
  user: MeResponse["user"] | null;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onCreateJob: () => void;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", fn);
    return () => document.removeEventListener("click", fn);
  }, []);

  const logout = () => {
    localStorage.removeItem("hr_token");
    document.cookie = "hr_token=; Max-Age=0; path=/; SameSite=Lax";
    router.push("/login");
  };

  const label = user?.name || user?.email || "Account";

  return (
    <header className="flex h-[72px] shrink-0 items-center gap-3 border-b border-app-border bg-app-surface px-4 sm:gap-4 sm:px-6 lg:px-8">
      <div className="relative mx-auto w-full max-w-xl flex-1">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-app-muted" aria-hidden>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
        </span>
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search jobs, candidates…"
          className="w-full rounded-xl border-0 bg-app-input py-2.5 pl-10 pr-4 text-sm text-app-text placeholder:text-app-muted outline-none ring-0 focus:bg-app-input-focus"
        />
      </div>

      <button
        type="button"
        onClick={onCreateJob}
        className="hidden shrink-0 rounded-xl bg-app-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-app-accent-hover sm:block"
      >
        New job
      </button>

      <ThemeToggle />

      <button type="button" className="relative shrink-0 rounded-full p-2 text-app-subtle hover:bg-app-hover" aria-label="Notifications">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
        </svg>
        <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-app-danger" />
      </button>

      <div className="relative shrink-0" ref={ref}>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 hover:bg-app-hover"
          aria-expanded={open}
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-app-nav-active text-xs font-semibold text-app-nav-active-text">
            {user ? initials(user.name, user.email) : "—"}
          </span>
          <span className="hidden max-w-[120px] truncate text-sm font-medium text-app-text lg:inline">{label}</span>
          <svg className={`h-4 w-4 text-app-subtle transition ${open ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
        {open && (
          <div className="absolute right-0 z-20 mt-2 w-52 rounded-xl border border-app-border bg-app-surface py-1 shadow-lg">
            <div className="border-b border-app-border px-4 py-2">
              <p className="truncate text-sm font-medium text-app-text">{label}</p>
              {user?.email && <p className="truncate text-xs text-app-muted">{user.email}</p>}
            </div>
            <Link href="/profile" className="block px-4 py-2.5 text-sm text-app-text hover:bg-app-hover-strong" onClick={() => setOpen(false)}>
              Profile
            </Link>
            <button type="button" className="w-full px-4 py-2.5 text-left text-sm text-app-text hover:bg-app-hover-strong" onClick={logout}>
              Log out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
