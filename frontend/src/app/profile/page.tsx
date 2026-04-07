"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ThemeToggle from "@/components/ThemeToggle";
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
      <main className="mx-auto min-h-screen w-full max-w-4xl bg-app-page px-4 py-16 text-center text-app-muted">
        Loading profile…
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-4xl bg-app-page px-4 py-16 text-center">
        <p className="text-app-danger">{error || "Profile unavailable"}</p>
        <Link href="/dashboard" className="mt-4 inline-block text-app-nav-active-text">
          Back to dashboard
        </Link>
      </main>
    );
  }

  const { user, jobs_stats, recent_jobs } = data;

  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl space-y-6 bg-app-page px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl text-app-text">Your profile</h1>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/dashboard"
            className="rounded-xl border border-app-border px-4 py-2 text-sm font-semibold text-app-text hover:bg-app-hover-strong"
          >
            Dashboard
          </Link>
          <button
            type="button"
            onClick={logout}
            className="rounded-xl border border-app-border px-4 py-2 text-sm font-semibold text-app-text hover:bg-app-hover-strong"
          >
            Logout
          </button>
        </div>
      </div>

      <section className="card flex flex-col gap-6 p-8 sm:flex-row sm:items-start">
        <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full bg-app-accent-faint text-2xl font-bold text-app-nav-active-text">
          {user.profile_picture ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.profile_picture} alt="" className="h-full w-full object-cover" />
          ) : (
            user.name.slice(0, 1).toUpperCase()
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <p className="font-display text-2xl text-app-text">{user.name}</p>
          <p className="text-sm text-app-muted">{user.email}</p>
          <p className="text-sm text-app-muted">
            Email status:{" "}
            <span className={user.email_verified ? "font-semibold text-app-success" : "font-semibold text-amber-600 dark:text-amber-400"}>
              {user.email_verified ? "Verified" : "Not verified"}
            </span>
          </p>
        </div>
      </section>

      <section className="card p-6">
        <h2 className="font-display text-xl text-app-text">Jobs (HR activity)</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-app-border bg-app-surface-2 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-app-muted">Jobs created</p>
            <p className="mt-1 font-display text-3xl text-app-text">{jobs_stats.total}</p>
          </div>
          <div className="rounded-xl border border-app-border bg-app-surface-2 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-app-muted">Last job created</p>
            <p className="mt-1 text-sm font-medium text-app-text">{formatDate(jobs_stats.last_created_at)}</p>
          </div>
        </div>
      </section>

      <section className="card overflow-hidden p-0">
        <div className="border-b border-app-border px-6 py-4">
          <h2 className="font-display text-xl text-app-text">Recent jobs</h2>
          <p className="mt-1 text-sm text-app-muted">
            Pipeline shows step progress from your hiring flow. Use <strong>Resume</strong> to continue on the dashboard.
          </p>
        </div>
        {recent_jobs.length === 0 ? (
          <p className="px-6 py-8 text-center text-sm text-app-muted">No jobs yet. Create one from the dashboard.</p>
        ) : (
          <ul className="divide-y divide-app-border">
            {recent_jobs.map((j) => (
              <li key={j.id} className="flex flex-col gap-4 px-6 py-4 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="font-semibold text-app-text">{j.title}</p>
                  <p className="text-xs text-app-muted">Created {formatDate(j.created_at)}</p>
                  <div className="flex flex-wrap gap-2 pt-1 text-xs text-app-subtle">
                    <span className="rounded-full bg-app-accent-faint px-2 py-0.5 text-app-nav-active-text">
                      Step: {j.pipeline.current_step_name}
                    </span>
                    <span className="rounded-full bg-app-surface-2 px-2 py-0.5">
                      {j.pipeline.completed_steps}/{j.pipeline.total_steps} steps done
                    </span>
                    <span className="rounded-full bg-app-surface-2 px-2 py-0.5">
                      {j.pipeline.application_count} application{j.pipeline.application_count === 1 ? "" : "s"}
                    </span>
                    {j.posted && (
                      <span className="rounded-full bg-app-success-bg px-2 py-0.5 font-medium text-app-success">Posted</span>
                    )}
                  </div>
                </div>
                <div className="flex flex-shrink-0 flex-wrap gap-2">
                  <Link
                    href={`/dashboard?jobId=${j.id}`}
                    className="rounded-lg bg-app-accent px-4 py-2 text-center text-sm font-semibold text-white hover:bg-app-accent-hover"
                  >
                    Resume
                  </Link>
                  <a
                    href={j.public_url}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg border border-app-border px-4 py-2 text-center text-sm font-semibold text-app-text hover:bg-app-hover-strong"
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
