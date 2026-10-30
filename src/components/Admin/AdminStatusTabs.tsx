export interface StatusTab<K extends string> {
  key: K;
  label: string;
  dot?: string;
}

type Props<K extends string> = {
  tabs: StatusTab<K>[];
  value: K;
  counts: Partial<Record<K, number>>;
  onChange: (value: K) => void;
};

// Các thẻ đếm theo trạng thái, bấm để lọc danh sách (trang quản trị)
export default function AdminStatusTabs<K extends string>({
  tabs,
  value,
  counts,
  onChange,
}: Props<K>) {
  return (
    <div
      className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:flex lg:flex-wrap"
      role="tablist"
      aria-label="Lọc theo trạng thái"
    >
      {tabs.map((t) => {
        const active = value === t.key;
        return (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(t.key)}
            className={`flex min-w-0 items-center justify-between gap-3 rounded-2xl border px-4 py-3.5 text-left transition lg:flex-1 ${
              active
                ? "border-ink-900 bg-ink-900 shadow-[0_18px_40px_-24px_rgba(10,15,26,0.7)]"
                : "border-white/80 bg-white hover:border-primary-200"
            }`}
          >
            <span
              className={`flex min-w-0 items-center gap-2 text-sm ${
                active ? "font-semibold text-white" : "text-body"
              }`}
            >
              {t.dot && (
                <span className={`h-2 w-2 shrink-0 rounded-full ${t.dot}`} />
              )}
              <span className="truncate">{t.label}</span>
            </span>
            <span
              className={`font-heading text-xl font-extrabold tabular-nums ${
                active ? "text-primary-200" : "text-heading"
              }`}
            >
              {counts[t.key] ?? 0}
            </span>
          </button>
        );
      })}
    </div>
  );
}
