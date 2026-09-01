import { ArrowDown, CheckCircle2, XCircle } from "lucide-react";
import { useI18n } from "../../i18n";
import { Reveal } from "../ui/Reveal";

function Flow({ steps, tone }: { steps: string[]; tone: "bad" | "good" }) {
  return (
    <ol className="flex flex-col items-stretch gap-2">
      {steps.map((s, i) => (
        <li key={i} className="flex items-center gap-3">
          <span
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white ${
              tone === "bad" ? "bg-rose-500" : "bg-emerald-500"
            }`}
          >
            {tone === "bad" ? (
              <XCircle className="h-4 w-4" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
          </span>
          <span
            className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-medium ${
              tone === "bad"
                ? "border-rose-100 bg-rose-50 text-rose-800"
                : "border-emerald-100 bg-emerald-50 text-emerald-800"
            }`}
          >
            {s}
          </span>
          {i < steps.length - 1 && <ArrowDown className="h-4 w-4 text-slate-300" />}
        </li>
      ))}
    </ol>
  );
}

export function ProblemSection() {
  const { t } = useI18n();
  return (
    <section id="problem" className="bg-slate-100 py-16 sm:py-24">
      <div className="container-page">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-brand-600">
              {t("problemTitle")}
            </p>
            <p className="mt-4 text-lg text-slate-600">{t("problemSubtitle")}</p>
          </div>
        </Reveal>

        <div className="mx-auto mt-12 grid max-w-4xl gap-8 md:grid-cols-2">
          <Reveal delay={80}>
            <div className="card p-6">
              <p className="text-sm font-bold uppercase tracking-wide text-rose-600">
                {t("problemOldTitle")}
              </p>
              <div className="mt-4">
                <Flow tone="bad" steps={[t("problemStep1"), t("problemStep2"), t("problemStep3"), t("problemStep4"), t("problemStep5"), t("problemStep6")]} />
              </div>
            </div>
          </Reveal>
          <Reveal delay={160}>
            <div className="card border-emerald-200 p-6">
              <p className="text-sm font-bold uppercase tracking-wide text-emerald-600">
                {t("problemNewTitle")}
              </p>
              <div className="mt-4">
                <Flow tone="good" steps={[t("newStep1"), t("newStep2"), t("newStep3"), t("newStep4"), t("newStep5"), t("newStep6")]} />
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
