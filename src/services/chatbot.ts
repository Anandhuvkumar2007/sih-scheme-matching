// ============================================================================
// Demo assistant — INTENT-MATCHING RULES (not an AI model).
//
// This powers the on-site chat widget. It is honest: it does NOT use a
// language model. It matches the user's typed question against a set of
// keyword "intents" and returns a scripted, helpful answer — plus an optional
// in-app action link.
//
// To add a new answer: add an entry to INTENTS below with the keywords the
// user might type and the reply text. Replies may include "\n" for line breaks.
// ============================================================================

export interface AssistantReply {
  /** One or more paragraphs of answer text. */
  text: string;
  /** Optional in-app action shown as a button under the answer. */
  action?: { label: string; to: string };
}

interface Intent {
  id: string;
  keywords: string[];
  reply: (ctx: ReplyContext) => AssistantReply;
}

export interface ReplyContext {
  /** Name of the applicant's top recommended scheme, if one exists. */
  bestScheme?: string;
  /** True when a recommendation exists in the current flow. */
  hasResult?: boolean;
}

const INTENTS: Intent[] = [
  {
    id: "greeting",
    keywords: ["hi", "hello", "hey", "namaste", "good morning", "good evening", "greetings"],
    reply: () => ({
      text: "Hello! 👋 I'm the SchemeSaathi demo assistant.\nYou can ask me things like “which scheme is right for me”, “can I afford the EMI”, or “where do I apply”.",
    }),
  },
  {
    id: "find-scheme",
    keywords: [
      "scheme", "which scheme", "find", "match", "recommend", "best", "right for me",
      "suitable", "welfare", "loan scheme",
    ],
    reply: (ctx) => ({
      text: ctx.hasResult && ctx.bestScheme
        ? `Based on the details you gave us, your best match is **${ctx.bestScheme}**. It's picked by our Smart Scheme Matching rules engine, which checks your business type, income, education and project cost — and explains every rule.\nYou can reopen your full result any time.`
        : `I can help with that! Head to “Find My Scheme”, answer a few questions (or tap a demo profile), and our Smart Scheme Matching rules engine will recommend the best fit — and tell you exactly why.\nIt's rule-based, not AI: you can see every eligibility rule that drives the match.`,
      action: {
        label: ctx.hasResult ? "View your result" : "Go to Find My Scheme",
        to: ctx.hasResult ? "/results" : "/apply",
      },
    }),
  },
  {
    id: "emi",
    keywords: [
      "emi", "loan amount", "interest", "interest rate", "repayment", "afford",
      "tenure", "moratorium", "calculator", "monthly", "installment", "cost", "pay back",
    ],
    reply: () => ({
      text: "After you get a recommendation, scroll to **Plan your repayment**. Sliders let you adjust the loan amount and tenure, and it instantly shows the estimated EMI, total interest, and what % of your monthly income that consumes.\nIt uses the standard reducing-balance EMI formula, including the moratorium period.",
      action: { label: "Start with Find My Scheme", to: "/apply" },
    }),
  },
  {
    id: "partner",
    keywords: [
      "partner", "bank", "branch", "where", "location", "near", "nbfc", "channel",
      "apply where", "office", "agency", "disburse",
    ],
    reply: () => ({
      text: "The **Channel Partner Locator** on your results page shows only partners that can process your recommended scheme — filtered by scheme category and sorted by distance (or capacity).\nEach partner shows its processing capacity and NPA/overdue risk so you can pick confidently.",
      action: { label: "See eligible partners", to: "/results" },
    }),
  },
  {
    id: "documents",
    keywords: [
      "document", "paper", "id", "aadhaar", "aadhar", "certificate", "required",
      "need to apply", "proof", "income certificate", "photo",
    ],
    reply: () => ({
      text: "Required documents differ by scheme, but a typical list includes: photo ID (Aadhaar/Voter ID), a community certificate, an income certificate, and a project or business plan.\nYour results page lists the exact documents for your recommended scheme, and the application checklist shows what to bring.",
    }),
  },
  {
    id: "language",
    keywords: [
      "language", "malayalam", "hindi", "translate", "english", "bahasa", "हिंदी",
      "മലയാളം", "change language",
    ],
    reply: () => ({
      text: "You can switch the interface between English, Malayalam and Hindi using the language selector (globe icon) in the top navigation bar. The main navigation, buttons, form labels and key results are translated.",
    }),
  },
  {
    id: "real",
    keywords: [
      "real", "fake", "demo", "sample", "genuine", "actual", "is this", "true",
      "government", "official",
    ],
    reply: () => ({
      text: "Honest answer: this is a **demonstration prototype** built for a hackathon. The schemes, partners, and eligibility results are sample data — they do not represent a real government scheme or bank.\nThe assistant you're chatting with is also demo-only and rule-based, not a real AI model.",
    }),
  },
  {
    id: "eligibility",
    keywords: [
      "eligible", "eligibility", "income", "qualify", "caste", "category", "sc",
      "community", "education", "age", "requirements", "who can",
    ],
    reply: () => ({
      text: "Eligibility is decided by a transparent rules engine: your business type, annual income, education level, and project cost are checked against each scheme's limits (age and experience are optional factors).\nYour result page shows every rule, why you qualify, and anything you'd still need to meet.",
      action: { label: "Check your eligibility", to: "/apply" },
    }),
  },
  {
    id: "contact",
    keywords: ["contact", "call", "phone", "help", "support", "talk", "human", "agent"],
    reply: () => ({
      text: "This is a demo, so there's no human support line. In the real product, each channel partner card would show a direct contact. For now, use the **Call** button on any partner card to see a sample contact action.",
    }),
  },
  {
    id: "thanks",
    keywords: ["thank", "thanks", "great", "helpful", "cool", "nice", "awesome", "good"],
    reply: () => ({
      text: "You're welcome! 😊 Good luck at the hackathon. Ask me anything about the platform.",
    }),
  },
];

const FALLBACK: AssistantReply = {
  text: "I'm still learning — I can best help with finding a scheme, planning repayment, finding a partner, documents, and eligibility. Try one of the quick replies below, or reword your question.",
};

/** Score every intent against the query and return the best reply. */
export function getReply(query: string, ctx: ReplyContext = {}): AssistantReply {
  const q = query.toLowerCase().trim();
  if (!q) return FALLBACK;

  let best: Intent | null = null;
  let bestScore = 0;
  for (const intent of INTENTS) {
    let score = 0;
    for (const kw of intent.keywords) {
      if (q.includes(kw.toLowerCase())) score += kw.length; // longer keyword match = stronger
    }
    if (score > bestScore) {
      best = intent;
      bestScore = score;
    }
  }

  if (!best || bestScore === 0) return FALLBACK;
  return best.reply(ctx);
}

/** Suggested quick-reply chips shown when the panel opens. */
export const QUICK_REPLIES: string[] = [
  "Which scheme is right for me?",
  "Can I afford the EMI?",
  "Where do I apply?",
  "What documents do I need?",
  "Is this real?",
];
