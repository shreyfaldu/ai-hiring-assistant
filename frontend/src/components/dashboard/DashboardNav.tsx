"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { api, isApiError, type MeResponse } from "@/lib/api";

function initials(name: string | undefined, email: string) {
  const n = (name || "").trim();
  if (n) {
    const parts = n.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return n.slice(0, 2).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

export default function DashboardNav({ onCreateJob }: { onCreateJob: () => void }) {
  const router = useRouter();
  const [user, setUser] = useState<MeResponse["user"] | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.me();
        if (!cancelled) setUser(res.user);
      } catch (e) {
        if (!cancelled && isApiError(e) && e.status === 401) router.replace("/login");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  const logout = () => {
    localStorage.removeItem("hr_token");
    document.cookie = "hr_token=; Max-Age=0; path=/; SameSite=Lax";
    router.push("/login");
  };

  const display = user?.name || user?.email || "Account";

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/90 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between gap-6 px-5">
        <Link href="/dashboard" className="text-[15px] font-medium tracking-tight text-neutral-900">
          Hiring
        </Link>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCreateJob}
            className="rounded-md border border-neutral-900 bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-neutral-800"
          >
            New job
          </button>

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-xs font-medium text-neutral-700 transition hover:bg-neutral-200"
              aria-expanded={menuOpen}
              aria-label="Account menu"
            >
              {user ? initials(user.name, user.email) : "·"}
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-1 w-44 rounded-md border border-neutral-200 bg-white py-1 shadow-sm">
                <div className="border-b border-neutral-100 px-3 py-2">
                  <p className="truncate text-xs font-medium text-neutral-900">{display}</p>
                  {user?.email && <p className="truncate text-[11px] text-neutral-500">{user.email}</p>}
                </div>
                <Link
                  href="/profile"
                  className="block px-3 py-2 text-xs text-neutral-700 hover:bg-neutral-50"
                  onClick={() => setMenuOpen(false)}
                >
                  Profile
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    logout();
                  }}
                  className="w-full px-3 py-2 text-left text-xs text-neutral-600 hover:bg-neutral-50"
                >
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
