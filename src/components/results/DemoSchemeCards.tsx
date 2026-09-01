import { useState, useMemo } from "react";
import {
  User,
  Building2,
  IndianRupee,
  MapPin,
  Briefcase,
  Edit3,
  RotateCcw,
  CheckCircle2,
  ChevronDown,
  FileText,
  Clock,
  Sparkles,
  CalendarDays,
  Percent,
  Award,
  AlertCircle,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  ListOrdered,
  XCircle,
  ArrowRight,
  SearchX,
  Scale,
  X,
} from "lucide-react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { Ring } from "../ui/Ring";
import { SchemeGuidanceModal } from "./SchemeGuidanceModal";
import { SchemeComparisonModal } from "./SchemeComparisonModal";
import { SchemeSearchFilterBar, type FilterState } from "./SchemeSearchFilterBar";
import { RecommendationSummary } from "./RecommendationSummary";
import { formatINR, formatPercent } from "../../utils/format";
import type {
  SchemeRecommenderProfile,
  ScoredSchemeResult,
  RecommendationStrength,
  SchemeEligibilityStatus,
} from "../../types";

interface Props {
  profile: SchemeRecommenderProfile;
  results: ScoredSchemeResult[];
  onEdit: () => void;
  onReset: () => void;
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
  { label: string; tone: "emerald" | "brand" | "amber" | "rose"; icon: typeof CheckCircle2 }
> = {
  "Eligible Based on Provided Information": {
    label: "Eligible Based on Provided Info",
    tone: "emerald",
    icon: CheckCircle2,
  },
  "Potential Match": {
    label: "Potential Match",
    tone: "brand",
    icon: Sparkles,
  },
  "Needs Verification": {
    label: "Needs Verification",
    tone: "amber",
    icon: AlertTriangle,
  },
  "Not a Match": {
    label: "Not a Match",
    tone: "rose",
    icon: XCircle,
  },
};

const INITIAL_FILTERS: FilterState = {
  searchQuery: "",
  selectedState: "all",
  selectedCategory: "all",
  selectedOccupation: "all",
  selectedBusinessStage: "all",
  selectedAssistanceType: "all",
  selectedStrength: "all",
  sortBy: "best",
};

export function DemoSchemeCards({ profile, results, onEdit, onReset }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(
    results.length > 0 ? results[0].scheme.id : null
  );

  const [modalResult, setModalResult] = useState<ScoredSchemeResult | null>(null);
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [selectedCompareIds, setSelectedCompareIds] = useState<string[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [compareWarning, setCompareWarning] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const toggleCompare = (id: string) => {
    setCompareWarning(null);
    setSelectedCompareIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((i) => i !== id);
      }
      if (prev.length >= 3) {
        setCompareWarning("You can select up to 3 schemes to compare at a time. Deselect a scheme to add another.");
        return prev;
      }
      return [...prev, id];
    });
  };

  const handleFilterChange = <K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters(INITIAL_FILTERS);
  };

  // Derive unique filter options from the dataset
  const availableStates = useMemo(() => {
    const set = new Set<string>();
    results.forEach((r) => {
      r.scheme.eligibleStates?.forEach((st) => {
        if (st !== "All States & UTs") set.add(st);
      });
    });
    return Array.from(set).sort();
  }, [results]);

  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    results.forEach((r) => {
      if (r.scheme.category) set.add(r.scheme.category);
    });
    return Array.from(set).sort();
  }, [results]);

  const availableOccupations = useMemo(() => {
    const set = new Set<string>();
    results.forEach((r) => {
      r.scheme.eligibleOccupations?.forEach((occ) => {
        if (occ !== "Other") set.add(occ);
      });
    });
    return Array.from(set).sort();
  }, [results]);

  const availableAssistanceTypes = useMemo(() => {
    const set = new Set<string>();
    results.forEach((r) => {
      if (r.scheme.financialAssistanceType) {
        set.add(r.scheme.financialAssistanceType);
      }
    });
    return Array.from(set).sort();
  }, [results]);

  // Compute filtered & sorted schemes
  const filteredResults = useMemo(() => {
    return results
      .filter((r) => {
        const { scheme, strength } = r;

        // 1. Search Query Filter (name, ministry, category, occupation, beneficiaries, description)
        if (filters.searchQuery.trim()) {
          const q = filters.searchQuery.toLowerCase().trim();
          const matchesName = scheme.name.toLowerCase().includes(q);
          const matchesMinistry = (scheme.ministry || scheme.agency || "")
            .toLowerCase()
            .includes(q);
          const matchesCategory = scheme.category.toLowerCase().includes(q);
          const matchesBeneficiaries = scheme.targetBeneficiaries.some((b) =>
            b.toLowerCase().includes(q)
          );
          const matchesOccupations = (scheme.eligibleOccupations || []).some(
            (o) => o.toLowerCase().includes(q)
          );
          const matchesDesc = scheme.description.toLowerCase().includes(q);

          if (
            !matchesName &&
            !matchesMinistry &&
            !matchesCategory &&
            !matchesBeneficiaries &&
            !matchesOccupations &&
            !matchesDesc
          ) {
            return false;
          }
        }

        // 2. State Filter
        if (filters.selectedState !== "all") {
          const states = scheme.eligibleStates || ["All States & UTs"];
          const isMatch =
            states.includes("All States & UTs") ||
            states.some(
              (st) => st.toLowerCase() === filters.selectedState.toLowerCase()
            );
          if (!isMatch) return false;
        }

        // 3. Category Filter
        if (filters.selectedCategory !== "all") {
          if (scheme.category !== filters.selectedCategory) return false;
        }

        // 4. Occupation Filter
        if (filters.selectedOccupation !== "all") {
          const occs = scheme.eligibleOccupations || [];
          if (!occs.includes(filters.selectedOccupation)) return false;
        }

        // 5. Business Stage Filter
        if (filters.selectedBusinessStage !== "all") {
          const stages = scheme.eligibleBusinessStages || [];
          if (!stages.includes(filters.selectedBusinessStage as any)) return false;
        }

        // 6. Assistance Type Filter
        if (filters.selectedAssistanceType !== "all") {
          if (scheme.financialAssistanceType !== filters.selectedAssistanceType) {
            return false;
          }
        }

        // 7. Match Strength Filter
        if (filters.selectedStrength !== "all") {
          if (strength !== filters.selectedStrength) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === "score") {
          return b.score - a.score;
        }
        if (filters.sortBy === "alphabetical") {
          return a.scheme.name.localeCompare(b.scheme.name);
        }
        // Default "best": preserve original engine ranking
        return 0;
      });
  }, [results, filters]);

  return (
    <div className="space-y-8 animate-fade-up">
      {/* 1. PRESERVED QUESTIONNAIRE CRITERIA SUMMARY */}
      <Card className="overflow-hidden border-brand-200 bg-white">
        <div className="flex flex-col gap-4 border-b border-slate-100 bg-brand-50/60 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-600 text-white shadow-sm">
                <CheckCircle2 className="h-4 w-4" />
              </span>
              <h3 className="text-lg font-bold text-slate-900">
                Preserved Entrepreneur Questionnaire Profile
              </h3>
            </div>
            <p className="mt-1 text-xs text-slate-600">
              Evaluated across 10 eligibility dimensions by the Scheme Matching & Eligibility Engine.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={onEdit} className="text-xs sm:text-sm">
              <Edit3 className="h-4 w-4" /> Edit Questionnaire
            </Button>
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              <RotateCcw className="h-4 w-4" /> Reset
            </button>
          </div>
        </div>

        {/* 3 Summary Columns */}
        <div className="grid divide-y divide-slate-100 sm:grid-cols-3 sm:divide-x sm:divide-y-0 p-5">
          {/* Col 1: Personal Profile */}
          <div className="space-y-2 py-3 sm:py-0 sm:pr-4">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-700">
              <User className="h-3.5 w-3.5" /> Personal Profile
            </div>
            <p className="text-sm font-semibold text-slate-900">
              {profile.age} yrs · {profile.gender}
            </p>
            <p className="text-xs text-slate-600 flex items-center gap-1">
              <MapPin className="h-3 w-3 text-brand-500" />
              {profile.state}
            </p>
            <div className="flex flex-wrap gap-1 pt-1">
              <Badge tone="brand">{profile.socialCategory}</Badge>
              {profile.disabilityStatus && profile.disabilityStatus !== "None / Not Applicable" && (
                <Badge tone="amber">{profile.disabilityStatus}</Badge>
              )}
            </div>
          </div>

          {/* Col 2: Business Sector */}
          <div className="space-y-2 py-3 sm:py-0 sm:px-4">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700">
              <Building2 className="h-3.5 w-3.5" /> Enterprise Sector
            </div>
            <p className="text-sm font-semibold text-slate-900">
              {profile.businessType}
            </p>
            <p className="text-xs text-slate-600 flex items-center gap-1">
              <Briefcase className="h-3 w-3 text-emerald-500" />
              {profile.occupation}
            </p>
            <div className="pt-1">
              <Badge tone={profile.businessStage.includes("Idea") ? "amber" : "emerald"}>
                {profile.businessStage}
              </Badge>
            </div>
          </div>

          {/* Col 3: Financial Requirement */}
          <div className="space-y-2 py-3 sm:py-0 sm:pl-4">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-violet-700">
              <IndianRupee className="h-3.5 w-3.5" /> Financial Scope
            </div>
            <div>
              <p className="text-xs text-slate-400">Required Financial Assistance</p>
              <p className="text-lg font-extrabold text-brand-700">
                {formatINR(profile.requiredFinancialAssistance)}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Annual Family Income</p>
              <p className="text-xs font-semibold text-slate-800">
                {formatINR(profile.annualIncome)} / year
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* 2. PERSONALIZED RECOMMENDATION SUMMARY */}
      <RecommendationSummary profile={profile} results={results} />

      {/* 3. SEARCH, FILTER & SORT BAR */}
      <SchemeSearchFilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        totalResults={results.length}
        filteredCount={filteredResults.length}
        availableStates={availableStates}
        availableCategories={availableCategories}
        availableOccupations={availableOccupations}
        availableAssistanceTypes={availableAssistanceTypes}
      />

      {/* 4. RANKED SCHEMES CARDS LIST */}
      {filteredResults.length > 0 ? (
        <div id="ranked-schemes-list" className="space-y-6 scroll-mt-20">
          {filteredResults.map((result: ScoredSchemeResult, index: number) => {
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
            const isExpanded = expandedId === scheme.id;
            const config = STRENGTH_CONFIG[strength];
            const statusConfig = ELIGIBILITY_STATUS_BADGE[eligibilityStatus];
            const StatusIcon = statusConfig.icon;
            const isDisqualified = eligibilityStatus === "Not a Match";

            return (
              <Card
                key={scheme.id}
                className={`overflow-hidden transition-all duration-200 ${
                  index === 0 && !isDisqualified
                    ? "border-2 border-brand-500 shadow-lift"
                    : isDisqualified
                    ? "border-slate-200 bg-slate-50/40 opacity-90"
                    : "hover:border-slate-300"
                }`}
              >
                <div className="p-6 sm:p-7">
                  {/* Header Row: Rank Badge, Category, Eligibility Status Badge, Match Ring */}
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-extrabold text-white ${
                          isDisqualified ? "bg-slate-400" : "bg-brand-600"
                        }`}
                      >
                        #{index + 1}
                      </span>
                      <Badge tone={(scheme.badgeColor || "brand") as "brand" | "emerald" | "amber" | "violet"}>
                        {scheme.category}
                      </Badge>
                      {/* Eligibility Status Badge */}
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
                        <StatusIcon className="h-3.5 w-3.5" />
                        {statusConfig.label}
                      </span>
                      {scheme.isVerified && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                          <ShieldCheck className="h-3 w-3 text-emerald-600" /> Verified Govt Scheme
                        </span>
                      )}
                      {scheme.subsidyPct ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                          <Sparkles className="h-3 w-3" /> Up to {scheme.subsidyPct}% Subsidy / Grant
                        </span>
                      ) : null}
                    </div>

                    {/* Visual Match Strength, Score Ring & Compare Control */}
                    <div className="flex items-center gap-3">
                      <label className="inline-flex items-center gap-1.5 cursor-pointer rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs">
                        <input
                          type="checkbox"
                          checked={selectedCompareIds.includes(scheme.id)}
                          onChange={() => toggleCompare(scheme.id)}
                          aria-label={`Select ${scheme.name} for comparison`}
                          className="h-3.5 w-3.5 rounded text-brand-600 focus:ring-brand-500"
                        />
                        <span className="hidden sm:inline">Compare</span>
                        <Scale className="h-3.5 w-3.5 text-brand-600 sm:hidden" />
                      </label>
                      <div className="text-right">
                        <span className={`inline-block text-xs font-bold px-2.5 py-0.5 rounded-full border ${config.cardBorder} ${config.accentBg} ${config.textColor}`}>
                          {strength} — {score}%
                        </span>
                        <p className="mt-0.5 text-[10px] font-semibold uppercase text-slate-400">
                          Match Score
                        </p>
                      </div>
                      <Ring value={score} color={isDisqualified ? "#94a3b8" : "#2b4ae3"} size={48} stroke={4} />
                    </div>
                  </div>

                  {/* Scheme Title & Ministry */}
                  <div className="mt-4">
                    <h4 className="text-2xl font-extrabold text-slate-900">
                      {scheme.name}
                    </h4>
                    <p className="mt-1 text-xs font-semibold text-slate-500">
                      {scheme.agency} {scheme.ministry ? `• ${scheme.ministry}` : ""}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                      {scheme.description}
                    </p>
                  </div>

                  {/* Assessment Summary Box */}
                  <div
                    className={`mt-4 rounded-xl border p-3.5 text-xs leading-relaxed ${
                      isDisqualified
                        ? "border-rose-200 bg-rose-50/70 text-rose-900"
                        : `${config.accentBg} ${config.cardBorder} ${config.textColor}`
                    }`}
                  >
                    <p className="font-bold text-slate-900 mb-0.5">Eligibility Assessment:</p>
                    <p>{explanation}</p>
                  </div>

                  {/* 100-Point Normalized Score Breakdown */}
                  {result.scoreBreakdown && (
                    <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-800 pb-2 border-b border-slate-200/60">
                        <span className="flex items-center gap-1.5">
                          <Award className="h-3.5 w-3.5 text-brand-600" />
                          Transparent Score Breakdown (Normalized 100 pts)
                        </span>
                        <span className="font-extrabold text-brand-700">
                          {result.scoreBreakdown.total.earned} / {result.scoreBreakdown.total.max} pts
                        </span>
                      </div>
                      <div className="mt-2.5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6 text-[11px]">
                        <div className="rounded-lg bg-white p-2 border border-slate-100 shadow-xs">
                          <p className="text-slate-400 font-medium truncate">State Scope</p>
                          <p className="font-bold text-slate-900 mt-0.5">
                            {result.scoreBreakdown.state.earned} / {result.scoreBreakdown.state.max}
                          </p>
                        </div>
                        <div className="rounded-lg bg-white p-2 border border-slate-100 shadow-xs">
                          <p className="text-slate-400 font-medium truncate">Occupation</p>
                          <p className="font-bold text-slate-900 mt-0.5">
                            {result.scoreBreakdown.occupation.earned} / {result.scoreBreakdown.occupation.max}
                          </p>
                        </div>
                        <div className="rounded-lg bg-white p-2 border border-slate-100 shadow-xs">
                          <p className="text-slate-400 font-medium truncate">Income & Limit</p>
                          <p className="font-bold text-slate-900 mt-0.5">
                            {result.scoreBreakdown.income.earned} / {result.scoreBreakdown.income.max}
                          </p>
                        </div>
                        <div className="rounded-lg bg-white p-2 border border-slate-100 shadow-xs">
                          <p className="text-slate-400 font-medium truncate">Sector</p>
                          <p className="font-bold text-slate-900 mt-0.5">
                            {result.scoreBreakdown.businessType.earned} / {result.scoreBreakdown.businessType.max}
                          </p>
                        </div>
                        <div className="rounded-lg bg-white p-2 border border-slate-100 shadow-xs">
                          <p className="text-slate-400 font-medium truncate">Venture Stage</p>
                          <p className="font-bold text-slate-900 mt-0.5">
                            {result.scoreBreakdown.stage.earned} / {result.scoreBreakdown.stage.max}
                          </p>
                        </div>
                        <div className="rounded-lg bg-white p-2 border border-slate-100 shadow-xs">
                          <p className="text-slate-400 font-medium truncate">Demographics</p>
                          <p className="font-bold text-slate-900 mt-0.5">
                            {result.scoreBreakdown.demographics.earned} / {result.scoreBreakdown.demographics.max}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* EXPLAINABILITY SECTION: "Why this scheme matches" vs "Things to verify" */}
                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    {/* Left Box: Why this scheme matches */}
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4">
                      <div className="flex items-center gap-2 border-b border-emerald-100 pb-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white text-xs">
                          ✓
                        </span>
                        <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-950">
                          Why this scheme matches ({positiveReasons.length})
                        </h5>
                      </div>
                      {positiveReasons.length > 0 ? (
                        <ul className="mt-3 space-y-2">
                          {positiveReasons.map((reason, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-emerald-900">
                              <span className="mt-0.5 font-bold text-emerald-600">✓</span>
                              <span>{reason}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-3 text-xs text-slate-500 italic">
                          No direct positive matches confirmed for this profile.
                        </p>
                      )}
                    </div>

                    {/* Right Box: Things to verify & Unknowns */}
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-600 text-white text-xs">
                          •
                        </span>
                        <h5 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                          Things to verify ({verificationItems.length + needsVerification.length})
                        </h5>
                      </div>
                      <ul className="mt-3 space-y-2">
                        {/* Unknown / Missing information warnings */}
                        {needsVerification.map((warn, i) => (
                          <li key={`warn-${i}`} className="flex items-start gap-2 text-xs text-amber-800 font-medium">
                            <span className="mt-0.5 font-bold text-amber-600">⚠</span>
                            <span>{warn}</span>
                          </li>
                        ))}
                        {/* Standard verification items */}
                        {verificationItems.map((item, i) => (
                          <li key={`item-${i}`} className="flex items-start gap-2 text-xs text-slate-700">
                            <span className="mt-0.5 font-bold text-slate-400">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Key Financial Metrics Grid */}
                  <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Max Assistance
                      </p>
                      <p className="mt-1 text-sm sm:text-base font-extrabold text-brand-700">
                        {formatINR(scheme.maxAssistance)}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
                      <div className="flex items-center justify-center gap-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        <Percent className="h-3 w-3" /> Interest Rate
                      </div>
                      <p className="mt-1 text-sm sm:text-base font-extrabold text-slate-900">
                        {scheme.interestRate === 0 ? "0% (Govt Grant)" : `${formatPercent(scheme.interestRate)} p.a.`}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
                      <div className="flex items-center justify-center gap-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        <Clock className="h-3 w-3" /> Moratorium
                      </div>
                      <p className="mt-1 text-sm sm:text-base font-extrabold text-slate-900">
                        {scheme.moratoriumMonths} Months
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
                      <div className="flex items-center justify-center gap-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        <CalendarDays className="h-3 w-3" /> Max Tenure
                      </div>
                      <p className="mt-1 text-sm sm:text-base font-extrabold text-slate-900">
                        {scheme.maxTenureMonths} Months
                      </p>
                    </div>
                  </div>

                  {/* Application CTA Actions Row */}
                  <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-slate-100 pt-4">
                    <button
                      type="button"
                      onClick={() => setModalResult(result)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-brand-700 transition"
                    >
                      <span>View Details & Application Guide</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>

                    <div className="flex items-center gap-3">
                      {scheme.officialUrl ? (
                        <a
                          href={scheme.officialUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700 hover:text-brand-800 hover:underline"
                        >
                          <span>Apply on Official Portal</span>
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400">
                          Official link unavailable
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Accordion Toggle for Inline Quick Summary */}
                <button
                  type="button"
                  onClick={() => toggleExpand(scheme.id)}
                  className="flex w-full items-center justify-between border-t border-slate-100 bg-slate-50/60 px-6 py-3.5 text-xs font-bold text-slate-600 transition hover:bg-slate-100/80"
                  aria-expanded={isExpanded}
                >
                  <span>{isExpanded ? "Hide Inline Checklist" : "Show Inline Checklist & Process"}</span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-200 ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Expanded Inline Summary */}
                {isExpanded && (
                  <div className="border-t border-slate-100 bg-white p-6 sm:p-7 animate-fade-up">
                    <div className="grid gap-6 md:grid-cols-2">
                      {/* Key Highlights */}
                      <div>
                        <h5 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          Key Scheme Highlights
                        </h5>
                        <ul className="mt-3 space-y-2 text-xs text-slate-600">
                          {scheme.keyBenefits.map((benefit, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                              <span>{benefit}</span>
                            </li>
                          ))}
                        </ul>

                        {/* Application Process Steps */}
                        {scheme.applicationProcess && scheme.applicationProcess.length > 0 && (
                          <div className="mt-5">
                            <h5 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                              <ListOrdered className="h-4 w-4 text-brand-600" />
                              Application Steps
                            </h5>
                            <ol className="mt-3 space-y-2 text-xs text-slate-600">
                              {scheme.applicationProcess.map((step, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-brand-100 text-[10px] font-bold text-brand-700">
                                    {i + 1}
                                  </span>
                                  <span>{step}</span>
                                </li>
                              ))}
                            </ol>
                          </div>
                        )}
                      </div>

                      {/* Required Documents & Official Link */}
                      <div>
                        <h5 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                          <FileText className="h-4 w-4 text-brand-600" />
                          Application Checklist Documents
                        </h5>
                        <ul className="mt-3 space-y-2 text-xs text-slate-600">
                          {scheme.requiredDocuments.map((doc, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                              <span>{doc}</span>
                            </li>
                          ))}
                        </ul>

                        {/* Official Application Portal Link */}
                        <div className="mt-6 rounded-xl border border-brand-100 bg-brand-50/50 p-4">
                          <p className="text-xs font-bold text-slate-900">Official Application Guidance</p>
                          <p className="mt-0.5 text-[11px] text-slate-500">
                            {scheme.officialUrl
                              ? scheme.sourceInfo || "Verified Official Government Guidelines"
                              : "Official application link unavailable — please verify through the relevant government department/portal."}
                          </p>
                          {scheme.officialUrl ? (
                            <a
                              href={scheme.officialUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-brand-700 transition"
                            >
                              <span>Open Official Portal</span>
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      ) : (
        /* Empty State: When Search / Filter yields 0 matches */
        <Card className="p-12 text-center border-slate-200">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <SearchX className="h-7 w-7" />
          </div>
          <h4 className="mt-4 text-base font-bold text-slate-900">
            No Schemes Found Matching Filters
          </h4>
          <p className="mx-auto mt-1 max-w-sm text-xs text-slate-500">
            Try adjusting your search keyword or clearing active filters to see all evaluated welfare schemes.
          </p>
          <div className="mt-5">
            <button
              type="button"
              onClick={handleClearFilters}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-sm"
            >
              Clear All Filters
            </button>
          </div>
        </Card>
      )}

      {/* 5. MANDATORY OFFICIAL DISCLAIMER */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Official Recommendation Disclaimer
            </h5>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">
              SchemeSaathi provides an indicative recommendation based on the information provided. Final eligibility, approval and financial sanction are determined by the relevant government department or lending institution. Please verify the latest requirements on the official portal before applying.
            </p>
          </div>
        </div>
      </div>

      {/* 6. FLOATING COMPARISON BAR (Active when >= 1 scheme selected) */}
      {selectedCompareIds.length > 0 && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 w-11/12 max-w-2xl animate-fade-up">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-brand-300 bg-slate-900/95 text-white p-4 shadow-2xl backdrop-blur-md">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm">
                <Scale className="h-5 w-5" />
              </span>
              <div aria-live="polite">
                <p className="text-xs font-bold text-white">
                  {selectedCompareIds.length} of 3 Schemes Selected for Comparison
                </p>
                <p className="text-[11px] text-slate-300">
                  Compare limits, interest rates, subsidies, and documents.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedCompareIds([])}
                className="rounded-xl px-3 py-2 text-xs font-medium text-slate-300 hover:text-white transition"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => setIsCompareModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-brand-500 transition"
              >
                <span>Compare Selected ({selectedCompareIds.length})</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comparison Limit Warning Notice */}
      {compareWarning && (
        <div
          role="alert"
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 w-11/12 max-w-md rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900 shadow-lg flex items-center justify-between gap-2 animate-fade-in"
        >
          <span>{compareWarning}</span>
          <button
            type="button"
            onClick={() => setCompareWarning(null)}
            className="rounded p-1 text-amber-700 hover:bg-amber-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* 7. DEDICATED SCHEME GUIDANCE MODAL */}
      <SchemeGuidanceModal
        result={modalResult}
        onClose={() => setModalResult(null)}
      />

      {/* 8. SCHEME COMPARISON MODAL */}
      {isCompareModalOpen && (
        <SchemeComparisonModal
          selectedResults={results.filter((r) =>
            selectedCompareIds.includes(r.scheme.id)
          )}
          onClose={() => setIsCompareModalOpen(false)}
          onRemove={(id) =>
            setSelectedCompareIds((prev) => prev.filter((i) => i !== id))
          }
          onOpenGuidance={(result) => {
            setIsCompareModalOpen(false);
            setModalResult(result);
          }}
        />
      )}
    </div>
  );
}
