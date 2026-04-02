import { Candidate, JobPayload } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

function authHeaders() {
  if (typeof window === "undefined") {
    return {};
  }

  const token = localStorage.getItem("hr_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  headers.set("Content-Type", "application/json");

  const auth = authHeaders();
  if (auth.Authorization) {
    headers.set("Authorization", auth.Authorization);
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Request failed" }));
    throw new Error(error.message || "Request failed");
  }

  return res.json();
}

export const api = {
  signup: (payload: { name: string; email: string; password: string }) =>
    request<{ token: string; user: { id: string; name: string; email: string } }>("/auth/signup", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  login: (payload: { email: string; password: string }) =>
    request<{ token: string; user: { id: string; name: string; email: string } }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  createJob: (payload: JobPayload) =>
    request<{ job: { id: string; job_description: string; public_url: string } }>("/jobs", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  getJob: (id: string) => request<{ job: any }>(`/jobs/${id}`),
  processAi: (payload: Record<string, unknown>) =>
    request<{ data: any }>("/ai/process", { method: "POST", body: JSON.stringify(payload) }),
  getCandidates: (jobId: string) => request<{ candidates: Candidate[] }>(`/jobs/${jobId}/candidates`),
  scoreCandidate: (candidateId: string) =>
    request<{ score: { match_score: number; summary: string } }>(`/candidates/${candidateId}/score`, {
      method: "POST"
    })
};
