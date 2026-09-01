// ============================================================================
// Smart Scheme Matching — explainable rules engine
//
// This is NOT a machine-learning model. It is a transparent, rule-based
// scoring engine: every factor an applicant has filled in is checked against
// each scheme's eligibility rules, a match percentage is computed, and the
// exact reasons are returned so the applicant can see WHY a scheme was
// recommended. Rules are plain data + a small scoring function, so they are
// easy to read and modify.
// ============================================================================

import type { Applicant, EducationLevel, EligibilityRule, ProjectCategory, Scheme } from "../types";

/** Result of scoring one scheme for an applicant. */
export interface ScoredScheme {
  scheme: Scheme;
  /** Match score 0–100. */
  score: number;
  /** Human-readable reasons the applicant (partially) matches. */
  reasons: string[];
  /** Every eligibility rule evaluated, each with a met flag. */
  eligibility: EligibilityRule[];
  /** Required rules that failed — things the applicant still needs. */
  missingRequirements: string[];
  /** True when every required rule is satisfied (a confident match). */
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

/** Map a scheme's supported business types to category labels for display. */
export const CATEGORY_LABELS: Record<ProjectCategory, string> = {
  "micro-finance": "Micro Finance",
  "term-loan": "Term Loan",
  "small-business": "Small Business / Entrepreneurship",
  education: "Educational Loan",
  "skill-development": "Skill / Business Development",
};

/** Score a single scheme against an applicant. */
export function scoreScheme(scheme: Scheme, applicant: Applicant): ScoredScheme {
  const eligibility: EligibilityRule[] = [];
  const reasons: string[] = [];
  const missing: string[] = [];

  // --- Project type must be supported by the scheme (REQUIRED, weight 35) ---
  const projectMatch = scheme.supportedBusinessTypes.some(
    (t) => t.toLowerCase() === applicant.projectType.trim().toLowerCase()
  );
  eligibility.push({
    label: `Business type supported: “${applicant.projectType}”`,
    key: "projectType",
    required: true,
    met: projectMatch,
    detail: projectMatch
      ? `“${applicant.projectType}” is covered by the ${scheme.name} scheme.`
      : `${scheme.name} does not list “${applicant.projectType}”.`,
  });
  if (projectMatch) reasons.push(`Your business type “${applicant.projectType}” is supported.`);
  else missing.push(`Business type not supported by this scheme.`);

  // --- Annual income must be within the scheme's ceiling (REQUIRED, weight 25)
  const incomeOk = scheme.incomeLimit === 0 || applicant.annualIncome <= scheme.incomeLimit;
  eligibility.push({
    label: `Annual income within ₹${scheme.incomeLimit.toLocaleString("en-IN")} limit`,
    key: "income",
    required: true,
    met: incomeOk,
    detail: incomeOk
      ? `Your income of ₹${applicant.annualIncome.toLocaleString("en-IN")} is within the limit.`
      : `Income exceeds the permitted ceiling.`,
  });
  if (incomeOk) reasons.push("Your income is within the scheme's eligibility ceiling.");
  else missing.push("Annual income exceeds the scheme limit.");

  // --- Education requirement (REQUIRED, weight 20) ---
  const eduOk = EDUCATION_ORDER[applicant.education] >= EDUCATION_ORDER[scheme.minEducation];
  eligibility.push({
    label: `Minimum education: ${scheme.minEducation.replace("-", " ")}`,
    key: "education",
    required: true,
    met: eduOk,
    detail: eduOk
      ? `Your education level satisfies the requirement.`
      : `This scheme needs at least ${scheme.minEducation.replace("-", " ")} education.`,
  });
  if (eduOk) reasons.push("Your education meets the required level.");
  else missing.push(`Education below the required ${scheme.minEducation} level.`);

  // --- Project cost must be within the loanable range (REQUIRED, weight 20) ---
  const costOk = applicant.projectCost >= scheme.loanMin && applicant.projectCost <= scheme.loanMax;
  eligibility.push({
    label: `Project cost between ₹${scheme.loanMin.toLocaleString("en-IN")} and ₹${scheme.loanMax.toLocaleString("en-IN")}`,
    key: "cost",
    required: true,
    met: costOk,
    detail: costOk
      ? `Your estimated cost of ₹${applicant.projectCost.toLocaleString("en-IN")} is within the permitted range.`
      : `Project cost is outside this scheme's loanable range.`,
  });
  if (costOk) reasons.push("Your project cost fits within the scheme's loan range.");
  else missing.push("Project cost outside the scheme's loanable range.");

  // --- Age (BONUS — not required) ---
  if (scheme.age?.min != null || scheme.age?.max != null) {
    const age = applicant.age ?? null;
    const ageOk = age == null || ((scheme.age.min == null || age >= scheme.age.min) && (scheme.age.max == null || age <= scheme.age.max));
    eligibility.push({
      label: `Age between ${scheme.age.min ?? "—"} and ${scheme.age.max ?? "—"}`,
      key: "age",
      required: false,
      met: ageOk,
      detail: age == null ? "Age not provided (optional)." : ageOk ? "Age in range." : "Age outside the preferred range.",
    });
    if (age != null && ageOk) reasons.push("Your age is in the preferred range.");
  }

  // --- Business experience (BONUS) ---
  if (scheme.minBusinessExperience != null) {
    const exp = applicant.businessExperienceYears ?? null;
    const expOk = exp == null || exp >= scheme.minBusinessExperience;
    eligibility.push({
      label: `Track record of ${scheme.minBusinessExperience}+ years`,
      key: "experience",
      required: false,
      met: expOk,
      detail: exp == null ? "Experience not provided (optional)." : expOk ? "Experience requirement met." : "Below preferred experience.",
    });
    if (exp != null && expOk) reasons.push(`Your ${exp} year(s) of experience qualify you.`);
  }

  // --- Compute the score ---
  // Required rules carry the bulk of the points; each adds to a total of 100.
  const REQUIRED_WEIGHTS: Record<string, number> = {
    projectType: 35,
    income: 25,
    education: 20,
    cost: 20,
  };
  const requiredRules = eligibility.filter((r) => r.required);
  const totalWeight = requiredRules.reduce((sum, r) => sum + (REQUIRED_WEIGHTS[r.key] ?? 0), 0) || 1;
  const earnedWeight = requiredRules.reduce(
    (sum, r) => sum + (r.met ? REQUIRED_WEIGHTS[r.key] ?? 0 : 0),
    0
  );
  let score = Math.round((earnedWeight / totalWeight) * 100);

  // Bonus for meeting soft rules when the core is fully eligible.
  const coreEligible = requiredRules.every((r) => r.met);
  const bonusMet = eligibility.filter((r) => !r.required).filter((r) => r.met).length;
  if (coreEligible && bonusMet > 0) {
    score = Math.min(100, score + bonusMet * 5);
  }

  const fullyEligible = coreEligible && score >= 100;

  return { scheme, score, reasons, eligibility, missingRequirements: missing, fullyEligible };
}

/**
 * Recommend the best scheme(s). Returns every scheme scored and sorted by
 * score (highest first) so the UI can show both the top pick and alternatives.
 */
export function recommend(applicant: Applicant, schemes: Scheme[]): ScoredScheme[] {
  return schemes
    .map((scheme) => scoreScheme(scheme, applicant))
    .sort(
      (a, b) =>
        (b.fullyEligible ? 1 : 0) - (a.fullyEligible ? 1 : 0) ||
        b.score - a.score ||
        (a.scheme.priority ?? 100) - (b.scheme.priority ?? 100) ||
        a.scheme.name.localeCompare(b.scheme.name)
    );
}
