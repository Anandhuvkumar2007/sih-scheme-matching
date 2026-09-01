import type { ReactNode } from "react";

type Tone = "neutral" | "brand" | "emerald" | "amber" | "rose" | "violet";

const TONES: Record<Tone, string> = {
  neutral: "bg-slate-100 text-slate-700",
  brand: "bg-brand-50 text-brand-700 border border-brand-200",
  emerald: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  amber: "bg-amber-50 text-amber-700 border border-amber-200",
  rose: "bg-rose-50 text-rose-700 border border-rose-200",
  violet: "bg-violet-50 text-violet-700 border border-violet-200",
};

/** Small colored pill used for statuses, categories, and tags. */
export function Badge({
  tone = "neutral",
  children,
  className = "",
}: {
  tone?: Tone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${TONES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
