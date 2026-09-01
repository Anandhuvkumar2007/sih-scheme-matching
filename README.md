# SchemeSaathi — AI-Driven Scheme Matching for Marginalized Entrepreneurs

**SchemeSaathi** is a multilingual web application that turns a fragmented welfare-credit journey into one guided experience. It answers the three questions every applicant has:

1. **Which scheme is right for me?** — *Smart Scheme Matching* (a transparent, rule-based engine)
2. **Can I afford the repayment?** — *Financial Calculator* (reducing-balance EMI)
3. **Where should I go to apply?** — *Channel Partner Locator* (filtered to eligible partners)

Then it converges all three into **one personalized result** with a clear next step.

> ⚠️ **Demonstration project.** All schemes, partners, eligibility rules, and EMI figures shown are **fictional sample data** for a college hackathon demo. They do not represent any real government scheme, bank, or institution, and do not imply actual eligibility. Final eligibility is decided by the relevant authority / channel partner.

---

## The Problem

Beneficiaries eligible for concessional credit under Scheduled Caste welfare schemes currently navigate a fragmented **Channel Finance System** with 100+ intermediaries — State Channelizing Agencies, Public Sector Banks, Regional Rural Banks, and NBFC-MFIs. Applicants cannot tell the difference between **Micro Finance, Term Loan, Educational Loan**, and other schemes, and struggle to find a nearby partner that can actually process their application. The result: confusion, misrouted applications, and delayed disbursement.

## The Solution

`Applicant → SchemeSaathi → Right Scheme → Repayment Plan → Eligible Partner → Clear Next Step`

## Features

- **Smart Scheme Matching** — explainable rule-based scoring (explicitly *not* fake AI). Shows match %, every eligibility rule, why the applicant qualifies, and missing requirements.
- **Financial Calculator** — interactive EMI sliders, moratorium handling, 0%-interest handling, Principal-vs-Interest chart (Recharts), and a clear plain-language breakdown.
- **Channel Partner Locator** — a polished simulated map + list, **filtered by the recommended scheme category**, with distance sorting, processing capacity, NPA/overdue risk, and a call action.
- **Personalized Results Dashboard** — best match, estimated repayment, nearest eligible partner, application readiness score, and a 5-step progress tracker.
- **Application Checklist & Clear Next Step** — what to bring and where to apply.
- **Multilingual** — English / Malayalam / Hindi, architected for adding more languages in one file.
- **"Try Demo" profiles**, animated match-score ring, toasts, empty/loading states, responsive mobile layout, keyboard-friendly controls.
- **On-site demo assistant** — a floating chat widget, powered by an honest **rule-based intent matcher** (not an AI model), that answers common questions and links into the right part of the flow.

## Tech Stack

- **React 18** + **TypeScript** (strict)
- **Vite** (build tool)
- **Tailwind CSS** (v3)
- **react-router-dom** (routing)
- **lucide-react** (icons)
- **Recharts** (financial charts)

## Project Structure

```
src/
  components/
    layout/      # Navbar, Footer, LanguageSelector
    ui/          # Button, Card, Badge, Ring, Slider, Tabs, Toast,
                 #   ProgressTracker, Reveal, SectionHeading, EmptyState
    home/        # Hero, Problem, HowItWorks, Modules, FAQ, CTA
    flow/        # ApplicantForm
    results/     # SchemeResultCard, EMICalculator, PartnerLocator, Checklist
  pages/          # Landing, Apply, Results
  types/          # index.ts — all shared TypeScript types
  data/           # schemes.ts, partners.ts, demoProfiles.ts, faq.ts
  services/       # recommendationEngine.ts, emiCalculator.ts
  utils/          # format.ts (₹ INR formatting)
  hooks/          # useLocalStorage.ts
  context/        # ApplicantContext.tsx (flow state)
  i18n/           # index.tsx + en.ts / ml.ts / hi.ts
```

## How the Recommendation Engine Works

It is a **rules engine, not a machine-learning model** (see `src/services/recommendationEngine.ts`). For every scheme it evaluates a set of rules against the applicant:

| Rule | Weight | Required? |
|------|--------|-----------|
| Business type is supported by the scheme | 35 | ✅ |
| Annual income within the scheme ceiling | 25 | ✅ |
| Education meets the scheme minimum | 20 | ✅ |
| Project cost inside the loanable range | 20 | ✅ |
| Age in the preferred range | — | Optional |
| Business experience requirement | — | Optional |

Each rule contributes to a `score` (0–100). Required rules that fail become `missingRequirements`; the scheme is still ranked but shown as a partial match. Soft rules add bonus points when the core is fully eligible. The engine returns `{ scheme, score, reasons[], eligibility[], missingRequirements[] }` and the UI renders every rule so the user can see *exactly* why.

**To change the rules:** edit the weights / logic in `src/services/recommendationEngine.ts`. **To change scheme data** (limits, rates, documents): edit `src/data/schemes.ts`. Changes take effect immediately — nothing is hard-coded in the UI.

## How the EMI is Calculated

`src/services/emiCalculator.ts` uses the standard **reducing-balance** formula:

```
EMI = P × r × (1 + r)ⁿ / ((1 + r)ⁿ − 1)
```
where `r` = monthly interest rate (annual ÷ 12 ÷ 100) and `n` = tenure in months.

- **0% interest** is handled (EMI = principal ÷ months).
- **Moratorium**: interest accrues monthly during the moratorium and is *capitalized* into the principal before EMI is computed (`P × (1 + r)^m`).
- Outputs: EMI, total repayment, total interest, and the EMI as a **% of the applicant's monthly income** (monthly repayment burden).

## How Partner Filtering Works

In `src/data/partners.ts`, each partner lists `supportedCategories`. The locator calls `partnersForCategory(partners, recommendedCategory)` — filtering to partners that can process the recommended scheme — then sorts by distance (`sortByDistance`) or by capacity. If your recommendation category changes, the eligible partner set changes with it.

## How to Run

```bash
npm install
npm run dev
```

- `npm run build` — type-check + production build (must pass with zero TS errors).
- `npm run preview` — preview the production build.

### Demo walkthrough
1. Open the app → click **Find My Scheme**.
2. On the Apply page, click **Try Demo Applicant** (e.g. *First-time entrepreneur* — small food-processing business, ₹5,00,000, Kochi).
3. Submit → you land on the **personalized result dashboard**.
4. Expand **View Full Explanation** to see the exact rules.
5. Use the EMI sliders to watch the chart update.
6. Browse the filtered partner list; sort by nearest or capacity.
7. Use the language selector in the navbar to switch EN → ML → HI.

## Replacing Mock Data With a Real Backend/API

The data layer is deliberately separated from the UI, so swapping is small and localized:

1. **Schemes:** replace `SCHEMES` in `src/data/schemes.ts` with data fetched from an API (or leave it and hydrate from the server).
2. **Partners:** replace `PARTNERS` in `src/data/partners.ts` with API data; the filtering functions still work on the same `ChannelPartner` type.
3. **Recommendation:** in `src/context/ApplicantContext.tsx`, `submitApplicant` currently calls `recommend(...)`. Replace that call with `fetch("/api/recommend", { body: applicant })` — the rest of the app is unchanged because it reads the same `ScoredScheme` shape.
4. **Locations/map:** `lat`/`lng` in `partners.ts` are already numeric — swap the simulated SVG map for a real map component (e.g. Leaflet) and map these coordinates directly.

## Future Improvements

- Real auth and application persistence (the flow already persists to `localStorage`).
- Live partner availability, queue status, and application tracking.
- Rule configuration UI instead of editing code.
- More languages (add one file per language in `src/i18n`).
- Server-side validation and audit logging of recommendations.
- Accessibility: speech support for low-literacy users.

---

*Built for a college hackathon. All data is sample data for demonstration.*
