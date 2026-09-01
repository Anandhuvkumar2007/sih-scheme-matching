import type { Applicant, Language, Scheme } from "./index";
import type { ScoredScheme } from "../services/recommendationEngine";

/**
 * Grounded context provided to the in-house AI assistance engine.
 * Directly references the application's single sources of truth.
 */
export interface AIAssistantContext {
  /** The applicant's profile from the questionnaire (if completed or selected from demo) */
  applicant?: Applicant | null;
  /** Currently focused or top recommended scheme */
  activeScheme?: Scheme | null;
  /** Full list of scored scheme results from the deterministic recommendation engine */
  results?: ScoredScheme[] | null;
  /** Active interface language ('en' | 'ml' | 'hi') */
  language?: Language;
}

/**
 * Request payload sent to the in-house AI assistant.
 */
export interface AIAssistantRequest {
  /** The user's typed question or query */
  query: string;
  /** Grounding context from current application state */
  context?: AIAssistantContext;
}

/**
 * Structured response produced by the in-house grounded AI assistant.
 */
export interface AIAssistantResponse {
  /** Grounded explanation in Markdown format */
  text: string;
  /** Optional contextual navigation or action button */
  action?: {
    label: string;
    to: string;
  };
  /** Source attribution confirming deterministic data grounding */
  source: "grounded-engine" | "rule";
  /** The specific verified scheme referenced in the answer, if applicable */
  relevantScheme?: Scheme;
}
