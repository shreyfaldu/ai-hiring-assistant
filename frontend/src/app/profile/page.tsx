"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api, isApiError } from "@/lib/api";

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{
    id: string;
    name: string;
    email: string;
    profile_picture: string | null;
    email_verified: boolean;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.me();
        if (!cancelled) {
          setUser(res.user);
        }
      } catch (err) {
        if (!cancelled) {
          if (isApiError(err) && err.status === 401) {
            router.replace("/login");
            return;
          }
          setError(err instanceof Error ? err.message : "Could not load profile");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const logout = () => {
    localStorage.removeItem("hr_token");
    document.cookie = "hr_token=; Max-Age=0; path=/";
    router.push("/login");
  };

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-2xl px-4 py-16 text-center text-slate-600">
        Loading profile…
      </main>
    );
  }

  if (error || !user) {
    return (
      <main className="mx-auto w-full max-w-2xl px-4 py-16 text-center">
        <p className="text-red-600">{error || "Profile unavailable"}</p>
        <Link href="/dashboard" className="mt-4 inline-block text-brand-700">
          Back to dashboard
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-2xl space-y-6 px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl text-ink">Your profile</h1>
        <div className="flex gap-2">
          <Link
            href="/dashboard"
            className="rounded-xl border border-brand-100 px-4 py-2 text-sm font-semibold text-ink"
          >
            Dashboard
          </Link>
          <button
            type="button"
            onClick={logout}
            className="rounded-xl border border-brand-100 px-4 py-2 text-sm font-semibold"
          >
            Logout
          </button>
        </div>
      </div>

      <section className="card flex flex-col gap-6 p-8 sm:flex-row sm:items-start">
        <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-100 text-2xl font-bold text-brand-700">
          {user.profile_picture ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.profile_picture} alt="" className="h-full w-full object-cover" />
          ) : (
            user.name.slice(0, 1).toUpperCase()
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <p className="font-display text-2xl text-ink">{user.name}</p>
          <p className="text-sm text-slate-600">{user.email}</p>
          <p className="text-sm text-slate-500">
            Email status:{" "}
            <span className={user.email_verified ? "font-semibold text-green-700" : "font-semibold text-amber-700"}>
              {user.email_verified ? "Verified" : "Not verified"}
            </span>
          </p>
        </div>
      </section>
    </main>
  );
}
