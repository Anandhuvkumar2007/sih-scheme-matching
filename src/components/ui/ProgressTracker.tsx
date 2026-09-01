import { Check } from "lucide-react";

export interface ProgressStep {
  /** Stable key. */
  id: string;
  /** Short label, e.g. "Profile". */
  label: string;
  done: boolean;
  current?: boolean;
}

/** Horizontal step tracker used for both the form and the results page. */
export function ProgressTracker({ steps }: { steps: ProgressStep[] }) {
  const doneCount = steps.filter((s) => s.done).length;

  return (
    <div className="w-full">
      <ol className="flex items-center">
        {steps.map((step, i) => {
          const isLast = i === steps.length - 1;
          return (
            <li key={step.id} className={`flex items-center ${isLast ? "" : "flex-1"}`}>
              <div className="flex flex-col items-center gap-1.5">
                <span
                  aria-current={step.current ? "step" : undefined}
                  className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-bold transition ${
                    step.done
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : step.current
                        ? "border-brand-600 bg-white text-brand-700"
                        : "border-slate-300 bg-white text-slate-400"
                  }`}
                >
                  {step.done ? <Check className="h-5 w-5" /> : i + 1}
                </span>
                <span
                  className={`hidden text-[11px] font-semibold sm:block ${
                    step.done || step.current ? "text-slate-700" : "text-slate-400"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {!isLast && (
                <div
                  className={`mx-2 h-0.5 flex-1 rounded ${step.done ? "bg-emerald-500" : "bg-slate-200"}`}
                />
              )}
            </li>
          );
        })}
      </ol>
      <p className="mt-3 text-center text-sm font-medium text-slate-500">
        {doneCount} / {steps.length} {doneCount === steps.length ? "complete" : "completed"}
      </p>
    </div>
  );
}
