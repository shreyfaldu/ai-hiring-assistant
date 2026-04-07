import { Candidate, JobPayload } from "@/types";

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export type ApiError = Error & {
  status: number;
  payload?: {
    message?: string;
    code?: string;
    email?: string;
    devCode?: string;
    [key: string]: unknown;
  };
};

export function isApiError(err: unknown): err is ApiError {
  return err instanceof Error && "status" in err && typeof (err as ApiError).status === "number";
}

export type SignupResponse =
  | { token: string; user: { id: string; name: string; email: string }; email_verified: true }
  | { message: string; email: string; devCode?: string };

export type MeResponse = {
  user: {
    id: string;
    name: string;
    email: string;
    profile_picture: string | null;
    email_verified: boolean;
  };
  jobs_stats: {
    total: number;
    last_created_at: string | null;
  };
  recent_jobs: {
    id: string;
    title: string;
    created_at: string;
    public_url: string;
    posted: boolean;
    pipeline: {
      total_steps: number;
      completed_steps: number;
      current_step_name: string;
      application_count: number;
    };
  }[];
};

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
    const payload = (await res.json().catch(() => ({ message: "Request failed" }))) as Record<string, unknown>;
    const message = typeof payload.message === "string" ? payload.message : "Request failed";
    const err = new Error(message) as ApiError;
    err.status = res.status;
    err.payload = payload;
    throw err;
  }

  return res.json() as Promise<T>;
}

export const api = {
  signup: (payload: { name: string; email: string; password: string }) =>
    request<SignupResponse>("/auth/signup", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  login: (payload: { email: string; password: string }) =>
    request<{ token: string; user: { id: string; name: string; email: string }; email_verified?: boolean }>(
      "/auth/login",
      {
        method: "POST",
        body: JSON.stringify(payload)
      }
    ),
  verifyEmail: (payload: { email: string; code: string }) =>
    request<{ token: string; user: { id: string; name: string; email: string }; message?: string }>(
      "/auth/verify-email",
      {
        method: "POST",
        body: JSON.stringify(payload)
      }
    ),
  resendVerification: (payload: { email: string }) =>
    request<{ message: string; devCode?: string }>("/auth/resend-verification", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  me: () => request<MeResponse>("/auth/me"),
  getJobResume: (jobId: string) =>
    request<{
      job: {
        id: string;
        title: string;
        experience?: string | null;
        skills?: string | null;
        location?: string | null;
        salary?: string | null;
        job_type?: string | null;
        job_description: string;
        public_url: string;
        posted: boolean;
        active_pipeline_index?: number;
      };
    }>(`/jobs/${jobId}/resume`),
  markJobPosted: (jobId: string) =>
    request<{ ok: boolean; posted: boolean }>(`/jobs/${jobId}/posted`, { method: "POST" }),
  createJob: (payload: JobPayload) =>
    request<{
      job: {
        id: string;
        title?: string;
        experience?: string | null;
        skills?: string | null;
        location?: string | null;
        salary?: string | null;
        job_type?: string | null;
        job_description: string;
        public_url: string;
      };
    }>("/jobs", {
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
