"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import CandidateTable from "@/components/CandidateTable";
import JobCreationForm from "@/components/JobCreationForm";
import PipelineStepper from "@/components/PipelineStepper";
import { downloadJobDescriptionPdf } from "@/lib/download-jd-pdf";

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

      <JobCreationForm onCreated={setJob} />

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
                onClick={() => setPosted(true)}
                className="rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white"
              >
                Mark as Posted
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
