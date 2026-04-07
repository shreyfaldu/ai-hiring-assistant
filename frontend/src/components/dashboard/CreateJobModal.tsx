"use client";

import { useEffect } from "react";
import JobCreationForm from "@/components/JobCreationForm";

export type CreatedJobPayload = {
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

export default function CreateJobModal({
  open,
  onClose,
  onCreated
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (job: CreatedJobPayload) => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-app-overlay" aria-label="Close" onClick={onClose} />
      <div
        className="relative z-10 max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg border border-app-border bg-app-surface p-6 shadow-sm"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-job-title"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <h2 id="create-job-title" className="text-base font-medium text-app-text">
            New job
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-app-muted hover:text-app-text"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <JobCreationForm
          variant="minimal"
          showCard={false}
          onCreated={(job) => {
            onCreated(job);
            onClose();
          }}
        />
      </div>
    </div>
  );
}
