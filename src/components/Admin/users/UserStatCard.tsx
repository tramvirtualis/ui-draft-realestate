import { Clock, ShieldCheck, UserCheck, Users, type LucideIcon } from "lucide-react";
import type { UserStat } from "../../../data/mockAdminUsers";

const ICONS: Record<UserStat["icon"], LucideIcon> = {
  users: Users,
  active: UserCheck,
  pending: Clock,
  roles: ShieldCheck,
};

// Màu nền nhạt theo từng thẻ
const TONES: Record<UserStat["tone"], string> = {
  green: "bg-gradient-to-br from-emerald-50 to-white",
  violet: "bg-gradient-to-br from-primary-50 to-white",
  amber: "bg-gradient-to-br from-amber-50 to-white",
  orange: "bg-gradient-to-br from-orange-50 to-white",
};

const NOTE_TONES: Record<UserStat["tone"], string> = {
  green: "text-emerald-600",
  violet: "text-primary-600",
  amber: "text-warning",
  orange: "text-orange-600",
};

export default function UserStatCard({ stat }: { stat: UserStat }) {
  const Icon = ICONS[stat.icon];
  return (
    <div className={`rounded-2xl border border-line p-5 shadow-sm ${TONES[stat.tone]}`}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-body">{stat.label}</p>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-primary-600 shadow-sm">
          <Icon size={18} />
        </span>
      </div>
      <p className="mt-3 flex flex-wrap items-baseline gap-x-3 text-4xl font-bold text-footer">
        {stat.value}
        <span className={`text-xs font-semibold ${NOTE_TONES[stat.tone]}`}>{stat.note}</span>
      </p>
    </div>
  );
}
