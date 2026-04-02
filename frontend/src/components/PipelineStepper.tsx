type Step = {
  label: string;
  status: "completed" | "active" | "pending";
};

const labels = [
  "Create Job",
  "JD Review",
  "Publish Job",
  "Applications",
  "Shortlist Candidates",
  "Finalize"
];

export default function PipelineStepper({ activeStep }: { activeStep: number }) {
  const steps: Step[] = labels.map((label, index) => ({
    label,
    status: index < activeStep ? "completed" : index === activeStep ? "active" : "pending"
  }));

  const completed = steps.filter((step) => step.status === "completed").length;
  const progress = Math.round((completed / steps.length) * 100);

  return (
    <section className="card p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-xl">Hiring Pipeline</h2>
        <span className="rounded-full bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-700">{progress}% complete</span>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {steps.map((step, index) => (
          <div
            key={step.label}
            className={`rounded-xl border p-4 ${
              step.status === "completed"
                ? "border-brand-500 bg-brand-50"
                : step.status === "active"
                  ? "border-ink bg-white"
                  : "border-slate-200 bg-slate-50"
            }`}
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Step {index + 1}</p>
            <p className="mt-1 text-sm font-semibold text-ink">{step.label}</p>
            <p className="mt-2 text-xs text-slate-600">
              {step.status === "completed" ? "Completed" : step.status === "active" ? "In progress" : "Pending"}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
