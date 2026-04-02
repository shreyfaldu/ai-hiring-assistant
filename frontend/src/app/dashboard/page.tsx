"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import CandidateTable from "@/components/CandidateTable";
import JobCreationForm from "@/components/JobCreationForm";
import PipelineStepper from "@/components/PipelineStepper";
import { downloadJobDescriptionPdf } from "@/lib/download-jd-pdf";
import { api } from "@/lib/api";

type CreatedJob = {
  id: string;
  title?: string;
  job_description: string;
  public_url: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const [job, setJob] = useState<CreatedJob | null>(null);
  const [posted, setPosted] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [resumeLoading, setResumeLoading] = useState(false);
  const [markPostedLoading, setMarkPostedLoading] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const jobId = new URLSearchParams(window.location.search).get("jobId");
    if (!jobId) return;

    let cancelled = false;
    setResumeLoading(true);
    (async () => {
      try {
        const { job: j } = await api.getJobResume(jobId);
        if (cancelled) return;
        setJob({
          id: j.id,
          title: j.title,
          job_description: j.job_description,
          public_url: j.public_url
        });
        setPosted(Boolean(j.posted));
        window.history.replaceState({}, "", "/dashboard");
      } catch {
        if (!cancelled) {
          router.replace("/dashboard");
        }
      } finally {
        if (!cancelled) setResumeLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  const activeStep = useMemo(() => {
    if (!job) {
      return 0;
    }
    if (!posted) {
      return 2;
    }
    return 3;
  }, [job, posted]);

  const logout = () => {
    localStorage.removeItem("hr_token");
    document.cookie = "hr_token=; Max-Age=0; path=/; SameSite=Lax";
    router.push("/login");
  };

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8 md:px-8">
      {resumeLoading && (
        <p className="rounded-xl border border-brand-100 bg-slate-50 px-4 py-3 text-sm text-slate-600">Loading job…</p>
      )}
      <header className="card flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-display text-3xl text-ink">Hiring Assistant Dashboard</h1>
          <p className="mt-1 text-sm text-slate-600">Create roles, publish AI-generated JD, and score applicants.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/profile" className="rounded-xl border border-brand-100 px-4 py-2 text-sm font-semibold text-ink">
            Profile
          </Link>
          <button onClick={logout} type="button" className="rounded-xl border border-brand-100 px-4 py-2 text-sm font-semibold">
            Logout
          </button>
        </div>
      </header>

      <PipelineStepper activeStep={activeStep} />

      <JobCreationForm
        onCreated={(j) => {
          setPosted(false);
          setJob(j);
        }}
      />

      {job && (
        <section className="card p-6">
          <div className="mb-4 flex items-start justify-between gap-4">
            <h2 className="font-display text-xl">Publish Job</h2>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="rounded-lg border border-brand-100 px-3 py-2 text-sm font-semibold"
                onClick={() => navigator.clipboard.writeText(job.job_description)}
              >
                Copy
              </button>
              <button
                type="button"
                disabled={pdfLoading}
                className="rounded-lg border border-brand-100 px-3 py-2 text-sm font-semibold disabled:opacity-60"
                onClick={async () => {
                  setPdfLoading(true);
                  try {
                    await downloadJobDescriptionPdf(job.title || "Job Description", job.job_description);
                  } finally {
                    setPdfLoading(false);
                  }
                }}
              >
                {pdfLoading ? "Preparing PDF…" : "Download PDF"}
              </button>
              <a
                href="https://www.linkedin.com/feed/"
                target="_blank"
                className="rounded-lg border border-brand-100 px-3 py-2 text-sm font-semibold"
              >
                Open LinkedIn
              </a>
              <button
                type="button"
                disabled={markPostedLoading || posted}
                onClick={async () => {
                  setMarkPostedLoading(true);
                  try {
                    await api.markJobPosted(job.id);
                    setPosted(true);
                  } catch {
                    /* keep UI; user can retry */
                  } finally {
                    setMarkPostedLoading(false);
                  }
                }}
                className="rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {posted ? "Posted" : markPostedLoading ? "Saving…" : "Mark as Posted"}
              </button>
            </div>
          </div>
          <pre className="whitespace-pre-wrap rounded-xl bg-slate-50 p-4 text-sm text-slate-700">{job.job_description}</pre>
          <p className="mt-3 text-sm text-slate-600">
            Public application page: {" "}
            <a href={job.public_url} className="text-brand-700 underline" target="_blank">
              {job.public_url}
            </a>
          </p>
        </section>
      )}

      {job && <CandidateTable jobId={job.id} />}
    </main>
  );
}
