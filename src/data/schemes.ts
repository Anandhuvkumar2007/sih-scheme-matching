// ============================================================================
// Scheme Data Layer — SchemeSaathi
//
// Structured government scheme dataset designed for deterministic rule-based
// recommendation and eligibility matching.
//
// DATA SAFETY NOTICE:
// These records are demonstration data created for the Smart India Hackathon
// prototype. Each record is explicitly flagged with `isDemo: true` and a clear
// disclaimer notice. They do NOT represent official government commitments.
// ============================================================================

import type { ProjectCategory, Scheme } from "../types";

export const SCHEMES: Scheme[] = [
  {
    id: "term-loan-udyam",
    name: "Udyam Term Loan Yojana",
    schemeName: "Udyam Term Loan Yojana",
    ministry: "Ministry of Social Justice & Empowerment / State Channelizing Agency",
    category: "term-loan",
    description:
      "A term loan for capital investment — machinery, equipment, and expansion of an existing or new production unit.",
    targetBeneficiaries: [
      "Scheduled Caste entrepreneurs",
      "Micro-enterprise owners",
      "Manufacturing & fabrication units",
    ],
    stateApplicability: "All India",
    businessStage: ["startup", "expansion"],
    ageCriteria: { min: 18, max: 65 },
    incomeCriteria: {
      maxAnnualIncome: 500000,
      isFamilyIncome: true,
      description: "Annual family income must not exceed ₹5,00,000 for rural and urban areas.",
    },
    benefits: {
      loanMin: 100000,
      loanMax: 2000000,
      interestRate: 6.5,
      moratoriumMonths: 6,
      maxTenureMonths: 84,
      marginContributionPct: 10,
      description: "Concessional interest rate of 6.5% p.a. with up to 6 months moratorium for unit commissioning.",
    },
    requiredDocuments: [
      "Photo ID (Aadhaar / Voter ID)",
      "Caste / community certificate",
      "Income certificate from competent revenue authority",
      "Detailed project / business proposal",
      "Bank statements (past 6 months)",
      "Quotation / proforma invoice for machinery & equipment",
    ],
    officialWebsite: "https://socialjustice.gov.in",
    applicationUrl: "https://socialjustice.gov.in/schemes/udyam-term-loan",
    eligibilityCriteria: {
      minEducation: "secondary",
      incomeLimit: 500000,
      age: { min: 18, max: 65 },
      socialCategories: ["Scheduled Caste", "Scheduled Tribe", "Other Backward Class", "Economically Weaker Section"],
      eligibleStates: ["All India"],
      businessStages: ["startup", "expansion"],
      minBusinessExperienceYears: 0,
    },
    isDemo: true,
    dataNotice: "DEMO DATA — NOT OFFICIAL (Hackathon demonstration record)",

    // --- Legacy / Backwards Compatibility Fields ---
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
    schemeName: "Sahayog Small Business Loan",
    ministry: "Ministry of Micro, Small & Medium Enterprises / National SC-ST Hub",
    category: "small-business",
    description:
      "Working capital and start-up finance for small shops, stalls, and micro services — ideal for first-time entrepreneurs.",
    targetBeneficiaries: [
      "First-time micro-entrepreneurs",
      "Retail shop owners",
      "Self-employed artisans",
      "Women entrepreneurs",
    ],
    stateApplicability: "All India",
    businessStage: ["startup", "expansion"],
    ageCriteria: { min: 18, max: 60 },
    incomeCriteria: {
      maxAnnualIncome: 400000,
      isFamilyIncome: true,
      description: "Family income cap of ₹4,00,000 per annum.",
    },
    benefits: {
      loanMin: 50000,
      loanMax: 1500000,
      interestRate: 5.5,
      moratoriumMonths: 4,
      maxTenureMonths: 72,
      marginContributionPct: 5,
      description: "Low 5% promoter margin contribution with 4 months moratorium.",
    },
    requiredDocuments: [
      "Photo ID (Aadhaar / Voter ID)",
      "Caste / community certificate",
      "Income certificate",
      "Business plan / trade description",
      "Proof of business location / trade license (if existing)",
    ],
    officialWebsite: "https://msme.gov.in",
    applicationUrl: "https://msme.gov.in/schemes/sahayog-business",
    eligibilityCriteria: {
      minEducation: "primary",
      incomeLimit: 400000,
      age: { min: 18, max: 60 },
      socialCategories: ["Scheduled Caste", "Scheduled Tribe", "Other Backward Class"],
      eligibleStates: ["All India"],
      businessStages: ["startup", "expansion"],
      minBusinessExperienceYears: 1,
    },
    isDemo: true,
    dataNotice: "DEMO DATA — NOT OFFICIAL (Hackathon demonstration record)",

    // --- Legacy / Backwards Compatibility Fields ---
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
    schemeName: "Swavalamban Micro Finance Scheme",
    ministry: "National Backward Classes / Scheduled Castes Finance & Development Corporation",
    category: "micro-finance",
    description:
      "Small, low-cost loans for income-generation activities — a starting point for self-employment and tiny enterprises.",
    targetBeneficiaries: [
      "Street vendors",
      "Home-based micro-producers",
      "Self-Help Groups (SHGs)",
      "Agricultural allied workers",
    ],
    stateApplicability: "All India",
    businessStage: ["ideation", "startup"],
    ageCriteria: { min: 18, max: 65 },
    incomeCriteria: {
      maxAnnualIncome: 200000,
      isFamilyIncome: true,
      description: "Reserved for low-income households with annual family income up to ₹2,00,000.",
    },
    benefits: {
      loanMin: 10000,
      loanMax: 300000,
      interestRate: 4.0,
      moratoriumMonths: 3,
      maxTenureMonths: 60,
      marginContributionPct: 0,
      description: "Zero margin contribution required with subsidized 4.0% interest.",
    },
    requiredDocuments: [
      "Photo ID (Aadhaar / Voter ID)",
      "Caste / community certificate",
      "Income certificate / BPL card",
      "Simple activity description proposal",
    ],
    officialWebsite: "https://nsfdc.nic.in",
    applicationUrl: "https://nsfdc.nic.in/schemes/swavalamban-microfinance",
    eligibilityCriteria: {
      minEducation: "none",
      incomeLimit: 200000,
      age: { min: 18, max: 65 },
      socialCategories: ["Scheduled Caste", "Scheduled Tribe", "Other Backward Class", "Economically Weaker Section"],
      eligibleStates: ["All India"],
      businessStages: ["ideation", "startup"],
      minBusinessExperienceYears: 0,
    },
    isDemo: true,
    dataNotice: "DEMO DATA — NOT OFFICIAL (Hackathon demonstration record)",

    // --- Legacy / Backwards Compatibility Fields ---
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
    schemeName: "Vidya Educational Loan",
    ministry: "Ministry of Education / National SC Finance Development Corporation",
    category: "education",
    description:
      "Financial support for higher education, professional courses, and skill certifications for eligible students.",
    targetBeneficiaries: [
      "Students pursuing technical and professional degrees",
      "Vocational trainees",
      "Youth from marginalized communities",
    ],
    stateApplicability: "All India",
    businessStage: ["any"],
    ageCriteria: { min: 16, max: 40 },
    incomeCriteria: {
      maxAnnualIncome: 800000,
      isFamilyIncome: true,
      description: "Family income ceiling of ₹8,00,000 per year.",
    },
    benefits: {
      loanMin: 50000,
      loanMax: 1000000,
      interestRate: 5.0,
      moratoriumMonths: 12,
      maxTenureMonths: 96,
      marginContributionPct: 0,
      description: "12-month course completion moratorium before repayment begins.",
    },
    requiredDocuments: [
      "Admission offer / confirmation letter from recognized institution",
      "Photo ID (Aadhaar / Voter ID)",
      "Caste / community certificate",
      "Income certificate",
      "Approved fee structure & breakdown",
    ],
    officialWebsite: "https://www.education.gov.in",
    applicationUrl: "https://www.education.gov.in/schemes/vidya-loan",
    eligibilityCriteria: {
      minEducation: "higher-secondary",
      incomeLimit: 800000,
      age: { min: 16, max: 40 },
      socialCategories: ["Scheduled Caste", "Scheduled Tribe", "Other Backward Class", "Economically Weaker Section"],
      eligibleStates: ["All India"],
      businessStages: ["any"],
      minBusinessExperienceYears: 0,
    },
    isDemo: true,
    dataNotice: "DEMO DATA — NOT OFFICIAL (Hackathon demonstration record)",

    // --- Legacy / Backwards Compatibility Fields ---
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
    schemeName: "Kaushal Vikas Skill & Business Grant",
    ministry: "Ministry of Skill Development & Entrepreneurship",
    category: "skill-development",
    description:
      "Support for skill training, upskilling, and business-development tools to help applicants build employable capabilities.",
    targetBeneficiaries: [
      "Vocational certification trainees",
      "Skilled technicians and craftspeople",
      "Youth seeking trade toolkits",
    ],
    stateApplicability: "All India",
    businessStage: ["ideation", "startup"],
    ageCriteria: { min: 17, max: 50 },
    incomeCriteria: {
      maxAnnualIncome: 300000,
      isFamilyIncome: true,
      description: "Annual family income ceiling of ₹3,00,000.",
    },
    benefits: {
      loanMin: 20000,
      loanMax: 500000,
      interestRate: 3.5,
      moratoriumMonths: 9,
      maxTenureMonths: 60,
      marginContributionPct: 10,
      description: "Low 3.5% interest rate with 9 months moratorium during training phase.",
    },
    requiredDocuments: [
      "Photo ID (Aadhaar / Voter ID)",
      "Caste / community certificate",
      "Income certificate",
      "Training / course enrolment certificate",
      "Trade equipment estimate (if purchasing tools)",
    ],
    officialWebsite: "https://www.msde.gov.in",
    applicationUrl: "https://www.msde.gov.in/schemes/kaushal-vikas",
    eligibilityCriteria: {
      minEducation: "upper-primary",
      incomeLimit: 300000,
      age: { min: 17, max: 50 },
      socialCategories: ["Scheduled Caste", "Scheduled Tribe", "Other Backward Class", "Economically Weaker Section"],
      eligibleStates: ["All India"],
      businessStages: ["ideation", "startup"],
      minBusinessExperienceYears: 0,
    },
    isDemo: true,
    dataNotice: "DEMO DATA — NOT OFFICIAL (Hackathon demonstration record)",

    // --- Legacy / Backwards Compatibility Fields ---
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

/** Convenience lookup by scheme ID. */
export const getSchemeById = (id: string): Scheme | undefined =>
  SCHEMES.find((s) => s.id === id);

/** Retrieve only verified official government schemes. */
export const getVerifiedSchemes = (): Scheme[] =>
  SCHEMES.filter((s) => s.isDemo !== true);

/** Retrieve demo/sample schemes. */
export const getDemoSchemes = (): Scheme[] =>
  SCHEMES.filter((s) => s.isDemo === true);

/** Filter schemes by project category. */
export const filterSchemesByCategory = (category: ProjectCategory): Scheme[] =>
  SCHEMES.filter((s) => s.category === category);

/** Filter schemes by state applicability. */
export const filterSchemesByState = (stateName: string): Scheme[] =>
  SCHEMES.filter((s) => {
    if (!s.stateApplicability || s.stateApplicability === "All India") return true;
    if (Array.isArray(s.stateApplicability)) {
      return s.stateApplicability.some(
        (st) => st.toLowerCase() === stateName.trim().toLowerCase()
      );
    }
    return false;
  });

