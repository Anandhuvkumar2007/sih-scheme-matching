// ============================================================================
// FAQ content — sample data for demonstration.
// ============================================================================

import type { FaqItem } from "../types";

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: "Is this a real government website?",
    answer:
      "No. This is a demonstration prototype built for a college hackathon. All schemes, partners, and eligibility shown are fictitious sample data — they do not represent any real government scheme or bank.",
  },
  {
    question: "How does the scheme recommendation work?",
    answer:
      "It uses a transparent rules engine (not AI). Your answers are checked against each scheme's eligibility rules — business type, income, education, and project cost — and a match score is computed from the rules you satisfy. You can expand 'Why this scheme?' to see the exact rules.",
  },
  {
    question: "Is my repayment estimate accurate?",
    answer:
      "The EMI is calculated with the standard reducing-balance loan formula, but it is an estimate only. The final rate, tenure, and margin contribution are fixed by the lending channel partner. Use this as a planning guide, not a final quote.",
  },
  {
    question: "What is a Channel Partner?",
    answer:
      "Channel partners are institutions — state channelizing agencies, public sector banks, regional rural banks, and NBFC-MFIs — that actually process and disburse welfare loans on behalf of the scheme authority. You apply to a scheme, but you visit one of these partners to submit documents.",
  },
  {
    question: "Why does the partner list change?",
    answer:
      "The partner locator only shows partners that can process the scheme category recommended for you. If your recommendation changes, the eligible partners are filtered to match it.",
  },
  {
    question: "Can I use this on my phone?",
    answer:
      "Yes. The interface is fully responsive and works on mobile, tablet, and desktop. The language can also be switched between English, Malayalam, and Hindi from the navigation bar.",
  },
];
