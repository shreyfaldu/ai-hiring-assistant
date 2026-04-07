export type JobForLinkedInPost = {
  title?: string;
  experience?: string | null;
  skills?: string | null;
  location?: string | null;
  salary?: string | null;
  job_type?: string | null;
  /** Not included in the short LinkedIn teaser; kept for callers that pass full job objects. */
  job_description?: string;
  public_url: string;
};

export type BuildLinkedInPostOptions = {
  /** Canonical apply page URL (e.g. http://localhost:3000/jobs/{id}). Overrides job.public_url. */
  applyUrl?: string;
};

/**
 * URL candidates use to open the job page (JD + apply form).
 * Prefer NEXT_PUBLIC_APP_URL, else current browser origin + /jobs/:id, else stored DB value.
 */
export function getApplyPageUrl(jobId: string, storedPublicUrl: string): string {
  const env =
    typeof process !== "undefined" && process.env.NEXT_PUBLIC_APP_URL
      ? process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "")
      : "";
  if (env) return `${env}/jobs/${jobId}`;
  if (typeof window !== "undefined") return `${window.location.origin}/jobs/${jobId}`;
  return storedPublicUrl;
}

/**
 * Short LinkedIn teaser: role, experience, tech — no full JD.
 * Candidates use the apply page for the full JD, form, and resume upload.
 */
export function buildLinkedInPostText(job: JobForLinkedInPost, options?: BuildLinkedInPostOptions): string {
  const applyUrl = (options?.applyUrl ?? job.public_url).trim();
  const title = (job.title || "Open role").trim();
  const lines: string[] = ["We're hiring!", "", `Role: ${title}`];

  const exp = job.experience?.toString().trim();
  if (exp) lines.push(`Experience: ${exp}`);

  const sk = job.skills?.toString().trim();
  if (sk) lines.push(`Tech: ${sk}`);

  const loc = job.location?.toString().trim();
  if (loc) lines.push(`Location: ${loc}`);

  const jt = job.job_type?.toString().trim();
  if (jt) lines.push(`Type: ${jt}`);

  lines.push(
    "",
    "Apply here (full JD, form & resume):",
    applyUrl,
    "",
    "#hiring #jobs #careers"
  );

  return lines.join("\n");
}

export function linkedInShareOffsiteUrl(applyPageUrl: string): string {
  return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(applyPageUrl)}`;
}
