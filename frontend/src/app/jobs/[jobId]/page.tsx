"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { downloadJobDescriptionPdf } from "@/lib/download-jd-pdf";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export default function PublicJobPage() {
  const params = useParams<{ jobId: string }>();
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [pdfLoading, setPdfLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/jobs/${params.jobId}`)
      .then((res) => res.json())
      .then((data) => {
        setJobTitle(data.job?.title || "");
        setJobDescription(data.job?.job_description || "");
      })
      .catch(() => setJobDescription("Unable to load job details right now."));
  }, [params.jobId]);

  const onApply = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const res = await fetch(`${API_URL}/jobs/${params.jobId}/apply`, {
      method: "POST",
      body: formData
    });

    if (res.ok) {
      setMessage("Application submitted successfully.");
      (e.target as HTMLFormElement).reset();
      return;
    }

    const err = await res.json().catch(() => ({ message: "Submission failed" }));
    setMessage(err.message);
  };

  return (
    <main className="mx-auto grid min-h-screen w-full max-w-6xl gap-6 px-4 py-10 md:grid-cols-2">
      <section className="card p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <h1 className="font-display text-2xl">Job Description</h1>
          <button
            type="button"
            disabled={pdfLoading || !jobDescription}
            className="shrink-0 rounded-lg border border-brand-100 px-3 py-2 text-sm font-semibold disabled:opacity-50"
            onClick={async () => {
              setPdfLoading(true);
              try {
                await downloadJobDescriptionPdf(jobTitle || "Job Description", jobDescription);
              } finally {
                setPdfLoading(false);
              }
            }}
          >
            {pdfLoading ? "Preparing PDF…" : "Download PDF"}
          </button>
        </div>
        <pre className="mt-4 whitespace-pre-wrap text-sm text-slate-700">{jobDescription}</pre>
      </section>
      <section className="card p-6">
        <h2 className="font-display text-2xl">Apply Now</h2>
        <form onSubmit={onApply} className="mt-4 space-y-3">
          <input className="w-full rounded-xl border border-brand-100 px-3 py-2 text-sm" name="name" placeholder="Name" required />
          <input className="w-full rounded-xl border border-brand-100 px-3 py-2 text-sm" name="email" type="email" placeholder="Email" required />
          <input className="w-full rounded-xl border border-brand-100 px-3 py-2 text-sm" name="phone" placeholder="Phone" required />
          <input className="w-full rounded-xl border border-brand-100 px-3 py-2 text-sm" name="resume" type="file" accept=".pdf,.doc,.docx,.txt" required />
          <button className="w-full rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white" type="submit">
            Submit Application
          </button>
        </form>
        {message && <p className="mt-3 text-sm text-slate-600">{message}</p>}
      </section>
    </main>
  );
}
