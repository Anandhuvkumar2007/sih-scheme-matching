// ============================================================================
// Smart Scheme Matching — Deterministic Explainable Rules Engine
//
// This is NOT a machine-learning / LLM model. It is a transparent, rule-based
// scoring and eligibility engine:
// 1. checkEligibility(): Evaluates hard and soft eligibility rules against scheme data.
// 2. calculateMatchScore(): Computes deterministic match scores (0-100).
// 3. matchScheme(): Evaluates a single scheme against an applicant profile.
// 4. rankSchemes(): Scores, filters, and ranks all schemes deterministically.
//
// Safe handling of missing information:
// - Missing required fields are never assumed eligible.
// - Statuses: "eligible" | "potentially-eligible" | "ineligible".
// ============================================================================

import type {
  Applicant,
  EducationLevel,
  EligibilityRule,
  MatchStatus,
  ProjectCategory,
  Scheme,
} from "../types";

/** Result of scoring one scheme for an applicant. */
export interface ScoredScheme {
  scheme: Scheme;
  /** Match score 0–100. */
  score: number;
  /** Evaluated match status. */
  status: MatchStatus;
  /** Criteria successfully satisfied. */
  matchedCriteria: string[];
  /** Mandatory criteria not satisfied. */
  unmetCriteria: string[];
  /** Criteria that could not be evaluated due to missing information. */
  unverifiedCriteria: string[];
  /** Transparent explanation of the match outcome. */
  explanation: string;
  /** Human-readable reasons the applicant matches (backward-compatible). */
  reasons: string[];
  /** Every eligibility rule evaluated, each with a met flag (backward-compatible). */
  eligibility: EligibilityRule[];
  /** Required rules that failed — things the applicant still needs (backward-compatible). */
  missingRequirements: string[];
  /** True when every required rule is satisfied (backward-compatible). */
  fullyEligible: boolean;
}

/** Result of checking eligibility rules. */
export interface EligibilityEvaluation {
  status: MatchStatus;
  rules: EligibilityRule[];
  matchedCriteria: string[];
  unmetCriteria: string[];
  unverifiedCriteria: string[];
  fullyEligible: boolean;
}

const EDUCATION_ORDER: Record<EducationLevel, number> = {
  none: 0,
  primary: 1,
  "upper-primary": 2,
  secondary: 3,
  "higher-secondary": 4,
  graduate: 5,
};

/** Weights for core mandatory criteria (sum to 100). */
const REQUIRED_WEIGHTS: Record<string, number> = {
  projectType: 35,
  income: 25,
  education: 20,
  cost: 20,
};

/** Relative priority ordering for sorting by eligibility status. */
const STATUS_PRIORITY: Record<MatchStatus, number> = {
  eligible: 2,
  "potentially-eligible": 1,
  ineligible: 0,
};

/** Map a scheme's supported business types to category labels for display. */
export const CATEGORY_LABELS: Record<ProjectCategory, string> = {
  "micro-finance": "Micro Finance",
  "term-loan": "Term Loan",
  "small-business": "Small Business / Entrepreneurship",
  education: "Educational Loan",
  "skill-development": "Skill / Business Development",
};

/**
 * Evaluates explicit scheme rules against applicant data.
 * Safely handles missing/incomplete information.
 */
export function checkEligibility(scheme: Scheme, applicant: Applicant): EligibilityEvaluation {
  const rules: EligibilityRule[] = [];
  const matchedCriteria: string[] = [];
  const unmetCriteria: string[] = [];
  const unverifiedCriteria: string[] = [];

  // --- 1. Business / Project Type (Mandatory) ---
  const projectTypeProvided = Boolean(applicant.projectType && applicant.projectType.trim());
  if (!projectTypeProvided) {
    rules.push({
      label: `Business type check`,
      key: "projectType",
      required: true,
      met: false,
      detail: `Business type was not provided.`,
    });
    unverifiedCriteria.push("Business type not provided.");
  } else {
    const projectMatch = scheme.supportedBusinessTypes.some(
      (t) => t.toLowerCase() === applicant.projectType.trim().toLowerCase()
    );
    rules.push({
      label: `Business type supported: “${applicant.projectType}”`,
      key: "projectType",
      required: true,
      met: projectMatch,
      detail: projectMatch
        ? `“${applicant.projectType}” is covered by the ${scheme.name} scheme.`
        : `${scheme.name} does not list “${applicant.projectType}”.`,
    });
    if (projectMatch) {
      matchedCriteria.push(`Business type “${applicant.projectType}” is supported.`);
    } else {
      unmetCriteria.push(`Business type “${applicant.projectType}” is not covered by this scheme.`);
    }
  }

  // --- 2. Annual Income Ceiling (Mandatory) ---
  const incomeProvided = applicant.annualIncome != null && !isNaN(applicant.annualIncome) && applicant.annualIncome >= 0;
  if (scheme.incomeLimit === 0) {
    // 0 denotes no income ceiling
    rules.push({
      label: "No annual income limit",
      key: "income",
      required: true,
      met: true,
      detail: "This scheme does not enforce an upper income ceiling.",
    });
    matchedCriteria.push("Scheme has no upper income ceiling.");
  } else if (!incomeProvided) {
    rules.push({
      label: `Annual income within ₹${scheme.incomeLimit.toLocaleString("en-IN")} limit`,
      key: "income",
      required: true,
      met: false,
      detail: "Annual income was not provided for verification.",
    });
    unverifiedCriteria.push("Annual income needs verification.");
  } else {
    const incomeOk = applicant.annualIncome <= scheme.incomeLimit;
    rules.push({
      label: `Annual income within ₹${scheme.incomeLimit.toLocaleString("en-IN")} limit`,
      key: "income",
      required: true,
      met: incomeOk,
      detail: incomeOk
        ? `Your income of ₹${applicant.annualIncome.toLocaleString("en-IN")} is within the ₹${scheme.incomeLimit.toLocaleString("en-IN")} limit.`
        : `Your income of ₹${applicant.annualIncome.toLocaleString("en-IN")} exceeds the permitted ₹${scheme.incomeLimit.toLocaleString("en-IN")} ceiling.`,
    });
    if (incomeOk) {
      matchedCriteria.push("Income is within the permitted scheme ceiling.");
    } else {
      unmetCriteria.push(`Income exceeds the scheme limit of ₹${scheme.incomeLimit.toLocaleString("en-IN")}.`);
    }
  }

  // --- 3. Minimum Education Requirement (Mandatory) ---
  const applicantEduOrder = applicant.education ? EDUCATION_ORDER[applicant.education] : undefined;
  const schemeMinEduOrder = EDUCATION_ORDER[scheme.minEducation] ?? 0;

  if (applicantEduOrder == null) {
    rules.push({
      label: `Minimum education: ${scheme.minEducation.replace("-", " ")}`,
      key: "education",
      required: true,
      met: false,
      detail: "Education level was not provided for verification.",
    });
    unverifiedCriteria.push("Education level needs verification.");
  } else {
    const eduOk = applicantEduOrder >= schemeMinEduOrder;
    rules.push({
      label: `Minimum education: ${scheme.minEducation.replace("-", " ")}`,
      key: "education",
      required: true,
      met: eduOk,
      detail: eduOk
        ? `Your education level (${applicant.education.replace("-", " ")}) satisfies the minimum requirement.`
        : `Requires at least ${scheme.minEducation.replace("-", " ")} education.`,
    });
    if (eduOk) {
      matchedCriteria.push("Education meets the required level.");
    } else {
      unmetCriteria.push(`Education below the required ${scheme.minEducation.replace("-", " ")} level.`);
    }
  }

  // --- 4. Project Cost / Loan Range (Mandatory) ---
  const costProvided = applicant.projectCost != null && !isNaN(applicant.projectCost) && applicant.projectCost > 0;
  if (!costProvided) {
    rules.push({
      label: `Project cost between ₹${scheme.loanMin.toLocaleString("en-IN")} and ₹${scheme.loanMax.toLocaleString("en-IN")}`,
      key: "cost",
      required: true,
      met: false,
      detail: "Project cost was not provided.",
    });
    unverifiedCriteria.push("Project cost not provided.");
  } else {
    const costOk = applicant.projectCost >= scheme.loanMin && applicant.projectCost <= scheme.loanMax;
    rules.push({
      label: `Project cost between ₹${scheme.loanMin.toLocaleString("en-IN")} and ₹${scheme.loanMax.toLocaleString("en-IN")}`,
      key: "cost",
      required: true,
      met: costOk,
      detail: costOk
        ? `Your project cost of ₹${applicant.projectCost.toLocaleString("en-IN")} fits the permitted range.`
        : `Project cost ₹${applicant.projectCost.toLocaleString("en-IN")} is outside the allowed range (₹${scheme.loanMin.toLocaleString("en-IN")} – ₹${scheme.loanMax.toLocaleString("en-IN")}).`,
    });
    if (costOk) {
      matchedCriteria.push("Project cost is within the scheme's loanable limits.");
    } else {
      unmetCriteria.push("Project cost is outside the loanable range.");
    }
  }

  // --- 5. Age Limits (Optional / Score Booster) ---
  if (scheme.age?.min != null || scheme.age?.max != null) {
    const ageProvided = applicant.age != null && !isNaN(applicant.age);
    if (!ageProvided) {
      rules.push({
        label: `Age between ${scheme.age.min ?? "—"} and ${scheme.age.max ?? "—"}`,
        key: "age",
        required: false,
        met: true,
        detail: "Age not provided (optional criterion).",
      });
    } else {
      const age = applicant.age as number;
      const ageOk =
        (scheme.age.min == null || age >= scheme.age.min) &&
        (scheme.age.max == null || age <= scheme.age.max);
      rules.push({
        label: `Age between ${scheme.age.min ?? "—"} and ${scheme.age.max ?? "—"}`,
        key: "age",
        required: false,
        met: ageOk,
        detail: ageOk
          ? `Age (${age}) is within the preferred range.`
          : `Age (${age}) is outside the preferred range.`,
      });
      if (ageOk) {
        matchedCriteria.push("Age is within the preferred bracket.");
      }
    }
  }

  // --- 6. Business Experience (Optional / Score Booster) ---
  if (scheme.minBusinessExperience != null) {
    const expProvided = applicant.businessExperienceYears != null && !isNaN(applicant.businessExperienceYears);
    if (!expProvided) {
      rules.push({
        label: `Experience of ${scheme.minBusinessExperience}+ years`,
        key: "experience",
        required: false,
        met: false,
        detail: "Experience not provided (optional criterion).",
      });
    } else {
      const exp = applicant.businessExperienceYears as number;
      const expOk = exp >= scheme.minBusinessExperience;
      rules.push({
        label: `Experience of ${scheme.minBusinessExperience}+ years`,
        key: "experience",
        required: false,
        met: expOk,
        detail: expOk
          ? `Your ${exp} year(s) of experience qualify for priority consideration.`
          : `Has ${exp} year(s), preferred ${scheme.minBusinessExperience}+ years.`,
      });
      if (expOk) {
        matchedCriteria.push(`Experience of ${exp} year(s) meets preferred requirement.`);
      }
    }
  }

  // --- Determine Match Status ---
  const hasHardGateFailure = unmetCriteria.length > 0;
  const hasUnverifiedRequirements = unverifiedCriteria.length > 0;

  let status: MatchStatus;
  if (hasHardGateFailure) {
    status = "ineligible";
  } else if (hasUnverifiedRequirements) {
    status = "potentially-eligible";
  } else {
    status = "eligible";
  }

  const fullyEligible = status === "eligible";

  return {
    status,
    rules,
    matchedCriteria,
    unmetCriteria,
    unverifiedCriteria,
    fullyEligible,
  };
}

/**
 * Calculates a transparent, deterministic match score (0–100).
 * The score reflects degree of alignment with explicit criteria.
 */
export function calculateMatchScore(
  scheme: Scheme,
  applicant: Applicant,
  evaluation: EligibilityEvaluation
): number {
  const requiredRules = evaluation.rules.filter((r) => r.required);
  const totalWeight =
    requiredRules.reduce((sum, r) => sum + (REQUIRED_WEIGHTS[r.key] ?? 0), 0) || 100;

  const earnedWeight = requiredRules.reduce(
    (sum, r) => sum + (r.met ? REQUIRED_WEIGHTS[r.key] ?? 0 : 0),
    0
  );

  let score = Math.round((earnedWeight / totalWeight) * 100);

  // Soft/Bonus rule adjustments for fully eligible candidates
  if (evaluation.status === "eligible") {
    let bonus = 0;
    if (
      scheme.age?.min != null || scheme.age?.max != null
    ) {
      if (applicant.age != null && !isNaN(applicant.age)) {
        const age = applicant.age;
        if (
          (scheme.age.min == null || age >= scheme.age.min) &&
          (scheme.age.max == null || age <= scheme.age.max)
        ) {
          bonus += 5;
        }
      }
    }

    if (scheme.minBusinessExperience != null) {
      if (
        applicant.businessExperienceYears != null &&
        applicant.businessExperienceYears >= scheme.minBusinessExperience
      ) {
        bonus += 5;
      }
    }

    score = Math.min(100, score + bonus);
  }

  return score;
}

/**
 * Evaluates a single scheme against an applicant profile.
 */
export function matchScheme(scheme: Scheme, applicant: Applicant): ScoredScheme {
  const evalResult = checkEligibility(scheme, applicant);
  const score = calculateMatchScore(scheme, applicant, evalResult);

  // Build transparent explanation
  let explanation: string;
  if (evalResult.status === "eligible") {
    explanation = `Fully eligible: Satisfies all mandatory criteria for ${scheme.name}.`;
  } else if (evalResult.status === "potentially-eligible") {
    explanation = `Potentially eligible: Meets known requirements, but requires additional verification for: ${evalResult.unverifiedCriteria.join(", ")}`;
  } else {
    explanation = `Not eligible: Does not satisfy scheme requirements (${evalResult.unmetCriteria.join(" · ")}).`;
  }

  return {
    scheme,
    score,
    status: evalResult.status,
    matchedCriteria: evalResult.matchedCriteria,
    unmetCriteria: evalResult.unmetCriteria,
    unverifiedCriteria: evalResult.unverifiedCriteria,
    explanation,
    // Backward-compatible properties for existing consumers:
    reasons: evalResult.matchedCriteria,
    eligibility: evalResult.rules,
    missingRequirements: evalResult.unmetCriteria,
    fullyEligible: evalResult.fullyEligible,
  };
}

/**
 * Alias for matchScheme for backward compatibility.
 */
export function scoreScheme(scheme: Scheme, applicant: Applicant): ScoredScheme {
  return matchScheme(scheme, applicant);
}

/**
 * Evaluates and ranks all schemes deterministically.
 * Does NOT mutate the input schemes array.
 */
export function rankSchemes(applicant: Applicant, schemes: Scheme[]): ScoredScheme[] {
  return [...schemes]
    .map((scheme) => matchScheme(scheme, applicant))
    .sort(
      (a, b) =>
        STATUS_PRIORITY[b.status] - STATUS_PRIORITY[a.status] ||
        b.score - a.score ||
        (a.scheme.priority ?? 100) - (b.scheme.priority ?? 100) ||
        a.scheme.name.localeCompare(b.scheme.name)
    );
}

/**
 * Main public entrypoint: recommends ranked schemes for an applicant.
 */
export function recommend(applicant: Applicant, schemes: Scheme[]): ScoredScheme[] {
  return rankSchemes(applicant, schemes);
}

