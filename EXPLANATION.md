# SchemeSaathi — Code Walkthrough for Beginners

This guide explains the project **file by file** in the order you should read it.
It assumes you know basic programming and are learning React + TypeScript.
Read this top-to-bottom; each section builds on the last.

Jump to a section:
1. [Project structure](#1-project-structure)
2. [Entry point](#2-entry-point)
3. [App and routing](#3-app-and-routing)
4. [Landing page](#4-landing-page)
5. [Applicant form](#5-applicant-form)
6. [Recommendation engine](#6-recommendation-engine)
7. [Scheme data](#7-scheme-data)
8. [EMI calculator](#8-emi-calculator)
9. [Partner locator](#9-partner-locator)
10. [Partner filtering](#10-partner-filtering)
11. [Results dashboard](#11-results-dashboard)
12. [Multilingual system](#12-multilingual-system)
13. [Reusable components](#13-reusable-components)
14. [Styling](#14-styling)
15. [README](#15-readme)

---

## 1. Project structure

```
schemesaathi/
  index.html            → the single HTML page Vite loads
  package.json          → dependencies + scripts
  vite.config.ts        → Vite build/dev config
  tailwind.config.js    → Tailwind theme (colors, fonts, animations)
  postcss.config.js     → process Tailwind → CSS
  tsconfig.json         → TypeScript compiler options
  src/
    main.tsx            → entry point: mounts the app
    App.tsx             → router + page layout
    index.css           → global styles + Tailwind
    types/index.ts      → all TypeScript types (the "shape" of data)
    data/               → sample data (schemes, partners, demo profiles, FAQ)
    services/           → pure logic (recommendation engine, EMI math)
    components/         → reusable UI pieces
    pages/              → one file per screen (Landing, Apply, Results)
    context/            → shared global state (the applicant + result)
    hooks/              → reusable React hooks
    i18n/               → translations (English/Malayalam/Hindi)
    utils/              → helper functions (₹ formatting)
```

**Key idea:** we separate *data* (`data/`), *logic* (`services/`), and *what you see* (`components/`, `pages/`). That is why swapping mock data for a real API later is easy.

---

## 2. Entry point — `src/main.tsx`

```tsx
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <I18nProvider>
          <ApplicantProvider>
            <App />
          </ApplicantProvider>
        </I18nProvider>
      </ToastProvider>
    </BrowserRouter>
  </React.StrictMode>
);
```

- `createRoot(...).render(...)` is how React 18 attaches the app to the `<div id="root">` in `index.html`.
- **Providers** wrap the app to give every component access to shared things:
  - `BrowserRouter` — enables routes like `/apply` and `/results`.
  - `ToastProvider` — lets any component show a toast notification.
  - `I18nProvider` — gives any component the `t()` translation function.
  - `ApplicantProvider` — gives any component the applicant + result state.
- Order matters here only for which components are available where; every provider knows about the ones outside it.

**React concept:** *Context* — a way to share data without passing it through props at every level. You'll see `createContext` + `useContext` later.

---

## 3. App and routing — `src/App.tsx`

```tsx
<Routes>
  <Route path="/" element={<Landing />} />
  <Route path="/apply" element={<Apply />} />
  <Route path="/results" element={<Results />} />
  <Route path="*" element={<Landing />} />
</Routes>
```

- `Routes`/`Route` come from `react-router-dom`. Each `<Route>` says "show this component when the URL is this path."
- `path="*"` is a fallback: any unknown URL shows the Landing page (so the app never breaks).
- `<ScrollToTop>` scrolls to the top whenever the route changes — a small custom component using `useLocation`.

The layout wraps the routes:

```tsx
<div className="flex min-h-screen flex-col">
  <Navbar />      {/* always on top */}
  <main className="flex-1">…routes…</main>
  <Footer />      {/* always at the bottom */}
</div>
```

`flex flex-col` + `flex-1` on `<main>` pins the footer to the bottom of tall pages — a CSS trick you'll use a lot.

---

## 4. Landing page — `src/pages/Landing.tsx` (+ `components/home/`)

`Landing` simply renders section components in order:

```tsx
<Hero /><ProblemSection /><HowItWorks /><ModulesSection /><CTASection /><FAQSection />
```

- **`Hero.tsx`** — the headline, CTA buttons, and a decorative "result preview" card. Note the CTAs: "Find My Scheme" is a `<Link to="/apply">` (navigates to the form); "See How It Works" is an `<a href="#how-it-works">` (jumps to the section on the same page).
- **`ProblemSection.tsx`** — shows the "Today" (confusing) flow vs the "With SchemeSaathi" (simple) flow. The little `Flow` component is reused for both — it's a `components`-style refactor (avoid duplicate JSX).
- **`HowItWorks`** — 4 step cards. Each step's text is looked up through `t("step1Title")` etc., so it translates automatically.
- **`FAQSection`** — an *accordion*. `useState` tracks which item is open; clicking a header toggles it. Built with a real `<button>` + `aria-expanded` so it's keyboard-accessible.

**React concept:** `useState` — local component memory. `const [open, setOpen] = useState<number | null>(0);`

---

## 5. Applicant form — `src/components/flow/ApplicantForm.tsx`

This is the most interactive file. It manages the form's data and validates it.

**Form state** is stored as strings (so the text boxes can be empty while the user types):

```ts
interface Draft { name: string; projectType: string; projectCost: string; … }
```

Numbers are converted later, in `onSubmit`. This avoids the classic bug where typing `500000` temporarily can't be `Number()`.

**Controlled inputs:** every field's `value` comes from `draft`, and typing calls `set(...)`:

```tsx
<input value={draft.name} onChange={(e) => set("name", e.target.value)} />
```

**"Try Demo" autofill:** `loadDemo(profileId)` finds a demo profile in `demoProfiles.ts` and sets every field from it — this is the "Wow" moment during the demo.

**Validation** on submit:

```ts
const validate = () => {
  const next: Partial<Record<keyof Draft, string>> = {};
  if (!draft.name.trim()) next.name = t("errorRequired");
  if (!draft.projectCost || Number(draft.projectCost) <= 0)
    next.projectCost = t("errorCost");
  …
  setErrors(next);
  return Object.keys(next).length === 0;
};
```

Errors are stored in an object keyed by field name and rendered under each input (`{errors.name && <p className="field-error">…</p>}`).

**Submitting:**

```tsx
submitApplicant(applicant);          // saves to context + runs the rules engine
showToast({ type: "success", … });   // feedback notification
navigate("/results");                // go to the results screen
```

It's wrapped in `setTimeout(…, 600)` to show a brief loading spinner — a realistic touch, not a real API call.

---

## 6. Recommendation engine — `src/services/recommendationEngine.ts`

This is the heart of "Smart Scheme Matching" — and it is deliberately **not** AI. It's a readable scoring function.

For each scheme it builds an array of `EligibilityRule`s:

```ts
const projectMatch = scheme.supportedBusinessTypes.some(
  (type) => type.toLowerCase() === applicant.projectType.trim().toLowerCase()
);
eligibility.push({ label: `Business type supported…`, key: "projectType",
                   required: true, met: projectMatch, detail: … });
```

Each rule gets a `met: true/false`. Then we compute a score by summing the weights of rules that are satisfied:

```ts
const REQUIRED_WEIGHTS = { projectType: 35, income: 25, education: 20, cost: 20 };
const earned = requiredRules.reduce((sum, r) => sum + (r.met ? REQUIRED_WEIGHTS[r.key] : 0), 0);
const score = Math.round((earned / 100) * 100);
```

Soft rules (age, experience) add up to a little bonus when the core is fully eligible. The function returns:

```ts
{ scheme, score, reasons[], eligibility[], missingRequirements[], fullyEligible }
```

`recommend(applicant, schemes)` maps **all** schemes through `scoreScheme` and sorts them, so the top pick *and* the alternatives both come from here. The UI never hard-codes which scheme wins — it just renders the engine's output.

**Where to modify:** the `REQUIRED_WEIGHTS` and rule checks.

---

## 7. Scheme data — `src/data/schemes.ts`

Just an array of `Scheme` objects. Example (abridged):

```ts
{
  id: "term-loan-udyam",
  name: "Udyam Term Loan Yojana",
  category: "term-loan",
  supportedBusinessTypes: ["Small food-processing business", …],
  incomeLimit: 500000,
  minEducation: "secondary",
  loanMin: 100000,
  loanMax: 2000000,
  interestRate: 6.5,
  moratoriumMonths: 6,
  maxTenureMonths: 84,
  marginContributionPct: 10,   // 10% own contribution required
  documents: [ … ],
}
```

The engine reads exactly these fields, so **editing this file changes recommendations instantly** — no UI code touched. The header comment calls it out as sample data, as required.

---

## 8. EMI calculator — `src/services/emiCalculator.ts` (+ `components/results/EMICalculator.tsx`)

The math function:

```ts
export function calculateLoan({ principal, annualRate, tenureMonths, moratoriumMonths }) {
  const monthlyRate = annualRate > 0 ? annualRate / 12 / 100 : 0;
  const n = Math.max(1, tenureMonths);

  // Moratorium: interest accrues into the principal before repayment starts.
  let capitalized = principal;
  if (moratoriumMonths > 0 && monthlyRate > 0)
    capitalized = principal * Math.pow(1 + monthlyRate, moratoriumMonths);

  // Standard reducing-balance EMI formula.
  const emi = monthlyRate === 0
    ? capitalized / n
    : (capitalized * monthlyRate * Math.pow(1 + monthlyRate, n))
      / (Math.pow(1 + monthlyRate, n) - 1);
  …
}
```

- `monthlyRate` is the annual rate divided by 12 and 100.
- **0% interest** is a special-case branch so we never divide by zero.
- The `withIncomeBurden` helper adds `emi / monthlyIncome` as the repayment burden %.

**The interactive UI** (`EMICalculator.tsx`) holds two `useState` values — the loan amount and tenure — driven by `<Slider>` components. Because the calculation is a *pure function* of those values, everything (EMI number, chart) updates automatically on every slider change via `useMemo`. The chart is a Recharts donut splitting **Principal** vs **Interest**.

**React concept:** `useMemo` — recomputes a value only when its inputs change, avoiding wasted work on every render.

---

## 9. Partner locator — `components/results/PartnerLocator.tsx`

Two halves:

1. **The simulated map** — a `div` with a CSS grid background and absolutely-positioned `<MapPin>` markers. Each marker's position comes from the partner's `lat`/`lng` (0–100):

```tsx
<button style={{ left: `${p.lng}%`, top: `${100 - p.lat * 0.9}%` }}>
  <MapPin … />
</button>
```

Clicking a marker selects it and shows a mini-info card. There's also a pulsing "you are here" dot. This is a convincing map without any API — and, as the README notes, swapping in a real map later only means mapping these same coordinates.

2. **The list** — clickable partner cards showing type, location, distance badge, capacity, NPA risk, supported categories, and a "Call" button (`<a href="tel:…">`).

---

## 10. Partner filtering — `src/data/partners.ts`

The filtering functions are pure and tiny:

```ts
export function partnersForCategory(partners, category) {
  return partners.filter((p) => p.supportedCategories.includes(category));
}
export function sortByDistance(partners) {
  return [...partners].sort((a, b) => a.distanceKm - b.distanceKm);
}
```

- `partnersForCategory` is what enforces **"only show partners that can process my recommended scheme."** The locator calls it with the recommended scheme's `category`, so if the recommendation changes, the eligible partner set changes too.
- `sortByDistance` is your distance sorting; the locator's `sortBy` state also supports sorting by capacity with a small custom comparator.

Notice `[...partners]` — we copy before sorting so we never mutate the original array. Good practice.

---

## 11. Results dashboard — `src/pages/Results.tsx`

This page *orchestrates* everything and only renders if a recommendation exists:

```tsx
if (!state.applicant || !state.results?.length) {
  return <EmptyState … link to /apply />;   // guard: no data yet
}
const best = state.results[0];               // the top recommendation
const nearest = sortByDistance(partnersForCategory(PARTNERS, best.scheme.category))[0];
```

It builds a **progress tracker** (5 steps), four **dashboard stat cards** (best match, EMI, nearest partner, readiness %), then renders:

- `SchemeResultCard` — the recommended scheme, match ring, "why you qualify", a toggleable **full explanation** of the rules, loan details, and required documents.
- Alternatives (the next few scored schemes).
- `EMICalculator`.
- `PartnerLocator`.
- `Checklist` — the application checklist + "Clear Next Step" box.

**React concept:** conditional rendering — `if (!state.results?.length) return <EmptyState …>` — the page returns a different UI when there's no data.

---

## 12. Multilingual system — `src/i18n/`

**`en.ts`** exports `en` — the canonical dictionary — and derives a type from it:

```ts
export const en = { brand: "SchemeSaathi", heroCta: "Find My Scheme", … } as const;
export type Messages = typeof en;
```

**`ml.ts` / `hi.ts`** are partial dictionaries:

```ts
export const ml: Partial<Messages> = { brand: "സ്കീം സാഥി", … };
```

**`index.tsx`** wires it together with a Context:

```ts
const t = (key: MessageKey) => dict[key] ?? en[key] ?? key;
```

So `t(key)` returns the current language's text, falling back to English for anything untranslated. The `LanguageSelector` dropdown calls `setLang(...)`.

**Adding a language** = create `ta.ts` and register it in two lists. Done.

**TypeScript highlight:** because `Messages` is `typeof en`, TypeScript will *error* if you type a key that was never defined in English — misspelled translation keys are caught at compile time.

---

## 13. Reusable components — `src/components/ui/`

- **`Button.tsx`** — wraps styling into `variant`s (`primary`, `ghost`, `success`). Props pass through so any button attribute works.
- **`Ring.tsx`** — an SVG circular progress ring. It animates via React state (an effect sets the value, and CSS `transition` on `stroke-dashoffset` animates the arc).
- **`Toast.tsx`** — a Context shows auto-dismissing notifications in the corner (`aria-live="polite"` for screen readers).
- **`ProgressTracker.tsx`** — takes an array of `{label, done, current}` and draws numbered circles connected by lines.
- **`Reveal.tsx`** — uses the **IntersectionObserver** API to fade content in as it scrolls into view (a subtle "wow" without heavy libraries).
- **`Badge`, `Card`, `Slider`, `Tabs`, `SectionHeading`, `EmptyState`** — small presentational pieces with no business logic.

The idea behind reusable components: one place to change a style, and no copy-pasted JSX.

---

## 14. Styling — Tailwind CSS

```css
/* src/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer components {
  .btn { @apply inline-flex items-center justify-center rounded-xl …; }
  .btn-primary { @apply btn bg-brand-600 text-white …; }
}
```

- Tailwind generates utility classes; we extend it in `tailwind.config.js` with a custom **palette** (`brand` indigo, `accent` emerald/amber), fonts, shadows, and a few animations (fade-up, pop).
- We define `.btn`, `.input`, `.label`, `.card` component classes with `@apply` so buttons/inputs look consistent everywhere.
- High-contrast colors + `:focus-visible` outlines + real form labels keep it accessible.

---

## 15. README — `README.md`

Read the README before demoing: it explains the problem/solution, how to run (`npm install && npm run dev`), how the engine/EMI/filtering work, and exactly how to swap mock data for a real backend.

---

### Summary of the data flow (end-to-end)

```
Landing → click "Find My Scheme"
      → /apply: ApplicantForm collects inputs
      → submitApplicant() in ApplicantContext runs recommend() (rules engine)
      → result saved to context + localStorage
      → navigate('/results')
      → /results reads the recommendation, computes EMI via calculateLoan(),
        filters partners via partnersForCategory() + sortByDistance()
      → user can switch language (i18n) and everything re-renders in that language
```

Good luck at the hackathon! 🚀
