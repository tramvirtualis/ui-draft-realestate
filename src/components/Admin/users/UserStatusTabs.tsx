import type { AdminUserStats, AdminUserStatus } from "../../../types/admin/adminUser.types";

export type UserStatusFilter = "all" | AdminUserStatus;

type Props = {
  value: UserStatusFilter;
  stats: AdminUserStats;
  onChange: (value: UserStatusFilter) => void;
};

const TABS: { key: UserStatusFilter; label: string; count: (s: AdminUserStats) => number }[] = [
  { key: "all", label: "Tất cả tài khoản", count: (s) => s.all },
  { key: "ACTIVE", label: "Đang hoạt động", count: (s) => s.active },
  { key: "INACTIVE", label: "Chưa kích hoạt", count: (s) => s.inactive },
  { key: "LOCKED", label: "Bị khóa", count: (s) => s.locked },
];

// Các thẻ đếm theo trạng thái tài khoản, bấm để lọc danh sách
export default function UserStatusTabs({ value, stats, onChange }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" role="tablist" aria-label="Lọc theo trạng thái tài khoản">
      {TABS.map((t) => {
        const active = value === t.key;
        return (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(t.key)}
            className={`flex items-center justify-between rounded-2xl border px-5 py-4 text-left shadow-sm transition ${
              active ? "border-primary-400 bg-primary-50 ring-2 ring-primary-100" : "border-line bg-white hover:border-primary-200"
            }`}
          >
            <span className={`text-sm ${active ? "font-semibold text-primary-700" : "text-body"}`}>{t.label}</span>
            <span className={`text-2xl font-bold ${active ? "text-primary-700" : "text-footer"}`}>{t.count(stats)}</span>
          </button>
        );
      })}
    </div>
  );
}
