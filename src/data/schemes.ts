// ============================================================================
// Scheme data — SAMPLE DATA FOR DEMONSTRATION.
//
// These are fictional welfare credit schemes created for the hackathon demo.
// They do NOT represent any real government scheme and do NOT imply actual
// government eligibility. Final eligibility is determined by the relevant
// authority / channel partner.
//
// To add or edit a scheme, simply add/edit an object here. The recommendation
// engine reads this file, so changes take effect immediately.
// ============================================================================

import type { Scheme } from "../types";

export const SCHEMES: Scheme[] = [
  {
    id: "term-loan-udyam",
    name: "Udyam Term Loan Yojana",
    category: "term-loan",
    description:
      "A term loan for capital investment — machinery, equipment, and expansion of an existing or new production unit.",
    supportedBusinessTypes: [
      "Small food-processing business",
      "Agricultural processing",
      "Transport services",
      "Machinery & equipment",
      "Workshop & fabrication",
      "Grocery wholesale",
    ],
    incomeLimit: 500000,
    minEducation: "secondary",
    loanMin: 100000,
    loanMax: 2000000,
    interestRate: 6.5,
    moratoriumMonths: 6,
    maxTenureMonths: 84,
    marginContributionPct: 10,
    age: { min: 18, max: 65 },
    tags: ["capital", "machinery", "expansion", "term"],
    documents: [
      "Photo ID (Aadhaar / Voter ID)",
      "Caste / community certificate",
      "Income certificate",
      "Project / business proposal",
      "Bank statements (6 months)",
      "Quotation for machinery/equipment",
    ],
    accent: "#3e67ee",
    priority: 1,
  },
  {
    id: "small-business-sahayog",
    name: "Sahayog Small Business Loan",
    category: "small-business",
    description:
      "Working capital and start-up finance for small shops, stalls, and micro services — ideal for first-time entrepreneurs.",
    supportedBusinessTypes: [
      "Small food-processing business",
      "Retail / kirana store",
      "Beauty & wellness",
      "Tailoring / garments",
      "Handicrafts",
      "Catering & tiffin service",
      "Bakery",
    ],
    incomeLimit: 400000,
    minEducation: "primary",
    loanMin: 50000,
    loanMax: 1500000,
    interestRate: 5.5,
    moratoriumMonths: 4,
    maxTenureMonths: 72,
    marginContributionPct: 5,
    age: { min: 18, max: 60 },
    minBusinessExperience: 1,
    tags: ["startup", "working-capital", "retail", "first-time"],
    documents: [
      "Photo ID (Aadhaar / Voter ID)",
      "Caste / community certificate",
      "Income certificate",
      "Business plan",
      "Proof of business (if existing)",
    ],
    accent: "#10b981",
    priority: 2,
  },
  {
    id: "micro-finance-swavalamban",
    name: "Swavalamban Micro Finance Scheme",
    category: "micro-finance",
    description:
      "Small, low-cost loans for income-generation activities — a starting point for self-employment and tiny enterprises.",
    supportedBusinessTypes: [
      "Retail / kirana store",
      "Tailoring / garments",
      "Handicrafts",
      "Poultry & dairy",
      "Beauty & wellness",
      "Small trading",
      "Vegetable vending",
    ],
    incomeLimit: 200000,
    minEducation: "none",
    loanMin: 10000,
    loanMax: 300000,
    interestRate: 4.0,
    moratoriumMonths: 3,
    maxTenureMonths: 60,
    marginContributionPct: 0,
    age: { min: 18, max: 65 },
    tags: ["micro", "self-employment", "low-income", "tiny"],
    documents: [
      "Photo ID (Aadhaar / Voter ID)",
      "Caste / community certificate",
      "Income certificate",
      "Simple project idea",
    ],
    accent: "#f59e0b",
    priority: 4,
  },
  {
    id: "education-vidya",
    name: "Vidya Educational Loan",
    category: "education",
    description:
      "Financial support for higher education, professional courses, and skill certifications for eligible students.",
    supportedBusinessTypes: [
      "Higher education",
      "Professional courses",
      "Technical / vocational education",
      "Skill certification",
    ],
    incomeLimit: 800000,
    minEducation: "higher-secondary",
    loanMin: 50000,
    loanMax: 1000000,
    interestRate: 5.0,
    moratoriumMonths: 12,
    maxTenureMonths: 96,
    marginContributionPct: 0,
    age: { min: 16, max: 40 },
    tags: ["education", "student", "course-fee"],
    documents: [
      "Admission letter from institution",
      "Photo ID (Aadhaar / Voter ID)",
      "Caste / community certificate",
      "Income certificate",
      "Study plan / fee structure",
    ],
    accent: "#8b5cf6",
    priority: 5,
  },
  {
    id: "skill-vikas",
    name: "Kaushal Vikas Skill & Business Grant",
    category: "skill-development",
    description:
      "Support for skill training, upskilling, and business-development tools to help applicants build employable capabilities.",
    supportedBusinessTypes: [
      "Skill training",
      "Vocational certification",
      "Business development tools",
      "Equipment for skilled trade",
      "Digital literacy setup",
    ],
    incomeLimit: 300000,
    minEducation: "upper-primary",
    loanMin: 20000,
    loanMax: 500000,
    interestRate: 3.5,
    moratoriumMonths: 9,
    maxTenureMonths: 60,
    marginContributionPct: 10,
    age: { min: 17, max: 50 },
    tags: ["skill", "training", "upskilling"],
    documents: [
      "Photo ID (Aadhaar / Voter ID)",
      "Caste / community certificate",
      "Income certificate",
      "Training / certification plan",
    ],
    accent: "#ec4899",
    priority: 3,
  },
];

/** Convenience lookup by id. */
export const getSchemeById = (id: string): Scheme | undefined =>
  SCHEMES.find((s) => s.id === id);
