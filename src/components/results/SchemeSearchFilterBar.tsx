import { Search, X, ArrowUpDown, SlidersHorizontal } from "lucide-react";

export interface FilterState {
  searchQuery: string;
  selectedState: string;
  selectedCategory: string;
  selectedOccupation: string;
  selectedBusinessStage: string;
  selectedAssistanceType: string;
  selectedStrength: string;
  sortBy: "best" | "score" | "alphabetical";
}

interface Props {
  filters: FilterState;
  onFilterChange: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  onClearFilters: () => void;
  totalResults: number;
  filteredCount: number;
  availableStates: string[];
  availableCategories: string[];
  availableOccupations: string[];
  availableAssistanceTypes: string[];
}

export function SchemeSearchFilterBar({
  filters,
  onFilterChange,
  onClearFilters,
  totalResults,
  filteredCount,
  availableStates,
  availableCategories,
  availableOccupations,
  availableAssistanceTypes,
}: Props) {
  const hasActiveFilters =
    filters.searchQuery !== "" ||
    filters.selectedState !== "all" ||
    filters.selectedCategory !== "all" ||
    filters.selectedOccupation !== "all" ||
    filters.selectedBusinessStage !== "all" ||
    filters.selectedAssistanceType !== "all" ||
    filters.selectedStrength !== "all" ||
    filters.sortBy !== "best";

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      {/* Search Input & Sort Row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => onFilterChange("searchQuery", e.target.value)}
            placeholder="Search schemes by name, ministry, category, trade, or beneficiaries..."
            aria-label="Search schemes"
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-10 text-xs text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
          {filters.searchQuery && (
            <button
              type="button"
              onClick={() => onFilterChange("searchQuery", "")}
              aria-label="Clear search input"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:text-slate-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2">
          <label htmlFor="scheme-sort-select" className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
            <ArrowUpDown className="h-3.5 w-3.5" />
            <span>Sort:</span>
          </label>
          <select
            id="scheme-sort-select"
            value={filters.sortBy}
            onChange={(e) =>
              onFilterChange(
                "sortBy",
                e.target.value as "best" | "score" | "alphabetical"
              )
            }
            className="rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-medium text-slate-700 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="best">Best Match (Recommended)</option>
            <option value="score">Highest Match Score</option>
            <option value="alphabetical">Alphabetical (A → Z)</option>
          </select>
        </div>
      </div>

      {/* Filter Selectors Grid */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6 pt-1">
        {/* Filter 1: State */}
        <div>
          <label htmlFor="filter-state-select" className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            State Scope
          </label>
          <select
            id="filter-state-select"
            value={filters.selectedState}
            onChange={(e) => onFilterChange("selectedState", e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-2.5 py-1.5 text-xs text-slate-700 focus:border-brand-500 focus:bg-white focus:outline-none"
          >
            <option value="all">All States & UTs</option>
            {availableStates.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>

        {/* Filter 2: Scheme Category */}
        <div>
          <label htmlFor="filter-category-select" className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Category
          </label>
          <select
            id="filter-category-select"
            value={filters.selectedCategory}
            onChange={(e) => onFilterChange("selectedCategory", e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-2.5 py-1.5 text-xs text-slate-700 focus:border-brand-500 focus:bg-white focus:outline-none"
          >
            <option value="all">All Categories</option>
            {availableCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Filter 3: Occupation */}
        <div>
          <label htmlFor="filter-occupation-select" className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Occupation
          </label>
          <select
            id="filter-occupation-select"
            value={filters.selectedOccupation}
            onChange={(e) => onFilterChange("selectedOccupation", e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-2.5 py-1.5 text-xs text-slate-700 focus:border-brand-500 focus:bg-white focus:outline-none"
          >
            <option value="all">All Occupations</option>
            {availableOccupations.map((occ) => (
              <option key={occ} value={occ}>
                {occ}
              </option>
            ))}
          </select>
        </div>

        {/* Filter 4: Business Stage */}
        <div>
          <label htmlFor="filter-stage-select" className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Stage
          </label>
          <select
            id="filter-stage-select"
            value={filters.selectedBusinessStage}
            onChange={(e) => onFilterChange("selectedBusinessStage", e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-2.5 py-1.5 text-xs text-slate-700 focus:border-brand-500 focus:bg-white focus:outline-none"
          >
            <option value="all">All Stages</option>
            <option value="Idea / New Venture">Idea / New Venture</option>
            <option value="Existing Business">Existing Business</option>
          </select>
        </div>

        {/* Filter 5: Assistance Type */}
        <div>
          <label htmlFor="filter-assistance-select" className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Assistance Type
          </label>
          <select
            id="filter-assistance-select"
            value={filters.selectedAssistanceType}
            onChange={(e) => onFilterChange("selectedAssistanceType", e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-2.5 py-1.5 text-xs text-slate-700 focus:border-brand-500 focus:bg-white focus:outline-none"
          >
            <option value="all">All Types</option>
            {availableAssistanceTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Filter 6: Match Strength */}
        <div>
          <label htmlFor="filter-strength-select" className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Match Strength
          </label>
          <select
            id="filter-strength-select"
            value={filters.selectedStrength}
            onChange={(e) => onFilterChange("selectedStrength", e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-2.5 py-1.5 text-xs text-slate-700 focus:border-brand-500 focus:bg-white focus:outline-none"
          >
            <option value="all">All Strengths</option>
            <option value="Strong Match">Strong Match (80%+)</option>
            <option value="Good Match">Good Match (60-79%)</option>
            <option value="Potential Match">Potential Match (40-59%)</option>
            <option value="Low Match">Low Match (&lt;40%)</option>
          </select>
        </div>
      </div>

      {/* Results Count & Active Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 text-xs">
        <div className="flex items-center gap-2 text-slate-600">
          <SlidersHorizontal className="h-3.5 w-3.5 text-brand-600" />
          <span>
            Showing <strong className="text-slate-900">{filteredCount}</strong> of{" "}
            <strong>{totalResults}</strong> evaluated schemes
          </span>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="inline-flex items-center gap-1 font-semibold text-brand-700 hover:text-brand-800 hover:underline"
          >
            <X className="h-3.5 w-3.5" />
            <span>Clear all filters</span>
          </button>
        )}
      </div>
    </div>
  );
}
