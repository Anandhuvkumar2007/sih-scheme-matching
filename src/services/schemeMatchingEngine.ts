// ============================================================================
// Scheme Matching & Eligibility Engine — Robust Two-Tier Evaluator
//
// Tier 1: Hard Eligibility Verification (Flags disqualifications for verified bounds).
// Tier 2: Multi-Factor Compatibility Scoring (Calculates match percentage).
// Tier 3: Unknown / Missing Information Handling (Tags "Needs Verification").
// Tier 4: Honest Status Assignment & Prioritized Ranking.
// ============================================================================

import type {
  SchemeRecommenderProfile,
  DemoScheme,
  ScoredSchemeResult,
  RecommendationStrength,
  SchemeEligibilityStatus,
} from "../types";

/**
 * Evaluates a single scheme against the entrepreneur's questionnaire profile
 * with strict separation between Hard Eligibility and Match Scoring.
 */
export function matchScheme(
  profile: SchemeRecommenderProfile,
  scheme: DemoScheme
): ScoredSchemeResult {
  const matchedCriteria: string[] = [];
  const unmatchedCriteria: string[] = [];
  const needsVerification: string[] = [];
  const positiveReasons: string[] = [];
  const verificationItems: string[] = [];

  let isDisqualified = false;
  const hardViolations: string[] = [];

  // Safe fallbacks to prevent crashes on sparse profile data
  const age = profile.age || 0;
  const state = profile.state || "";
  const gender = profile.gender || "";
  const socialCategory = profile.socialCategory || "";
  const occupation = profile.occupation || "";
  const businessType = profile.businessType || "";
  const businessStage = profile.businessStage || "";
  const annualIncome = profile.annualIncome ?? 0;
  const disabilityStatus = profile.disabilityStatus || "None / Not Applicable";
  const requiredAssistance = profile.requiredFinancialAssistance || 0;

  // ==========================================================================
  // TIER 1: HARD ELIGIBILITY CHECKS (Disqualifiers on Verified Data)
  // ==========================================================================

  // 1. Hard Age Check
  const minAge = scheme.minAge ?? 18;
  const maxAge = scheme.maxAge ?? 70;
  if (age > 0) {
    if (age < minAge || age > maxAge) {
      isDisqualified = true;
      hardViolations.push(`Age ${age} is outside mandatory range (${minAge}–${maxAge} years).`);
    }
  } else {
    needsVerification.push(`Age information unavailable (Scheme requires ${minAge}–${maxAge} years).`);
  }

  // 2. Hard Income Ceiling Check
  const incomeCeiling = scheme.incomeCeiling ?? 0;
  if (incomeCeiling > 0) {
    if (annualIncome > 0) {
      if (annualIncome > incomeCeiling) {
        isDisqualified = true;
        hardViolations.push(
          `Annual income ₹${annualIncome.toLocaleString("en-IN")} exceeds verified ceiling of ₹${incomeCeiling.toLocaleString("en-IN")}.`
        );
      }
    } else {
      needsVerification.push(
        `Income details unavailable (Scheme has income ceiling of ₹${incomeCeiling.toLocaleString("en-IN")}).`
      );
    }
  }

  // 3. Hard State / Geographic Jurisdiction Check
  const states = scheme.eligibleStates || ["All States & UTs"];
  const isAllIndia = states.includes("All States & UTs");
  if (!isAllIndia && state) {
    const isStateEligible = states.some((st) => st.toLowerCase() === state.toLowerCase());
    if (!isStateEligible) {
      isDisqualified = true;
      hardViolations.push(`Scheme is exclusively notified for ${states.join(", ")}, not ${state}.`);
    }
  } else if (!state) {
    needsVerification.push("State of operation not specified.");
  }

  // 4. Hard Social Category Exclusivity Check
  const categoryList = scheme.eligibleSocialCategories || [];
  const isOpenToAllCategories =
    categoryList.length >= 4 || categoryList.includes("General / Other");

  if (!isOpenToAllCategories && socialCategory) {
    const hasCategory = categoryList.some(
      (c) => c.toLowerCase() === socialCategory.toLowerCase()
    );
    if (!hasCategory) {
      isDisqualified = true;
      hardViolations.push(
        `Scheme is restricted to ${categoryList.join(" / ")} beneficiaries (applicant is ${socialCategory}).`
      );
    }
  } else if (!socialCategory) {
    needsVerification.push("Social category certificate verification required.");
  }

  // 5. Hard Gender Exclusivity Check
  const genders = scheme.eligibleGenders || [];
  const isAllGenders = genders.length >= 3 || genders.includes("Male");
  if (!isAllGenders && gender) {
    const hasGender = genders.some((g) => g.toLowerCase() === gender.toLowerCase());
    if (!hasGender) {
      isDisqualified = true;
      hardViolations.push(`Scheme is exclusively for ${genders.join(" / ")} entrepreneurs.`);
    }
  } else if (!gender) {
    needsVerification.push("Gender-specific concession eligibility needs verification.");
  }

  // ==========================================================================
  // TIER 2: COMPATIBILITY SCORING (For Potential & Eligible Matches)
  // ==========================================================================
  let score = 0;

  // Criterion 1: Social Category (25 pts)
  if (socialCategory) {
    const hasCategory = categoryList.some(
      (c) => c.toLowerCase() === socialCategory.toLowerCase()
    );
    if (hasCategory) {
      score += 25;
      matchedCriteria.push(`Social Category: ${socialCategory}`);
      positiveReasons.push(`Your social category (${socialCategory}) matches target beneficiary guidelines.`);
    } else if (isOpenToAllCategories) {
      score += 20;
      matchedCriteria.push(`Social Category: Open to all groups`);
      positiveReasons.push(`This scheme is open to entrepreneurs across all social groups.`);
    } else {
      unmatchedCriteria.push(`Social Category: Scheme prioritizes ${categoryList.join(" / ")}`);
    }
  }

  // Criterion 2: Financial Assistance Range (20 pts)
  const minAssistance = scheme.minAssistance ?? 0;
  const maxAssistance = scheme.maxAssistance;
  if (requiredAssistance > 0) {
    if (requiredAssistance >= minAssistance && requiredAssistance <= maxAssistance) {
      score += 20;
      matchedCriteria.push(
        `Financial Assistance: Within bounds (₹${minAssistance.toLocaleString("en-IN")} – ₹${maxAssistance.toLocaleString("en-IN")})`
      );
      positiveReasons.push(
        `Requested assistance (₹${requiredAssistance.toLocaleString("en-IN")}) fits within scheme limits (up to ₹${maxAssistance.toLocaleString("en-IN")}).`
      );
    } else if (requiredAssistance <= maxAssistance * 1.25) {
      score += 10;
      unmatchedCriteria.push(
        `Financial Assistance: Requested ₹${requiredAssistance.toLocaleString("en-IN")} is near the ceiling of ₹${maxAssistance.toLocaleString("en-IN")}`
      );
      verificationItems.push(`Project cost review: Requested ₹${requiredAssistance.toLocaleString("en-IN")} is close to maximum assistance limit.`);
    } else if (requiredAssistance > maxAssistance) {
      unmatchedCriteria.push(
        `Financial Assistance: Requested amount exceeds scheme maximum of ₹${maxAssistance.toLocaleString("en-IN")}`
      );
      verificationItems.push(`Assistance cap: Requested amount exceeds the scheme's limit of ₹${maxAssistance.toLocaleString("en-IN")}.`);
    } else {
      unmatchedCriteria.push(
        `Financial Assistance: Below minimum loan threshold of ₹${minAssistance.toLocaleString("en-IN")}`
      );
      verificationItems.push(`Minimum unit cost: Scheme requires a minimum project cost of ₹${minAssistance.toLocaleString("en-IN")}.`);
    }
  } else {
    needsVerification.push(`Project assistance requirement not specified (Scheme covers up to ₹${maxAssistance.toLocaleString("en-IN")}).`);
  }

  // Criterion 3: Business Sector (15 pts)
  const businessTypes = scheme.eligibleBusinessTypes || [];
  if (businessType) {
    const hasBusinessType = businessTypes.some(
      (bt) => bt.toLowerCase() === businessType.toLowerCase() || bt === "Other Micro Enterprise"
    );
    if (hasBusinessType) {
      score += 15;
      matchedCriteria.push(`Business Sector: ${businessType}`);
      positiveReasons.push(`Your enterprise sector (${businessType}) is supported.`);
    } else {
      score += 5;
      unmatchedCriteria.push(`Business Sector: “${businessType}” is not specifically prioritized`);
      verificationItems.push(`Activity approval: Verify if “${businessType}” is eligible under local guidelines.`);
    }
  } else {
    needsVerification.push("Enterprise sector not specified.");
  }

  // Criterion 4: Annual Income (15 pts)
  if (incomeCeiling === 0) {
    score += 15;
    matchedCriteria.push("Annual Income: No income ceiling restriction");
    positiveReasons.push("There is no upper family income limit for this scheme.");
  } else if (annualIncome > 0 && annualIncome <= incomeCeiling) {
    score += 15;
    matchedCriteria.push(`Annual Income: Within ₹${incomeCeiling.toLocaleString("en-IN")} ceiling`);
    positiveReasons.push(`Your annual income (₹${annualIncome.toLocaleString("en-IN")}) is within the ₹${incomeCeiling.toLocaleString("en-IN")} limit.`);
  } else if (annualIncome > incomeCeiling) {
    unmatchedCriteria.push(`Annual Income: Exceeds ceiling of ₹${incomeCeiling.toLocaleString("en-IN")}`);
  }

  // Criterion 5: Business Stage (10 pts)
  const stages = scheme.eligibleBusinessStages || [];
  if (businessStage) {
    const hasStage = stages.some((s) => s.toLowerCase() === businessStage.toLowerCase());
    if (hasStage) {
      score += 10;
      matchedCriteria.push(`Business Stage: ${businessStage}`);
      positiveReasons.push(`Your venture stage (${businessStage}) is supported.`);
    } else {
      unmatchedCriteria.push(`Business Stage: Scheme is designated for ${stages.join(" / ")}`);
      verificationItems.push(`Venture stage check: Scheme is specifically tailored for ${stages.join(" / ")}.`);
    }
  } else {
    needsVerification.push("Business stage (Idea vs Existing) not specified.");
  }

  // Criterion 6: Gender Compatibility (5 pts)
  if (gender) {
    const hasGender = genders.some((g) => g.toLowerCase() === gender.toLowerCase());
    if (hasGender) {
      score += 5;
      matchedCriteria.push(`Gender: ${gender}`);
      if (gender === "Female" && (scheme.name.includes("Mahila") || scheme.subsidyPct)) {
        positiveReasons.push("Special concessions and interest rebates apply for women entrepreneurs.");
      }
    }
  }

  // Criterion 7: Age Eligibility (5 pts)
  if (age >= minAge && age <= maxAge) {
    score += 5;
    matchedCriteria.push(`Age: ${age} years (Permitted range: ${minAge}–${maxAge})`);
    positiveReasons.push(`Your age (${age} years) is within the eligible range (${minAge}–${maxAge} years).`);
  }

  // Criterion 8: State Scope (5 pts)
  if (isAllIndia || (state && states.some((st) => st.toLowerCase() === state.toLowerCase()))) {
    score += 5;
    matchedCriteria.push(isAllIndia ? `Geographic Scope: Pan-India (${state})` : `State: ${state}`);
    if (state) {
      positiveReasons.push(`Your state (${state}) is covered under the scheme's operating jurisdiction.`);
    }
  }

  // Criterion 9: Special Disability Bonus (+5 pts)
  const hasDisability = disabilityStatus && disabilityStatus !== "None / Not Applicable";
  if (hasDisability && (scheme.disabilityFriendly || scheme.id.includes("divyangjan") || scheme.id.includes("nhfdc"))) {
    score += 5;
    matchedCriteria.push("Disability Status: Divyangjan concessional provisions apply");
    positiveReasons.push("Special Divyangjan concessional provisions, interest rebate, and assistive support apply.");
  }

  // Criterion 10: Occupation Trade Match (+3 pts)
  const occupations = scheme.eligibleOccupations || [];
  if (occupation && occupations.some((o) => o.toLowerCase() === occupation.toLowerCase())) {
    score += 3;
    matchedCriteria.push(`Occupation: Supported trade (${occupation})`);
    positiveReasons.push(`Your occupation (${occupation}) aligns with priority trades.`);
  }

  // Standard official verification items
  verificationItems.push("Required documents (Aadhaar, Caste Certificate, Project Quotation) must be verified.");
  verificationItems.push("Final eligibility and loan sanction are subject to official channel partner assessment.");

  // ==========================================================================
  // TIER 3: HARD DISQUALIFICATION & STATUS ASSIGNMENT
  // ==========================================================================
  let finalScore = Math.min(100, Math.max(0, Math.round(score)));
  let eligibilityStatus: SchemeEligibilityStatus = "Potential Match";
  let strength: RecommendationStrength = "Good Match";

  if (isDisqualified) {
    // Penalize score strictly so failed schemes NEVER appear as Strong Matches
    finalScore = Math.min(25, Math.round(score * 0.25));
    eligibilityStatus = "Not a Match";
    strength = "Low Match";

    // Prepend hard violation reasons
    hardViolations.forEach((hv) => {
      unmatchedCriteria.unshift(`Disqualifying Condition: ${hv}`);
      verificationItems.unshift(`⚠ Ineligible: ${hv}`);
    });
  } else if (needsVerification.length >= 3) {
    // Sparse / missing profile inputs
    eligibilityStatus = "Needs Verification";
    strength = finalScore >= 60 ? "Potential Match" : "Low Match";
  } else if (finalScore >= 75 && unmatchedCriteria.length === 0) {
    eligibilityStatus = "Eligible Based on Provided Information";
    strength = "Strong Match";
  } else if (finalScore >= 55) {
    eligibilityStatus = "Potential Match";
    strength = finalScore >= 75 ? "Strong Match" : "Good Match";
  } else if (finalScore >= 35) {
    eligibilityStatus = "Potential Match";
    strength = "Potential Match";
  } else {
    eligibilityStatus = "Needs Verification";
    strength = "Low Match";
  }

  // Generate plain-language explanation summary
  let explanation = "";
  if (isDisqualified) {
    explanation = `Does not satisfy core mandatory eligibility criteria: ${hardViolations[0]}`;
  } else if (eligibilityStatus === "Eligible Based on Provided Information") {
    explanation = `Strong compatibility across your ${socialCategory || "demographic"} profile, ${businessType || "enterprise"} sector, and requested financial support.`;
  } else if (eligibilityStatus === "Potential Match") {
    explanation = `Promising match with viable funding terms for your ₹${requiredAssistance.toLocaleString("en-IN")} project.`;
  } else if (eligibilityStatus === "Needs Verification") {
    explanation = `Partial evaluation. Key eligibility parameters (e.g., documents or category verification) need official review.`;
  } else {
    explanation = `Limited compatibility with this scheme's target guidelines.`;
  }

  return {
    scheme,
    score: finalScore,
    strength,
    eligibilityStatus,
    matchedCriteria,
    unmatchedCriteria,
    needsVerification,
    positiveReasons,
    verificationItems,
    explanation,
  };
}

/**
 * Runs the Scheme Matching & Eligibility Engine across all schemes and
 * returns them ranked:
 * 1. Eligible schemes with highest scores first.
 * 2. Potential matches.
 * 3. Schemes needing verification.
 * 4. Disqualified "Not a Match" schemes strictly at the bottom.
 */
export function matchSchemes(
  profile: SchemeRecommenderProfile,
  schemes: DemoScheme[]
): ScoredSchemeResult[] {
  if (!schemes || schemes.length === 0) return [];

  const STATUS_PRIORITY: Record<SchemeEligibilityStatus, number> = {
    "Eligible Based on Provided Information": 4,
    "Potential Match": 3,
    "Needs Verification": 2,
    "Not a Match": 1,
  };

  return schemes
    .map((scheme) => matchScheme(profile, scheme))
    .sort((a, b) => {
      // 1. Primary sort: Eligibility Status Priority
      const priorityDiff = STATUS_PRIORITY[b.eligibilityStatus] - STATUS_PRIORITY[a.eligibilityStatus];
      if (priorityDiff !== 0) {
        return priorityDiff;
      }
      // 2. Secondary sort: Compatibility Score descending
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      // 3. Tertiary sort: Higher subsidy first
      const subB = b.scheme.subsidyPct ?? 0;
      const subA = a.scheme.subsidyPct ?? 0;
      if (subB !== subA) {
        return subB - subA;
      }
      // 4. Quaternary sort: Lower interest rate first
      return a.scheme.interestRate - b.scheme.interestRate;
    });
}
