// ============================================================================
// Demo applicant profiles for the "Try Demo" buttons (hackathon demo data).
// ============================================================================

import type { DemoProfile } from "../types";

export const DEMO_PROFILES: DemoProfile[] = [
  {
    id: "entrepreneur",
    name: "First-time entrepreneur",
    label: "Small food-processing business",
    applicant: {
      name: "Rahul Krishnan",
      projectType: "Small food-processing business",
      projectCost: 500000,
      annualIncome: 150000,
      education: "higher-secondary",
      location: "Kochi",
      age: 26,
      category: "Scheduled Caste",
      businessExperienceYears: 1,
      demoProfileId: "entrepreneur",
    },
  },
  {
    id: "micro-vendor",
    name: "Micro vendor",
    label: "Kirana / retail store",
    applicant: {
      name: "Meera Sasidharan",
      projectType: "Retail / kirana store",
      projectCost: 150000,
      annualIncome: 120000,
      education: "secondary",
      location: "Thrissur",
      age: 34,
      category: "Scheduled Caste",
      businessExperienceYears: 2,
      demoProfileId: "micro-vendor",
    },
  },
  {
    id: "student",
    name: "Student",
    label: "Higher education",
    applicant: {
      name: "Arjun Nair",
      projectType: "Higher education",
      projectCost: 400000,
      annualIncome: 220000,
      education: "higher-secondary",
      location: "Kottayam",
      age: 19,
      category: "Scheduled Caste",
      businessExperienceYears: 0,
      demoProfileId: "student",
    },
  },
];

/** Shortlist used on the landing page / apply page hero. */
export const getDemoProfile = (id: string): DemoProfile | undefined =>
  DEMO_PROFILES.find((p) => p.id === id);
