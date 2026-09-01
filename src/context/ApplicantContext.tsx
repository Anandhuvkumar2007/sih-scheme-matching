// ============================================================================
// ApplicantContext — holds the applicant's profile and the computed
// recommendation results, shared across routes (Apply page writes it, Results
// page reads it). Persisted to localStorage so /results survives a refresh.
//
// This acts as the "data layer" between the form, the rules engine, and the
// results dashboard. It is intentionally independent of the UI, so swapping
// the rules engine for a real API later is a small change: replace
// `recommend(...)` with a fetch call inside `submitApplicant`.
// ============================================================================

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { recommend, type ScoredScheme } from "../services/recommendationEngine";
import { SCHEMES } from "../data/schemes";
import { useLocalStorage } from "../hooks/useLocalStorage";
import type { Applicant } from "../types";

export interface FlowState {
  applicant: Applicant | null;
  /** Every scheme scored for this applicant, sorted best-first. */
  results: ScoredScheme[] | null;
}

interface ApplicantContextValue {
  state: FlowState;
  /** Compute and store a recommendation for an applicant. */
  submitApplicant: (applicant: Applicant) => ScoredScheme[];
  /** Reset the whole flow (used by "Start over"). */
  reset: () => void;
}

const ApplicantContext = createContext<ApplicantContextValue | null>(null);

const EMPTY: FlowState = { applicant: null, results: null };

export function ApplicantProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useLocalStorage<FlowState>("schemesaathi.flow", EMPTY);

  const value = useMemo<ApplicantContextValue>(() => ({
    state,
    submitApplicant: (applicant: Applicant) => {
      // Run the rules engine. To use a real backend later, replace these two
      // lines with: const res = await api.recommend(applicant); setState(...);
      const results = recommend(applicant, SCHEMES);
      setState({ applicant, results });
      return results;
    },
    reset: () => setState(EMPTY),
  }), [state, setState]);

  return (
    <ApplicantContext.Provider value={value}>{children}</ApplicantContext.Provider>
  );
}

export function useApplicant(): ApplicantContextValue {
  const ctx = useContext(ApplicantContext);
  if (!ctx) throw new Error("useApplicant must be used within an ApplicantProvider");
  return ctx;
}
