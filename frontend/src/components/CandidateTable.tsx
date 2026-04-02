"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Candidate } from "@/types";

export default function CandidateTable({ jobId }: { jobId: string }) {
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

  return (
    <section className="card p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-xl">Candidates</h2>
        <button
          className="rounded-lg border border-brand-100 px-3 py-2 text-xs font-semibold"
          onClick={() => loadCandidates()}
          type="button"
        >
          Refresh
        </button>
      </div>
      {loading ? (
        <p className="text-sm text-slate-600">Loading candidates...</p>
      ) : candidates.length === 0 ? (
        <p className="text-sm text-slate-600">No applications yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500">
                <th className="pb-2">Name</th>
                <th className="pb-2">Email</th>
                <th className="pb-2">Resume</th>
                <th className="pb-2">Match %</th>
                <th className="pb-2">Summary</th>
                <th className="pb-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((candidate) => (
                <tr key={candidate.id} className="border-t border-slate-100">
                  <td className="py-3">{candidate.name}</td>
                  <td className="py-3">{candidate.email}</td>
                  <td className="py-3">
                    <a href={candidate.resume_url} className="text-brand-700 underline" target="_blank">
                      View Resume
                    </a>
                  </td>
                  <td className="py-3">{candidate.score?.match_score ?? "-"}</td>
                  <td className="py-3">{candidate.score?.summary ?? "Not scored"}</td>
                  <td className="py-3">
                    <button
                      type="button"
                      onClick={() => scoreCandidate(candidate.id)}
                      className="rounded-lg bg-brand-600 px-3 py-2 text-xs font-semibold text-white"
                    >
                      Score with AI
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
