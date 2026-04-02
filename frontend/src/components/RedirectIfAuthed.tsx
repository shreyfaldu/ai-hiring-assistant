"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

function readTokenFromCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|; )hr_token=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * If a stored session is valid, send the user to the dashboard.
 * If the token is missing or invalid, clear it so login/signup can run cleanly.
 */
export default function RedirectIfAuthed({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      let token = localStorage.getItem("hr_token");
      if (!token) {
        const fromCookie = readTokenFromCookie();
        if (fromCookie) {
          localStorage.setItem("hr_token", fromCookie);
          token = fromCookie;
        }
      }

      if (!token) {
        if (!cancelled) setReady(true);
        return;
      }

      try {
        await api.me();
        if (!cancelled) {
          router.replace("/dashboard");
        }
        return;
      } catch {
        localStorage.removeItem("hr_token");
        document.cookie = "hr_token=; Max-Age=0; path=/; SameSite=Lax";
        if (!cancelled) setReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (!ready) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <p className="text-sm text-slate-600">Loading…</p>
      </main>
    );
  }

  return <>{children}</>;
}
