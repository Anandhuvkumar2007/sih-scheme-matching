// ============================================================================
// English translations — this is the canonical key set for the whole app.
// `Messages` is derived from this object so every language dictionary is
// checked against the same keys. Strings here are the English default.
// ============================================================================

export const en = {
  // Navbar / brand
  brand: "SchemeSaathi",
  navFindScheme: "Find My Scheme",
  navRecommender: "Scheme Recommender",
  navHowItWorks: "How It Works",
  navFaq: "FAQ",
  navViewResults: "View Results",

  // Hero
  heroBadge: "Smart Scheme Matching · Financial Calculator · Channel Partner Locator",
  heroTitle: "Find the Right Scheme. Plan Your Loan. Reach the Right Partner.",
  heroSubtitle:
    "An intelligent, multilingual platform that helps marginalized entrepreneurs discover suitable welfare credit schemes, understand repayment, and find an eligible channel partner — all in one guided journey.",
  heroCta: "Find My Scheme",
  heroCta2: "See How It Works",

  // Problem section
  problemTitle: "The current process is fragmented and confusing",
  problemSubtitle:
    "Eligible beneficiaries navigate a Channel Finance System with 100+ intermediaries — state agencies, public sector banks, regional rural banks, and NBFC-MFIs.",
  problemOldTitle: "Today",
  problemNewTitle: "With SchemeSaathi",
  problemStep1: "Applicant",
  problemStep2: "Multiple Schemes",
  problemStep3: "100+ Intermediaries",
  problemStep4: "Confusion",
  problemStep5: "Misrouted Application",
  problemStep6: "Delayed Disbursement",
  newStep1: "Applicant",
  newStep2: "SchemeSaathi",
  newStep3: "Right Scheme",
  newStep4: "Repayment Plan",
  newStep5: "Eligible Partner",
  newStep6: "Clear Next Step",

  // How it works
  howItWorksTitle: "How it works",
  howItWorksSubtitle: "One guided journey from confusion to a clear next step.",
  step1Title: "Tell us about you",
  step1Desc: "Share your project, income, education and location.",
  step2Title: "Get matched",
  step2Desc: "A transparent rules engine recommends the best scheme and explains why.",
  step3Title: "Plan repayment",
  step3Desc: "Slide the loan amount and tenure to see your estimated EMI before you commit.",
  step4Title: "Reach a partner",
  step4Desc: "See nearby channel partners filtered to ones that can process your scheme.",

  // Modules
  modulesTitle: "Three modules, one clear answer",
  modulesSubtitle: "Each question you have is answered inside a single personalized result.",
  moduleRecommendTitle: "Smart Scheme Matching",
  moduleRecommendDesc: "Which scheme is right for me?",
  moduleCalcTitle: "Financial Calculator",
  moduleCalcDesc: "Can I afford the repayment?",
  moduleLocatorTitle: "Channel Partner Locator",
  moduleLocatorDesc: "Where should I go to apply?",

  // CTA
  ctaTitle: "Ready to find the right scheme?",
  ctaSubtitle: "It takes less than a minute. Your answer converges into one clear next step.",
  ctaBtn: "Find My Scheme",

  // Apply / form
  applyTitle: "Find My Scheme",
  applySubtitle:
    "Answer a few questions and our Smart Scheme Matching will recommend the best fit — and tell you exactly why.",
  fieldName: "Full name",
  fieldProjectType: "Project / business type",
  fieldProjectCost: "Estimated project cost (₹)",
  fieldAnnualIncome: "Annual family income (₹)",
  fieldEducation: "Education status",
  fieldLocation: "Your location (city / district)",
  fieldAge: "Age (optional)",
  fieldCategory: "Community / category (optional)",
  fieldExperience: "Business experience in years (optional)",
  placeholderProject: "Pick your project or business type",
  btnSubmit: "Get My Recommendation",
  btnTryDemo: "Try Demo Applicant",
  errorRequired: "This field is required.",
  errorCost: "Please enter a valid project cost above ₹0.",
  errorIncome: "Please enter a valid annual income.",
  demoNote: "Demo applicant — sample data only",
  demoPull: "Or start from a sample profile:",
  formProgress: "Profile details",
  formStep1: "Profile",
  formStep2: "Scheme Matched",
  formStep3: "Repayment Planned",
  formStep4: "Partner Found",
  formStep5: "Ready to Apply",

  // Results
  resultsTitle: "Your personalized result",
  resultsSubtitle: "Based on the information you provided, your best match is…",
  bestMatch: "Your Best Match",
  matchScore: "Match score",
  whyQualify: "Why you qualify",
  eligibilityHeadline: "Eligibility conditions",
  loanDetails: "Loan details",
  loanAmount: "Loan amount",
  downPayment: "Down payment / contribution",
  interestRate: "Interest rate",
  moratorium: "Moratorium",
  tenure: "Repayment period",
  docsHeadline: "Required documents",
  altSchemes: "Alternative schemes",
  altNote: "Other schemes worth considering",
  partnersHeadline: "Your nearby eligible channel partners",
  partnersSubtitle: "Only partners that can process this scheme category are shown.",
  nearestPartner: "Nearest eligible partner",
  contact: "Contact",
  call: "Call",
  viewFullExplanation: "View Full Explanation",
  hideExplanation: "Hide Explanation",
  moreAbout: "More about this scheme",
  missingReq: "Does not fully qualify",
  missingReqNote: "To fully qualify, you would need to meet:",
  recommendedByRules: "Recommended by Smart Scheme Matching",
  rulesEngineNote: "Rule-based matching · not AI",

  // Dashboard labels
  dashBestMatch: "Your Best Match",
  dashRepayment: "Your Estimated Repayment",
  dashPartner: "Nearest Eligible Partner",
  dashReadiness: "Application Readiness",
  readinessDetail: "Steps completed toward applying",

  // EMI calculator
  emiTitle: "Plan your repayment",
  emiSubtitle: "Slide to adjust the loan amount and tenure. The estimate updates instantly.",
  sliderLoan: "Loan amount",
  sliderTenure: "Repayment period (years)",
  emiMonthly: "Estimated EMI",
  emiTotalPayment: "Total repayment",
  emiTotalInterest: "Total interest",
  emiBurden: "of monthly income",
  chartPrincipal: "Principal",
  chartInterest: "Interest",
  calcNote:
    "EMI is computed with the standard reducing-balance formula and is an estimate only. The final rate is decided by the channel partner.",

  // Partner status / risk
  statusHigh: "High capacity",
  statusModerate: "Moderate capacity",
  statusLow: "Low capacity",
  riskLow: "Low risk",
  riskMedium: "Medium risk",
  riskHigh: "High risk",
  canProcess: "Can process this scheme",
  sortNearest: "Nearest first",
  sortCapacity: "Capacity",
  showingNote: "Showing {count} eligible partner(s)",

  // Checklist / next step
  checklistTitle: "Your application checklist",
  checklistDone: "Done",
  nextStep: "Clear Next Step",
  applyNow: "Apply at your nearest eligible partner",
  stepCap: "Steps to apply",
  profileDone: "Profile completed",
  schemeDone: "Scheme matched",
  repaymentDone: "Repayment planned",
  partnerDone: "Eligible partner found",
  readyToApply: "Ready to apply",

  // Toasts
  toastRecTitle: "Recommendation ready!",
  toastRecMsg: "We found your best scheme match.",
  toastErrorTitle: "Something went wrong",
  toastErrorMsg: "Please check your details and try again.",

  // Footer / misc
  footerTag: "Helping marginalized entrepreneurs reach the right credit, clearly.",
  footerProduct: "Product",
  footerResources: "Resources",
  footerLegal: "Legal",
  footerDemo: "Demonstration project",
  footerMadeFor: "Built for a college hackathon",
  disclaimer:
    "Scheme eligibility shown in this prototype is based on demonstration rules and sample data. Final eligibility is determined by the relevant authority/channel partner.",

  // FAQ
  faqTitle: "Frequently asked questions",
  faqSubtitle: "Answers to common questions about this demonstration platform.",
  backHome: "Back to home",
  startOver: "Start over",

  // Chatbot
  chatTitle: "SchemeSaathi Assistant",
  chatSubtitle: "Demo assistant · rule-based, not AI",
  chatPlaceholder: "Ask a question…",
  chatSend: "Send",
  chatClose: "Close assistant",
  chatDisclosure:
    "This is a demo assistant. It is rule-based, not an AI model, and no personal data is stored or sent anywhere.",

  // Scheme Recommender
  recommenderHeading: "Scheme Recommender Questionnaire",
  recommenderSubheading: "A tailored questionnaire for marginalized entrepreneurs to capture your demographics, business profile, and credit needs.",
  recommenderResultsHeading: "Recommended Welfare Credit Schemes",
  recommenderResultsSubheading: "Schemes evaluated and ranked by the Scheme Matching & Eligibility Engine.",
  qAgeLabel: "Age (Years)",
  qStateLabel: "State / Union Territory",
  qGenderLabel: "Gender",
  qCategoryLabel: "Social Category",
  qOccupationLabel: "Primary Occupation / Trade",
  qBusinessTypeLabel: "Enterprise Sector / Business Type",
  qBusinessStageLabel: "Venture Stage",
  qIncomeLabel: "Annual Family Income (₹)",
  qDisabilityLabel: "Disability Status (Divyangjan)",
  qAssistanceLabel: "Required Financial Assistance (₹)",
  btnFindSchemes: "Find Matching Schemes",
  btnEditForm: "Edit Questionnaire",
  btnResetForm: "Reset",
  btnViewDetails: "View Details & Application Guide",
  btnApplyOfficial: "Apply on Official Portal",
  eligibilityEligible: "Eligible Based on Provided Info",
  eligibilityPotential: "Potential Match",
  eligibilityNeedsVerification: "Needs Verification",
  eligibilityNotAMatch: "Not a Match",
  whyMatches: "Why this scheme matches",
  thingsToVerify: "Things to verify",
};

export type Messages = typeof en;
