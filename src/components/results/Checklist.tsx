import { CheckCircle2, MapPin } from "lucide-react";
import { useI18n } from "../../i18n";
import { calculateLoan, withIncomeBurden } from "../../services/emiCalculator";
import { formatINR } from "../../utils/format";
import { Button } from "../ui/Button";
import { useToast } from "../ui/Toast";
import type { ChannelPartner, Scheme } from "../../types";

interface Props {
  scheme: Scheme;
  projectCost: number;
  annualIncome: number;
  fullyEligible: boolean;
  nearestPartner: ChannelPartner | null;
}

export function Checklist({
  scheme,
  projectCost,
  annualIncome,
  fullyEligible,
  nearestPartner,
}: Props) {
  const { t } = useI18n();
  const { showToast } = useToast();

  const downPayment = projectCost * (scheme.marginContributionPct / 100);
  const maxLoan = Math.max(
    scheme.loanMin,
    Math.min(Math.floor(projectCost - downPayment), scheme.loanMax)
  );
  const calc = withIncomeBurden(
    calculateLoan({
      principal: maxLoan,
      annualRate: scheme.interestRate,
      tenureMonths: scheme.maxTenureMonths,
      moratoriumMonths: scheme.moratoriumMonths,
    }),
    annualIncome
  );

  const items = [
    { label: t("profileDone"), done: true },
    { label: t("schemeDone"), done: fullyEligible },
    { label: t("repaymentDone"), done: true },
    { label: t("partnerDone"), done: Boolean(nearestPartner) },
    { label: t("readyToApply"), done: fullyEligible && Boolean(nearestPartner) },
  ];
  const doneCount = items.filter((i) => i.done).length;
  const readyPct = Math.round((doneCount / items.length) * 100);

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900">{t("checklistTitle")}</h3>
        <span className="text-sm font-bold text-brand-700">{readyPct}%</span>
      </div>
      <div className="mt-3 h-2 w-full rounded-full bg-slate-100">
        <div
          className="h-2 rounded-full bg-emerald-500 transition-all"
          style={{ width: `${readyPct}%` }}
        />
      </div>

      <ul className="mt-4 space-y-2">
        {items.map((item) => (
          <li key={item.label} className="flex items-center gap-2.5 text-sm">
            <CheckCircle2
              className={`h-5 w-5 ${
                item.done ? "text-emerald-500" : "text-slate-300"
              }`}
            />
            <span className={item.done ? "font-medium text-slate-700" : "text-slate-400"}>
              {item.label}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-5 rounded-xl bg-ink-800 p-4 text-white">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-300">
          {t("nextStep")}
        </p>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold">
              <MapPin className="h-4 w-4 text-emerald-400" />
              {nearestPartner
                ? `${nearestPartner.name} · ${nearestPartner.distanceKm} km`
                : "—"}
            </p>
            <p className="mt-1 text-sm text-slate-300">{t("applyNow")}</p>
          </div>
          <Button
            variant="success"
            onClick={() =>
              showToast({
                type: "success",
                title: t("applyNow"),
                message: `${nearestPartner?.name ?? "A channel partner"} · ${t("toastRecTitle")}`,
              })
            }
          >
            {t("applyNow")}
          </Button>
        </div>
      </div>

      <p className="mt-4 text-center text-2xl font-extrabold text-slate-900">
        {formatINR(calc.emi)}
        <span className="text-sm font-semibold text-slate-500"> /mo</span>
        <span className="ml-2 text-sm font-medium text-slate-400">{t("emiMonthly")}</span>
      </p>
    </div>
  );
}
