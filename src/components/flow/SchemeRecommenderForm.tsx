import { useState, useEffect } from "react";
import {
  User,
  IndianRupee,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Briefcase,
  Award,
  Mic,
  AlertCircle,
} from "lucide-react";
import { Button } from "../ui/Button";
import { VoiceInputButton } from "../ui/VoiceInputButton";
import { useSpeechRecognition } from "../../hooks/useSpeechRecognition";
import { useI18n } from "../../i18n";
import type { SchemeRecommenderProfile } from "../../types";

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi (NCT)",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

const GENDER_OPTIONS = [
  "Male",
  "Female",
  "Transgender",
  "Prefer not to say",
] as const;

const SOCIAL_CATEGORIES = [
  "Scheduled Caste (SC)",
  "Scheduled Tribe (ST)",
  "Other Backward Class (OBC)",
  "Economically Weaker Section (EWS)",
  "General / Other",
] as const;

const BUSINESS_TYPES = [
  "Food Processing & Agro-Products",
  "Retail / Kirana / General Store",
  "Tailoring, Garments & Textiles",
  "Handicrafts, Pottery & Traditional Arts",
  "Agriculture, Poultry & Dairy Farming",
  "Beauty, Wellness & Personal Care",
  "Automobile Repair & Fabrication Workshop",
  "Carpentry & Woodwork",
  "Leather Products & Footwear",
  "Small Scale Manufacturing",
  "Digital Services & IT Support",
  "Other Micro Enterprise",
];

const OCCUPATION_OPTIONS = [
  "Daily Wage Artisan / Craftsperson",
  "Street Vendor / Hawker",
  "Small Shop Owner / Retailer",
  "Farmer / Agricultural Laborer",
  "Unemployed / Aspiring Entrepreneur",
  "Self-Employed Freelancer / Skilled Worker",
  "Student / Recent Graduate",
  "Homemaker / Self-Help Group (SHG) Member",
  "Other",
];

const BUSINESS_STAGES = [
  "Idea / New Venture",
  "Existing Business",
] as const;

const DISABILITY_OPTIONS = [
  "None / Not Applicable",
  "Locomotor Disability",
  "Visual Impairment",
  "Hearing Impairment",
  "Other",
] as const;

interface FormDraft {
  age: string;
  state: string;
  gender: string;
  socialCategory: string;
  occupation: string;
  businessType: string;
  businessStage: string;
  annualIncome: string;
  disabilityStatus: string;
  requiredFinancialAssistance: string;
}

const EMPTY_DRAFT: FormDraft = {
  age: "",
  state: "",
  gender: "",
  socialCategory: "",
  occupation: "",
  businessType: "",
  businessStage: "",
  annualIncome: "",
  disabilityStatus: "None / Not Applicable",
  requiredFinancialAssistance: "",
};

const DEMO_PERSONAS = [
  {
    label: "SC First-Time Artisan (Kerala)",
    data: {
      age: "27",
      state: "Kerala",
      gender: "Female",
      socialCategory: "Scheduled Caste (SC)",
      occupation: "Daily Wage Artisan / Craftsperson",
      businessType: "Handicrafts, Pottery & Traditional Arts",
      businessStage: "Idea / New Venture",
      annualIncome: "120000",
      disabilityStatus: "None / Not Applicable",
      requiredFinancialAssistance: "250000",
    },
  },
  {
    label: "OBC Kirana Vendor (Tamil Nadu)",
    data: {
      age: "36",
      state: "Tamil Nadu",
      gender: "Male",
      socialCategory: "Other Backward Class (OBC)",
      occupation: "Small Shop Owner / Retailer",
      businessType: "Retail / Kirana / General Store",
      businessStage: "Existing Business",
      annualIncome: "180000",
      disabilityStatus: "None / Not Applicable",
      requiredFinancialAssistance: "500000",
    },
  },
  {
    label: "ST Agro-Food Entrepreneur (Maharashtra)",
    data: {
      age: "31",
      state: "Maharashtra",
      gender: "Female",
      socialCategory: "Scheduled Tribe (ST)",
      occupation: "Farmer / Agricultural Laborer",
      businessType: "Food Processing & Agro-Products",
      businessStage: "Idea / New Venture",
      annualIncome: "150000",
      disabilityStatus: "None / Not Applicable",
      requiredFinancialAssistance: "750000",
    },
  },
];

interface Props {
  onComplete: (profile: SchemeRecommenderProfile) => void;
  initialProfile?: SchemeRecommenderProfile | null;
}

export function SchemeRecommenderForm({ onComplete, initialProfile }: Props) {
  const { t } = useI18n();
  const {
    isListening,
    activeField,
    error: voiceError,
    isSupported: isVoiceSupported,
    startListening,
    stopListening,
  } = useSpeechRecognition();

  const [draft, setDraft] = useState<FormDraft>(() => {
    if (initialProfile) {
      return {
        age: String(initialProfile.age),
        state: initialProfile.state,
        gender: initialProfile.gender,
        socialCategory: initialProfile.socialCategory,
        occupation: initialProfile.occupation,
        businessType: initialProfile.businessType,
        businessStage: initialProfile.businessStage,
        annualIncome: String(initialProfile.annualIncome),
        disabilityStatus: initialProfile.disabilityStatus,
        requiredFinancialAssistance: String(initialProfile.requiredFinancialAssistance),
      };
    }
    return EMPTY_DRAFT;
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormDraft, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialProfile) {
      setDraft({
        age: String(initialProfile.age),
        state: initialProfile.state,
        gender: initialProfile.gender,
        socialCategory: initialProfile.socialCategory,
        occupation: initialProfile.occupation,
        businessType: initialProfile.businessType,
        businessStage: initialProfile.businessStage,
        annualIncome: String(initialProfile.annualIncome),
        disabilityStatus: initialProfile.disabilityStatus,
        requiredFinancialAssistance: String(initialProfile.requiredFinancialAssistance),
      });
    }
  }, [initialProfile]);

  const update = (key: keyof FormDraft, value: string) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const applyDemo = (personaData: FormDraft) => {
    setDraft({ ...personaData });
    setErrors({});
  };

  const validate = (): boolean => {
    const errs: Partial<Record<keyof FormDraft, string>> = {};

    // 1. Age
    const ageNum = Number(draft.age);
    if (!draft.age.trim()) {
      errs.age = "Age is required.";
    } else if (isNaN(ageNum) || ageNum < 18 || ageNum > 90) {
      errs.age = "Please enter a valid age between 18 and 90.";
    }

    // 2. State
    if (!draft.state.trim()) {
      errs.state = "Please select your state or union territory.";
    }

    // 3. Gender
    if (!draft.gender.trim()) {
      errs.gender = "Please select your gender.";
    }

    // 4. Social category
    if (!draft.socialCategory.trim()) {
      errs.socialCategory = "Please select your social category.";
    }

    // 5. Occupation
    if (!draft.occupation.trim()) {
      errs.occupation = "Please select or specify your current occupation.";
    }

    // 6. Business type
    if (!draft.businessType.trim()) {
      errs.businessType = "Please select the type of business/project.";
    }

    // 7. Business stage
    if (!draft.businessStage.trim()) {
      errs.businessStage = "Please select whether this is a new idea or existing business.";
    }

    // 8. Annual income
    const incomeNum = Number(draft.annualIncome);
    if (!draft.annualIncome.trim()) {
      errs.annualIncome = "Annual family income is required.";
    } else if (isNaN(incomeNum) || incomeNum < 0) {
      errs.annualIncome = "Please enter a valid annual income in ₹.";
    }

    // 9. Disability status
    if (!draft.disabilityStatus.trim()) {
      errs.disabilityStatus = "Please specify disability status.";
    }

    // 10. Required financial assistance
    const assistanceNum = Number(draft.requiredFinancialAssistance);
    if (!draft.requiredFinancialAssistance.trim()) {
      errs.requiredFinancialAssistance = "Required financial assistance amount is required.";
    } else if (isNaN(assistanceNum) || assistanceNum <= 0) {
      errs.requiredFinancialAssistance = "Please enter a valid loan or grant amount greater than ₹0.";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setTimeout(() => {
      const profile: SchemeRecommenderProfile = {
        age: Number(draft.age),
        state: draft.state,
        gender: draft.gender as SchemeRecommenderProfile["gender"],
        socialCategory: draft.socialCategory as SchemeRecommenderProfile["socialCategory"],
        occupation: draft.occupation,
        businessType: draft.businessType,
        businessStage: draft.businessStage as SchemeRecommenderProfile["businessStage"],
        annualIncome: Number(draft.annualIncome),
        disabilityStatus: draft.disabilityStatus as SchemeRecommenderProfile["disabilityStatus"],
        requiredFinancialAssistance: Number(draft.requiredFinancialAssistance),
      };

      onComplete(profile);
      setSubmitting(false);
    }, 300);
  };

  const handleReset = () => {
    setDraft(EMPTY_DRAFT);
    setErrors({});
  };

  return (
    <div className="space-y-8">
      {/* Demo Persona Shortcuts for quick SIH testing */}
      <div className="rounded-2xl border border-brand-100 bg-brand-50/70 p-4 sm:p-5">
        <div className="flex items-center gap-2 text-sm font-bold text-brand-900">
          <Sparkles className="h-4 w-4 text-brand-600" />
          <span>Quick Demo Personas (One-Click Pre-fill):</span>
        </div>
        <p className="mt-1 text-xs text-slate-600">
          Select a sample profile to instantly populate all 10 entrepreneur questionnaire fields.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {DEMO_PERSONAS.map((persona) => (
            <button
              key={persona.label}
              type="button"
              onClick={() => applyDemo(persona.data)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-brand-200 bg-white px-3 py-1.5 text-xs font-semibold text-brand-800 shadow-sm transition hover:bg-brand-100 hover:border-brand-300"
            >
              <Award className="h-3.5 w-3.5 text-brand-600" />
              {persona.label}
            </button>
          ))}
        </div>
      </div>

      {/* Voice Recognition Status Banner */}
      {isListening && (
        <div
          role="status"
          className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-800 animate-pulse"
        >
          <div className="flex items-center gap-2">
            <Mic className="h-4 w-4 text-rose-600 animate-bounce" />
            <span>
              <strong>Listening...</strong> Speak clearly (e.g. your age or amount). Click mic or wait to finish.
            </span>
          </div>
          <button
            type="button"
            onClick={stopListening}
            className="rounded-lg bg-rose-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-rose-700"
          >
            Stop
          </button>
        </div>
      )}

      {voiceError && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800"
        >
          <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
          <span>{voiceError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-8">
        {/* SECTION 1: Personal & Demographics */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
              <User className="h-4 w-4" />
            </span>
            <h3 className="text-base font-bold text-slate-900">
              1. Personal Demographics & Background
            </h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Age */}
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="rec-age" className="label mb-0">
                  {t("qAgeLabel")} <span className="text-rose-500">*</span>
                </label>
                <VoiceInputButton
                  fieldId="age"
                  isListening={isListening && activeField === "age"}
                  isSupported={isVoiceSupported}
                  onStart={() =>
                    startListening("age", (val) => update("age", val), {
                      numericOnly: true,
                    })
                  }
                  onStop={stopListening}
                />
              </div>
              <div className="relative mt-1">
                <input
                  id="rec-age"
                  type="number"
                  min={18}
                  max={90}
                  placeholder="e.g. 28"
                  className="input"
                  value={draft.age}
                  onChange={(e) => update("age", e.target.value)}
                  aria-required="true"
                  aria-invalid={Boolean(errors.age)}
                  aria-describedby={errors.age ? "error-rec-age" : undefined}
                />
              </div>
              {errors.age && (
                <p id="error-rec-age" role="alert" className="field-error">
                  {errors.age}
                </p>
              )}
            </div>

            {/* State */}
            <div>
              <label htmlFor="rec-state" className="label">
                {t("qStateLabel")} <span className="text-rose-500">*</span>
              </label>
              <select
                id="rec-state"
                className="input"
                value={draft.state}
                onChange={(e) => update("state", e.target.value)}
                aria-required="true"
                aria-invalid={Boolean(errors.state)}
                aria-describedby={errors.state ? "error-rec-state" : undefined}
              >
                <option value="">-- Select State / UT --</option>
                {INDIAN_STATES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
              {errors.state && (
                <p id="error-rec-state" role="alert" className="field-error">
                  {errors.state}
                </p>
              )}
            </div>

            {/* Gender */}
            <div>
              <label htmlFor="rec-gender" className="label">
                {t("qGenderLabel")} <span className="text-rose-500">*</span>
              </label>
              <select
                id="rec-gender"
                className="input"
                value={draft.gender}
                onChange={(e) => update("gender", e.target.value)}
                aria-required="true"
                aria-invalid={Boolean(errors.gender)}
                aria-describedby={errors.gender ? "error-rec-gender" : undefined}
              >
                <option value="">-- Select Gender --</option>
                {GENDER_OPTIONS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
              {errors.gender && (
                <p id="error-rec-gender" role="alert" className="field-error">
                  {errors.gender}
                </p>
              )}
            </div>

            {/* Social Category */}
            <div>
              <label htmlFor="rec-socialCategory" className="label">
                {t("qCategoryLabel")} <span className="text-rose-500">*</span>
              </label>
              <select
                id="rec-socialCategory"
                className="input"
                value={draft.socialCategory}
                onChange={(e) => update("socialCategory", e.target.value)}
                aria-required="true"
                aria-invalid={Boolean(errors.socialCategory)}
                aria-describedby={
                  errors.socialCategory ? "error-rec-socialCategory" : undefined
                }
              >
                <option value="">-- Select Social Category --</option>
                {SOCIAL_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {errors.socialCategory && (
                <p id="error-rec-socialCategory" role="alert" className="field-error">
                  {errors.socialCategory}
                </p>
              )}
            </div>

            {/* Disability Status */}
            <div className="sm:col-span-2 lg:col-span-2">
              <label htmlFor="rec-disabilityStatus" className="label">
                {t("qDisabilityLabel")} <span className="text-rose-500">*</span>
              </label>
              <select
                id="rec-disabilityStatus"
                className="input"
                value={draft.disabilityStatus}
                onChange={(e) => update("disabilityStatus", e.target.value)}
                aria-required="true"
                aria-invalid={Boolean(errors.disabilityStatus)}
                aria-describedby={
                  errors.disabilityStatus ? "error-rec-disabilityStatus" : undefined
                }
              >
                {DISABILITY_OPTIONS.map((dis) => (
                  <option key={dis} value={dis}>
                    {dis}
                  </option>
                ))}
              </select>
              {errors.disabilityStatus && (
                <p id="error-rec-disabilityStatus" role="alert" className="field-error">
                  {errors.disabilityStatus}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 2: Occupation & Business Profile */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
              <Briefcase className="h-4 w-4" />
            </span>
            <h3 className="text-base font-bold text-slate-900">
              2. Occupation & Enterprise Details
            </h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Occupation */}
            <div className="sm:col-span-2 lg:col-span-1">
              <label htmlFor="rec-occupation" className="label">
                {t("qOccupationLabel")} <span className="text-rose-500">*</span>
              </label>
              <select
                id="rec-occupation"
                className="input"
                value={draft.occupation}
                onChange={(e) => update("occupation", e.target.value)}
                aria-required="true"
                aria-invalid={Boolean(errors.occupation)}
                aria-describedby={errors.occupation ? "error-rec-occupation" : undefined}
              >
                <option value="">-- Select Occupation --</option>
                {OCCUPATION_OPTIONS.map((occ) => (
                  <option key={occ} value={occ}>
                    {occ}
                  </option>
                ))}
              </select>
              {errors.occupation && (
                <p id="error-rec-occupation" role="alert" className="field-error">
                  {errors.occupation}
                </p>
              )}
            </div>

            {/* Business Type */}
            <div className="sm:col-span-2 lg:col-span-1">
              <label htmlFor="rec-businessType" className="label">
                {t("qBusinessTypeLabel")} <span className="text-rose-500">*</span>
              </label>
              <select
                id="rec-businessType"
                className="input"
                value={draft.businessType}
                onChange={(e) => update("businessType", e.target.value)}
                aria-required="true"
                aria-invalid={Boolean(errors.businessType)}
                aria-describedby={errors.businessType ? "error-rec-businessType" : undefined}
              >
                <option value="">-- Select Business Sector --</option>
                {BUSINESS_TYPES.map((bt) => (
                  <option key={bt} value={bt}>
                    {bt}
                  </option>
                ))}
              </select>
              {errors.businessType && (
                <p id="error-rec-businessType" role="alert" className="field-error">
                  {errors.businessType}
                </p>
              )}
            </div>

            {/* Business Stage */}
            <div className="sm:col-span-2 lg:col-span-1">
              <label htmlFor="rec-businessStage" className="label">
                {t("qBusinessStageLabel")} <span className="text-rose-500">*</span>
              </label>
              <select
                id="rec-businessStage"
                className="input"
                value={draft.businessStage}
                onChange={(e) => update("businessStage", e.target.value)}
                aria-required="true"
                aria-invalid={Boolean(errors.businessStage)}
                aria-describedby={errors.businessStage ? "error-rec-businessStage" : undefined}
              >
                <option value="">-- Select Stage --</option>
                {BUSINESS_STAGES.map((bs) => (
                  <option key={bs} value={bs}>
                    {bs}
                  </option>
                ))}
              </select>
              {errors.businessStage && (
                <p id="error-rec-businessStage" role="alert" className="field-error">
                  {errors.businessStage}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 3: Financial Requirements */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100 text-violet-700">
              <IndianRupee className="h-4 w-4" />
            </span>
            <h3 className="text-base font-bold text-slate-900">
              3. Financial Capacity & Requirement
            </h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Annual Income */}
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="rec-annualIncome" className="label mb-0">
                  {t("qIncomeLabel")} <span className="text-rose-500">*</span>
                </label>
                <VoiceInputButton
                  fieldId="annualIncome"
                  isListening={isListening && activeField === "annualIncome"}
                  isSupported={isVoiceSupported}
                  onStart={() =>
                    startListening("annualIncome", (val) => update("annualIncome", val), {
                      numericOnly: true,
                    })
                  }
                  onStop={stopListening}
                />
              </div>
              <div className="relative mt-1">
                <input
                  id="rec-annualIncome"
                  type="number"
                  min={0}
                  step={5000}
                  placeholder="e.g. 150000"
                  className="input"
                  value={draft.annualIncome}
                  onChange={(e) => update("annualIncome", e.target.value)}
                  aria-required="true"
                  aria-invalid={Boolean(errors.annualIncome)}
                  aria-describedby={errors.annualIncome ? "error-rec-annualIncome" : undefined}
                />
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Total combined annual income of family from all sources.
              </p>
              {errors.annualIncome && (
                <p id="error-rec-annualIncome" role="alert" className="field-error">
                  {errors.annualIncome}
                </p>
              )}
            </div>

            {/* Required Financial Assistance */}
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="rec-financialAssistance" className="label mb-0">
                  {t("qAssistanceLabel")} <span className="text-rose-500">*</span>
                </label>
                <VoiceInputButton
                  fieldId="requiredFinancialAssistance"
                  isListening={
                    isListening && activeField === "requiredFinancialAssistance"
                  }
                  isSupported={isVoiceSupported}
                  onStart={() =>
                    startListening(
                      "requiredFinancialAssistance",
                      (val) => update("requiredFinancialAssistance", val),
                      { numericOnly: true }
                    )
                  }
                  onStop={stopListening}
                />
              </div>
              <div className="relative mt-1">
                <input
                  id="rec-financialAssistance"
                  type="number"
                  min={1000}
                  step={10000}
                  placeholder="e.g. 500000"
                  className="input"
                  value={draft.requiredFinancialAssistance}
                  onChange={(e) =>
                    update("requiredFinancialAssistance", e.target.value)
                  }
                  aria-required="true"
                  aria-invalid={Boolean(errors.requiredFinancialAssistance)}
                  aria-describedby={
                    errors.requiredFinancialAssistance
                      ? "error-rec-financialAssistance"
                      : undefined
                  }
                />
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Estimated loan, grant, or working capital required for project.
              </p>
              {errors.requiredFinancialAssistance && (
                <p
                  id="error-rec-financialAssistance"
                  role="alert"
                  className="field-error"
                >
                  {errors.requiredFinancialAssistance}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Submit & Reset actions */}
        <div className="pt-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3.5 text-base shadow-sm hover:shadow-lift focus:ring-2 focus:ring-brand-500 focus:outline-none"
            >
              {submitting ? (
                "Validating Profile..."
              ) : (
                <>
                  {t("btnFindSchemes")} <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={handleReset}
              className="py-3.5 focus:ring-2 focus:ring-slate-400 focus:outline-none"
            >
              <RotateCcw className="h-4 w-4" /> {t("btnResetForm")}
            </Button>
          </div>
          <p className="mt-3 text-center text-xs text-slate-500">
            All details are validated locally. Your data is used exclusively to discover matching welfare credit schemes and channel finance partners.
          </p>
        </div>
      </form>
    </div>
  );
}
