// ============================================================================
// EMI / loan calculation
// Uses the standard reducing-balance (amortization) formula and handles:
//   - 0% interest rate
//   - different tenures
//   - moratorium periods (interest accrues and capitalizes into the principal)
// This is a pure function: same inputs always produce the same output.
// ============================================================================

import type { LoanCalculation } from "../types";

export interface EmiInput {
  principal: number;
  annualRate: number; // annual interest rate in %
  tenureMonths: number; // repayment period in months (after moratorium)
  moratoriumMonths?: number; // months before repayment begins
}

/**
 * Compute the full loan breakdown.
 *
 * Standard reducing-balance EMI formula:
 *   EMI = P * r * (1 + r)^n / ((1 + r)^n - 1)
 * where r is the monthly interest rate (annual / 12 / 100) and n is tenure
 * in months.
 *
 * During the moratorium, interest accrues on the outstanding principal. That
 * accrued interest is added (capitalized) to the principal before the EMI is
 * computed, so the borrower effectively pays interest on the capitalized
 * amount.
 */
export function calculateLoan(input: EmiInput): LoanCalculation {
  const { principal, annualRate, tenureMonths, moratoriumMonths = 0 } = input;

  const monthlyRate = annualRate > 0 ? annualRate / 12 / 100 : 0;
  const n = Math.max(1, tenureMonths);

  // Capitalize any interest accrued during the moratorium.
  let capitalizedPrincipal = principal;
  if (moratoriumMonths > 0 && monthlyRate > 0) {
    // Simple compounding of monthly interest during the moratorium.
    capitalizedPrincipal = principal * Math.pow(1 + monthlyRate, moratoriumMonths);
  }

  // EMI — guard against divide-by-zero / degenerate cases.
  let emi: number;
  if (monthlyRate === 0) {
    emi = capitalizedPrincipal / n;
  } else {
    const factor = Math.pow(1 + monthlyRate, n);
    emi = (capitalizedPrincipal * monthlyRate * factor) / (factor - 1);
  }

  const totalRepayment = emi * n;
  const totalInterest = totalRepayment - principal;

  return {
    principal,
    downPayment: 0,
    annualRate,
    tenureMonths,
    moratoriumMonths,
    emi,
    totalRepayment,
    totalInterest,
    monthlyBurdenPct: 0, // filled in by the caller which knows the income
    capitalizedPrincipal,
  };
}

/**
 * Attach the "monthly burden" percentage — what fraction of the borrower's
 * monthly income the EMI consumes. Requires an annual income figure.
 */
export function withIncomeBurden(
  calc: LoanCalculation,
  annualIncome: number
): LoanCalculation {
  const monthlyIncome = annualIncome > 0 ? annualIncome / 12 : 0;
  const burden = monthlyIncome > 0 ? (calc.emi / monthlyIncome) * 100 : 0;
  return { ...calc, monthlyBurdenPct: burden };
}
