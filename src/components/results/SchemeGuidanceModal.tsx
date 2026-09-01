import { useEffect } from "react";
import {
  X,
  MapPin,
  CheckCircle2,
  FileText,
  ExternalLink,
  ShieldCheck,
  ListOrdered,
  AlertCircle,
  AlertTriangle,
  Info,
  Layers,
} from "lucide-react";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { Ring } from "../ui/Ring";
import { formatINR, formatPercent } from "../../utils/format";
import type { ScoredSchemeResult, RecommendationStrength, SchemeEligibilityStatus } from "../../types";

interface Props {
  result: ScoredSchemeResult | null;
  onClose: () => void;
}

const STRENGTH_CONFIG: Record<
  RecommendationStrength,
  { badge: "emerald" | "brand" | "amber" | "rose"; textColor: string; cardBorder: string; accentBg: string }
> = {
  "Strong Match": {
    badge: "emerald",
    textColor: "text-emerald-700",
    cardBorder: "border-emerald-200",
    accentBg: "bg-emerald-50/60",
  },
  "Good Match": {
    badge: "brand",
    textColor: "text-brand-700",
    cardBorder: "border-brand-200",
    accentBg: "bg-brand-50/60",
  },
  "Potential Match": {
    badge: "amber",
    textColor: "text-amber-700",
    cardBorder: "border-amber-200",
    accentBg: "bg-amber-50/60",
  },
  "Low Match": {
    badge: "rose",
    textColor: "text-slate-600",
    cardBorder: "border-slate-200",
    accentBg: "bg-slate-50/60",
  },
};

const ELIGIBILITY_STATUS_BADGE: Record<
  SchemeEligibilityStatus,
  { label: string; tone: "emerald" | "brand" | "amber" | "rose" }
> = {
  "Eligible Based on Provided Information": {
    label: "Eligible Based on Provided Info",
    tone: "emerald",
  },
  "Potential Match": {
    label: "Potential Match",
    tone: "brand",
  },
  "Needs Verification": {
    label: "Needs Verification",
    tone: "amber",
  },
  "Not a Match": {
    label: "Not a Match",
    tone: "rose",
  },
};

export function SchemeGuidanceModal({ result, onClose }: Props) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!result) return null;

  const {
    scheme,
    score,
    strength,
    eligibilityStatus,
    positiveReasons,
    verificationItems,
    needsVerification,
    explanation,
  } = result;

  const strengthConfig = STRENGTH_CONFIG[strength];
  const statusConfig = ELIGIBILITY_STATUS_BADGE[eligibilityStatus];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white shadow-2xl border border-slate-200 animate-fade-up">
        {/* Modal Header */}
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-100 bg-white/95 px-6 py-5 backdrop-blur-md sm:px-8">
          <div className="space-y-1 pr-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={(scheme.badgeColor || "brand") as "brand" | "emerald" | "amber" | "violet"}>
                {scheme.category}
              </Badge>
              {scheme.financialAssistanceType && (
                <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                  {scheme.financialAssistanceType}
                </span>
              )}
              {scheme.isVerified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                  <ShieldCheck className="h-3 w-3 text-emerald-600" /> Verified Govt Scheme
                </span>
              )}
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 sm:text-2xl">
              {scheme.name}
            </h3>
            <p className="text-xs font-medium text-slate-500">
              {scheme.agency} {scheme.ministry ? `• ${scheme.ministry}` : ""}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="space-y-6 p-6 sm:p-8">
          {/* 1. Personalized Match Explanation Bar */}
          <div className={`rounded-2xl border p-5 ${strengthConfig.accentBg} ${strengthConfig.cardBorder}`}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      statusConfig.tone === "emerald"
                        ? "bg-emerald-100 text-emerald-800"
                        : statusConfig.tone === "brand"
                        ? "bg-brand-100 text-brand-800"
                        : statusConfig.tone === "amber"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-rose-100 text-rose-800"
                    }`}
                  >
                    {statusConfig.label}
                  </span>
                  <span className={`text-xs font-extrabold ${strengthConfig.textColor}`}>
                    {strength} ({score}%)
                  </span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed pt-1">
                  {explanation}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <Ring value={score} color="#2b4ae3" size={54} stroke={4} />
              </div>
            </div>

            {/* Personalized Criteria Checklist */}
            <div className="mt-4 grid gap-4 pt-3 border-t border-slate-200/60 md:grid-cols-2">
              {/* Positive Factors */}
              <div>
                <p className="text-xs font-bold text-emerald-950 flex items-center gap-1.5 mb-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Why this scheme matches:
                </p>
                <ul className="space-y-1.5 text-xs text-emerald-900">
                  {positiveReasons.map((reason, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="font-bold text-emerald-600">✓</span>
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Things to Verify */}
              <div>
                <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5 mb-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600" /> Things to verify:
                </p>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {needsVerification.map((warn, idx) => (
                    <li key={`warn-${idx}`} className="flex items-start gap-1.5 font-medium text-amber-800">
                      <span className="text-amber-600 font-bold">⚠</span>
                      <span>{warn}</span>
                    </li>
                  ))}
                  {verificationItems.slice(0, 3).map((item, idx) => (
                    <li key={`item-${idx}`} className="flex items-start gap-1.5">
                      <span className="text-slate-400 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* 2. Scheme Description & Overview */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <Info className="h-4 w-4 text-brand-600" /> Scheme Overview
            </h4>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              {scheme.description}
            </p>
          </div>

          {/* 3. Financial Assistance & Key Parameters */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Financial Scope & Concessional Terms
            </h4>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-xl bg-white p-3 border border-slate-200/80 text-center">
                <p className="text-[11px] font-bold text-slate-400 uppercase">Max Assistance</p>
                <p className="mt-1 text-base font-extrabold text-brand-700">
                  {formatINR(scheme.maxAssistance)}
                </p>
              </div>

              <div className="rounded-xl bg-white p-3 border border-slate-200/80 text-center">
                <p className="text-[11px] font-bold text-slate-400 uppercase">Interest Rate</p>
                <p className="mt-1 text-base font-extrabold text-slate-900">
                  {scheme.interestRate === 0 ? "0% (Grant)" : `${formatPercent(scheme.interestRate)} p.a.`}
                </p>
              </div>

              <div className="rounded-xl bg-white p-3 border border-slate-200/80 text-center">
                <p className="text-[11px] font-bold text-slate-400 uppercase">Moratorium</p>
                <p className="mt-1 text-base font-extrabold text-slate-900">
                  {scheme.moratoriumMonths} Months
                </p>
              </div>

              <div className="rounded-xl bg-white p-3 border border-slate-200/80 text-center">
                <p className="text-[11px] font-bold text-slate-400 uppercase">Max Tenure</p>
                <p className="mt-1 text-base font-extrabold text-slate-900">
                  {scheme.maxTenureMonths} Months
                </p>
              </div>
            </div>
          </div>

          {/* 4. Target Beneficiaries & Geographic Applicability */}
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5 mb-2">
                <Layers className="h-4 w-4 text-brand-600" /> Target Beneficiaries
              </h5>
              <div className="flex flex-wrap gap-1.5">
                {scheme.targetBeneficiaries.map((b, i) => (
                  <span key={i} className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                    {b}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5 mb-2">
                <MapPin className="h-4 w-4 text-emerald-600" /> State Applicability
              </h5>
              <div className="flex flex-wrap gap-1.5">
                {scheme.eligibleStates.map((st, i) => (
                  <span key={i} className="rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 text-xs font-medium">
                    {st}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* 5. Key Highlights & Required Documents */}
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h5 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Key Scheme Benefits
              </h5>
              <ul className="mt-3 space-y-2 text-xs text-slate-600">
                {scheme.keyBenefits.map((benefit, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h5 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <FileText className="h-4 w-4 text-brand-600" />
                Required Application Documents
              </h5>
              <ul className="mt-3 space-y-2 text-xs text-slate-600">
                {scheme.requiredDocuments.map((doc, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                    <span>{doc}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 6. How to Apply (Step-by-Step Guidance) */}
          <div className="rounded-2xl border border-brand-100 bg-brand-50/40 p-5">
            <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <ListOrdered className="h-4 w-4 text-brand-600" />
              How to Apply (Application Guidance)
            </h4>
            {scheme.applicationProcess && scheme.applicationProcess.length > 0 ? (
              <ol className="mt-3 space-y-2.5">
                {scheme.applicationProcess.map((step, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs text-slate-700">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-600 text-[11px] font-bold text-white shadow-sm">
                      {i + 1}
                    </span>
                    <span className="mt-0.5">{step}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-2 text-xs text-slate-600">
                Submit application through the nominated State Channelizing Agency (SCA) or participating commercial bank branch with required identity and project documents.
              </p>
            )}
          </div>

          {/* 7. Official Application Portal Action */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Official Government Application Portal
                </h5>
                <p className="mt-0.5 text-xs text-slate-500">
                  {scheme.officialUrl
                    ? scheme.sourceInfo || "Verified Official Government Guidelines Portal"
                    : "Official application link unavailable — please verify through the relevant government department/portal."}
                </p>
              </div>

              <div>
                {scheme.officialUrl ? (
                  <a
                    href={scheme.officialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-xs font-bold text-white shadow-md hover:bg-brand-700 transition"
                  >
                    <span>Apply on Official Portal</span>
                    <ExternalLink className="h-4 w-4" />
                  </a>
                ) : (
                  <span className="inline-block rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-500">
                    Official link unavailable
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 8. Mandatory Official Disclaimer */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-500 leading-relaxed">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
              <p>
                <strong>Notice:</strong> SchemeSaathi provides an indicative recommendation based on the information provided. Final eligibility, approval and financial sanction are determined by the relevant government department or lending institution. Please verify the latest requirements on the official portal before applying.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="sticky bottom-0 z-10 flex items-center justify-end border-t border-slate-100 bg-slate-50/95 px-6 py-4 backdrop-blur-md sm:px-8">
          <Button variant="ghost" onClick={onClose} className="text-xs sm:text-sm">
            Close Details
          </Button>
        </div>
      </div>
    </div>
  );
}
