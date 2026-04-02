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
  onCreated
}: {
  onCreated: (payload: { id: string; job_description: string; public_url: string }) => void;
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

  return (
    <section className="card p-6">
      <h2 className="font-display text-xl text-ink">Create Job</h2>
      <form onSubmit={onGenerate} className="mt-4 grid gap-3 md:grid-cols-2">
        <input className="rounded-xl border border-brand-100 px-3 py-2 text-sm" placeholder="Job Title" value={form.job_title} onChange={(e) => setForm({ ...form, job_title: e.target.value })} required />
        <input className="rounded-xl border border-brand-100 px-3 py-2 text-sm" placeholder="Experience" value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} required />
        <input className="rounded-xl border border-brand-100 px-3 py-2 text-sm" placeholder="Skills (comma-separated)" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} required />
        <input className="rounded-xl border border-brand-100 px-3 py-2 text-sm" placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required />
        <input className="rounded-xl border border-brand-100 px-3 py-2 text-sm" placeholder="Salary" value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} required />
        <input className="rounded-xl border border-brand-100 px-3 py-2 text-sm" placeholder="Job Type" value={form.job_type} onChange={(e) => setForm({ ...form, job_type: e.target.value })} required />
        <button disabled={loading} className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60 md:col-span-2" type="submit">
          {loading ? "Generating and saving..." : "Generate JD + Save Job"}
        </button>
      </form>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </section>
  );
}
