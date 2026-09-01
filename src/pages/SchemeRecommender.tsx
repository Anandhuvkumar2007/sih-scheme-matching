import { useState, useMemo, useEffect } from "react";
import { Sparkles, ShieldCheck, Compass } from "lucide-react";
import { Card } from "../components/ui/Card";
import { ProgressTracker } from "../components/ui/ProgressTracker";
import { SchemeRecommenderForm } from "../components/flow/SchemeRecommenderForm";
import { DemoSchemeCards } from "../components/results/DemoSchemeCards";
import { DEMO_RECOMMENDER_SCHEMES } from "../data/demoRecommenderSchemes";
import { matchSchemes } from "../services/schemeMatchingEngine";
import { useI18n } from "../i18n";
import type { SchemeRecommenderProfile } from "../types";

export function SchemeRecommender() {
  const { t } = useI18n();
  const [profile, setProfile] = useState<SchemeRecommenderProfile | null>(() => {
    try {
      const saved = sessionStorage.getItem("schemesaathi_profile");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isEditing, setIsEditing] = useState(false);

  // Sync profile with session storage for seamless browser back/forward navigation
  useEffect(() => {
    try {
      if (profile) {
        sessionStorage.setItem("schemesaathi_profile", JSON.stringify(profile));
      } else {
        sessionStorage.removeItem("schemesaathi_profile");
      }
    } catch {
      // Ignore storage errors
    }
  }, [profile]);

  const steps = [
    {
      id: "questionnaire",
      label: "Entrepreneur Questionnaire",
      done: profile !== null && !isEditing,
      current: profile === null || isEditing,
    },
    {
      id: "matching",
      label: "Matching & Eligibility Engine",
      done: profile !== null && !isEditing,
      current: profile !== null && !isEditing,
    },
    {
      id: "guidance",
      label: "Application Guidance & Portals",
      done: false,
      current: false,
    },
  ];

  // Run the Scheme Matching Engine whenever a profile is present
  const results = useMemo(() => {
    if (!profile) return [];
    return matchSchemes(profile, DEMO_RECOMMENDER_SCHEMES);
  }, [profile]);

  const handleComplete = (submittedProfile: SchemeRecommenderProfile) => {
    setProfile(submittedProfile);
    setIsEditing(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleEdit = () => {
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleReset = () => {
    setProfile(null);
    setIsEditing(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="bg-slate-50 py-10 sm:py-14">
      <div className="container-page max-w-5xl">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3.5 py-1 text-xs font-bold text-brand-700">
            <Sparkles className="h-3.5 w-3.5" />
            <span>SIH AI-Driven Welfare Credit Matching</span>
          </div>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            {profile && !isEditing
              ? t("recommenderResultsHeading")
              : t("recommenderHeading")}
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-base text-slate-600 sm:text-lg">
            {profile && !isEditing
              ? t("recommenderResultsSubheading")
              : t("recommenderSubheading")}
          </p>
        </div>

        {/* Flow Progress Tracker */}
        <div className="mt-8">
          <Card className="p-5">
            <ProgressTracker steps={steps} />
          </Card>
        </div>

        {/* Main Content: Either Questionnaire or Scored Scheme Cards */}
        <div className="mt-6">
          {profile && !isEditing ? (
            <DemoSchemeCards
              profile={profile}
              results={results}
              onEdit={handleEdit}
              onReset={handleReset}
            />
          ) : (
            <Card className="p-6 sm:p-8">
              <SchemeRecommenderForm
                initialProfile={profile}
                onComplete={handleComplete}
              />
            </Card>
          )}
        </div>

        {/* Bottom Trust Badge */}
        <div className="mt-8 flex items-center justify-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            Transparent & Confidential
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <Compass className="h-4 w-4 text-brand-600" />
            Direct Channel Financing
          </span>
        </div>
      </div>
    </div>
  );
}
