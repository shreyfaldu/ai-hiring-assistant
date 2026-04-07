"use client";

import { FormEvent, useState } from "react";
import { api } from "@/lib/api";
import { JobPayload } from "@/types";

const initialState: JobPayload = {
  job_title: "",
  experience: "",
  skills: "",
  location: "",
  salary: "",
  job_type: "",
  job_description: ""
};

export default function JobCreationForm({
  onCreated,
  variant = "light",
  showCard = true
}: {
  onCreated: (payload: {
    id: string;
    title?: string;
    experience?: string | null;
    skills?: string | null;
    location?: string | null;
    salary?: string | null;
    job_type?: string | null;
    job_description: string;
    public_url: string;
  }) => void;
  variant?: "light" | "dark" | "minimal";
  showCard?: boolean;
}) {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onGenerate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const jdRes = await api.processAi({
        task_type: "generate_jd",
        ...form
      });

      const generated = jdRes.data?.text || jdRes.data?.job_description || "";
      const createRes = await api.createJob({
        ...form,
        job_description: generated
      });
      onCreated(createRes.job);
      setForm(initialState);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const isDark = variant === "dark";
  const isMinimal = variant === "minimal";

  const inputMinimal =
    "w-full rounded-md border border-app-border-strong bg-app-surface px-3 py-2 text-sm text-app-text placeholder:text-app-muted focus:border-app-accent focus:outline-none";
  const btnMinimal =
    "w-full rounded-md bg-app-accent py-2.5 text-sm font-medium text-white transition hover:bg-app-accent-hover disabled:opacity-50 md:col-span-2";

  const inputBase =
    "w-full rounded-2xl border px-4 py-3 pl-10 text-sm outline-none transition focus:ring-2 focus:ring-offset-0";
  const inputLight = `${inputBase} border-brand-100 bg-white text-ink placeholder:text-slate-400 focus:border-brand-500 focus:ring-brand-500/25`;
  const inputDark = `${inputBase} border-slate-600/80 bg-slate-900/60 text-white placeholder:text-slate-500 focus:border-[#c4f542]/50 focus:ring-[#c4f542]/20`;
  const inputClass = isDark ? inputDark : inputLight;

  const btnClass = isDark
    ? "w-full rounded-full bg-[#c4f542] py-3.5 text-sm font-bold text-[#14221c] shadow-[0_4px_24px_rgba(196,245,66,0.25)] transition hover:bg-[#d4f85a] disabled:opacity-60 md:col-span-2"
    : "w-full rounded-2xl bg-gradient-to-r from-brand-600 to-emerald-600 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-600/20 transition hover:from-brand-700 hover:to-emerald-700 disabled:opacity-60 md:col-span-2";

  const formBody = isMinimal ? (
    <>
      <form onSubmit={onGenerate} className="grid gap-2.5 md:grid-cols-2 md:gap-3">
        <input
          className={`${inputMinimal} md:col-span-2`}
          placeholder="Job title"
          value={form.job_title}
          onChange={(e) => setForm({ ...form, job_title: e.target.value })}
          required
        />
        <input
          className={inputMinimal}
          placeholder="Experience"
          value={form.experience}
          onChange={(e) => setForm({ ...form, experience: e.target.value })}
          required
        />
        <input
          className={inputMinimal}
          placeholder="Skills (comma-separated)"
          value={form.skills}
          onChange={(e) => setForm({ ...form, skills: e.target.value })}
          required
        />
        <input
          className={inputMinimal}
          placeholder="Location"
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
          required
        />
        <input
          className={inputMinimal}
          placeholder="Salary"
          value={form.salary}
          onChange={(e) => setForm({ ...form, salary: e.target.value })}
          required
        />
        <input
          className={inputMinimal}
          placeholder="Job type"
          value={form.job_type}
          onChange={(e) => setForm({ ...form, job_type: e.target.value })}
          required
        />
        <button disabled={loading} className={btnMinimal} type="submit">
          {loading ? "Working…" : "Generate JD & save"}
        </button>
      </form>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </>
  ) : (
    <>
      <form onSubmit={onGenerate} className="grid gap-3 md:grid-cols-2">
        <div className="relative md:col-span-2">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </span>
          <input
            className={`${inputClass} pl-10`}
            placeholder="Job title"
            value={form.job_title}
            onChange={(e) => setForm({ ...form, job_title: e.target.value })}
            required
          />
        </div>
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </span>
          <input
            className={inputClass}
            placeholder="Experience (e.g. 2+ years)"
            value={form.experience}
            onChange={(e) => setForm({ ...form, experience: e.target.value })}
            required
          />
        </div>
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </span>
          <input
            className={inputClass}
            placeholder="Skills (comma-separated)"
            value={form.skills}
            onChange={(e) => setForm({ ...form, skills: e.target.value })}
            required
          />
        </div>
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </span>
          <input
            className={inputClass}
            placeholder="Location"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            required
          />
        </div>
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </span>
          <input
            className={inputClass}
            placeholder="Salary"
            value={form.salary}
            onChange={(e) => setForm({ ...form, salary: e.target.value })}
            required
          />
        </div>
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          </span>
          <input
            className={inputClass}
            placeholder="Job type (e.g. Full-time)"
            value={form.job_type}
            onChange={(e) => setForm({ ...form, job_type: e.target.value })}
            required
          />
        </div>
        <button disabled={loading} className={btnClass} type="submit">
          {loading ? "Generating & saving…" : "Generate JD + save job"}
        </button>
      </form>
      {error && (
        <p className={`mt-3 text-sm ${isDark ? "text-red-400" : "text-red-600"}`}>{error}</p>
      )}
    </>
  );

  if (!showCard) {
    return formBody;
  }

  return (
    <section
      className={
        isDark
          ? "rounded-3xl border border-white/5 bg-white/5 p-6 backdrop-blur-sm md:p-8"
          : "rounded-xl border border-neutral-200 bg-white p-6 md:p-8"
      }
    >
      <div className="mb-6 flex items-center gap-3">
        <span
          className={`flex h-10 w-10 items-center justify-center rounded-lg ${isDark ? "bg-[#c4f542]/20 text-[#c4f542]" : "bg-neutral-100 text-neutral-700"}`}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </span>
        <div>
          <h2 className={`text-lg font-semibold ${isDark ? "text-white" : "text-neutral-900"}`}>Create job</h2>
          <p className={`text-sm ${isDark ? "text-slate-400" : "text-neutral-500"}`}>AI writes the description from your inputs</p>
        </div>
      </div>
      {formBody}
    </section>
  );
}
