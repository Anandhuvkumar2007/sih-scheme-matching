import { useI18n } from "../i18n";
import { Card } from "../components/ui/Card";
import { ApplicantForm } from "../components/flow/ApplicantForm";
import { ProgressTracker } from "../components/ui/ProgressTracker";

export function Apply() {
  const { t } = useI18n();

  const steps = [
    { id: "profile", label: t("formStep1"), done: true, current: true },
    { id: "scheme", label: t("formStep2"), done: false },
    { id: "repayment", label: t("formStep3"), done: false },
    { id: "partner", label: t("formStep4"), done: false },
    { id: "ready", label: t("formStep5"), done: false },
  ];

  return (
    <div className="bg-slate-50 py-10 sm:py-14">
      <div className="container-page max-w-3xl">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            {t("applyTitle")}
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-lg text-slate-600">{t("applySubtitle")}</p>
        </div>

        <div className="mt-8">
          <Card className="p-5">
            <ProgressTracker steps={steps} />
          </Card>
        </div>

        <Card className="mt-6 p-6 sm:p-8">
          <ApplicantForm />
        </Card>
      </div>
    </div>
  );
}
