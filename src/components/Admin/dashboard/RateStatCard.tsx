import { AlertTriangle, Landmark, LineChart, TrendingDown, type LucideIcon } from "lucide-react";
import type { RateStat, RateTone } from "../../../data/mockInterestRates";

const ICONS: Record<RateStat["icon"], LucideIcon> = {
  bank: Landmark,
  "trend-down": TrendingDown,
  chart: LineChart,
  alert: AlertTriangle,
};

const TONES: Record<RateTone, string> = {
  primary: "bg-primary-100 text-primary-600",
  success: "bg-success/10 text-success",
  violet: "bg-primary-100 text-primary-600",
  warning: "bg-amber-100 text-warning",
};

export default function RateStatCard({ stat }: { stat: RateStat }) {
  const Icon = ICONS[stat.icon];
  return (
    <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-body">{stat.label}</p>
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${TONES[stat.tone]}`}>
          <Icon size={18} />
        </span>
      </div>
      <div className="mt-3 flex items-end justify-between gap-3">
        <p className="text-4xl font-bold text-footer">{stat.value}</p>
        <p className={`pb-1 text-right text-[11px] ${stat.noteTone === "warning" ? "text-warning" : "text-muted"}`}>{stat.note}</p>
      </div>
    </div>
  );
}
