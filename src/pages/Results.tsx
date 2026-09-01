import { Link } from "react-router-dom";
import { ArrowRight, MapPin, Award, Compass, Wallet, RotateCcw } from "lucide-react";
import { useI18n } from "../i18n";
import { useApplicant } from "../context/ApplicantContext";
import { calculateLoan, withIncomeBurden } from "../services/emiCalculator";
import { formatINR } from "../utils/format";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { ProgressTracker } from "../components/ui/ProgressTracker";
import { SchemeResultCard } from "../components/results/SchemeResultCard";
import { EMICalculator } from "../components/results/EMICalculator";
import { PartnerLocator } from "../components/results/PartnerLocator";
import { Checklist } from "../components/results/Checklist";
import { PARTNERS, partnersForCategory, sortByDistance } from "../data/partners";
import { EmptyState } from "../components/ui/EmptyState";

export function Results() {
  const { t } = useI18n();
  const { state, reset } = useApplicant();

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
  const alternatives = state.results.slice(1, 4);

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
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              {t("resultsTitle")}
            </h1>
            <p className="mt-2 max-w-2xl text-lg text-slate-600">
              {t("resultsSubtitle")} <strong className="text-slate-900">{best.scheme.name}</strong>
            </p>
          </div>
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            <RotateCcw className="h-4 w-4" /> {t("startOver")}
          </button>
        </div>

        {/* Progress */}
        <Card className="mt-6 p-5">
          <ProgressTracker steps={trackerSteps} />
        </Card>

        {/* Dashboard stat cards */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <DashCard icon={Award} tone="bg-brand-50 text-brand-600" label={t("dashBestMatch")}>
            <p className="truncate text-lg font-extrabold text-slate-900">{best.scheme.name}</p>
            <p className="text-sm font-semibold text-brand-700">{best.score}%</p>
          </DashCard>
          <DashCard icon={Wallet} tone="bg-emerald-50 text-emerald-600" label={t("dashRepayment")}>
            <p className="text-lg font-extrabold text-slate-900">{formatINR(dashCalc.emi)}</p>
            <p className="text-sm text-slate-500">/mo · {best.scheme.interestRate}%</p>
          </DashCard>
          <DashCard icon={MapPin} tone="bg-amber-50 text-amber-600" label={t("dashPartner")}>
            <p className="truncate text-lg font-extrabold text-slate-900">
              {nearest?.name ?? "—"}
            </p>
            <p className="text-sm text-slate-500">{nearest ? `${nearest.distanceKm} km` : ""}</p>
          </DashCard>
          <DashCard icon={Compass} tone="bg-violet-50 text-violet-600" label={t("dashReadiness")}>
            <p className="text-lg font-extrabold text-slate-900">{readiness}%</p>
            <p className="text-sm text-slate-500">{t("readinessDetail")}</p>
          </DashCard>
        </div>

        {/* Main recommendation */}
        <div className="mt-8">
          <SectionLabel>{t("bestMatch")}</SectionLabel>
          <SchemeResultCard result={best} />
        </div>

        {/* Alternatives */}
        {alternatives.length > 0 && (
          <div className="mt-8">
            <SectionLabel>{t("altNote")}</SectionLabel>
            <div className="grid gap-4 md:grid-cols-3">
              {alternatives.map((alt) => (
                <div key={alt.scheme.id} className="card p-5">
                  <div className="flex items-center justify-between gap-2">
                    <Badge tone="brand">{alt.scheme.category}</Badge>
                    <span className="text-sm font-bold text-brand-700">{alt.score}%</span>
                  </div>
                  <h4 className="mt-2 font-bold text-slate-900">{alt.scheme.name}</h4>
                  <p className="mt-1 text-sm text-slate-500">{alt.scheme.description}</p>
                  <p className="mt-3 text-xs text-slate-400">
                    {formatINR(alt.scheme.loanMin)}–{formatINR(alt.scheme.loanMax)} ·{" "}
                    {alt.scheme.interestRate}% · {alt.scheme.maxTenureMonths} mo
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* EMI calculator */}
        <div className="mt-10" id="repayment">
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
        <div className="mt-10" id="partner">
          <SectionLabel>{t("partnersHeadline")}</SectionLabel>
          <p className="mb-4 max-w-2xl text-sm text-slate-500">{t("partnersSubtitle")}</p>
          <PartnerLocator
            category={best.scheme.category}
            applicantLocation={applicant.location}
          />
        </div>

        {/* Checklist / next step */}
        <div className="mt-10">
          <Checklist
            scheme={best.scheme}
            projectCost={applicant.projectCost}
            annualIncome={applicant.annualIncome}
            fullyEligible={best.fullyEligible}
            nearestPartner={nearest}
          />
        </div>

        {/* Back */}
        <div className="mt-8 text-center">
          <Link to="/" className="text-sm font-semibold text-brand-700 hover:underline">
            {t("backHome")}
          </Link>
        </div>
      </div>
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
