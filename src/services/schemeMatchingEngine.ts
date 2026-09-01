// ============================================================================
// SchemeSaathi — Deterministic Scheme Matching & Eligibility Engine
//
// Tier 1: Hard Eligibility Gate (Binary disqualifiers on verified criteria).
// Tier 2: Importance-Weighted Multi-Factor Compatibility (Normalized 100 pts).
// Tier 3: Explicit Unknown & Missing Data Segregation (0 pts awarded for unknown).
// Tier 4: Transparent Score Breakdown & Explainable Reasoning.
// ============================================================================

import type {
  SchemeRecommenderProfile,
  DemoScheme,
  ScoredSchemeResult,
  RecommendationStrength,
  SchemeEligibilityStatus,
  ScoreBreakdown,
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
  const unknownCriteria: string[] = [];
  const needsVerification: string[] = [];
  const positiveReasons: string[] = [];
  const verificationItems: string[] = [];

  let isDisqualified = false;
  const hardViolations: string[] = [];

  // Extract profile inputs safely
  const age = profile.age || 0;
  const state = (profile.state || "").trim();
  const gender = (profile.gender || "").trim();
  const socialCategory = (profile.socialCategory || "").trim();
  const occupation = (profile.occupation || "").trim();
  const businessType = (profile.businessType || "").trim();
  const businessStage = (profile.businessStage || "").trim();
  const annualIncome = profile.annualIncome ?? 0;
  const disabilityStatus = (profile.disabilityStatus || "None / Not Applicable").trim();
  const requiredAssistance = profile.requiredFinancialAssistance || 0;

  // Track unknown/missing profile fields explicitly
  if (age <= 0) {
    unknownCriteria.push("Age not specified (Scheme min/max age rules apply).");
  }
  if (!state) {
    unknownCriteria.push("State of operation not specified.");
  }
  if (!gender) {
    unknownCriteria.push("Gender not specified.");
  }
  if (!socialCategory) {
    unknownCriteria.push("Social category certificate verification required.");
  }
  if (!occupation) {
    unknownCriteria.push("Primary occupation / trade not specified.");
  }
  if (!businessType) {
    unknownCriteria.push("Enterprise sector / business type not specified.");
  }
  if (!businessStage) {
    unknownCriteria.push("Venture stage (Idea vs Existing) not specified.");
  }
  if (annualIncome <= 0) {
    unknownCriteria.push("Annual family income not specified.");
  }
  if (requiredAssistance <= 0) {
    unknownCriteria.push("Required financial assistance amount not specified.");
  }

  // ==========================================================================
  // TIER 1: HARD ELIGIBILITY CHECKS (Disqualifying Rules on Verified Data)
  // ==========================================================================

  // 1. Hard Age Limits Check
  const minAge = scheme.minAge ?? 18;
  const maxAge = scheme.maxAge ?? 70;
  if (age > 0) {
    if (age < minAge || age > maxAge) {
      isDisqualified = true;
      hardViolations.push(
        `Age ${age} is outside the mandatory eligible range of ${minAge}–${maxAge} years.`
      );
    }
  }

  // 2. Hard Income Ceiling Check
  const incomeCeiling = scheme.incomeCeiling ?? 0;
  if (incomeCeiling > 0 && annualIncome > 0) {
    if (annualIncome > incomeCeiling) {
      isDisqualified = true;
      hardViolations.push(
        `Annual family income (₹${annualIncome.toLocaleString("en-IN")}) exceeds the verified ceiling of ₹${incomeCeiling.toLocaleString("en-IN")}.`
      );
    }
  }

  // 3. Hard State / Geographic Jurisdiction Check
  const states = scheme.eligibleStates || ["All States & UTs"];
  const isAllIndia =
    states.includes("All States & UTs") || states.includes("All India") || states.length === 0;
  if (!isAllIndia && state) {
    const isStateEligible = states.some((st) => st.toLowerCase() === state.toLowerCase());
    if (!isStateEligible) {
      isDisqualified = true;
      hardViolations.push(
        `Scheme is specifically notified only for ${states.join(", ")}, not for ${state}.`
      );
    }
  }

  // 4. Hard Social Category Exclusivity Check
  const categoryList = scheme.eligibleSocialCategories || [];
  const isOpenToAllCategories =
    categoryList.length >= 4 ||
    categoryList.includes("General / Other") ||
    categoryList.length === 0;

  if (!isOpenToAllCategories && socialCategory) {
    const hasCategory = categoryList.some(
      (c) => c.toLowerCase() === socialCategory.toLowerCase()
    );
    if (!hasCategory) {
      isDisqualified = true;
      hardViolations.push(
        `Scheme is exclusively restricted to ${categoryList.join(" / ")} beneficiaries (Applicant is ${socialCategory}).`
      );
    }
  }

  // 5. Hard Gender Exclusivity Check
  const genders = scheme.eligibleGenders || [];
  const isAllGenders =
    genders.length >= 3 || genders.includes("Male") || genders.length === 0;
  if (!isAllGenders && gender) {
    const hasGender = genders.some((g) => g.toLowerCase() === gender.toLowerCase());
    if (!hasGender) {
      isDisqualified = true;
      hardViolations.push(
        `Scheme is exclusively for ${genders.join(" / ")} entrepreneurs (Applicant is ${gender}).`
      );
    }
  }

  // ==========================================================================
  // TIER 2: NORMALIZED IMPORTANCE-WEIGHTED SCORING (100 Point Scale)
  // ==========================================================================

  // --- Dimension 1: State Scope & Jurisdiction (Max: 20 pts) ---
  let stateEarned = 0;
  if (isDisqualified && !isAllIndia && state && !states.some((s) => s.toLowerCase() === state.toLowerCase())) {
    stateEarned = 0;
    unmatchedCriteria.push(`State: Not covered (${state})`);
  } else if (state) {
    if (isAllIndia) {
      stateEarned = 20;
      matchedCriteria.push(`State Jurisdiction: Pan-India Coverage (${state})`);
      positiveReasons.push(`Your state (${state}) is covered under the pan-India scheme guidelines.`);
    } else if (states.some((st) => st.toLowerCase() === state.toLowerCase())) {
      stateEarned = 20;
      matchedCriteria.push(`State Jurisdiction: Specific Notified State (${state})`);
      positiveReasons.push(`Your state (${state}) is an officially notified target state for this scheme.`);
    }
  } else {
    stateEarned = 0;
  }

  // --- Dimension 2: Occupation & Target Trade (Max: 20 pts) ---
  let occEarned = 0;
  const eligibleOccs = scheme.eligibleOccupations || [];
  if (occupation) {
    const isExactOcc = eligibleOccs.some(
      (o) => o.toLowerCase() === occupation.toLowerCase()
    );
    if (isExactOcc) {
      occEarned = 20;
      matchedCriteria.push(`Target Occupation: Priority Trade (${occupation})`);
      positiveReasons.push(`Your primary occupation (${occupation}) is a designated priority trade under this scheme.`);
    } else if (eligibleOccs.includes("Other") || eligibleOccs.length === 0) {
      occEarned = 14;
      matchedCriteria.push(`Target Occupation: Broad Eligibility (${occupation})`);
      positiveReasons.push(`Your occupation (${occupation}) is eligible under broad micro-enterprise provisions.`);
    } else {
      occEarned = 6;
      unmatchedCriteria.push(`Target Occupation: Scheme focuses on ${eligibleOccs.slice(0, 2).join(", ")}`);
      verificationItems.push(`Trade suitability: Verify whether ${occupation} can be processed through local nodal agencies.`);
    }
  } else {
    occEarned = 0;
  }

  // --- Dimension 3: Income & Financial Feasibility (Max: 20 pts) ---
  let incomeEarned = 0;
  // Sub-component 3a: Income Cap (10 pts)
  if (incomeCeiling === 0 && annualIncome > 0) {
    incomeEarned += 10;
    matchedCriteria.push("Income Criterion: No upper family income ceiling");
    positiveReasons.push("There is no upper family income barrier for this scheme.");
  } else if (annualIncome > 0 && annualIncome <= incomeCeiling) {
    incomeEarned += 10;
    matchedCriteria.push(`Income Criterion: Within ₹${incomeCeiling.toLocaleString("en-IN")} ceiling`);
    positiveReasons.push(`Your family income (₹${annualIncome.toLocaleString("en-IN")}) is within the scheme ceiling of ₹${incomeCeiling.toLocaleString("en-IN")}.`);
  } else if (annualIncome > incomeCeiling) {
    incomeEarned += 0;
    unmatchedCriteria.push(`Income Criterion: Exceeds ₹${incomeCeiling.toLocaleString("en-IN")} ceiling`);
  }

  // Sub-component 3b: Assistance Limits (10 pts)
  const minAssistance = scheme.minAssistance ?? 0;
  const maxAssistance = scheme.maxAssistance;
  if (requiredAssistance > 0) {
    if (requiredAssistance >= minAssistance && requiredAssistance <= maxAssistance) {
      incomeEarned += 10;
      matchedCriteria.push(
        `Assistance Fit: ₹${requiredAssistance.toLocaleString("en-IN")} is within ₹${minAssistance.toLocaleString("en-IN")}–₹${maxAssistance.toLocaleString("en-IN")}`
      );
      positiveReasons.push(
        `Requested assistance (₹${requiredAssistance.toLocaleString("en-IN")}) fits within the sanctioned range (up to ₹${maxAssistance.toLocaleString("en-IN")}).`
      );
    } else if (requiredAssistance <= maxAssistance * 1.25) {
      incomeEarned += 5;
      unmatchedCriteria.push(
        `Assistance Fit: Requested ₹${requiredAssistance.toLocaleString("en-IN")} is near ceiling of ₹${maxAssistance.toLocaleString("en-IN")}`
      );
      verificationItems.push(`Project cost review: Requested amount is close to the upper ceiling of ₹${maxAssistance.toLocaleString("en-IN")}.`);
    } else if (requiredAssistance > maxAssistance) {
      incomeEarned += 2;
      unmatchedCriteria.push(
        `Assistance Fit: Requested amount exceeds scheme cap of ₹${maxAssistance.toLocaleString("en-IN")}`
      );
      verificationItems.push(`Assistance cap: Scheme limit is capped at ₹${maxAssistance.toLocaleString("en-IN")}.`);
    } else {
      incomeEarned += 2;
      unmatchedCriteria.push(
        `Assistance Fit: Below minimum threshold of ₹${minAssistance.toLocaleString("en-IN")}`
      );
    }
  }

  // --- Dimension 4: Business Sector & Enterprise Type (Max: 15 pts) ---
  let bTypeEarned = 0;
  const eligibleBTypes = scheme.eligibleBusinessTypes || [];
  if (businessType) {
    const isExactBType = eligibleBTypes.some(
      (bt) => bt.toLowerCase() === businessType.toLowerCase() || bt === "Other Micro Enterprise"
    );
    if (isExactBType) {
      bTypeEarned = 15;
      matchedCriteria.push(`Enterprise Sector: Supported (${businessType})`);
      positiveReasons.push(`Your enterprise sector (${businessType}) is actively supported with credit lines.`);
    } else {
      bTypeEarned = 5;
      unmatchedCriteria.push(`Enterprise Sector: “${businessType}” is not specifically prioritized`);
      verificationItems.push(`Sector check: Confirm with lending bank whether “${businessType}” qualifies under standard activity codes.`);
    }
  } else {
    bTypeEarned = 0;
  }

  // --- Dimension 5: Venture Stage (Max: 15 pts) ---
  let stageEarned = 0;
  const eligibleStages = scheme.eligibleBusinessStages || [];
  if (businessStage) {
    const hasStage = eligibleStages.some(
      (s) => s.toLowerCase() === businessStage.toLowerCase()
    );
    if (hasStage) {
      stageEarned = 15;
      matchedCriteria.push(`Venture Stage: Supported (${businessStage})`);
      positiveReasons.push(`Your venture stage (${businessStage}) is supported with dedicated term credit or expansion capital.`);
    } else {
      stageEarned = 3;
      unmatchedCriteria.push(`Venture Stage: Scheme targets ${eligibleStages.join(" / ")}`);
      verificationItems.push(`Venture stage check: Scheme is specifically tailored for ${eligibleStages.join(" / ")}.`);
    }
  } else {
    stageEarned = 0;
  }

  // --- Dimension 6: Demographics & Special Concessions (Max: 10 pts) ---
  let demoEarned = 0;
  if (socialCategory) {
    const hasCat = categoryList.some(
      (c) => c.toLowerCase() === socialCategory.toLowerCase()
    );
    if (hasCat) {
      demoEarned += 4;
      matchedCriteria.push(`Social Category: Targeted Group (${socialCategory})`);
      positiveReasons.push(`Your social category (${socialCategory}) matches target beneficiary guidelines.`);
    } else if (isOpenToAllCategories) {
      demoEarned += 3;
      matchedCriteria.push("Social Category: Open to all groups");
    } else {
      unmatchedCriteria.push(`Social Category: Prioritizes ${categoryList.join(" / ")}`);
    }
  }

  if (gender) {
    const hasGen = genders.some((g) => g.toLowerCase() === gender.toLowerCase());
    if (hasGen) {
      demoEarned += 3;
      if (gender === "Female" && (scheme.name.includes("Mahila") || scheme.subsidyPct)) {
        positiveReasons.push("Special concessions and interest rebates apply for women entrepreneurs.");
      }
    }
  }

  if (age >= minAge && age <= maxAge) {
    demoEarned += 2;
  }
  const hasDisability = disabilityStatus && disabilityStatus !== "None / Not Applicable";
  if (hasDisability && (scheme.disabilityFriendly || scheme.id.includes("divyangjan") || scheme.id.includes("nhfdc"))) {
    demoEarned += 1;
    matchedCriteria.push("Disability Support: Divyangjan concessional provisions apply");
    positiveReasons.push("Special Divyangjan interest rebate and assistive financing terms apply.");
  }
  demoEarned = Math.min(10, demoEarned);

  // Standard verification items
  verificationItems.push("Identity & Address Proof (Aadhaar / Voter ID) must be verified.");
  verificationItems.push("Final sanction and terms are subject to lending bank appraisal.");

  // ==========================================================================
  // TIER 3: SCORE AGGREGATION & BREAKDOWN
  // ==========================================================================
  const rawTotal = stateEarned + occEarned + incomeEarned + bTypeEarned + stageEarned + demoEarned;
  let finalScore = Math.min(100, Math.max(0, Math.round(rawTotal)));

  const scoreBreakdown: ScoreBreakdown = {
    state: { earned: stateEarned, max: 20, label: "State Scope" },
    occupation: { earned: occEarned, max: 20, label: "Occupation & Trade" },
    income: { earned: incomeEarned, max: 20, label: "Income & Financial Feasibility" },
    businessType: { earned: bTypeEarned, max: 15, label: "Enterprise Sector" },
    stage: { earned: stageEarned, max: 15, label: "Venture Stage" },
    demographics: { earned: demoEarned, max: 10, label: "Demographics & Concessions" },
    total: { earned: finalScore, max: 100 },
  };

  let eligibilityStatus: SchemeEligibilityStatus = "Potential Match";
  let strength: RecommendationStrength = "Good Match";

  if (isDisqualified) {
    // Hard-ineligible schemes NEVER appear as Strong or Good Match
    finalScore = Math.min(20, Math.round(finalScore * 0.2));
    scoreBreakdown.total.earned = finalScore;
    eligibilityStatus = "Not a Match";
    strength = "Low Match";

    hardViolations.forEach((hv) => {
      unmatchedCriteria.unshift(`Disqualifying Condition: ${hv}`);
      verificationItems.unshift(`⚠ Ineligible: ${hv}`);
    });
  } else if (unknownCriteria.length >= 3) {
    eligibilityStatus = "Needs Verification";
    strength = finalScore >= 60 ? "Potential Match" : "Low Match";
    needsVerification.push(...unknownCriteria);
  } else if (finalScore >= 80 && unmatchedCriteria.length === 0) {
    eligibilityStatus = "Eligible Based on Provided Information";
    strength = "Strong Match";
  } else if (finalScore >= 60) {
    eligibilityStatus = "Potential Match";
    strength = "Good Match";
  } else if (finalScore >= 40) {
    eligibilityStatus = "Potential Match";
    strength = "Potential Match";
  } else {
    eligibilityStatus = "Needs Verification";
    strength = "Low Match";
  }

  // Explanation generation based strictly on computed results
  let explanation = "";
  if (isDisqualified) {
    explanation = `Ineligible: ${hardViolations[0]}`;
  } else if (eligibilityStatus === "Eligible Based on Provided Information") {
    explanation = `Strong compatibility (${finalScore}/100) across state coverage, priority trade (${occupation || "sector"}), and financial limit requirements.`;
  } else if (eligibilityStatus === "Potential Match") {
    explanation = `Viable opportunity (${finalScore}/100) with favorable funding terms for your ₹${requiredAssistance.toLocaleString("en-IN")} enterprise.`;
  } else if (eligibilityStatus === "Needs Verification") {
    explanation = `Evaluation pending. Key parameters (${unknownCriteria.length} unconfirmed fields) need verification before applying.`;
  } else {
    explanation = `Limited compatibility (${finalScore}/100) with this scheme's target eligibility guidelines.`;
  }

  return {
    scheme,
    score: finalScore,
    strength,
    eligibilityStatus,
    matchedCriteria,
    unmatchedCriteria,
    unknownCriteria,
    needsVerification,
    positiveReasons,
    verificationItems,
    scoreBreakdown,
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
      const priorityDiff =
        STATUS_PRIORITY[b.eligibilityStatus] - STATUS_PRIORITY[a.eligibilityStatus];
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
