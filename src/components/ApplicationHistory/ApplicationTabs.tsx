import {
  APPLICATION_STATUS_META,
  APPLICATION_STATUS_ORDER,
  type ApplicationStatus,
} from "../../types/applicationHistory.types";

type Tab = ApplicationStatus | "ALL";

const TABS: { id: Tab; label: string }[] = [
  { id: "ALL", label: "Tất cả" },
  ...APPLICATION_STATUS_ORDER.map((s) => ({ id: s, label: APPLICATION_STATUS_META[s].label })),
];

export default function ApplicationTabs({
  value,
  counts,
  onChange,
}: {
  value: Tab;
  counts: Record<Tab, number>;
  onChange: (tab: Tab) => void;
}) {
  return (
    <div role="tablist" aria-label="Lọc theo trạng thái" className="flex gap-1 overflow-x-auto rounded-2xl bg-primary-50/70 p-1">
      {TABS.map((t) => {
        const active = value === t.id;
        return (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(t.id)}
            className={`flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm transition focus-visible:outline-2 focus-visible:outline-primary-600 ${
              active ? "bg-white font-medium text-primary-700 shadow-sm" : "text-body hover:text-primary-600"
            }`}
          >
            {t.label}
            <span
              className={`rounded-full px-1.5 text-[10px] ${
                active ? "bg-primary-100 text-primary-700" : "bg-white text-gray-400"
              }`}
            >
              {counts[t.id]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
