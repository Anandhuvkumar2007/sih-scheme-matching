import { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  Info,
  ChevronDown,
  FileText,
  IndianRupee,
  Percent,
  Clock,
  CalendarDays,
} from "lucide-react";
import { useI18n } from "../../i18n";
import { Ring } from "../ui/Ring";
import { Badge } from "../ui/Badge";
import { formatINR, formatPercent, formatNumber } from "../../utils/format";
import type { ScoredScheme } from "../../services/recommendationEngine";

export function SchemeResultCard({ result }: { result: ScoredScheme }) {
  const { t } = useI18n();
  const { scheme, score, eligibility, reasons, missingRequirements, fullyEligible } = result;
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="card overflow-hidden">
      <div className="grid gap-6 p-6 sm:grid-cols-[auto_1fr]">
        <div className="flex flex-col items-center gap-3">
          <Ring value={score} color={scheme.accent} />
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {t("matchScore")}
          </p>
          <Badge tone="brand">{scheme.category}</Badge>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-brand-600">
            {t("bestMatch")}
          </p>
          <h2 className="mt-1 text-2xl font-extrabold text-slate-900">{scheme.name}</h2>
          <p className="mt-2 text-slate-600">{scheme.description}</p>

          {!fullyEligible && (
            <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              <Info className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                <strong>{t("missingReq")}.</strong> {t("missingReqNote")}{" "}
                {missingRequirements.join(" · ")}
              </span>
            </div>
          )}

          {/* Why you qualify */}
          <div className="mt-4">
            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" /> {t("whyQualify")}
            </h3>
            <ul className="mt-2 space-y-1.5">
              {eligibility
                .filter((r) => r.met)
                .map((r) => (
                  <li key={r.key} className="flex items-start gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    {r.label}
                  </li>
                ))}
              {eligibility
                .filter((r) => !r.met && !r.required)
                .map((r) => (
                  <li key={r.key} className="flex items-start gap-2 text-sm text-slate-400">
                    <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-slate-300" />
                    {r.label} <span className="text-xs">(optional)</span>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Full explanation toggle */}
      <button
        onClick={() => setExpanded((e) => !e)}
        className="flex w-full items-center justify-between border-t border-slate-100 px-6 py-3.5 text-sm font-semibold text-brand-700 hover:bg-brand-50"
        aria-expanded={expanded}
      >
        {expanded ? t("hideExplanation") : t("viewFullExplanation")}
        <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`} />
      </button>

      {expanded && (
        <div className="border-t border-slate-100 px-6 py-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
            {t("eligibilityHeadline")} · {t("rulesEngineNote")}
          </p>
          <ul className="space-y-2">
            {eligibility.map((r) => (
              <li key={r.key} className="flex items-start gap-2 text-sm">
                {r.met ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                ) : (
                  <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
                )}
                <div>
                  <span className="font-medium text-slate-700">{r.label}</span>
                  {r.detail && <p className="text-slate-500">{r.detail}</p>}
                </div>
              </li>
            ))}
            {reasons.length > 0 && (
              <>
                <div className="!mt-4 border-t border-slate-100 pt-3" />
                <li className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                  Summary
                </li>
                {reasons.map((r, i) => (
                  <li key={i} className="text-sm text-slate-600">• {r}</li>
                ))}
              </>
            )}
          </ul>
        </div>
      )}

      {/* Loan details */}
      <div className="grid grid-cols-2 gap-px border-t border-slate-100 bg-slate-100 sm:grid-cols-4">
        <Detail icon={IndianRupee} label={t("loanAmount")} value={`${formatINR(scheme.loanMin)} – ${formatINR(scheme.loanMax)}`} />
        <Detail icon={Percent} label={t("interestRate")} value={formatPercent(scheme.interestRate)} />
        <Detail icon={Clock} label={t("moratorium")} value={`${scheme.moratoriumMonths} mo`} />
        <Detail icon={CalendarDays} label={t("tenure")} value={`${formatNumber(scheme.maxTenureMonths)} mo`} />
      </div>

      {/* Documents */}
      <div className="border-t border-slate-100 px-6 py-5">
        <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800">
          <FileText className="h-4 w-4 text-brand-600" /> {t("docsHeadline")}
        </h3>
        <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
          {scheme.documents.map((doc) => (
            <li key={doc} className="flex items-start gap-2 text-sm text-slate-600">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
              {doc}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Detail({ icon: Icon, label, value }: { icon: typeof IndianRupee; label: string; value: string }) {
  return (
    <div className="bg-white p-4">
      <div className="flex items-center gap-1.5 text-slate-400">
        <Icon className="h-3.5 w-3.5" />
        <span className="text-[11px] font-medium uppercase tracking-wide">{label}</span>
      </div>
      <p className="mt-1 text-sm font-bold text-slate-800">{value}</p>
    </div>
  );
}
