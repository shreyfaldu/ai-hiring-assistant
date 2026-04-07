"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Candidate } from "@/types";

export default function CandidateTable({
  jobId,
  embedded,
  variant
}: {
  jobId: string;
  embedded?: boolean;
  variant?: "default" | "dashboard";
}) {
  const dash = variant === "dashboard";
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(false);

  const loadCandidates = async () => {
    setLoading(true);
    const res = await api.getCandidates(jobId);
    const sorted = [...res.candidates].sort(
      (a, b) => (b.score?.match_score || 0) - (a.score?.match_score || 0)
    );
    setCandidates(sorted);
    setLoading(false);
  };

  const scoreCandidate = async (id: string) => {
    await api.scoreCandidate(id);
    await loadCandidates();
  };

  useEffect(() => {
    if (jobId) {
      loadCandidates().catch(console.error);
    }
  }, [jobId]);

  const th = dash
    ? "border-b border-app-border pb-3 pr-3 text-left text-[11px] font-semibold uppercase tracking-wide text-app-muted"
    : "border-b border-neutral-200 text-left text-[11px] font-medium uppercase tracking-wide text-neutral-400";
  const td = dash ? "py-3 pr-3 text-sm text-app-text" : "py-2.5 pr-2 text-neutral-800";
  const tdMuted = dash ? "py-3 pr-3 text-sm text-app-subtle" : "py-2.5 pr-2 text-neutral-600";

  return (
    <section className={embedded && !dash ? "" : embedded && dash ? "p-6" : "card p-6"}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className={dash ? "text-sm font-semibold text-app-text" : "text-sm font-medium text-neutral-900"}>Candidates</h2>
        <button
          type="button"
          className={
            dash
              ? "text-xs font-medium text-app-nav-active-text hover:underline"
              : "text-xs text-neutral-500 underline-offset-2 hover:text-neutral-900 hover:underline"
          }
          onClick={() => loadCandidates()}
        >
          Refresh
        </button>
      </div>
      {loading ? (
        <p className={dash ? "text-sm text-app-muted" : "text-sm text-neutral-500"}>Loading…</p>
      ) : candidates.length === 0 ? (
        <p className={dash ? "text-sm text-app-muted" : "text-sm text-neutral-500"}>No applications yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className={dash ? "" : ""}>
                <th className={`${th} ${dash ? "" : "pb-2"}`}>Name</th>
                <th className={`${th} ${dash ? "" : "pb-2"}`}>Email</th>
                <th className={`${th} ${dash ? "" : "pb-2"}`}>Resume</th>
                <th className={`${th} ${dash ? "" : "pb-2"}`}>Match</th>
                <th className={`${th} ${dash ? "" : "pb-2"}`}>Summary</th>
                <th className={dash ? th : `${th} pb-2`}>Action</th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((candidate) => (
                <tr key={candidate.id} className={dash ? "border-b border-app-border" : "border-b border-neutral-100"}>
                  <td className={td}>{candidate.name}</td>
                  <td className={tdMuted}>{candidate.email}</td>
                  <td className={tdMuted}>
                    <a
                      href={candidate.resume_url}
                      className={
                        dash
                          ? "text-xs font-medium text-app-nav-active-text hover:underline"
                          : "text-xs text-neutral-900 underline underline-offset-2"
                      }
                      target="_blank"
                      rel="noreferrer"
                    >
                      Resume
                    </a>
                  </td>
                  <td className={tdMuted}>{candidate.score?.match_score ?? "—"}</td>
                  <td className={`max-w-[200px] truncate ${tdMuted}`}>{candidate.score?.summary ?? "—"}</td>
                  <td className={dash ? "py-3" : "py-2.5"}>
                    <button
                      type="button"
                      onClick={() => scoreCandidate(candidate.id)}
                      className={
                        dash
                          ? "rounded-lg border border-app-border-strong px-3 py-1.5 text-xs font-medium text-app-text hover:bg-app-hover-strong"
                          : "rounded-md border border-neutral-200 px-2 py-1 text-[11px] font-medium text-neutral-800 hover:bg-neutral-50"
                      }
                    >
                      Score
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
