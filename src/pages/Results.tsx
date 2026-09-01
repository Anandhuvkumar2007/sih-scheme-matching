import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  MapPin,
  Award,
  Compass,
  Wallet,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Info,
  FileText,
  Building2,
  Percent,
  Clock,
  CalendarDays,
  IndianRupee,
  X,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useI18n } from "../i18n";
import { useApplicant } from "../context/ApplicantContext";
import { calculateLoan, withIncomeBurden } from "../services/emiCalculator";
import { formatINR, formatPercent, formatNumber } from "../utils/format";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { ProgressTracker } from "../components/ui/ProgressTracker";
import { Ring } from "../components/ui/Ring";
import { EMICalculator } from "../components/results/EMICalculator";
import { PartnerLocator } from "../components/results/PartnerLocator";
import { Checklist } from "../components/results/Checklist";
import { PARTNERS, partnersForCategory, sortByDistance } from "../data/partners";
import { EmptyState } from "../components/ui/EmptyState";
import type { ScoredScheme } from "../services/recommendationEngine";
import type { Scheme } from "../types";

/** Ministry / Implementing authority lookup for demonstration schemes. */
function getMinistryInfo(scheme: Scheme): { ministry: string; authority: string } {
  switch (scheme.category) {
    case "term-loan":
      return {
        ministry: "Ministry of Micro, Small & Medium Enterprises (MSME)",
        authority: "National Small Industries Corporation / State Channelizing Agency",
      };
    case "small-business":
      return {
        ministry: "Ministry of Skill Development & Entrepreneurship",
        authority: "National Entrepreneurship Board / Public Sector Bank Channel",
      };
    case "micro-finance":
      return {
        ministry: "Ministry of Social Justice and Empowerment",
        authority: "National Backward Classes / Minorities Finance & Development Corp",
      };
    case "education":
      return {
        ministry: "Ministry of Education & Social Justice",
        authority: "Higher Education Welfare Credit Board",
      };
    case "skill-development":
      return {
        ministry: "Ministry of Skill Development & Entrepreneurship",
        authority: "National Skill Development Corporation (NSDC)",
      };
    default:
      return {
        ministry: "Government Welfare Credit Department",
        authority: "Designated State Channel Partner",
      };
  }
}

/** Get user-friendly match strength label and tone. */
function getMatchStrength(result: ScoredScheme): {
  label: "Strong Match" | "Potential Match";
  tone: "emerald" | "amber";
} {
  if (result.fullyEligible || result.score >= 80) {
    return { label: "Strong Match", tone: "emerald" };
  }
  return { label: "Potential Match", tone: "amber" };
}

export function Results() {
  const { t } = useI18n();
  const { state, reset } = useApplicant();
  const [selectedSchemeForDetails, setSelectedSchemeForDetails] = useState<ScoredScheme | null>(null);

  if (!state.applicant || !state.results?.length) {
    return (
      <div className="bg-slate-50 py-24">
        <div className="container-page max-w-lg">
          <Card className="p-10 text-center">
            <EmptyState
              title={t("applyTitle")}
              message={t("applySubtitle")}
            />
            <Link to="/apply">
              <Button className="mt-6">
                {t("heroCta")} <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  const { applicant } = state;
  const best = state.results[0];
  const alternatives = state.results.slice(1);

  // Nearest eligible partner for the recommended scheme's category.
  const nearest = sortByDistance(partnersForCategory(PARTNERS, best.scheme.category))[0] ?? null;

  // Default EMI for the dashboard card.
  const downPayment = applicant.projectCost * (best.scheme.marginContributionPct / 100);
  const dashboardLoan = Math.max(
    best.scheme.loanMin,
    Math.min(Math.floor(applicant.projectCost - downPayment), best.scheme.loanMax)
  );
  const dashCalc = withIncomeBurden(
    calculateLoan({
      principal: dashboardLoan,
      annualRate: best.scheme.interestRate,
      tenureMonths: best.scheme.maxTenureMonths,
      moratoriumMonths: best.scheme.moratoriumMonths,
    }),
    applicant.annualIncome
  );

  // Readiness reflects how close the applicant is to fully qualifying.
  const readiness = best.fullyEligible ? 100 : Math.min(95, best.score);

  const trackerSteps = [
    { id: "profile", label: t("formStep1"), done: true },
    { id: "scheme", label: t("formStep2"), done: true, current: true },
    { id: "repayment", label: t("formStep3"), done: true },
    { id: "partner", label: t("formStep4"), done: true },
    { id: "ready", label: t("formStep5"), done: readiness === 100 },
  ];

  return (
    <div className="bg-slate-50 py-10 sm:py-14">
      <div className="container-page max-w-6xl">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-700">
                <Sparkles className="h-3.5 w-3.5" /> Recommendation Results
              </span>
              <span className="inline-flex items-center rounded-full bg-slate-200/80 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                DEMO DATA
              </span>
            </div>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              {t("resultsTitle")}
            </h1>
            <p className="mt-2 max-w-2xl text-base text-slate-600 sm:text-lg">
              {t("resultsSubtitle")} <strong className="text-slate-900">{best.scheme.name}</strong>
            </p>
          </div>
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
          >
            <RotateCcw className="h-4 w-4 text-slate-500" /> {t("startOver")}
          </button>
        </div>

        {/* Legal / Evaluation Disclaimer Notice */}
        <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-blue-200 bg-blue-50/70 p-3.5 text-xs text-blue-900 sm:text-sm">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
          <div>
            <strong>Transparent Rule-Based Matching:</strong> Recommendation scores and match strengths are computed based on the profile information provided. Final eligibility is determined by the concerned government authority or channel partner.
          </div>
        </div>

        {/* Progress Tracker */}
        <Card className="mt-6 p-5">
          <ProgressTracker steps={trackerSteps} />
        </Card>

        {/* Dashboard stat cards */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <DashCard icon={Award} tone="bg-brand-50 text-brand-600" label={t("dashBestMatch")}>
            <p className="truncate text-lg font-extrabold text-slate-900">{best.scheme.name}</p>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-sm font-bold text-brand-700">{best.score}%</span>
              <Badge tone={getMatchStrength(best).tone}>{getMatchStrength(best).label}</Badge>
            </div>
          </DashCard>
          <DashCard icon={Wallet} tone="bg-emerald-50 text-emerald-600" label={t("dashRepayment")}>
            <p className="text-lg font-extrabold text-slate-900">{formatINR(dashCalc.emi)}</p>
            <p className="text-sm text-slate-500">/mo · {best.scheme.interestRate}% APR</p>
          </DashCard>
          <DashCard icon={MapPin} tone="bg-amber-50 text-amber-600" label={t("dashPartner")}>
            <p className="truncate text-lg font-extrabold text-slate-900">
              {nearest?.name ?? "—"}
            </p>
            <p className="text-sm text-slate-500">{nearest ? `${nearest.distanceKm} km away` : ""}</p>
          </DashCard>
          <DashCard icon={Compass} tone="bg-violet-50 text-violet-600" label={t("dashReadiness")}>
            <p className="text-lg font-extrabold text-slate-900">{readiness}%</p>
            <p className="text-sm text-slate-500">{t("readinessDetail")}</p>
          </DashCard>
        </div>

        {/* Main recommendation result card */}
        <div className="mt-8">
          <SectionLabel>{t("bestMatch")}</SectionLabel>
          <MainRecommendationCard
            result={best}
            onViewDetails={() => setSelectedSchemeForDetails(best)}
          />
        </div>

        {/* Alternative recommendations */}
        {alternatives.length > 0 && (
          <div className="mt-10">
            <SectionLabel>{t("altNote")}</SectionLabel>
            <p className="mb-4 text-sm text-slate-500">
              Additional welfare credit schemes evaluated against your profile. Click &ldquo;View Details&rdquo; to compare eligibility, benefits, and requirements.
            </p>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {alternatives.map((alt) => (
                <AlternativeSchemeCard
                  key={alt.scheme.id}
                  result={alt}
                  onViewDetails={() => setSelectedSchemeForDetails(alt)}
                />
              ))}
            </div>
          </div>
        )}

        {/* EMI calculator */}
        <div className="mt-12" id="repayment">
          <SectionLabel>{t("emiTitle")}</SectionLabel>
          <Card className="p-6">
            <p className="mb-6 max-w-2xl text-slate-600">{t("emiSubtitle")}</p>
            <EMICalculator
              scheme={best.scheme}
              projectCost={applicant.projectCost}
              annualIncome={applicant.annualIncome}
            />
          </Card>
        </div>

        {/* Partner locator */}
        <div className="mt-12" id="partner">
          <SectionLabel>{t("partnersHeadline")}</SectionLabel>
          <p className="mb-4 max-w-2xl text-sm text-slate-500">{t("partnersSubtitle")}</p>
          <PartnerLocator
            category={best.scheme.category}
            applicantLocation={applicant.location}
          />
        </div>

        {/* Checklist / next step */}
        <div className="mt-12">
          <Checklist
            scheme={best.scheme}
            projectCost={applicant.projectCost}
            annualIncome={applicant.annualIncome}
            fullyEligible={best.fullyEligible}
            nearestPartner={nearest}
          />
        </div>

        {/* Back */}
        <div className="mt-10 text-center">
          <Link to="/" className="text-sm font-semibold text-brand-700 hover:underline">
            {t("backHome")}
          </Link>
        </div>
      </div>

      {/* Scheme Details Modal */}
      {selectedSchemeForDetails && (
        <SchemeDetailsModal
          result={selectedSchemeForDetails}
          onClose={() => setSelectedSchemeForDetails(null)}
        />
      )}
    </div>
  );
}

/** Primary Recommendation Result Card */
function MainRecommendationCard({
  result,
  onViewDetails,
}: {
  result: ScoredScheme;
  onViewDetails: () => void;
}) {
  const { t } = useI18n();
  const { scheme, score, eligibility, reasons, missingRequirements, fullyEligible } = result;
  const matchStrength = getMatchStrength(result);
  const ministryInfo = getMinistryInfo(scheme);

  return (
    <div className="card overflow-hidden transition hover:shadow-lift">
      <div className="grid gap-6 p-6 sm:grid-cols-[auto_1fr] sm:p-8">
        {/* Score Ring & Badge */}
        <div className="flex flex-col items-center justify-start gap-2.5">
          <Ring value={score} color={scheme.accent} />
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {t("matchScore")}
          </p>
          <Badge tone={matchStrength.tone}>{matchStrength.label}</Badge>
          <Badge tone="brand">{scheme.category}</Badge>
        </div>

        {/* Scheme Information & Breakdown */}
        <div className="flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
                Top Recommendation
              </span>
              <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                DEMO DATA
              </span>
            </div>
            <h2 className="mt-1 text-2xl font-extrabold text-slate-900 sm:text-3xl">
              {scheme.name}
            </h2>
            <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <Building2 className="h-3.5 w-3.5 text-slate-400" />
              {ministryInfo.ministry}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
              {scheme.description}
            </p>

            {/* Incomplete match warning */}
            {!fullyEligible && missingRequirements.length > 0 && (
              <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 sm:text-sm">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <span>
                  <strong>Potential Match:</strong> Based on the information provided, you satisfy the core criteria. Note: {missingRequirements.join(" · ")}
                </span>
              </div>
            )}

            {/* Why this scheme matches */}
            <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50/70 p-4">
              <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Why this scheme matches your profile
              </h3>
              <ul className="mt-2.5 space-y-2">
                {reasons.map((reason, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 sm:text-sm">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Eligibility Rules Summary */}
            <div className="mt-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Eligibility Evaluation (Transparent Rules Engine)
              </p>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {eligibility.slice(0, 4).map((rule) => (
                  <div
                    key={rule.key}
                    className="flex items-center gap-2 rounded-lg border border-slate-100 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm"
                  >
                    {rule.met ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                    ) : (
                      <XCircle className="h-4 w-4 shrink-0 text-rose-500" />
                    )}
                    <span className="truncate">{rule.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
            <div className="text-xs text-slate-500">
              Final eligibility is determined by the concerned government authority.
            </div>
            <Button
              onClick={onViewDetails}
              className="inline-flex items-center gap-2 shadow-sm"
            >
              View Full Scheme Details <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Loan benefits key summary */}
      <div className="grid grid-cols-2 gap-px border-t border-slate-200 bg-slate-200 sm:grid-cols-4">
        <DetailItem
          icon={IndianRupee}
          label={t("loanAmount")}
          value={`${formatINR(scheme.loanMin)} – ${formatINR(scheme.loanMax)}`}
        />
        <DetailItem
          icon={Percent}
          label={t("interestRate")}
          value={`${formatPercent(scheme.interestRate)} p.a.`}
        />
        <DetailItem
          icon={Clock}
          label={t("moratorium")}
          value={`${scheme.moratoriumMonths} months`}
        />
        <DetailItem
          icon={CalendarDays}
          label={t("tenure")}
          value={`Up to ${formatNumber(scheme.maxTenureMonths)} months`}
        />
      </div>

      {/* Required documents preview */}
      <div className="border-t border-slate-100 bg-slate-50/50 px-6 py-4 sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
            <FileText className="h-4 w-4 text-brand-600" />
            Required Documents Checklist
          </h4>
          <span className="text-xs text-slate-500">
            {scheme.documents.length} document(s) required
          </span>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {scheme.documents.map((doc) => (
            <span
              key={doc}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-700 shadow-sm"
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              {doc}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Alternative Scheme Recommendation Card */
function AlternativeSchemeCard({
  result,
  onViewDetails,
}: {
  result: ScoredScheme;
  onViewDetails: () => void;
}) {
  const { scheme, score, reasons } = result;
  const matchStrength = getMatchStrength(result);

  return (
    <div className="card flex flex-col justify-between p-5 transition hover:shadow-lift">
      <div>
        {/* Top Header */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <Badge tone="brand">{scheme.category}</Badge>
            <span className="text-[10px] font-semibold uppercase text-slate-400">DEMO</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Badge tone={matchStrength.tone}>{matchStrength.label}</Badge>
            <span className="text-sm font-extrabold text-brand-700">{score}%</span>
          </div>
        </div>

        {/* Title & Description */}
        <h4 className="mt-3 text-lg font-bold text-slate-900">{scheme.name}</h4>
        <p className="mt-1.5 line-clamp-2 text-xs text-slate-600 sm:text-sm">
          {scheme.description}
        </p>

        {/* Why this matches */}
        <div className="mt-3 rounded-lg bg-slate-50 p-2.5">
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
            Match Highlights
          </p>
          <ul className="mt-1 space-y-1">
            {reasons.slice(0, 2).map((r, i) => (
              <li key={i} className="flex items-start gap-1.5 text-xs text-slate-600">
                <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-emerald-500" />
                <span className="line-clamp-1">{r}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Key Benefits / Terms */}
        <div className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3 text-xs">
          <div>
            <span className="text-slate-400">Loan Range:</span>
            <p className="font-semibold text-slate-800">
              {formatINR(scheme.loanMin)} – {formatINR(scheme.loanMax)}
            </p>
          </div>
          <div>
            <span className="text-slate-400">Interest Rate:</span>
            <p className="font-semibold text-slate-800">{formatPercent(scheme.interestRate)} p.a.</p>
          </div>
        </div>

        {/* Documents preview */}
        <div className="mt-2 text-xs text-slate-500">
          <span className="text-slate-400">Documents: </span>
          {scheme.documents.slice(0, 2).join(", ")}
          {scheme.documents.length > 2 ? ` +${scheme.documents.length - 2} more` : ""}
        </div>
      </div>

      {/* Card Action */}
      <div className="mt-4 border-t border-slate-100 pt-3">
        <button
          onClick={onViewDetails}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-brand-200 bg-brand-50/60 px-3 py-2 text-xs font-bold text-brand-700 transition hover:bg-brand-100"
        >
          View Details <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

/** Comprehensive Scheme Details Modal Component */
function SchemeDetailsModal({
  result,
  onClose,
}: {
  result: ScoredScheme;
  onClose: () => void;
}) {
  const { scheme, score, reasons, eligibility, missingRequirements, fullyEligible } = result;
  const matchStrength = getMatchStrength(result);
  const ministryInfo = getMinistryInfo(scheme);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-sm sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="scheme-details-title"
    >
      <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl bg-white shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-slate-100 p-5 sm:p-6">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="brand">{scheme.category}</Badge>
              <Badge tone={matchStrength.tone}>{matchStrength.label}</Badge>
              <span className="rounded bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800">
                DEMO DATA
              </span>
            </div>
            <h2
              id="scheme-details-title"
              className="mt-2 text-2xl font-extrabold text-slate-900 sm:text-3xl"
            >
              {scheme.name}
            </h2>
            <p className="mt-1 text-sm font-medium text-slate-500">
              {ministryInfo.ministry} · {ministryInfo.authority}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            aria-label="Close details"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 space-y-6 overflow-y-auto p-5 sm:p-6">
          {/* Official Evaluation & Demo Notice Banner */}
          <div className="rounded-xl border border-blue-200 bg-blue-50/80 p-4 text-xs text-blue-950 sm:text-sm">
            <div className="flex items-center gap-2 font-bold text-blue-900">
              <ShieldCheck className="h-4 w-4 text-blue-600" />
              Notice on Scheme Eligibility & Matching
            </div>
            <p className="mt-1 leading-relaxed text-blue-800">
              This recommendation is computed based on the profile information provided. This platform uses demonstration welfare schemes for educational / hackathon evaluation. Final eligibility and loan sanctions are determined solely by the concerned government department and channel partner.
            </p>
          </div>

          {/* Match Score & Why You Matched */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                Why You Matched ({score}% Match Score)
              </h3>
              <Badge tone={matchStrength.tone}>{matchStrength.label}</Badge>
            </div>
            <ul className="mt-3 space-y-2">
              {reasons.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  <span>{r}</span>
                </li>
              ))}
              {!fullyEligible && missingRequirements.length > 0 && (
                <li className="flex items-start gap-2 text-sm text-amber-700">
                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                  <span>Missing/Soft requirements: {missingRequirements.join(", ")}</span>
                </li>
              )}
            </ul>
          </div>

          {/* Scheme Description & Objectives */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Scheme Overview & Purpose
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
              {scheme.description}
            </p>
          </div>

          {/* Target Beneficiaries & Supported Business Types */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Target Beneficiaries & Supported Activities
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Entrepreneurs, self-employed individuals, and business projects eligible under this scheme:
            </p>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {scheme.supportedBusinessTypes.map((type) => (
                <span
                  key={type}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700"
                >
                  <Building2 className="h-3.5 w-3.5 text-brand-600" />
                  {type}
                </span>
              ))}
            </div>
          </div>

          {/* Financial Benefits & Key Terms */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Financial Benefits & Loan Terms
            </h3>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <BenefitItem
                label="Loan Amount"
                value={`${formatINR(scheme.loanMin)} – ${formatINR(scheme.loanMax)}`}
              />
              <BenefitItem
                label="Interest Rate"
                value={`${formatPercent(scheme.interestRate)} per annum`}
              />
              <BenefitItem
                label="Moratorium Period"
                value={`${scheme.moratoriumMonths} months`}
              />
              <BenefitItem
                label="Max Repayment Tenure"
                value={`${scheme.maxTenureMonths} months (${(scheme.maxTenureMonths / 12).toFixed(1)} yrs)`}
              />
              <BenefitItem
                label="Beneficiary Contribution"
                value={`${scheme.marginContributionPct}% margin money`}
              />
              <BenefitItem
                label="Income Limit Ceiling"
                value={scheme.incomeLimit > 0 ? `Up to ${formatINR(scheme.incomeLimit)}/yr` : "No Upper Cap"}
              />
            </div>
          </div>

          {/* Eligibility Criteria Breakdown */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Eligibility Rules & Qualification Breakdown
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Evaluation rules checked transparently by SchemeSaathi rules engine:
            </p>
            <div className="mt-3 space-y-2">
              {eligibility.map((rule) => (
                <div
                  key={rule.key}
                  className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
                >
                  <div className="flex items-start gap-2.5">
                    {rule.met ? (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    ) : (
                      <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
                    )}
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{rule.label}</p>
                      {rule.detail && (
                        <p className="mt-0.5 text-xs text-slate-500">{rule.detail}</p>
                      )}
                    </div>
                  </div>
                  <Badge tone={rule.met ? "emerald" : rule.required ? "rose" : "neutral"}>
                    {rule.met ? "Satisfied" : rule.required ? "Required" : "Optional"}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Required Documents */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Required Documents to Apply
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Keep original documents and self-attested photocopies ready for submission:
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {scheme.documents.map((doc, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs font-medium text-slate-700"
                >
                  <FileText className="h-4 w-4 shrink-0 text-brand-600" />
                  <span>{doc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Application Procedure / Process */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Step-by-Step Application Procedure
            </h3>
            <ol className="mt-3 space-y-3">
              <ProcedureStep
                num="1"
                title="Verify Match & Eligibility"
                desc="Review your match score and confirm that your project cost and income fall within the prescribed ceiling."
              />
              <ProcedureStep
                num="2"
                title="Prepare Required Documents"
                desc="Assemble photo identification, caste/income certificates, and your project quotation or proposal."
              />
              <ProcedureStep
                num="3"
                title="Locate Channel Partner"
                desc="Visit the nearest State Channelizing Agency, Public Sector Bank, or NBFC-MFI designated for this scheme category."
              />
              <ProcedureStep
                num="4"
                title="Application Verification & Sanction"
                desc="Submit application at the partner desk. The partner verifies documents, completes KYC, and sanctions credit disbursement."
              />
            </ol>
          </div>

          {/* Official Application Link */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Official Application Link
            </h3>
            {"officialUrl" in scheme &&
            typeof (scheme as Record<string, unknown>).officialUrl === "string" &&
            Boolean((scheme as Record<string, unknown>).officialUrl) ? (
              <div className="mt-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Official Portal Application
                    </p>
                    <p className="text-xs text-slate-500">
                      Apply directly on the designated government / agency portal.
                    </p>
                  </div>
                  <a
                    href={String((scheme as Record<string, unknown>).officialUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-brand-700"
                  >
                    Open Official Portal <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            ) : (
              <div className="mt-3 flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/80 p-4 text-xs text-slate-600 sm:text-sm">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <div>
                  <p className="font-semibold text-slate-800">
                    Official application link not available
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    This demo scheme is processed offline through designated State Channelizing Agencies and Channel Partners. Please visit the nearest eligible channel partner listed below to submit your application.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50 p-4 sm:p-6">
          <div className="text-xs text-slate-500">
            DEMO DATA · Prototype dataset for demonstration purposes.
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
            <a href="#partner" onClick={onClose}>
              <Button>
                Find Partner to Apply <ArrowRight className="h-4 w-4" />
              </Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProcedureStep({
  num,
  title,
  desc,
}: {
  num: string;
  title: string;
  desc: string;
}) {
  return (
    <li className="flex items-start gap-3 rounded-xl border border-slate-100 bg-white p-3.5 shadow-sm">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
        {num}
      </span>
      <div>
        <h4 className="text-xs font-bold text-slate-900 sm:text-sm">{title}</h4>
        <p className="mt-0.5 text-xs text-slate-500 sm:text-xs">{desc}</p>
      </div>
    </li>
  );
}

function BenefitItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-1 text-xs font-bold text-slate-800 sm:text-sm">{value}</p>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-4 flex items-center gap-2 text-xl font-extrabold text-slate-900">
      <span className="h-5 w-1.5 rounded-full bg-brand-600" />
      {children}
    </h2>
  );
}

function DetailItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof IndianRupee;
  label: string;
  value: string;
}) {
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

function DashCard({
  icon: Icon,
  label,
  tone,
  children,
}: {
  icon: typeof Award;
  label: string;
  tone: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2">
        <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${tone}`}>
          <Icon className="h-5 w-5" />
        </span>
        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{label}</p>
      </div>
      <div className="mt-3">{children}</div>
    </Card>
  );
}

