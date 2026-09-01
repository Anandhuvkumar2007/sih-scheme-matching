import { FileText, Target, Calculator, MapPin } from "lucide-react";
import { useI18n } from "../../i18n";
import { SectionHeading } from "../ui/SectionHeading";
import { Reveal } from "../ui/Reveal";

const STEPS = [
  { icon: FileText, title: "step1Title" as const, desc: "step1Desc" as const },
  { icon: Target, title: "step2Title" as const, desc: "step2Desc" as const },
  { icon: Calculator, title: "step3Title" as const, desc: "step3Desc" as const },
  { icon: MapPin, title: "step4Title" as const, desc: "step4Desc" as const },
];

export function HowItWorks() {
  const { t } = useI18n();
  return (
    <section id="how-it-works" className="bg-white py-16 sm:py-24">
      <div className="container-page">
        <Reveal>
          <SectionHeading title={t("howItWorksTitle")} subtitle={t("howItWorksSubtitle")} />
        </Reveal>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <Reveal key={step.title} delay={i * 90}>
              <div className="card relative h-full p-6">
                <span className="absolute right-5 top-5 text-4xl font-extrabold text-slate-100">
                  {i + 1}
                </span>
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <step.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-4 text-lg font-bold text-slate-900">{t(step.title)}</h3>
                <p className="mt-1.5 text-sm text-slate-600">{t(step.desc)}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
