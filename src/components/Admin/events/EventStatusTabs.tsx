import {
  EVENT_STATUS_META,
  type EventStatus,
} from "../../../types/event/event.types";

export type EventStatusFilter = EventStatus | "";

type Props = {
  value: EventStatusFilter;
  counts: Record<string, number>;
  onChange: (value: EventStatusFilter) => void;
};

const TABS: { key: EventStatusFilter; label: string }[] = [
  { key: "", label: "Tất cả sự kiện" },
  ...(Object.keys(EVENT_STATUS_META) as EventStatus[]).map((s) => ({
    key: s,
    label: EVENT_STATUS_META[s].label,
  })),
];

export default function EventStatusTabs({ value, counts, onChange }: Props) {
  return (
    <div
      className="grid grid-cols-2 gap-4 md:grid-cols-5"
      role="tablist"
      aria-label="Lọc theo trạng thái"
    >
      {TABS.map((t) => {
        const active = value === t.key;
        return (
          <button
            key={t.key || "all"}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(t.key)}
            className={`flex items-center justify-between gap-2 rounded-2xl border px-5 py-4 text-left shadow-sm transition ${
              active
                ? "border-primary-400 bg-primary-50 ring-2 ring-primary-100"
                : "border-line bg-white hover:border-primary-200"
            }`}
          >
            <span
              className={`flex items-center gap-2 text-sm ${
                active ? "font-semibold text-primary-700" : "text-body"
              }`}
            >
              {t.key && (
                <span
                  className={`h-2 w-2 shrink-0 rounded-full ${
                    EVENT_STATUS_META[t.key].dot
                  }`}
                />
              )}
              {t.label}
            </span>
            <span
              className={`text-2xl font-bold ${
                active ? "text-primary-700" : "text-footer"
              }`}
            >
              {counts[t.key || "all"] ?? 0}
            </span>
          </button>
        );
      })}
    </div>
  );
}
