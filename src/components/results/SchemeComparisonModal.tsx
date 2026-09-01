import { useEffect } from "react";
import {
  X,
  Scale,
  MapPin,
  FileText,
  ExternalLink,
  ShieldCheck,
  ArrowRight,
  Trash2,
} from "lucide-react";
import { Badge } from "../ui/Badge";
import { Ring } from "../ui/Ring";
import { formatINR, formatPercent } from "../../utils/format";
import type { ScoredSchemeResult, RecommendationStrength } from "../../types";

interface Props {
  selectedResults: ScoredSchemeResult[];
  onClose: () => void;
  onRemove: (schemeId: string) => void;
  onOpenGuidance: (result: ScoredSchemeResult) => void;
}

const STRENGTH_BADGE: Record<
  RecommendationStrength,
  { tone: "emerald" | "brand" | "amber" | "rose" }
> = {
  "Strong Match": { tone: "emerald" },
  "Good Match": { tone: "brand" },
  "Potential Match": { tone: "amber" },
  "Low Match": { tone: "rose" },
};

export function SchemeComparisonModal({
  selectedResults,
  onClose,
  onRemove,
  onOpenGuidance,
}: Props) {
  // Bind Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!selectedResults || selectedResults.length === 0) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="comparison-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-fade-in"
    >
      <div className="relative flex max-h-[92vh] w-full max-w-6xl flex-col rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-sm">
              <Scale className="h-5 w-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="comparison-title" className="text-lg sm:text-xl font-extrabold text-slate-900">
                  Compare Welfare Credit Schemes
                </h3>
                <span className="rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-bold text-brand-800">
                  {selectedResults.length} / 3 Selected
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Side-by-side comparison of match scores, credit caps, subsidies, interest rates, and application requirements.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close comparison"
            className="rounded-full p-2 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Comparison Grid Table */}
        <div className="overflow-x-auto overflow-y-auto p-5 sm:p-6">
          <div
            className="grid min-w-[720px] gap-4"
            style={{
              gridTemplateColumns: `repeat(${selectedResults.length}, minmax(280px, 1fr))`,
            }}
          >
            {selectedResults.map((result) => {
              const { scheme, score, strength, eligibilityStatus } = result;
              const isDisqualified = eligibilityStatus === "Not a Match";

              return (
                <div
                  key={scheme.id}
                  className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-brand-300 transition"
                >
                  {/* Card Top / Remove Action */}
                  <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex flex-wrap gap-1.5">
                      <Badge tone={STRENGTH_BADGE[strength].tone}>
                        {strength} ({score}%)
                      </Badge>
                      {scheme.isVerified && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                          <ShieldCheck className="h-3 w-3 text-emerald-600" /> Verified
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemove(scheme.id)}
                      title="Remove from comparison"
                      aria-label={`Remove ${scheme.name} from comparison`}
                      className="rounded-lg p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Title & Ministry */}
                  <div className="mt-3">
                    <h4 className="text-base font-extrabold text-slate-900 line-clamp-2">
                      {scheme.name}
                    </h4>
                    <p className="mt-0.5 text-[11px] font-medium text-slate-500 line-clamp-1">
                      {scheme.ministry || scheme.agency || "Information not available"}
                    </p>
                  </div>

                  {/* Visual Match Score Ring */}
                  <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 p-3">
                    <div>
                      <p className="text-[10px] font-bold uppercase text-slate-400">Match Compatibility</p>
                      <p className="text-xs font-bold text-slate-800">{eligibilityStatus}</p>
                    </div>
                    <Ring value={score} color={isDisqualified ? "#94a3b8" : "#2b4ae3"} size={42} stroke={3.5} />
                  </div>

                  {/* Key Financial Terms Box */}
                  <div className="mt-4 space-y-2.5 rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Max Assistance:</span>
                      <strong className="text-brand-700 font-extrabold">
                        {formatINR(scheme.maxAssistance)}
                      </strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Interest Rate:</span>
                      <strong className="text-slate-900">
                        {scheme.interestRate === 0
                          ? "0% (Govt Grant)"
                          : `${formatPercent(scheme.interestRate)} p.a.`}
                      </strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Subsidy / Rebate:</span>
                      <strong className={scheme.subsidyPct ? "text-emerald-700 font-bold" : "text-slate-600"}>
                        {scheme.subsidyPct ? `Up to ${scheme.subsidyPct}%` : "No direct capital subsidy"}
                      </strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Moratorium:</span>
                      <strong className="text-slate-900">{scheme.moratoriumMonths} Months</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Max Repayment:</span>
                      <strong className="text-slate-900">{scheme.maxTenureMonths} Months</strong>
                    </div>
                  </div>

                  {/* Comparison Dimension Rows */}
                  <div className="mt-4 flex-1 space-y-4 text-xs">
                    {/* Target Beneficiaries */}
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Target Beneficiaries
                      </p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {scheme.targetBeneficiaries && scheme.targetBeneficiaries.length > 0 ? (
                          scheme.targetBeneficiaries.map((b, i) => (
                            <span
                              key={i}
                              className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] text-slate-700 font-medium"
                            >
                              {b}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Information not available</span>
                        )}
                      </div>
                    </div>

                    {/* Geographic Jurisdiction */}
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        State Applicability
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-700 font-semibold flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-brand-500" />
                        {scheme.eligibleStates && scheme.eligibleStates.length > 0
                          ? scheme.eligibleStates.includes("All States & UTs")
                            ? "All States & UTs (Pan-India)"
                            : scheme.eligibleStates.join(", ")
                          : "All States & UTs"}
                      </p>
                    </div>

                    {/* Priority Enterprise Sectors */}
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Eligible Sectors
                      </p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {scheme.eligibleBusinessTypes && scheme.eligibleBusinessTypes.length > 0 ? (
                          scheme.eligibleBusinessTypes.slice(0, 3).map((bt, i) => (
                            <span
                              key={i}
                              className="rounded-md bg-brand-50 border border-brand-100 px-2 py-0.5 text-[11px] text-brand-800 font-medium"
                            >
                              {bt}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Information not available</span>
                        )}
                      </div>
                    </div>

                    {/* Key Benefits Highlights */}
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Key Highlights
                      </p>
                      <ul className="mt-1 space-y-1 text-[11px] text-slate-600">
                        {scheme.keyBenefits && scheme.keyBenefits.length > 0 ? (
                          scheme.keyBenefits.slice(0, 3).map((benefit, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                              <span className="line-clamp-2">{benefit}</span>
                            </li>
                          ))
                        ) : (
                          <li className="text-slate-400 italic">Information not available</li>
                        )}
                      </ul>
                    </div>

                    {/* Required Documents */}
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Required Documents ({scheme.requiredDocuments?.length || 0})
                      </p>
                      <ul className="mt-1 space-y-1 text-[11px] text-slate-600">
                        {scheme.requiredDocuments && scheme.requiredDocuments.length > 0 ? (
                          scheme.requiredDocuments.slice(0, 3).map((doc, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <FileText className="mt-0.5 h-3 w-3 text-brand-500 shrink-0" />
                              <span className="line-clamp-1">{doc}</span>
                            </li>
                          ))
                        ) : (
                          <li className="text-slate-400 italic">Information not available</li>
                        )}
                      </ul>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="mt-5 space-y-2 border-t border-slate-100 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenGuidance(result);
                      }}
                      className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-brand-700 transition"
                    >
                      <span>View Full Guidance</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>

                    {scheme.officialUrl ? (
                      <a
                        href={scheme.officialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full inline-flex items-center justify-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                      >
                        <span>Official Portal</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <span className="block text-center text-[10px] text-slate-400">
                        Official link unavailable
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/80 px-6 py-3.5">
          <p className="text-xs text-slate-500">
            Click <strong>"View Full Guidance"</strong> on any scheme to see step-by-step application instructions and complete checklists.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-300 bg-white px-4 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
