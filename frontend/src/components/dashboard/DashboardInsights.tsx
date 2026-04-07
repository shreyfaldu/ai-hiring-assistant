"use client";

import Link from "next/link";
import type { MeResponse } from "@/lib/api";

type RecentJob = MeResponse["recent_jobs"][number];

export default function DashboardInsights({
  jobsTotal,
  lastCreatedLabel,
  recentJobs,
  searchQuery,
  pipelineStepIndex,
  pipelineStepCount,
  applicationCount,
  currentJobTitle,
  posted,
  selectedJobId
}: {
  jobsTotal: number;
  lastCreatedLabel: string;
  recentJobs: RecentJob[];
  searchQuery: string;
  pipelineStepIndex: number;
  pipelineStepCount: number;
  applicationCount: number;
  currentJobTitle: string | null;
  posted: boolean;
  selectedJobId?: string | null;
}) {
  const q = searchQuery.trim().toLowerCase();
  const filteredJobs = q ? recentJobs.filter((j) => j.title.toLowerCase().includes(q)) : recentJobs;
  const displayJobs = filteredJobs.slice(0, 5);
  const postedCount = recentJobs.filter((j) => j.posted).length;

  const barJobs = recentJobs.slice(0, 6);
  const maxH = 88;

  const progressDeg = Math.min(360, Math.max(0, (pipelineStepIndex / Math.max(pipelineStepCount - 1, 1)) * 360));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-app-border bg-app-surface p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-app-muted">Total roles</p>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-app-text">{jobsTotal}</p>
              <p className="mt-1 flex items-center gap-1 text-sm text-app-success">
                <span>↑</span> {lastCreatedLabel}
              </p>
            </div>
            <Link
              href="/dashboard#workspace"
              className="rounded-lg border border-app-border-strong px-3 py-1.5 text-xs font-medium text-app-nav-active-text hover:bg-app-hover-strong"
            >
              View workspace
            </Link>
          </div>
          <div className="mt-8 flex h-[100px] items-end justify-between gap-2">
            {(barJobs.length ? barJobs : [1, 2, 3, 4, 5, 6]).map((j, i) => {
              const pct =
                typeof j === "number"
                  ? 35 + (i * 11) % 55
                  : Math.round((j.pipeline.completed_steps / Math.max(j.pipeline.total_steps, 1)) * 100);
              const h = Math.round((pct / 100) * maxH);
              return (
                <div key={typeof j === "number" ? i : j.id} className="flex flex-1 flex-col items-center gap-2">
                  <div
                    className="w-full max-w-[36px] rounded-t-md bg-app-accent opacity-90"
                    style={{ height: `${h}px` }}
                  />
                  <span className="text-[10px] text-app-muted">{i + 1}</span>
                </div>
              );
            })}
          </div>
          <p className="mt-2 text-center text-[11px] text-app-muted">Pipeline progress by recent role</p>
        </div>

        <div className="rounded-2xl border border-app-border bg-app-surface p-6 shadow-sm">
          <p className="text-sm font-medium text-app-muted">Hiring funnel</p>
          <p className="mt-2 text-lg font-semibold text-app-text">Current stage</p>
          <div className="mt-6 flex items-center justify-center">
            <div
              className="relative h-44 w-44 rounded-full"
              style={{
                background: `conic-gradient(rgb(var(--app-accent-rgb) / 1) 0deg ${progressDeg}deg, var(--app-conic-track) ${progressDeg}deg 360deg)`
              }}
            >
              <div className="absolute inset-[18%] flex flex-col items-center justify-center rounded-full bg-app-surface shadow-inner">
                <span className="text-2xl font-semibold text-app-text">{pipelineStepIndex + 1}</span>
                <span className="text-xs text-app-muted">of {pipelineStepCount}</span>
              </div>
            </div>
          </div>
          <p className="mt-4 text-center text-sm text-app-subtle">
            {currentJobTitle ? `"${currentJobTitle}"` : "Create a job to track stages"}
            {posted && <span className="ml-1 text-app-success">· Live</span>}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-app-border bg-app-surface p-6 shadow-sm">
          <p className="text-sm font-medium text-app-muted">Pipeline health</p>
          <div className="mt-6 flex items-center justify-center gap-[-8px]">
            <div
              className="z-[3] flex h-24 w-24 items-center justify-center rounded-full border-4 border-app-surface bg-[#a855f7] text-center text-sm font-semibold text-white shadow-md"
              style={{ marginRight: "-12px" }}
            >
              JD
            </div>
            <div
              className="z-[2] flex h-24 w-24 items-center justify-center rounded-full border-4 border-app-surface bg-[#f97316] text-center text-sm font-semibold text-white shadow-md"
              style={{ marginRight: "-12px" }}
            >
              {posted ? "Live" : "Draft"}
            </div>
            <div className="z-[1] flex h-24 w-24 items-center justify-center rounded-full border-4 border-app-surface bg-[#14b8a6] text-center text-sm font-semibold text-white shadow-md">
              Apps
            </div>
          </div>
          <div className="mt-4 flex justify-between px-2 text-center text-xs text-app-muted">
            <span>Description</span>
            <span>Published</span>
            <span>{applicationCount} open</span>
          </div>
        </div>

        <div className="rounded-2xl border border-app-border bg-app-surface p-6 shadow-sm lg:col-span-1">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-app-muted">Recent roles</p>
            <span className="text-xs text-app-muted">{postedCount} posted</span>
          </div>
          <ul className="mt-4 space-y-3">
            {displayJobs.length === 0 ? (
              <li className="text-sm text-app-muted">No roles match search.</li>
            ) : (
              displayJobs.map((j) => (
                <li key={j.id}>
                  <Link
                    href={`/dashboard?jobId=${j.id}`}
                    className={`flex items-center gap-3 rounded-xl p-2 transition hover:bg-app-hover-strong ${
                      selectedJobId === j.id ? "bg-app-nav-active ring-1 ring-app-ring-selected" : ""
                    }`}
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-app-accent-faint text-sm font-semibold text-app-nav-active-text">
                      {(j.title || "?").slice(0, 1).toUpperCase()}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-app-text">{j.title || "Untitled"}</p>
                      <p className="text-xs text-app-muted">{j.pipeline.application_count} applicants</p>
                    </div>
                    {j.posted && (
                      <span className="shrink-0 rounded-full bg-app-success-bg px-2 py-0.5 text-[10px] font-medium text-app-success">
                        Live
                      </span>
                    )}
                  </Link>
                </li>
              ))
            )}
          </ul>
        </div>

        <div className="rounded-2xl border border-app-border bg-app-surface p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-app-muted">Applications</p>
              <p className="mt-2 text-3xl font-semibold text-app-text">{applicationCount}</p>
              <p className="mt-1 text-sm text-app-danger">For current role</p>
            </div>
          </div>
          <div className="mt-6 flex h-24 items-end">
            {[0.35, 0.55, 0.42, 0.7, 0.5, 0.62, 0.45].map((v, i) => (
              <div key={i} className="mx-0.5 flex-1 rounded-t-sm bg-app-accent/20" style={{ height: `${v * 100}%` }} />
            ))}
          </div>
          <p className="mt-2 text-center text-[11px] text-app-muted">Activity (illustrative)</p>
        </div>
      </div>
    </div>
  );
}
