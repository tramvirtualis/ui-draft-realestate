export type NewsStatusFilter = "all" | "active" | "hidden";

type Props = {
  value: NewsStatusFilter;
  counts: Record<NewsStatusFilter, number>;
  onChange: (value: NewsStatusFilter) => void;
};

const TABS: { key: NewsStatusFilter; label: string }[] = [
  { key: "all", label: "Tất cả tin tức" },
  { key: "active", label: "Đang hiển thị" },
  { key: "hidden", label: "Đang ẩn" },
];

// Các thẻ đếm theo trạng thái, bấm để lọc danh sách
export default function NewsStatusTabs({ value, counts, onChange }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-3" role="tablist" aria-label="Lọc theo trạng thái">
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
            <span className={`text-2xl font-bold ${active ? "text-primary-700" : "text-footer"}`}>{counts[t.key]}</span>
          </button>
        );
      })}
    </div>
  );
}
