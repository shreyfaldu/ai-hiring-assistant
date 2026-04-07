"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import CandidateTable from "@/components/CandidateTable";
import CreateJobModal from "@/components/dashboard/CreateJobModal";
import DashboardInsights from "@/components/dashboard/DashboardInsights";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardTopBar from "@/components/dashboard/DashboardTopBar";
import Pipeline3D from "@/components/dashboard/Pipeline3D";
import { downloadJobDescriptionPdf } from "@/lib/download-jd-pdf";
import { api, type MeResponse } from "@/lib/api";
import { buildLinkedInPostText, getApplyPageUrl, linkedInShareOffsiteUrl } from "@/lib/linkedin-post";

const PIPELINE_STEPS = 6;

type CreatedJob = {
  id: string;
  title?: string;
  experience?: string | null;
  skills?: string | null;
  location?: string | null;
  salary?: string | null;
  job_type?: string | null;
  job_description: string;
  public_url: string;
  active_pipeline_index?: number;
};

function lastCreatedLabel(iso: string | null) {
  if (!iso) return "Start your first role";
  try {
    const d = new Date(iso);
    const diff = Math.floor((Date.now() - d.getTime()) / 86400000);
    if (diff <= 0) return "Latest role: today";
    if (diff === 1) return "Latest role: yesterday";
    return `Latest role: ${diff} days ago`;
  } catch {
    return "—";
  }
}

const btnSecondary =
  "rounded-lg border border-app-border-strong bg-app-surface px-3 py-2 text-xs font-medium text-app-text transition hover:bg-app-hover-strong disabled:opacity-50";
const btnPrimarySm =
  "rounded-lg bg-app-accent px-3 py-2 text-xs font-medium text-white transition hover:bg-app-accent-hover disabled:opacity-50";
const btnPrimaryMd =
  "rounded-lg bg-app-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-app-accent-hover";

function jobFromResume(j: {
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
}): CreatedJob {
  return {
    id: j.id,
    title: j.title,
    experience: j.experience,
    skills: j.skills,
    location: j.location,
    salary: j.salary,
    job_type: j.job_type,
    job_description: j.job_description,
    public_url: j.public_url,
    active_pipeline_index:
      typeof j.active_pipeline_index === "number" ? j.active_pipeline_index : undefined
  };
}

function DashboardInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobIdParam = searchParams.get("jobId");

  const [job, setJob] = useState<CreatedJob | null>(null);
  const [posted, setPosted] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [resumeLoading, setResumeLoading] = useState(false);
  const [markPostedLoading, setMarkPostedLoading] = useState(false);
  const [linkedInBusy, setLinkedInBusy] = useState(false);
  const [publishHint, setPublishHint] = useState<string | null>(null);
  const [createJobOpen, setCreateJobOpen] = useState(false);
  const [me, setMe] = useState<MeResponse | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [appCount, setAppCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    api
      .me()
      .then((res) => {
        if (!cancelled) setMe(res);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [job?.id]);

  useEffect(() => {
    if (!jobIdParam) {
      setJob(null);
      setPosted(false);
      setResumeLoading(false);
      return;
    }

    let cancelled = false;
    setResumeLoading(true);
    (async () => {
      try {
        const { job: j } = await api.getJobResume(jobIdParam);
        if (cancelled) return;
        setJob(jobFromResume(j));
        setPosted(Boolean(j.posted));
        api.me().then(setMe).catch(() => {});
      } catch {
        if (!cancelled) {
          setJob(null);
          setPosted(false);
          router.replace("/dashboard");
        }
      } finally {
        if (!cancelled) setResumeLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [jobIdParam, router]);

  useEffect(() => {
    if (!job?.id) {
      setAppCount(0);
      return;
    }
    api
      .getCandidates(job.id)
      .then((r) => setAppCount(r.candidates.length))
      .catch(() => setAppCount(0));
  }, [job?.id]);

  const activeStep = useMemo(() => {
    if (!job) return 0;
    if (typeof job.active_pipeline_index === "number") {
      return Math.min(PIPELINE_STEPS - 1, Math.max(0, job.active_pipeline_index));
    }
    if (!posted) return 2;
    return 3;
  }, [job, posted]);

  const applyPageUrl = useMemo(
    () => (job ? getApplyPageUrl(job.id, job.public_url) : ""),
    [job]
  );

  const jobsTotal = me?.jobs_stats.total ?? 0;
  const recentJobs = me?.recent_jobs ?? [];

  return (
    <div className="flex min-h-screen bg-app-page">
      <DashboardSidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-app-border bg-app-surface px-4 py-3 md:hidden">
          <span className="text-sm font-semibold text-app-text">Hiring</span>
          <button type="button" onClick={() => setCreateJobOpen(true)} className={`${btnPrimarySm} px-3 py-1.5`}>
            New job
          </button>
        </div>

        <DashboardTopBar
          user={me?.user ?? null}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onCreateJob={() => setCreateJobOpen(true)}
        />

        <CreateJobModal
          open={createJobOpen}
          onClose={() => setCreateJobOpen(false)}
          onCreated={(created) => {
            setPosted(false);
            setJob({
              id: created.id,
              title: created.title,
              experience: created.experience,
              skills: created.skills,
              location: created.location,
              salary: created.salary,
              job_type: created.job_type,
              job_description: created.job_description,
              public_url: created.public_url,
              active_pipeline_index: 2
            });
            router.replace(`/dashboard?jobId=${created.id}`);
            api.me().then(setMe).catch(() => {});
          }}
        />

        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          {resumeLoading && <p className="text-sm text-app-muted">Loading job…</p>}

          <DashboardInsights
            jobsTotal={jobsTotal}
            lastCreatedLabel={lastCreatedLabel(me?.jobs_stats.last_created_at ?? null)}
            recentJobs={recentJobs}
            searchQuery={searchQuery}
            pipelineStepIndex={activeStep}
            pipelineStepCount={PIPELINE_STEPS}
            applicationCount={appCount}
            currentJobTitle={job?.title ?? null}
            posted={posted}
            selectedJobId={jobIdParam}
          />

          <div id="workspace" className="mt-8 scroll-mt-24 space-y-6">
            <Pipeline3D activeStep={activeStep} />

            {!job && !resumeLoading && (
              <div className="rounded-2xl border border-app-border bg-app-surface p-6 shadow-sm">
                <p className="text-sm font-medium text-app-text">No active job</p>
                <p className="mt-1 text-sm text-app-muted">Create a role or pick one from Recent roles above.</p>
                <button type="button" onClick={() => setCreateJobOpen(true)} className={`${btnPrimaryMd} mt-4`}>
                  New job
                </button>
              </div>
            )}

            {job && (
              <>
                <section id="publish" className="scroll-mt-24 space-y-4 rounded-2xl border border-app-border bg-app-surface p-6 shadow-sm">
                  <div>
                    <h2 className="text-sm font-semibold text-app-text">Publish & share</h2>
                    <p className="mt-1 text-sm text-app-muted">
                      Copy a short post with your apply link, or mark the role as posted when it&apos;s live.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={linkedInBusy}
                        className={`${btnPrimarySm} disabled:opacity-50`}
                        onClick={async () => {
                          setPublishHint(null);
                          setLinkedInBusy(true);
                          try {
                            const text = buildLinkedInPostText(job, { applyUrl: applyPageUrl });
                            await navigator.clipboard.writeText(text);
                            window.open(linkedInShareOffsiteUrl(applyPageUrl), "_blank", "noopener,noreferrer");
                            setPublishHint("Copied. Paste into LinkedIn — your apply URL is in the text.");
                          } catch {
                            setPublishHint("Could not copy. Allow clipboard access for this site.");
                          } finally {
                            setLinkedInBusy(false);
                          }
                        }}
                      >
                        {linkedInBusy ? "…" : "LinkedIn"}
                      </button>
                      <button
                        type="button"
                        className={btnSecondary}
                        onClick={() =>
                          navigator.clipboard.writeText(buildLinkedInPostText(job, { applyUrl: applyPageUrl }))
                        }
                      >
                        Copy post
                      </button>
                      <button type="button" className={btnSecondary} onClick={() => navigator.clipboard.writeText(job.job_description)}>
                        Copy JD
                      </button>
                      <button
                        type="button"
                        disabled={pdfLoading}
                        className={btnSecondary}
                        onClick={async () => {
                          setPdfLoading(true);
                          try {
                            await downloadJobDescriptionPdf(job.title || "Job Description", job.job_description);
                          } finally {
                            setPdfLoading(false);
                          }
                        }}
                      >
                        {pdfLoading ? "…" : "PDF"}
                      </button>
                      <a
                        href={linkedInShareOffsiteUrl(applyPageUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${btnSecondary} inline-flex items-center no-underline`}
                      >
                        Share link
                      </a>
                      <button
                        type="button"
                        disabled={markPostedLoading || posted}
                        className={btnSecondary}
                        onClick={async () => {
                          setMarkPostedLoading(true);
                          try {
                            await api.markJobPosted(job.id);
                            const { job: refreshed } = await api.getJobResume(job.id);
                            setJob(jobFromResume(refreshed));
                            setPosted(Boolean(refreshed.posted));
                            api.me().then(setMe).catch(() => {});
                          } finally {
                            setMarkPostedLoading(false);
                          }
                        }}
                      >
                        {posted ? "Posted" : markPostedLoading ? "…" : "Mark posted"}
                      </button>
                    </div>
                    {publishHint && <p className="text-xs text-app-muted">{publishHint}</p>}
                  </div>

                  <details className="text-sm">
                    <summary className="cursor-pointer text-app-nav-active-text hover:underline">Preview post</summary>
                    <p className="mt-2 text-xs text-app-muted">{applyPageUrl}</p>
                    <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap rounded-lg bg-app-surface-2 p-3 text-xs text-app-subtle">
                      {buildLinkedInPostText(job, { applyUrl: applyPageUrl })}
                    </pre>
                  </details>

                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-app-muted">Job description</h3>
                    <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap rounded-lg bg-app-surface-2 p-4 text-sm text-app-text">
                      {job.job_description}
                    </pre>
                    <p className="mt-3 text-xs text-app-muted">
                      Apply:{" "}
                      <a
                        href={applyPageUrl}
                        className="text-app-nav-active-text underline underline-offset-2"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {applyPageUrl}
                      </a>
                    </p>
                  </div>
                </section>

                <div id="candidates" className="scroll-mt-24 overflow-hidden rounded-2xl border border-app-border bg-app-surface shadow-sm">
                  <CandidateTable jobId={job.id} embedded variant="dashboard" />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-app-page text-sm text-app-muted">Loading…</div>
      }
    >
      <DashboardInner />
    </Suspense>
  );
}
