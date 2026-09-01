import { useEffect, useMemo, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useI18n } from "../../i18n";
import { calculateLoan, withIncomeBurden } from "../../services/emiCalculator";
import { formatINR, formatPercent } from "../../utils/format";
import { Slider } from "../ui/Slider";
import type { Scheme } from "../../types";

interface Props {
  scheme: Scheme;
  projectCost: number;
  annualIncome: number;
}

export function EMICalculator({ scheme, projectCost, annualIncome }: Props) {
  const { t } = useI18n();

  // Loanable ceiling = project cost minus any required own contribution.
  const downPayment = projectCost * (scheme.marginContributionPct / 100);
  const maxLoan = Math.max(
    scheme.loanMin,
    Math.min(Math.floor(projectCost - downPayment), scheme.loanMax)
  );

  const [principal, setPrincipal] = useState(maxLoan);
  const [tenureMonths, setTenureMonths] = useState(scheme.maxTenureMonths);

  // Reset sliders whenever the scheme or project cost changes.
  useEffect(() => {
    setPrincipal(maxLoan);
    setTenureMonths(scheme.maxTenureMonths);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scheme.id, projectCost]);

  const calc = useMemo(() => {
    const base = calculateLoan({
      principal,
      annualRate: scheme.interestRate,
      tenureMonths,
      moratoriumMonths: scheme.moratoriumMonths,
    });
    return withIncomeBurden(base, annualIncome);
  }, [principal, tenureMonths, scheme, annualIncome]);

  const pieData = [
    { name: t("chartPrincipal"), value: calc.principal },
    { name: t("chartInterest"), value: Math.max(0, calc.totalInterest) },
  ];

  const tenureYears = (tenureMonths / 12).toFixed(1);

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Sliders + inputs */}
      <div className="space-y-6">
        <div className="rounded-2xl bg-brand-600 p-5 text-white">
          <p className="text-sm font-medium text-brand-100">{t("emiMonthly")}</p>
          <p className="text-4xl font-extrabold tabular-nums">
            {formatINR(calc.emi)}
            <span className="text-lg font-semibold text-brand-200"> /mo</span>
          </p>
          <div className="mt-3 h-2 w-full rounded-full bg-white/20">
            <div
              className="h-2 rounded-full bg-white"
              style={{ width: `${Math.min(100, calc.monthlyBurdenPct)}%` }}
            />
          </div>
          <p className="mt-1.5 text-xs text-brand-100">
            {calc.monthlyBurdenPct.toFixed(0)}% {t("emiBurden")}
          </p>
        </div>

        <Slider
          label={t("sliderLoan")}
          displayValue={formatINR(principal)}
          min={scheme.loanMin}
          max={maxLoan}
          step={5000}
          value={principal}
          onChange={setPrincipal}
        />
        <Slider
          label={t("sliderTenure")}
          displayValue={`${tenureYears} ${t("tenure").toLowerCase()}`}
          min={12}
          max={scheme.maxTenureMonths}
          step={12}
          value={tenureMonths}
          onChange={setTenureMonths}
        />

        <div className="grid grid-cols-3 gap-3">
          <MiniStat label={t("emiTotalPayment")} value={formatINR(calc.totalRepayment)} />
          <MiniStat label={t("emiTotalInterest")} value={formatINR(calc.totalInterest)} />
          <MiniStat
            label={t("interestRate")}
            value={formatPercent(calc.annualRate)}
          />
        </div>

        <p className="text-xs leading-relaxed text-slate-500">
          {t("calcNote")} ({t("downPayment")}: {formatINR(downPayment)} · {t("moratorium")}:{" "}
          {calc.moratoriumMonths} mo)
        </p>
      </div>

      {/* Chart */}
      <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={3}
              strokeWidth={0}
            >
              <Cell fill="#2b4ae3" />
              <Cell fill="#f59e0b" />
            </Pie>
            <Tooltip formatter={(v: number) => formatINR(v)} />
          </PieChart>
        </ResponsiveContainer>
        <div className="mt-3 flex gap-5 text-sm">
          <Legend color="bg-brand-500" label={`${t("chartPrincipal")} · ${formatINR(calc.principal)}`} />
          <Legend color="bg-amber-500" label={`${t("chartInterest")} · ${formatINR(calc.totalInterest)}`} />
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 text-center">
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-bold tabular-nums text-slate-800">{value}</p>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-2 font-medium text-slate-600">
      <span className={`h-3 w-3 rounded-full ${color}`} />
      {label}
    </span>
  );
}
