import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Sparkles } from "lucide-react";
import { useI18n } from "../../i18n";
import { useApplicant } from "../../context/ApplicantContext";
import { useToast } from "../ui/Toast";
import { Button } from "../ui/Button";
import { SCHEMES } from "../../data/schemes";
import { DEMO_PROFILES } from "../../data/demoProfiles";
import type { Applicant, EducationLevel } from "../../types";

// All project/business types supported across every scheme (for the select).
const PROJECT_TYPES = Array.from(
  new Set(SCHEMES.flatMap((s) => s.supportedBusinessTypes))
).sort();

const EDUCATION_OPTIONS: { value: EducationLevel; label: string }[] = [
  { value: "none", label: "No formal education" },
  { value: "primary", label: "Primary" },
  { value: "upper-primary", label: "Upper primary" },
  { value: "secondary", label: "Secondary" },
  { value: "higher-secondary", label: "Higher secondary" },
  { value: "graduate", label: "Graduate / above" },
];

interface Draft {
  name: string;
  projectType: string;
  projectCost: string;
  annualIncome: string;
  education: EducationLevel;
  location: string;
  age: string;
  category: string;
  businessExperienceYears: string;
}

const EMPTY: Draft = {
  name: "",
  projectType: "",
  projectCost: "",
  annualIncome: "",
  education: "secondary",
  location: "",
  age: "",
  category: "",
  businessExperienceYears: "",
};

export function ApplicantForm() {
  const { t } = useI18n();
  const { submitApplicant } = useApplicant();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof Draft, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  const set = (key: keyof Draft, value: string) => {
    setDraft((d) => ({ ...d, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const loadDemo = (profileId: string) => {
    const profile = DEMO_PROFILES.find((p) => p.id === profileId);
    if (!profile) return;
    const a = profile.applicant;
    setDraft({
      name: a.name,
      projectType: a.projectType,
      projectCost: String(a.projectCost),
      annualIncome: String(a.annualIncome),
      education: a.education,
      location: a.location,
      age: a.age != null ? String(a.age) : "",
      category: a.category ?? "",
      businessExperienceYears:
        a.businessExperienceYears != null ? String(a.businessExperienceYears) : "",
    });
    setErrors({});
  };

  const validate = (): boolean => {
    const next: Partial<Record<keyof Draft, string>> = {};
    if (!draft.name.trim()) next.name = t("errorRequired");
    if (!draft.projectType) next.projectType = t("errorRequired");
    if (!draft.location.trim()) next.location = t("errorRequired");
    if (!draft.projectCost || Number(draft.projectCost) <= 0) next.projectCost = t("errorCost");
    if (!draft.annualIncome || Number(draft.annualIncome) < 0) next.annualIncome = t("errorIncome");
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const applicant: Applicant = {
      name: draft.name.trim(),
      projectType: draft.projectType.trim(),
      projectCost: Number(draft.projectCost),
      annualIncome: Number(draft.annualIncome),
      education: draft.education,
      location: draft.location.trim(),
      age: draft.age ? Number(draft.age) : null,
      category: draft.category.trim() || null,
      businessExperienceYears: draft.businessExperienceYears
        ? Number(draft.businessExperienceYears)
        : null,
    };

    setSubmitting(true);
    // Simulate a short async step so the loading state is visible.
    window.setTimeout(() => {
      submitApplicant(applicant);
      setSubmitting(false);
      showToast({ type: "success", title: t("toastRecTitle"), message: t("toastRecMsg") });
      navigate("/results");
    }, 600);
  };

  return (
    <div>
      {/* Demo profile shortcuts */}
      <div className="mb-6">
        <p className="mb-2 text-sm font-medium text-slate-500">{t("demoPull")}</p>
        <div className="flex flex-wrap gap-2">
          {DEMO_PROFILES.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => loadDemo(p.id)}
              className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3 py-1.5 text-sm font-semibold text-brand-700 hover:bg-brand-100"
            >
              <Sparkles className="h-3.5 w-3.5" />
              {p.name}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={onSubmit} noValidate className="space-y-5">
        <div>
          <label className="label" htmlFor="name">{t("fieldName")} *</label>
          <input
            id="name"
            className="input"
            value={draft.name}
            onChange={(e) => set("name", e.target.value)}
            autoComplete="name"
          />
          {errors.name && <p className="field-error">{errors.name}</p>}
        </div>

        <div>
          <label className="label" htmlFor="projectType">{t("fieldProjectType")} *</label>
          <select
            id="projectType"
            className="input"
            value={draft.projectType}
            onChange={(e) => set("projectType", e.target.value)}
          >
            <option value="">{t("placeholderProject")}</option>
            {PROJECT_TYPES.map((pt) => (
              <option key={pt} value={pt}>{pt}</option>
            ))}
          </select>
          {errors.projectType && <p className="field-error">{errors.projectType}</p>}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="projectCost">{t("fieldProjectCost")} *</label>
            <input
              id="projectCost"
              className="input"
              type="number"
              min={0}
              step={1000}
              value={draft.projectCost}
              onChange={(e) => set("projectCost", e.target.value)}
              placeholder="e.g. 500000"
            />
            {errors.projectCost && <p className="field-error">{errors.projectCost}</p>}
          </div>
          <div>
            <label className="label" htmlFor="annualIncome">{t("fieldAnnualIncome")} *</label>
            <input
              id="annualIncome"
              className="input"
              type="number"
              min={0}
              step={1000}
              value={draft.annualIncome}
              onChange={(e) => set("annualIncome", e.target.value)}
              placeholder="e.g. 150000"
            />
            {errors.annualIncome && <p className="field-error">{errors.annualIncome}</p>}
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="education">{t("fieldEducation")} *</label>
            <select
              id="education"
              className="input"
              value={draft.education}
              onChange={(e) => set("education", e.target.value)}
            >
              {EDUCATION_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="location">{t("fieldLocation")} *</label>
            <input
              id="location"
              className="input"
              value={draft.location}
              onChange={(e) => set("location", e.target.value)}
              placeholder="e.g. Kochi"
            />
            {errors.location && <p className="field-error">{errors.location}</p>}
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          <div>
            <label className="label" htmlFor="age">{t("fieldAge")}</label>
            <input
              id="age"
              className="input"
              type="number"
              min={16}
              max={70}
              value={draft.age}
              onChange={(e) => set("age", e.target.value)}
            />
          </div>
          <div>
            <label className="label" htmlFor="category">{t("fieldCategory")}</label>
            <select id="category" className="input" value={draft.category} onChange={(e) => set("category", e.target.value)}>
              <option value="">—</option>
              <option value="Scheduled Caste">Scheduled Caste</option>
              <option value="Scheduled Tribe">Scheduled Tribe</option>
              <option value="Other Backward Class">Other Backward Class</option>
              <option value="Economically Weaker Section">Economically Weaker Section</option>
            </select>
          </div>
          <div>
            <label className="label" htmlFor="experience">{t("fieldExperience")}</label>
            <input
              id="experience"
              className="input"
              type="number"
              min={0}
              max={40}
              value={draft.businessExperienceYears}
              onChange={(e) => set("businessExperienceYears", e.target.value)}
            />
          </div>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
          {t("demoNote")} — {t("disclaimer")}
        </div>

        <Button type="submit" className="w-full py-3.5 text-base" disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              {t("btnSubmit")}…
            </>
          ) : (
            t("btnSubmit")
          )}
        </Button>
      </form>
    </div>
  );
}
