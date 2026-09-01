import { Sparkles, Award, CheckCircle2, AlertTriangle, ArrowDown, ChevronRight, ShieldCheck, XCircle } from "lucide-react";
import { Badge } from "../ui/Badge";
import type { SchemeRecommenderProfile, ScoredSchemeResult } from "../../types";

interface Props {
  profile: SchemeRecommenderProfile;
  results: ScoredSchemeResult[];
  onScrollToMatches?: () => void;
}

export function RecommendationSummary({ profile, results, onScrollToMatches }: Props) {
  if (!results || results.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold text-slate-700">
          No evaluated schemes available for this profile.
        </p>
      </div>
    );
  }

  const totalCount = results.length;
  const strongMatchesCount = results.filter((r) => r.strength === "Strong Match").length;
  const goodOrPotentialCount = results.filter(
    (r) => r.strength === "Good Match" || (r.strength === "Potential Match" && r.eligibilityStatus !== "Not a Match")
  ).length;
  const needsVerificationCount = results.filter(
    (r) => r.eligibilityStatus === "Needs Verification"
  ).length;
  const notAMatchCount = results.filter(
    (r) => r.eligibilityStatus === "Not a Match"
  ).length;

  // Best match is top-ranked non-disqualified scheme, if any
  const bestMatch = results.find((r) => r.eligibilityStatus !== "Not a Match") || results[0];
  const hasViableMatch = bestMatch && bestMatch.eligibilityStatus !== "Not a Match";

  const handleScroll = () => {
    if (onScrollToMatches) {
      onScrollToMatches();
    } else {
      const el = document.getElementById("ranked-schemes-list");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-brand-200 bg-gradient-to-br from-white via-brand-50/40 to-indigo-50/50 p-6 sm:p-7 shadow-sm">
      {/* Top Header Row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-brand-100/80 pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-100 px-3 py-0.5 text-xs font-bold text-brand-800">
            <Sparkles className="h-3.5 w-3.5 text-brand-600" />
            <span>Personalized Recommendation Summary</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            {hasViableMatch
              ? `${totalCount} Schemes Evaluated for Your Profile`
              : "Evaluation Completed"}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
            {hasViableMatch ? (
              <>
                Based on your provided information (<strong>{profile.occupation || "trade"}</strong>,{" "}
                <strong>{profile.state || "state"}</strong>, and{" "}
                <strong>₹{profile.requiredFinancialAssistance?.toLocaleString("en-IN") || "0"}</strong> requirement),
                your strongest potential match is{" "}
                <strong className="text-brand-900 font-extrabold">{bestMatch.scheme.name}</strong> with an indicative compatibility score of{" "}
                <strong className="text-emerald-700 font-extrabold">{bestMatch.score}%</strong>.
              </>
            ) : (
              <>
                Based on your provided information, evaluated schemes require parameters outside current profile limits. Please review details below for verification guidelines.
              </>
            )}
          </p>
        </div>

        {/* Call-to-action button */}
        <div className="shrink-0">
          <button
            type="button"
            onClick={handleScroll}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-brand-700 transition focus:outline-none focus:ring-2 focus:ring-brand-500/30"
          >
            <span>View Top Matches</span>
            <ArrowDown className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 4 Metric Status Cards */}
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* Metric 1: Strong Matches */}
        <div className="rounded-xl border border-emerald-200 bg-white p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-emerald-800 font-semibold">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Strong Matches
            </span>
            <Badge tone="emerald">{strongMatchesCount}</Badge>
          </div>
          <p className="mt-1 text-2xl font-extrabold text-slate-900">
            {strongMatchesCount}
          </p>
          <p className="mt-0.5 text-[10px] text-slate-500">
            Highest compatibility (80%+)
          </p>
        </div>

        {/* Metric 2: Potential / Good Matches */}
        <div className="rounded-xl border border-brand-200 bg-white p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-brand-800 font-semibold">
            <span className="flex items-center gap-1">
              <Award className="h-3.5 w-3.5 text-brand-600" /> Good / Potential
            </span>
            <Badge tone="brand">{goodOrPotentialCount}</Badge>
          </div>
          <p className="mt-1 text-2xl font-extrabold text-slate-900">
            {goodOrPotentialCount}
          </p>
          <p className="mt-0.5 text-[10px] text-slate-500">
            Viable funding options (40–79%)
          </p>
        </div>

        {/* Metric 3: Needs Verification */}
        <div className="rounded-xl border border-amber-200 bg-white p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-amber-800 font-semibold">
            <span className="flex items-center gap-1">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-600" /> Needs Verification
            </span>
            <Badge tone="amber">{needsVerificationCount}</Badge>
          </div>
          <p className="mt-1 text-2xl font-extrabold text-slate-900">
            {needsVerificationCount}
          </p>
          <p className="mt-0.5 text-[10px] text-slate-500">
            Requires document or nodal check
          </p>
        </div>

        {/* Metric 4: Ineligible / Not a Match */}
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-600 font-semibold">
            <span className="flex items-center gap-1">
              <XCircle className="h-3.5 w-3.5 text-rose-500" /> Not a Match
            </span>
            <span className="inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
              {notAMatchCount}
            </span>
          </div>
          <p className="mt-1 text-2xl font-extrabold text-slate-900">
            {notAMatchCount}
          </p>
          <p className="mt-0.5 text-[10px] text-slate-500">
            Mandatory criteria not met
          </p>
        </div>
      </div>

      {/* Grounded Transparency Footer Note */}
      <div className="mt-4 flex items-center justify-between gap-2 border-t border-brand-100/60 pt-3 text-[11px] text-slate-500">
        <span className="flex items-center gap-1">
          <ShieldCheck className="h-3.5 w-3.5 text-brand-600" />
          Indicative matching based strictly on provided answers. Final approval rests with lending institutions.
        </span>
        {hasViableMatch && (
          <span className="hidden sm:inline-flex items-center gap-1 font-semibold text-brand-700">
            Top match: {bestMatch.scheme.name} ({bestMatch.score}%)
            <ChevronRight className="h-3 w-3" />
          </span>
        )}
      </div>
    </div>
  );
}
