// ============================================================================
// SchemeSaathi In-House Grounded Natural Language Assistance Engine
//
// 100% In-House, Client-Side, and Deterministic:
// - Zero external LLM APIs (no OpenAI, no Gemini, no cloud dependencies).
// - Zero network calls / zero fetch requests (purely local execution).
// - Grounded directly in verified `src/data/schemes.ts`.
// - Uses the deterministic recommendation engine result as sole eligibility truth.
// - Enforces strict "information unavailable" safeguard for unverified claims.
// ============================================================================

import { SCHEMES, getSchemeById } from "../data/schemes";
import type { Scheme } from "../types";
import type { ScoredScheme } from "./recommendationEngine";
import type {
  AIAssistantContext,
  AIAssistantRequest,
  AIAssistantResponse,
} from "../types/ai";
import { getReply as getFallbackIntentReply } from "./chatbot";
import { formatINR } from "../utils/format";

/**
 * Normalizes query string for entity & intent extraction.
 */
function normalize(str: string): string {
  return (str || "").toLowerCase().trim();
}

/**
 * Extract a mentioned scheme from user query by name, ID, or domain keywords.
 */
function findMentionedScheme(query: string): Scheme | undefined {
  const q = normalize(query);

  if (q.includes("udyam") || q.includes("term-loan-udyam") || q.includes("term loan")) {
    return getSchemeById("term-loan-udyam");
  }
  if (q.includes("sahayog") || q.includes("small-business-sahayog") || q.includes("small business") || q.includes("kirana")) {
    return getSchemeById("small-business-sahayog");
  }
  if (q.includes("swavalamban") || q.includes("micro-finance-swavalamban") || q.includes("micro finance") || q.includes("micro-finance") || q.includes("tiny")) {
    return getSchemeById("micro-finance-swavalamban");
  }
  if (q.includes("vidya") || q.includes("education-vidya") || q.includes("education") || q.includes("student") || q.includes("course") || q.includes("degree")) {
    return getSchemeById("education-vidya");
  }
  if (q.includes("kaushal") || q.includes("vikas") || q.includes("skill-vikas") || q.includes("skill development") || q.includes("grant") || q.includes("training") || q.includes("upskilling")) {
    return getSchemeById("skill-vikas");
  }

  return undefined;
}

/**
 * Resolves the relevant scheme: mentioned in query > activeScheme in context > top recommended scheme.
 */
function resolveScheme(query: string, context?: AIAssistantContext): Scheme | undefined {
  const mentioned = findMentionedScheme(query);
  if (mentioned) return mentioned;
  if (context?.activeScheme) return context.activeScheme;
  if (context?.results && context.results.length > 0) return context.results[0].scheme;
  return undefined;
}

/**
 * Find matching result from context for a specific scheme.
 */
function findMatchingResult(scheme: Scheme | undefined, context?: AIAssistantContext): ScoredScheme | undefined {
  if (!scheme || !context?.results) return undefined;
  return context.results.find((r) => r.scheme.id === scheme.id);
}

/**
 * Main in-house entry point for SchemeSaathi assistant requests.
 * Evaluates queries locally and deterministically.
 */
export async function askAssistant(
  request: AIAssistantRequest
): Promise<AIAssistantResponse> {
  const { query, context } = request;
  const q = normalize(query);

  if (!q) {
    return {
      text: "Please type a question about SchemeSaathi schemes, eligibility, documents, or repayment.",
      source: "grounded-engine",
    };
  }

  const targetScheme = resolveScheme(query, context);
  const targetResult = findMatchingResult(targetScheme, context) || context?.results?.[0];
  const hasResults = Boolean(context?.results && context.results.length > 0);

  // --------------------------------------------------------------------------
  // 1. GREETING & PLATFORM CAPABILITIES
  // --------------------------------------------------------------------------
  if (/^(hi|hello|hey|namaste|greetings|good morning|good afternoon|good evening)\b/.test(q)) {
    return {
      text: `Hello! 👋 I'm your **SchemeSaathi Assistant**.\n\nI can help you:\n• **Understand schemes:** Ask *"Tell me about Udyam"* or *"What is Sahayog?"*\n• **Check eligibility:** Ask *"Am I eligible?"* or *"Who can apply for Vidya?"*\n• **Understand recommendations:** Ask *"Why was this scheme recommended to me?"*\n• **Check required documents:** Ask *"What documents do I need?"*\n• **Plan repayment:** Ask *"How is EMI calculated?"*`,
      action: hasResults ? { label: "View your recommendation", to: "/results" } : { label: "Find My Scheme", to: "/apply" },
      source: "grounded-engine",
    };
  }

  // --------------------------------------------------------------------------
  // 2. "WHY WAS THIS SCHEME RECOMMENDED?" (Recommendation Reasoning)
  // --------------------------------------------------------------------------
  if (
    q.includes("why was this") ||
    q.includes("why recommended") ||
    q.includes("why this scheme") ||
    q.includes("why did i get") ||
    q.includes("why qualified") ||
    q.includes("why did i qualify") ||
    q.includes("why not 100") ||
    q.includes("explain match") ||
    q.includes("how was this picked")
  ) {
    if (targetResult) {
      const { scheme, score, missingRequirements, eligibility } = targetResult;
      const metRules = eligibility.filter((r) => r.met).map((r) => `• **${r.label}**${r.detail ? `: ${r.detail}` : ""}`);
      const unmetRules = eligibility.filter((r) => !r.met).map((r) => `• **${r.label}**${r.detail ? `: ${r.detail}` : ""}`);

      let responseText = `**${scheme.name}** was recommended with a **${score}% Match Score** by SchemeSaathi's deterministic matching engine.\n\n`;

      if (metRules.length > 0) {
        responseText += `**Matched criteria:**\n${metRules.join("\n")}\n\n`;
      }

      if (unmetRules.length > 0 || missingRequirements.length > 0) {
        responseText += `**Unmet or missing criteria:**\n${(unmetRules.length ? unmetRules : missingRequirements.map((m) => `• ${m}`)).join("\n")}\n\n`;
      }

      responseText += `*Eligibility is scored from your business type, income ceiling, education level, and project cost.*`;

      return {
        text: responseText,
        action: { label: "View full explanation & EMI", to: "/results" },
        source: "grounded-engine",
        relevantScheme: scheme,
      };
    } else {
      return {
        text: `To see why a scheme is recommended for your specific profile, please complete the questionnaire on **Find My Scheme**.\n\nOur rules engine evaluates your business type, annual income, education level, and project cost transparently.`,
        action: { label: "Find My Scheme", to: "/apply" },
        source: "grounded-engine",
      };
    }
  }

  // --------------------------------------------------------------------------
  // 3. "AM I ELIGIBLE?" (Deterministic Eligibility Result from Application)
  // --------------------------------------------------------------------------
  if (
    q.includes("am i eligible") ||
    q.includes("do i qualify") ||
    q.includes("can i apply") ||
    q.includes("check my eligibility") ||
    q.includes("is my income eligible")
  ) {
    if (targetResult) {
      if (targetResult.fullyEligible) {
        return {
          text: `According to SchemeSaathi's deterministic eligibility check, your profile is **fully eligible** (Match Score: **${targetResult.score}%**) for **${targetResult.scheme.name}**.\n\n**Verified reasons you qualify:**\n${targetResult.reasons.map((r) => `• ${r}`).join("\n")}`,
          action: { label: "View results & plan repayment", to: "/results" },
          source: "grounded-engine",
          relevantScheme: targetResult.scheme,
        };
      } else {
        const unmet = targetResult.missingRequirements.length > 0
          ? targetResult.missingRequirements
          : targetResult.eligibility.filter((r) => !r.met).map((r) => r.label);

        return {
          text: `According to SchemeSaathi's eligibility check, your profile does not currently meet all criteria (Match Score: **${targetResult.score}%**) for **${targetResult.scheme.name}**.\n\n**Unmet criteria:**\n${unmet.map((u) => `• ${u}`).join("\n")}`,
          action: { label: "Review your applicant details", to: "/apply" },
          source: "grounded-engine",
          relevantScheme: targetResult.scheme,
        };
      }
    } else if (targetScheme) {
      return {
        text: `**${targetScheme.name}** eligibility criteria:\n• **Maximum Annual Income:** ₹${targetScheme.incomeLimit.toLocaleString("en-IN")}\n• **Minimum Education:** ${targetScheme.minEducation.replace("-", " ")}\n• **Loan Range:** ${formatINR(targetScheme.loanMin)} to ${formatINR(targetScheme.loanMax)}\n• **Supported Business Types:** ${targetScheme.supportedBusinessTypes.join(", ")}\n\nTo evaluate your eligibility deterministically, submit your details on **Find My Scheme**.`,
        action: { label: "Check my eligibility", to: "/apply" },
        source: "grounded-engine",
        relevantScheme: targetScheme,
      };
    } else {
      return {
        text: `SchemeSaathi checks your eligibility deterministically based on:\n1. **Business/Project Type**\n2. **Annual Family Income**\n3. **Education Level**\n4. **Project Cost**\n\nSubmit your details on Find My Scheme (or select a demo applicant) to see your exact eligibility result.`,
        action: { label: "Go to Find My Scheme", to: "/apply" },
        source: "grounded-engine",
      };
    }
  }

  // --------------------------------------------------------------------------
  // 4. ELIGIBILITY REQUIREMENTS FOR SCHEMES (Who can apply?)
  // --------------------------------------------------------------------------
  if (
    q.includes("eligibility") ||
    q.includes("requirement") ||
    q.includes("who can apply") ||
    q.includes("income limit") ||
    q.includes("education requirement") ||
    q.includes("criteria")
  ) {
    if (targetScheme) {
      return {
        text: `**Eligibility Criteria for ${targetScheme.name}:**\n\n• **Annual Family Income:** Up to ₹${targetScheme.incomeLimit.toLocaleString("en-IN")}/year (0 = no cap)\n• **Minimum Education:** ${targetScheme.minEducation.replace("-", " ")}\n• **Loan Amount Range:** ${formatINR(targetScheme.loanMin)} – ${formatINR(targetScheme.loanMax)}\n• **Own Contribution (Margin):** ${targetScheme.marginContributionPct}%\n• **Supported Business Activities:** ${targetScheme.supportedBusinessTypes.join(", ")}${targetScheme.age ? `\n• **Age Range:** ${targetScheme.age.min ?? "—"} to ${targetScheme.age.max ?? "—"} years` : ""}${targetScheme.minBusinessExperience ? `\n• **Experience:** ${targetScheme.minBusinessExperience}+ years preferred` : ""}`,
        action: { label: "Check your eligibility", to: "/apply" },
        source: "grounded-engine",
        relevantScheme: targetScheme,
      };
    }
  }

  // --------------------------------------------------------------------------
  // 5. REQUIRED DOCUMENTS (Strictly from targetScheme.documents)
  // --------------------------------------------------------------------------
  if (
    q.includes("document") ||
    q.includes("paper") ||
    q.includes("aadhaar") ||
    q.includes("aadhar") ||
    q.includes("certificate") ||
    q.includes("proof") ||
    q.includes("what to bring")
  ) {
    if (targetScheme && targetScheme.documents && targetScheme.documents.length > 0) {
      return {
        text: `**Required Documents for ${targetScheme.name}:**\n\n${targetScheme.documents.map((d) => `• ${d}`).join("\n")}`,
        action: { label: "View application checklist", to: "/results" },
        source: "grounded-engine",
        relevantScheme: targetScheme,
      };
    } else {
      return {
        text: "Please select a scheme to see its verified document requirements. If the information is unavailable, it needs verification from the official government source.",
        action: { label: "Find My Scheme", to: "/apply" },
        source: "grounded-engine",
      };
    }
  }

  // --------------------------------------------------------------------------
  // 6. SCHEME DETAILS, OVERVIEW & BENEFITS
  // --------------------------------------------------------------------------
  if (
    q.includes("what is") ||
    q.includes("tell me about") ||
    q.includes("details") ||
    q.includes("benefit") ||
    q.includes("interest rate") ||
    q.includes("tenure") ||
    q.includes("moratorium") ||
    q.includes("loan amount") ||
    (targetScheme && q.includes(targetScheme.name.toLowerCase()))
  ) {
    if (targetScheme) {
      return {
        text: `**${targetScheme.name}** (${targetScheme.category}):\n${targetScheme.description}\n\n• **Loan Amount:** ${formatINR(targetScheme.loanMin)} – ${formatINR(targetScheme.loanMax)}\n• **Interest Rate:** ${targetScheme.interestRate}% per annum\n• **Moratorium Period:** ${targetScheme.moratoriumMonths} months\n• **Maximum Repayment Tenure:** ${targetScheme.maxTenureMonths} months\n• **Own Contribution:** ${targetScheme.marginContributionPct}%\n• **Supported Activities:** ${targetScheme.supportedBusinessTypes.slice(0, 4).join(", ")}`,
        action: { label: "Plan repayment", to: "/results" },
        source: "grounded-engine",
        relevantScheme: targetScheme,
      };
    }
  }

  // --------------------------------------------------------------------------
  // 7. LIST ALL AVAILABLE SCHEMES
  // --------------------------------------------------------------------------
  if (
    q.includes("all schemes") ||
    q.includes("list schemes") ||
    q.includes("which schemes") ||
    q.includes("what schemes") ||
    q.includes("available schemes")
  ) {
    const list = SCHEMES.map(
      (s) => `• **${s.name}** (${s.category}): ${formatINR(s.loanMin)}–${formatINR(s.loanMax)}, ${s.interestRate}% interest`
    ).join("\n");

    return {
      text: `SchemeSaathi includes the following verified welfare credit schemes:\n\n${list}\n\nComplete the questionnaire on **Find My Scheme** to see which one best matches your profile.`,
      action: { label: "Find My Scheme", to: "/apply" },
      source: "grounded-engine",
    };
  }

  // --------------------------------------------------------------------------
  // 8. EMI & REPAYMENT INQUIRIES (Grounding in emiCalculator.ts behavior)
  // --------------------------------------------------------------------------
  if (
    q.includes("emi") ||
    q.includes("repay") ||
    q.includes("repayment") ||
    q.includes("afford") ||
    q.includes("calculator") ||
    q.includes("installment")
  ) {
    let text = `SchemeSaathi includes an interactive **Financial Calculator** on the Results page that computes repayment using the standard reducing-balance EMI formula.`;
    if (targetScheme) {
      text += `\n\nFor **${targetScheme.name}**:\n• **Interest Rate:** ${targetScheme.interestRate}%\n• **Moratorium:** ${targetScheme.moratoriumMonths} months (interest accrues and capitalizes before EMI repayment starts)\n• **Max Tenure:** ${targetScheme.maxTenureMonths} months\n• **Own Contribution (Margin):** ${targetScheme.marginContributionPct}%`;
    }
    text += `\n\nYou can adjust loan amount and tenure sliders on the Results page to see estimated monthly EMI and income burden share.`;

    return {
      text,
      action: { label: "Open repayment calculator", to: "/results#repayment" },
      source: "grounded-engine",
      relevantScheme: targetScheme,
    };
  }

  // --------------------------------------------------------------------------
  // 9. CHANNEL PARTNER & LOCATIONS (Grounding in partners.ts)
  // --------------------------------------------------------------------------
  if (
    q.includes("partner") ||
    q.includes("bank") ||
    q.includes("where to apply") ||
    q.includes("branch") ||
    q.includes("locator") ||
    q.includes("location") ||
    q.includes("channel")
  ) {
    let text = `The **Channel Partner Locator** filters intermediaries (State Channelizing Agencies, Public Sector Banks, Regional Rural Banks, and NBFC-MFIs) to show only partners that support your scheme's category.`;
    if (targetScheme) {
      text += `\n\nFor **${targetScheme.name}** (category: *${targetScheme.category}*), the locator displays nearest eligible partners sorted by distance.`;
    }

    return {
      text,
      action: { label: "View eligible partners", to: "/results#partner" },
      source: "grounded-engine",
      relevantScheme: targetScheme,
    };
  }

  // --------------------------------------------------------------------------
  // 10. UNVERIFIED / UNKNOWN EXTERNAL SCHEMES SAFEGUARD
  // --------------------------------------------------------------------------
  const knownTokens = ["udyam", "sahayog", "swavalamban", "vidya", "kaushal", "vikas", "schemesaathi"];
  const isAskingExternal = !knownTokens.some((t) => q.includes(t)) && (q.includes("yojana") || q.includes("scheme") || q.includes("pm ") || q.includes("subsidy") || q.includes("grant"));

  if (isAskingExternal) {
    return {
      text: `This information is not available in the current SchemeSaathi data and needs verification from the official government source.\n\nSchemeSaathi currently assists with verified welfare credit schemes configured in the application. You can explore available schemes using the button below.`,
      action: { label: "Find My Scheme", to: "/apply" },
      source: "grounded-engine",
    };
  }

  // --------------------------------------------------------------------------
  // 11. REUSE EXISTING CHATBOT INTENTS OR DEFAULT GUIDANCE
  // --------------------------------------------------------------------------
  const fallbackReply = getFallbackIntentReply(query, {
    bestScheme: targetScheme?.name,
    hasResult: hasResults,
  });

  return {
    text: fallbackReply.text,
    action: fallbackReply.action,
    source: "grounded-engine",
  };
}
