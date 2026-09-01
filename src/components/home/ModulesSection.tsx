import { Sparkles, Calculator, MapPin } from "lucide-react";
import { useI18n } from "../../i18n";
import { SectionHeading } from "../ui/SectionHeading";
import { Reveal } from "../ui/Reveal";

const MODULES = [
  { icon: Sparkles, title: "moduleRecommendTitle" as const, desc: "moduleRecommendDesc" as const, tone: "text-brand-600 bg-brand-50" },
  { icon: Calculator, title: "moduleCalcTitle" as const, desc: "moduleCalcDesc" as const, tone: "text-emerald-600 bg-emerald-50" },
  { icon: MapPin, title: "moduleLocatorTitle" as const, desc: "moduleLocatorDesc" as const, tone: "text-amber-600 bg-amber-50" },
];

export function ModulesSection() {
  const { t } = useI18n();
  return (
    <section id="modules" className="bg-gradient-to-b from-slate-50 to-white py-16 sm:py-24">
      <div className="container-page">
        <Reveal>
          <SectionHeading title={t("modulesTitle")} subtitle={t("modulesSubtitle")} />
        </Reveal>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {MODULES.map((m, i) => (
            <Reveal key={m.title} delay={i * 90}>
              <div className="card h-full p-6 text-center">
                <span className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${m.tone}`}>
                  <m.icon className="h-7 w-7" />
                </span>
                <h3 className="mt-4 text-lg font-bold text-slate-900">{t(m.title)}</h3>
                <p className="mt-1.5 text-base font-semibold text-slate-600">{t(m.desc)}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
