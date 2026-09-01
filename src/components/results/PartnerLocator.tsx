import { useMemo, useState } from "react";
import { MapPin, Phone, CheckCircle2, Building2, ArrowUpDown } from "lucide-react";
import { useI18n } from "../../i18n";
import {
  PARTNERS,
  partnersForCategory,
  sortByDistance,
  categoryToLabel,
} from "../../data/partners";
import { Badge } from "../ui/Badge";
import { formatDistance } from "../../utils/format";
import type { ChannelPartner, ProjectCategory } from "../../types";

interface Props {
  category: ProjectCategory;
  applicantLocation: string;
}

const RISK_TONE = { Low: "emerald", Medium: "amber", High: "rose" } as const;
const STATUS_TONE = { High: "emerald", Moderate: "brand", Low: "amber" } as const;

export function PartnerLocator({ category, applicantLocation }: Props) {
  const { t } = useI18n();
  const [sortBy, setSortBy] = useState<"distance" | "capacity">("distance");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const eligible = useMemo(() => partnersForCategory(PARTNERS, category), [category]);

  const sorted = useMemo(() => {
    if (sortBy === "capacity") {
      const order = { "High capacity": 0, "Moderate capacity": 1, "Low capacity": 2 } as const;
      return [...eligible].sort((a, b) => {
        const d = order[a.processingStatus] - order[b.processingStatus];
        return d !== 0 ? d : a.distanceKm - b.distanceKm;
      });
    }
    return sortByDistance(eligible);
  }, [eligible, sortBy]);

  const selected = sorted.find((p) => p.id === selectedId) ?? null;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Mock map */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-brand-50/60">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          aria-hidden
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(43,74,227,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(43,74,227,0.08) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="relative flex h-[340px] items-center justify-center">
          {/* Focal point: the applicant's location */}
          <div
            className="absolute h-3 w-3 rounded-full bg-rose-500 ring-4 ring-rose-200"
            style={{ left: "62%", top: "50%" }}
            aria-hidden
          >
            <span className="absolute -inset-2 animate-ping rounded-full bg-rose-300/50" />
          </div>

          {sorted.map((p) => {
            const isSelected = selectedId === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setSelectedId(isSelected ? null : p.id)}
                aria-label={p.name}
                className={`absolute -translate-x-1/2 -translate-y-full transition-transform ${
                  isSelected ? "z-10 scale-125" : "hover:scale-110"
                }`}
                style={{ left: `${p.lng}%`, top: `${100 - p.lat * 0.9}%` }}
              >
                <MapPin
                  className={`h-7 w-7 drop-shadow ${
                    isSelected ? "text-brand-700" : "text-brand-500"
                  }`}
                  fill={isSelected ? "#1f2d86" : "#3e67ee"}
                />
              </button>
            );
          })}

          {/* Selected partner mini-card */}
          {selected && (
            <div className="absolute bottom-3 left-3 right-3 z-20 rounded-xl border border-slate-200 bg-white/95 p-3 shadow-lift backdrop-blur">
              <p className="font-bold text-slate-900">{selected.name}</p>
              <p className="mt-0.5 text-sm text-slate-600">
                {selected.type} · {selected.location} · {formatDistance(selected.distanceKm)}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <Badge tone="emerald">
                  <CheckCircle2 className="h-3 w-3" /> {t("canProcess")}
                </Badge>
              </div>
            </div>
          )}
        </div>
        <div className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-slate-500 backdrop-blur">
          {applicantLocation} · {t("moduleLocatorTitle")}
        </div>
      </div>

      {/* Partner list */}
      <div className="flex flex-col">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-slate-500">
            {t("showingNote").replace("{count}", String(sorted.length))} —{" "}
            {categoryToLabel[category]}
          </p>
          <div className="flex gap-1">
            <SortPill active={sortBy === "distance"} onClick={() => setSortBy("distance")}>
              <ArrowUpDown className="h-3.5 w-3.5" /> {t("sortNearest")}
            </SortPill>
            <SortPill active={sortBy === "capacity"} onClick={() => setSortBy("capacity")}>
              <Building2 className="h-3.5 w-3.5" /> {t("sortCapacity")}
            </SortPill>
          </div>
        </div>

        <ul className="space-y-3 overflow-y-auto pr-1 lg:max-h-[340px]">
          {sorted.map((p) => (
            <li
              key={p.id}
              className={`card cursor-pointer p-4 transition ${
                selectedId === p.id ? "ring-2 ring-brand-500" : "hover:border-slate-300"
              }`}
              onClick={() => setSelectedId(selectedId === p.id ? null : p.id)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-bold text-slate-900">{p.name}</p>
                  <p className="mt-0.5 text-sm text-slate-600">
                    {p.type} · {p.location}
                  </p>
                </div>
                <Badge tone="brand">{formatDistance(p.distanceKm)}</Badge>
              </div>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                <StatusBadge partner={p} />
                <RiskBadge partner={p} />
              </div>
              <div className="mt-3 flex items-center justify-between gap-2">
                <div className="flex flex-wrap gap-1">
                  {p.supportedCategories.slice(0, 2).map((c) => (
                    <span
                      key={c}
                      className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600"
                    >
                      {categoryToLabel[c]}
                    </span>
                  ))}
                </div>
                <a
                  href={`tel:${p.phone.replace(/\s/g, "")}`}
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700"
                >
                  <Phone className="h-3.5 w-3.5" /> {t("call")}
                </a>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function SortPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold transition ${
        active ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
      }`}
    >
      {children}
    </button>
  );
}

function StatusBadge({ partner }: { partner: ChannelPartner }) {
  const tone = STATUS_TONE[partner.processingStatus.split(" ")[0] as "High" | "Moderate" | "Low"];
  return <Badge tone={tone}>{partner.processingStatus}</Badge>;
}

function RiskBadge({ partner }: { partner: ChannelPartner }) {
  const tone = RISK_TONE[partner.npaRisk];
  return <Badge tone={tone}>NPA {partner.npaRisk}</Badge>;
}
