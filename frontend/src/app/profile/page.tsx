"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api, isApiError, type MeResponse } from "@/lib/api";

function formatDate(iso: string | null) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short"
    });
  } catch {
    return "—";
  }
}

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<MeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.me();
        if (!cancelled) {
          setData(res);
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
      <main className="mx-auto w-full max-w-4xl px-4 py-16 text-center text-slate-600">
        Loading profile…
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="mx-auto w-full max-w-4xl px-4 py-16 text-center">
        <p className="text-red-600">{error || "Profile unavailable"}</p>
        <Link href="/dashboard" className="mt-4 inline-block text-brand-700">
          Back to dashboard
        </Link>
      </main>
    );
  }

  const { user, jobs_stats, recent_jobs } = data;

  return (
    <main className="mx-auto w-full max-w-4xl space-y-6 px-4 py-10">
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

      <section className="card p-6">
        <h2 className="font-display text-xl text-ink">Jobs (HR activity)</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-brand-100 bg-slate-50/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Jobs created</p>
            <p className="mt-1 font-display text-3xl text-ink">{jobs_stats.total}</p>
          </div>
          <div className="rounded-xl border border-brand-100 bg-slate-50/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Last job created</p>
            <p className="mt-1 text-sm font-medium text-ink">{formatDate(jobs_stats.last_created_at)}</p>
          </div>
        </div>
      </section>

      <section className="card overflow-hidden p-0">
        <div className="border-b border-brand-100 px-6 py-4">
          <h2 className="font-display text-xl text-ink">Recent jobs</h2>
          <p className="mt-1 text-sm text-slate-600">
            Pipeline shows step progress from your hiring flow. Use <strong>Resume</strong> to continue on the dashboard.
          </p>
        </div>
        {recent_jobs.length === 0 ? (
          <p className="px-6 py-8 text-center text-sm text-slate-600">No jobs yet. Create one from the dashboard.</p>
        ) : (
          <ul className="divide-y divide-brand-100">
            {recent_jobs.map((j) => (
              <li key={j.id} className="flex flex-col gap-4 px-6 py-4 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="font-semibold text-ink">{j.title}</p>
                  <p className="text-xs text-slate-500">Created {formatDate(j.created_at)}</p>
                  <div className="flex flex-wrap gap-2 pt-1 text-xs text-slate-600">
                    <span className="rounded-full bg-brand-50 px-2 py-0.5">
                      Step: {j.pipeline.current_step_name}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5">
                      {j.pipeline.completed_steps}/{j.pipeline.total_steps} steps done
                    </span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5">
                      {j.pipeline.application_count} application{j.pipeline.application_count === 1 ? "" : "s"}
                    </span>
                    {j.posted && (
                      <span className="rounded-full bg-green-50 px-2 py-0.5 font-medium text-green-800">Posted</span>
                    )}
                  </div>
                </div>
                <div className="flex flex-shrink-0 flex-wrap gap-2">
                  <Link
                    href={`/dashboard?jobId=${j.id}`}
                    className="rounded-lg bg-brand-600 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-brand-700"
                  >
                    Resume
                  </Link>
                  <a
                    href={j.public_url}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg border border-brand-100 px-4 py-2 text-center text-sm font-semibold text-ink hover:bg-slate-50"
                  >
                    Apply page
                  </a>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
