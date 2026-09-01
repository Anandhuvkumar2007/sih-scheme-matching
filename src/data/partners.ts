// ============================================================================
// Channel Partner data — SAMPLE DATA FOR DEMONSTRATION.
//
// These are fictional channel partners created for the hackathon demo. They do
// not represent any real bank, institution, or government body.
//
// Each partner declares the scheme categories it can process
// (supportedCategories). The partner locator filters partners to those that
// can process the applicant's recommended scheme category.
//
// `lat` / `lng` are simulated positions (0–100) used to draw markers on the
// mock map. Distance is measured from the demo location (Kochi) in km.
// ============================================================================

import type { ChannelPartner, ProjectCategory } from "../types";

export const PARTNERS: ChannelPartner[] = [
  {
    id: "p1",
    name: "Kerala SC Development Finance Corporation",
    type: "State Channelizing Agency",
    location: "Kochi",
    lat: 50,
    lng: 62,
    distanceKm: 3,
    supportedCategories: ["term-loan", "small-business", "skill-development"],
    processingStatus: "High capacity",
    npaRisk: "Low",
    phone: "+91 98000 11001",
  },
  {
    id: "p2",
    name: "State Bank of India — Marine Drive Branch",
    type: "Public Sector Bank",
    location: "Kochi",
    lat: 55,
    lng: 66,
    distanceKm: 5,
    supportedCategories: ["term-loan", "small-business", "education"],
    processingStatus: "High capacity",
    npaRisk: "Low",
    phone: "+91 98000 11002",
  },
  {
    id: "p3",
    name: "Kerala Gramin Bank — Ernakulam",
    type: "Regional Rural Bank",
    location: "Ernakulam",
    lat: 58,
    lng: 58,
    distanceKm: 14,
    supportedCategories: ["small-business", "micro-finance"],
    processingStatus: "Moderate capacity",
    npaRisk: "Medium",
    phone: "+91 98000 11003",
  },
  {
    id: "p4",
    name: "Swan Microfinance Pvt. Ltd.",
    type: "NBFC-MFI",
    location: "Ernakulam",
    lat: 56,
    lng: 55,
    distanceKm: 16,
    supportedCategories: ["micro-finance"],
    processingStatus: "High capacity",
    npaRisk: "High",
    phone: "+91 98000 11004",
  },
  {
    id: "p5",
    name: "SC Backward Classes Development Corporation",
    type: "State Channelizing Agency",
    location: "Thrissur",
    lat: 44,
    lng: 50,
    distanceKm: 62,
    supportedCategories: ["term-loan", "small-business", "micro-finance"],
    processingStatus: "Moderate capacity",
    npaRisk: "Low",
    phone: "+91 98000 11005",
  },
  {
    id: "p6",
    name: "Canara Bank — Thrissur Main",
    type: "Public Sector Bank",
    location: "Thrissur",
    lat: 46,
    lng: 47,
    distanceKm: 66,
    supportedCategories: ["term-loan", "education"],
    processingStatus: "High capacity",
    npaRisk: "Medium",
    phone: "+91 98000 11006",
  },
  {
    id: "p7",
    name: "Kottayam Rural Credit Society",
    type: "Regional Rural Bank",
    location: "Kottayam",
    lat: 66,
    lng: 52,
    distanceKm: 70,
    supportedCategories: ["micro-finance", "small-business"],
    processingStatus: "Low capacity",
    npaRisk: "Low",
    phone: "+91 98000 11007",
  },
  {
    id: "p8",
    name: "Alappuzha Community Finance Ltd.",
    type: "NBFC-MFI",
    location: "Alappuzha",
    lat: 70,
    lng: 46,
    distanceKm: 55,
    supportedCategories: ["micro-finance", "small-business"],
    processingStatus: "Moderate capacity",
    npaRisk: "High",
    phone: "+91 98000 11008",
  },
  {
    id: "p9",
    name: "Kerala Scheduled Caste Co-op Federation",
    type: "State Channelizing Agency",
    location: "Kollam",
    lat: 78,
    lng: 36,
    distanceKm: 142,
    supportedCategories: ["term-loan", "skill-development"],
    processingStatus: "Moderate capacity",
    npaRisk: "Low",
    phone: "+91 98000 11009",
  },
  {
    id: "p10",
    name: "Bank of Baroda — Palakkad",
    type: "Public Sector Bank",
    location: "Palakkad",
    lat: 30,
    lng: 44,
    distanceKm: 98,
    supportedCategories: ["term-loan", "small-business", "education", "skill-development"],
    processingStatus: "High capacity",
    npaRisk: "Low",
    phone: "+91 98000 11010",
  },
  {
    id: "p11",
    name: "Kozhikode Vikas Micro Finance",
    type: "NBFC-MFI",
    location: "Kozhikode",
    lat: 22,
    lng: 40,
    distanceKm: 168,
    supportedCategories: ["micro-finance"],
    processingStatus: "Low capacity",
    npaRisk: "Medium",
    phone: "+91 98000 11011",
  },
  {
    id: "p12",
    name: "Northern Kerala Scheduled Tribe Development Corp.",
    type: "State Channelizing Agency",
    location: "Kannur",
    lat: 12,
    lng: 34,
    distanceKm: 218,
    supportedCategories: ["term-loan", "small-business"],
    processingStatus: "Low capacity",
    npaRisk: "Medium",
    phone: "+91 98000 11012",
  },
];

/** Categories every distinct category value maps to for badge colors. */
export const categoryToLabel: Record<ProjectCategory, string> = {
  "micro-finance": "Micro Finance",
  "term-loan": "Term Loan",
  "small-business": "Small Business",
  education: "Education Loan",
  "skill-development": "Skill Development",
};

/**
 * Filter partners to those able to process a given scheme category.
 * This is the core filtering logic used by the partner locator.
 */
export function partnersForCategory(
  partners: ChannelPartner[],
  category: ProjectCategory
): ChannelPartner[] {
  return partners.filter((p) => p.supportedCategories.includes(category));
}

/** Sort partners by distance (nearest first). */
export function sortByDistance(partners: ChannelPartner[]): ChannelPartner[] {
  return [...partners].sort((a, b) => a.distanceKm - b.distanceKm);
}
