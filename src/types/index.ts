// ============================================================================
// SchemeSaathi — Shared TypeScript types
// Single source of truth for every shape used across the app.
// ============================================================================

/** The language/locale the UI is displayed in. */
export type Language = "en" | "ml" | "hi";

/** Broad project / business categories a scheme can support. */
export type ProjectCategory =
  | "micro-finance"
  | "term-loan"
  | "small-business"
  | "education"
  | "skill-development";

/** Minimum education requirement expressed as a comparable level. */
export type EducationLevel =
  | "none"
  | "primary"
  | "upper-primary"
  | "secondary"
  | "higher-secondary"
  | "graduate";

/** Types of channel partners that can process applications. */
export type PartnerType =
  | "State Channelizing Agency"
  | "Public Sector Bank"
  | "Regional Rural Bank"
  | "NBFC-MFI";

/** Business stage applicability for a scheme. */
export type BusinessStage = "ideation" | "startup" | "expansion" | "any";

/** Gender eligibility restriction. */
export type GenderEligibility = "all" | "female" | "transgender" | "male";

/** Structured Age Criteria. */
export interface AgeCriteria {
  min?: number;
  max?: number;
}

/** Structured Income Criteria. */
export interface IncomeCriteria {
  /** Maximum annual income permitted in ₹. 0 = no income ceiling. */
  maxAnnualIncome: number;
  /** Whether the income ceiling applies to total family income. */
  isFamilyIncome?: boolean;
  /** Human-readable explanation of income rules. */
  description?: string;
}

/** Detailed structured financial benefits provided by a scheme. */
export interface SchemeBenefits {
  loanMin: number;
  loanMax: number;
  interestRate: number;
  moratoriumMonths: number;
  maxTenureMonths: number;
  marginContributionPct: number;
  /** Subsidy or capital grant percentage, if applicable. */
  subsidyPct?: number;
  /** Subsidy maximum ceiling in ₹. */
  maxSubsidyAmount?: number;
  /** Description of additional financial benefits or interest subventions. */
  description?: string;
}

/** Deterministic rule criteria used by the recommendation/matching engine. */
export interface SchemeEligibilityCriteria {
  minEducation?: EducationLevel;
  incomeLimit?: number;
  age?: AgeCriteria;
  gender?: GenderEligibility[];
  socialCategories?: string[];
  eligibleStates?: string[];
  eligibleOccupations?: string[];
  businessStages?: BusinessStage[];
  disabilityEligibleOnly?: boolean;
  minBusinessExperienceYears?: number;
  specialConditions?: string[];
}

/** A single explainable rule used to score a scheme against an applicant. */
export interface EligibilityRule {
  /** Human-readable description of the rule. */
  label: string;
  /** Short machine key so the UI can tag it (e.g. "income", "cost"). */
  key: string;
  /** Whether this rule is required (hard gate) or just a score booster. */
  required: boolean;
  /** Whether this rule is currently satisfied by the applicant. */
  met: boolean;
  /** Optional message explaining why it passed/failed. */
  detail?: string;
}

/**
 * A welfare credit or government scheme offered on the platform.
 * Contains both rich structured fields for the matching engine/database
 * and legacy properties for backwards compatibility with existing UI.
 */
export interface Scheme {
  id: string;
  /** Scheme title / display name. */
  name: string;
  /** Alias for scheme title. */
  schemeName?: string;
  /** Sponsoring Ministry, Department, or Government Corporation. */
  ministry?: string;
  /** Category of the scheme. */
  category: ProjectCategory;
  /** Full description of the scheme's purpose. */
  description: string;
  /** Target demographic/beneficiaries (e.g. "SC Entrepreneurs", "Women Artisans"). */
  targetBeneficiaries?: string[];
  /** State applicability: list of states or "All India". */
  stateApplicability?: string[] | "All India";
  /** Structured age limits. */
  ageCriteria?: AgeCriteria;
  /** Structured income limits. */
  incomeCriteria?: IncomeCriteria;
  /** Applicable business stages (ideation, startup, expansion, etc.). */
  businessStage?: BusinessStage[] | "any";
  /** Structured financial benefits and terms. */
  benefits?: SchemeBenefits;
  /** Required documents for applying. */
  requiredDocuments?: string[];
  /** Official government portal URL. */
  officialWebsite?: string;
  /** Direct link to application form or portal. */
  applicationUrl?: string;
  /** Declarative rules for the deterministic matching engine. */
  eligibilityCriteria?: SchemeEligibilityCriteria;

  // --- Data Safety & Transparency Flags ---
  /** Flag identifying demo/sample data vs official government records. */
  isDemo?: boolean;
  /** Explicit verification status notice or disclaimer. */
  dataNotice?: string;

  // --- Properties for existing UI, services, and recommendation engine ---
  /** The supported business/project types (EN label list). */
  supportedBusinessTypes: string[];
  /** Maximum annual family income allowed (₹). 0 = no cap. */
  incomeLimit: number;
  /** Minimum education level required. */
  minEducation: EducationLevel;
  /** Allowed loan range in ₹. */
  loanMin: number;
  loanMax: number;
  /** Annual interest rate as a percentage. */
  interestRate: number;
  /** Moratorium period in months (no repayment, interest accrues). */
  moratoriumMonths: number;
  /** Maximum repayment period in months. */
  maxTenureMonths: number;
  /** Whether an own contribution (down payment) is required and its %. */
  marginContributionPct: number;
  /** Optional age eligibility, e.g. { min: 18, max: 65 }. */
  age?: { min?: number; max?: number };
  /** Business experience (years) required, if any. */
  minBusinessExperience?: number;
  /** List of search tags that typically match this scheme. */
  tags: string[];
  /** Documents required to apply. */
  documents: string[];
  /** Distinct accent color used in the UI (tailwind-safe hex). */
  accent: string;
  /** Preferred display/ranking order for tie-breaking equal matches (lower = higher). */
  priority?: number;
}

/** An applicant's submitted profile. */
export interface Applicant {
  name: string;
  projectType: string;
  projectCost: number;
  /** Annual income in ₹. */
  annualIncome: number;
  education: EducationLevel;
  location: string;
  /** Optional extra fields — used as score boosters, never hard gates. */
  age?: number | null;
  category?: string | null;
  businessExperienceYears?: number | null;
  /** ID of the demo profile that prefilled this form, if any. */
  demoProfileId?: string | null;
}

/** Result of the recommendation engine for one scheme + applicant. */
export interface Recommendation {
  scheme: Scheme;
  /** Match score as a percentage (0–100). */
  score: number;
  /** Human-readable reasons the applicant matches. */
  reasons: string[];
  /** Eligibility rules evaluated, each with a met flag. */
  eligibility: EligibilityRule[];
  /** Bare requirements the applicant did not satisfy (hard gates failed). */
  missingRequirements: string[];
}

/** A financial channel partner that can process applications. */
export interface ChannelPartner {
  id: string;
  name: string;
  type: PartnerType;
  /** Friendly location name. */
  location: string;
  /** Simulated x/y position (0–100) on the mock map. */
  lat: number;
  lng: number;
  /** Distance from the demo applicant's location in km. */
  distanceKm: number;
  /** Scheme categories this partner is able to process. */
  supportedCategories: ProjectCategory[];
  /** Processing capability status label + flag. */
  processingStatus: "High capacity" | "Moderate capacity" | "Low capacity";
  /** NPA / overdue risk indicator for display. */
  npaRisk: "Low" | "Medium" | "High";
  /** Contact phone number (fictional). */
  phone: string;
  /** Whether this partner can process a given category (derived). */
}

/** A single EMI / loan calculation breakdown. */
export interface LoanCalculation {
  principal: number;
  /** Down payment / own contribution in ₹. */
  downPayment: number;
  /** Annual interest rate %. */
  annualRate: number;
  /** Repayment tenure in months (after moratorium). */
  tenureMonths: number;
  /** Moratorium months (interest accrues). */
  moratoriumMonths: number;
  /** Monthly EMI in ₹. */
  emi: number;
  /** Total amount repaid including principal & interest. */
  totalRepayment: number;
  /** Total interest paid over the loan life. */
  totalInterest: number;
  /** EMI as a share of the applicant's monthly income. */
  monthlyBurdenPct: number;
  /** Principal amount that is capitalized after moratorium. */
  capitalizedPrincipal: number;
}

/** A demo applicant profile used by the "Try Demo" button. */
export interface DemoProfile {
  id: string;
  name: string;
  /** Short label, e.g. "First-time entrepreneur". */
  label: string;
  applicant: Applicant;
}

/** FAQ entry. */
export interface FaqItem {
  question: string;
  answer: string;
}

/** A toast notification shown to the user. */
export interface ToastMessage {
  id: string;
  type: "success" | "info" | "error";
  title: string;
  message?: string;
}
