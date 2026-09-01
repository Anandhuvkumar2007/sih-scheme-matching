// ============================================================================
// SchemeSaathi Rule-Based Assistant — Grounded Intent Matcher
//
// Honest, deterministic, and 100% offline:
// - No external LLM APIs (no OpenAI, no Gemini, no external network requests).
// - Grounded directly in application data and deterministic engine outputs.
// - Avoids unverified document claims or hardcoded eligibility rules.
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
      text: "Hello! 👋 I'm the SchemeSaathi assistant.\nYou can ask me things like “which scheme is right for me”, “can I afford the EMI”, or “where do I apply”.",
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
        ? `Based on your profile, your top match is **${ctx.bestScheme}**, evaluated by SchemeSaathi's deterministic rules engine.\nYou can review your full results and rule breakdown at any time.`
        : `I can help with that! Go to “Find My Scheme”, answer the questionnaire (or select a demo profile), and our deterministic rules engine will evaluate and rank schemes for your profile.`,
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
      text: "On the **Results** page, the repayment calculator uses the standard reducing-balance EMI formula (accounting for moratorium interest capitalization) to estimate monthly EMI and repayment burden share.\nYou can adjust loan amount and tenure sliders to test different scenarios.",
      action: { label: "Go to Find My Scheme", to: "/apply" },
    }),
  },
  {
    id: "partner",
    keywords: [
      "partner", "bank", "branch", "where", "location", "near", "nbfc", "channel",
      "apply where", "office", "agency", "disburse",
    ],
    reply: () => ({
      text: "The **Channel Partner Locator** on your results page filters channel partners (State Channelizing Agencies, Public Sector Banks, Regional Rural Banks, and NBFC-MFIs) by the recommended scheme category, sorted by distance.\nPartner cards display processing capacity and NPA risk indicators from the application data.",
      action: { label: "See eligible partners", to: "/results" },
    }),
  },
  {
    id: "documents",
    keywords: [
      "document", "paper", "id", "aadhaar", "aadhar", "certificate", "required",
      "need to apply", "proof", "income certificate", "photo",
    ],
    reply: (ctx) => ({
      text: ctx.hasResult && ctx.bestScheme
        ? `Required documents for **${ctx.bestScheme}** are displayed in your application checklist on the results page. Each scheme in SchemeSaathi specifies its own verified document list.`
        : `Required documents differ by scheme. Please select a scheme or complete “Find My Scheme” to see the verified document checklist. If information is unavailable, it needs verification from the official government source.`,
      action: { label: ctx.hasResult ? "View document checklist" : "Find My Scheme", to: ctx.hasResult ? "/results" : "/apply" },
    }),
  },
  {
    id: "language",
    keywords: [
      "language", "malayalam", "hindi", "translate", "english", "bahasa", "हिंदी",
      "മലയാളം", "change language",
    ],
    reply: () => ({
      text: "You can switch the interface between English, Malayalam, and Hindi using the language selector (globe icon) in the navigation bar.",
    }),
  },
  {
    id: "real",
    keywords: [
      "real", "fake", "demo", "sample", "genuine", "actual", "is this", "true",
      "government", "official",
    ],
    reply: () => ({
      text: "This application is a demonstration prototype for SchemeSaathi. The schemes and partner listings in the repository are demo data configured for demonstration purposes.",
    }),
  },
  {
    id: "eligibility",
    keywords: [
      "eligible", "eligibility", "income", "qualify", "caste", "category", "sc",
      "community", "education", "age", "requirements", "who can",
    ],
    reply: (ctx) => ({
      text: ctx.hasResult && ctx.bestScheme
        ? `Eligibility for **${ctx.bestScheme}** is determined by SchemeSaathi's deterministic rules engine. You can inspect every evaluated rule and qualification detail on your results page.`
        : `Eligibility is determined by SchemeSaathi's deterministic rules engine. Complete the questionnaire on “Find My Scheme” to evaluate your profile against each scheme's criteria.`,
      action: { label: ctx.hasResult ? "View eligibility results" : "Check your eligibility", to: ctx.hasResult ? "/results" : "/apply" },
    }),
  },
  {
    id: "contact",
    keywords: ["contact", "call", "phone", "help", "support", "talk", "human", "agent"],
    reply: () => ({
      text: "In SchemeSaathi, each channel partner card displays a direct contact number. Use the **Call** button on any partner card on the results page to initiate contact.",
      action: { label: "View partners", to: "/results" },
    }),
  },
  {
    id: "thanks",
    keywords: ["thank", "thanks", "great", "helpful", "cool", "nice", "awesome", "good"],
    reply: () => ({
      text: "You're welcome! 😊 Feel free to ask any question about SchemeSaathi schemes, eligibility, or repayment plans.",
    }),
  },
];

const FALLBACK: AssistantReply = {
  text: "I can help with finding a scheme, planning repayment, locating channel partners, checking documents, and understanding eligibility. Try asking one of the quick questions below or reword your query.",
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
      if (q.includes(kw.toLowerCase())) score += kw.length;
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
  "Why was this scheme recommended?",
  "Am I eligible?",
  "What documents do I need?",
  "Can I afford the EMI?",
  "Where do I apply?",
];
