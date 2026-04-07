type Step = {
  label: string;
  status: "completed" | "active" | "pending";
};

const labels = ["Create", "JD", "Publish", "Apply", "Shortlist", "Done"];

export default function Pipeline3D({ activeStep }: { activeStep: number }) {
  const steps: Step[] = labels.map((label, index) => ({
    label,
    status: index < activeStep ? "completed" : index === activeStep ? "active" : "pending"
  }));

  const n = steps.length;
  const trackPct = n <= 1 ? 0 : Math.min(100, Math.max(0, (activeStep / (n - 1)) * 100));

  return (
    <div className="rounded-2xl border border-app-border bg-app-surface p-6 shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-app-muted">Pipeline</p>
      <div className="mt-2 text-xs text-app-muted">
        Step {Math.min(activeStep + 1, n)} of {n}
      </div>

      <div className="relative mt-8">
        <div className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-app-border" aria-hidden />
        <div
          className="absolute left-0 top-1/2 h-px -translate-y-1/2 bg-app-accent transition-[width] duration-300"
          style={{ width: `${trackPct}%` }}
          aria-hidden
        />

        <div className="relative flex justify-between">
          {steps.map((step) => (
            <div
              key={step.label}
              className={`relative z-[1] h-2.5 w-2.5 shrink-0 rounded-full border-2 ${
                step.status === "completed"
                  ? "border-app-accent bg-app-accent"
                  : step.status === "active"
                    ? "border-app-accent bg-app-surface"
                    : "border-app-border-strong bg-app-surface"
              }`}
            >
              {step.status === "active" && (
                <span className="absolute left-1/2 top-1/2 block h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-app-accent" />
              )}
            </div>
          ))}
        </div>

        <div className="mt-3 flex justify-between gap-0.5">
          {steps.map((step) => (
            <span
              key={step.label}
              className={`w-0 flex-1 text-center text-[10px] text-app-muted md:text-[11px] ${
                step.status === "active" ? "font-semibold text-app-nav-active-text" : ""
              }`}
            >
              {step.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
