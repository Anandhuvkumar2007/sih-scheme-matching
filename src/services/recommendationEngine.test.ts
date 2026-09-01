// ============================================================================
// Scheme Matching Engine — Unit Tests
// Tests core business logic, rule evaluations, scoring, and safe missing-info handling.
// ============================================================================

import {
  matchScheme,
  rankSchemes,
  recommend,
} from "./recommendationEngine";
import type { Applicant, Scheme } from "../types";

// Demo test schemes for isolated testing
const TEST_SCHEME_A: Scheme = {
  id: "test-scheme-a",
  name: "Scheme Alpha (Term Loan)",
  category: "term-loan",
  description: "Test term loan scheme",
  supportedBusinessTypes: ["Food Processing", "Garments", "Retail Store"],
  incomeLimit: 500000,
  minEducation: "secondary",
  loanMin: 100000,
  loanMax: 1000000,
  interestRate: 6.0,
  moratoriumMonths: 6,
  maxTenureMonths: 60,
  marginContributionPct: 10,
  age: { min: 18, max: 60 },
  minBusinessExperience: 1,
  tags: ["term", "manufacturing"],
  documents: ["Photo ID", "Income Certificate"],
  accent: "#3e67ee",
  priority: 1,
};

const TEST_SCHEME_B: Scheme = {
  id: "test-scheme-b",
  name: "Scheme Beta (Micro Finance)",
  category: "micro-finance",
  description: "Test micro finance scheme",
  supportedBusinessTypes: ["Retail Store", "Handicrafts"],
  incomeLimit: 200000,
  minEducation: "none",
  loanMin: 10000,
  loanMax: 200000,
  interestRate: 4.0,
  moratoriumMonths: 3,
  maxTenureMonths: 36,
  marginContributionPct: 0,
  tags: ["micro"],
  documents: ["Photo ID"],
  accent: "#f59e0b",
  priority: 2,
};

const ALL_TEST_SCHEMES = [TEST_SCHEME_A, TEST_SCHEME_B];

/**
 * Lightweight assertion helper.
 */
function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion Failed: ${message}`);
  }
}

export function runAllTests(): { passed: number; failed: number; results: string[] } {
  const log: string[] = [];
  let passed = 0;
  let failed = 0;

  function test(name: string, fn: () => void) {
    try {
      fn();
      passed++;
      log.push(`[PASS] ${name}`);
    } catch (err: any) {
      failed++;
      log.push(`[FAIL] ${name}: ${err.message}`);
    }
  }

  // ==========================================================================
  // 1. STRONG MATCH
  // ==========================================================================
  test("1. Strong Match — Fully satisfies scheme requirements", () => {
    const applicant: Applicant = {
      name: "Rahul Krishnan",
      projectType: "Food Processing",
      projectCost: 500000,
      annualIncome: 150000,
      education: "higher-secondary",
      location: "Kochi",
      age: 28,
      businessExperienceYears: 2,
    };

    const result = matchScheme(TEST_SCHEME_A, applicant);

    // Verify high score & status
    assert(result.score >= 95, `Expected score >= 95, got ${result.score}`);
    assert(result.status === "eligible", `Expected status 'eligible', got ${result.status}`);
    assert(result.fullyEligible === true, `Expected fullyEligible to be true`);
    assert(result.unmetCriteria.length === 0, `Expected 0 unmet criteria, got ${result.unmetCriteria.length}`);
    assert(result.matchedCriteria.length >= 4, `Expected at least 4 matched criteria`);
    assert(result.explanation.includes("Fully eligible"), `Expected explanation to mention eligibility`);

    // Verify existing consumer contract
    assert(Array.isArray(result.reasons), `Expected reasons array`);
    assert(Array.isArray(result.eligibility), `Expected eligibility array`);
    assert(result.missingRequirements.length === 0, `Expected empty missingRequirements`);
    assert(result.scheme.id === TEST_SCHEME_A.id, `Expected matching scheme object`);
  });

  // ==========================================================================
  // 2. PARTIAL MATCH
  // ==========================================================================
  test("2. Partial Match — Meets some criteria, fails income ceiling", () => {
    const applicant: Applicant = {
      name: "Priya Sharma",
      projectType: "Food Processing",
      projectCost: 500000,
      annualIncome: 750000, // Exceeds 500,000 ceiling
      education: "higher-secondary",
      location: "Delhi",
      age: 30,
    };

    const result = matchScheme(TEST_SCHEME_A, applicant);

    // Hard gate failure means status must be ineligible
    assert(result.status === "ineligible", `Expected status 'ineligible', got ${result.status}`);
    assert(result.fullyEligible === false, `Expected fullyEligible to be false`);
    assert(result.score === 75, `Expected score 75 (projectType 35 + edu 20 + cost 20), got ${result.score}`);
    assert(result.unmetCriteria.some((c) => c.toLowerCase().includes("income")), `Expected unmet income criterion`);
    assert(result.matchedCriteria.some((c) => c.toLowerCase().includes("business type")), `Expected matched business type`);
    assert(result.missingRequirements.length > 0, `Expected missingRequirements to be populated`);
  });

  // ==========================================================================
  // 3. POOR MATCH
  // ==========================================================================
  test("3. Poor Match — Unrelated business and out of range parameters", () => {
    const applicant: Applicant = {
      name: "Amit Kumar",
      projectType: "Space Exploration",
      projectCost: 50000000, // 5 Crore
      annualIncome: 10000000, // 1 Crore
      education: "none",
      location: "Mumbai",
    };

    const result = matchScheme(TEST_SCHEME_A, applicant);

    assert(result.status === "ineligible", `Expected status 'ineligible', got ${result.status}`);
    assert(result.score === 0, `Expected score 0, got ${result.score}`);
    assert(result.fullyEligible === false, `Expected fullyEligible to be false`);
    assert(result.unmetCriteria.length >= 3, `Expected at least 3 unmet criteria, got ${result.unmetCriteria.length}`);
  });

  // ==========================================================================
  // 4. MISSING INFORMATION
  // ==========================================================================
  test("4. Missing Information — Incomplete applicant profile handled safely", () => {
    const applicant: Applicant = {
      name: "Incomplete User",
      projectType: "Retail Store",
      projectCost: 0, // Missing
      annualIncome: -1, // Missing / unprovided
      education: "" as any, // Missing
      location: "",
    };

    const result = matchScheme(TEST_SCHEME_A, applicant);

    // Engine must not crash
    assert(result !== undefined, `Result must not be undefined`);
    // Must NOT assume eligible
    assert(result.status === "potentially-eligible", `Expected 'potentially-eligible', got ${result.status}`);
    assert(result.fullyEligible === false, `Expected fullyEligible to be false`);
    // Unverified criteria must track what was missing
    assert(result.unverifiedCriteria.length >= 3, `Expected at least 3 unverified criteria`);
    // Score reflects only what was verified (projectType = 35)
    assert(result.score === 35, `Expected score 35, got ${result.score}`);
    assert(result.explanation.includes("Potentially eligible"), `Expected explanation to indicate potential eligibility`);
  });

  // ==========================================================================
  // 5. NO MATCHING SCHEMES (EMPTY INPUT)
  // ==========================================================================
  test("5. No Matching Schemes — Empty scheme list returns empty array safely", () => {
    const applicant: Applicant = {
      name: "Test User",
      projectType: "Retail Store",
      projectCost: 100000,
      annualIncome: 150000,
      education: "secondary",
      location: "Kochi",
    };

    const results = recommend(applicant, []);
    assert(Array.isArray(results), `Expected array`);
    assert(results.length === 0, `Expected empty array length 0`);
  });

  // ==========================================================================
  // 6. DETERMINISTIC RANKING & PROPERTY INTEGRITY
  // ==========================================================================
  test("6. Ranking & Properties — Deterministic order and complete contract", () => {
    const applicant: Applicant = {
      name: "Vendor",
      projectType: "Retail Store",
      projectCost: 150000,
      annualIncome: 120000,
      education: "secondary",
      location: "Thrissur",
      age: 30,
      businessExperienceYears: 2,
    };

    const results = rankSchemes(applicant, ALL_TEST_SCHEMES);

    assert(results.length === 2, `Expected 2 scored schemes`);
    assert(results[0].score <= 100 && results[0].score >= 0, `Score out of range`);
    assert(results[1].score <= 100 && results[1].score >= 0, `Score out of range`);

    // Verify all properties on both results
    for (const r of results) {
      assert(typeof r.score === "number", `score missing`);
      assert(typeof r.status === "string", `status missing`);
      assert(Array.isArray(r.matchedCriteria), `matchedCriteria missing`);
      assert(Array.isArray(r.unmetCriteria), `unmetCriteria missing`);
      assert(Array.isArray(r.unverifiedCriteria), `unverifiedCriteria missing`);
      assert(typeof r.explanation === "string", `explanation missing`);
      assert(Array.isArray(r.reasons), `reasons missing`);
      assert(Array.isArray(r.eligibility), `eligibility missing`);
      assert(Array.isArray(r.missingRequirements), `missingRequirements missing`);
      assert(typeof r.fullyEligible === "boolean", `fullyEligible missing`);
    }
  });

  return { passed, failed, results: log };
}
