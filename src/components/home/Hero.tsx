import { Link } from "react-router-dom";
import { ArrowRight, PlayCircle, MapPin, Calculator, Sparkles } from "lucide-react";
import { useI18n } from "../../i18n";
import { Button } from "../ui/Button";

export function Hero() {
  const { t } = useI18n();

  return (
    <section className="relative overflow-hidden bg-white">
      {/* Decorative gradient blobs */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-brand-100/60 blur-3xl" />
        <div className="absolute top-10 right-0 h-80 w-80 rounded-full bg-emerald-100/50 blur-3xl" />
      </div>

      <div className="container-page relative grid items-center gap-12 py-16 sm:py-24 lg:grid-cols-2">
        <div className="animate-fade-up">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
            <Sparkles className="h-3.5 w-3.5" />
            {t("heroBadge")}
          </span>
          <h1 className="mt-5 text-4xl font-extrabold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl">
            {t("heroTitle")}
          </h1>
          <p className="mt-5 max-w-xl text-lg text-slate-600">{t("heroSubtitle")}</p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/apply">
              <Button className="w-full px-7 py-3.5 text-base sm:w-auto">
                {t("heroCta")}
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <a href="#how-it-works">
              <Button variant="ghost" className="w-full px-7 py-3.5 text-base sm:w-auto">
                <PlayCircle className="h-5 w-5" />
                {t("heroCta2")}
              </Button>
            </a>
          </div>
        </div>

        {/* Hero visual: mini result-preview mockup */}
        <div className="relative animate-fade-up" style={{ animationDelay: "120ms" }}>
          <div className="card p-6 shadow-lift">
            <p className="text-xs font-bold uppercase tracking-wider text-brand-600">
              {t("recommendedByRules")}
            </p>
            <h3 className="mt-1 text-xl font-extrabold text-slate-900">
              Udyam Term Loan Yojana
            </h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Match</p>
                <p className="text-lg font-extrabold text-brand-600">96%</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Est. EMI</p>
                <p className="text-lg font-extrabold text-slate-900">₹9,240/mo</p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
              <MapPin className="h-4 w-4 shrink-0" />
              <span>Kerala SC Development Finance Corporation · 3.0 km</span>
            </div>
            <div className="mt-3 flex items-center justify-between rounded-xl border border-slate-200 p-3 text-sm">
              <span className="flex items-center gap-2 text-slate-700">
                <Calculator className="h-4 w-4 text-brand-600" />
                {t("moduleCalcTitle")}
              </span>
              <span className="font-semibold text-slate-900">6.5% · 84 mo</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
