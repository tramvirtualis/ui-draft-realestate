import type { AdminPostStats, PostScope } from "../../../types/social/social.types";

export type PostScopeFilter = "all" | PostScope;

type Props = {
  value: PostScopeFilter;
  stats: AdminPostStats;
  onChange: (value: PostScopeFilter) => void;
};

const TABS: { key: PostScopeFilter; label: string; count: (s: AdminPostStats) => number }[] = [
  { key: "all", label: "Tất cả bài viết", count: (s) => s.all },
  { key: "PUBLIC", label: "Công khai", count: (s) => s.publicPosts },
  { key: "PRIVATE", label: "Riêng tư", count: (s) => s.privatePosts },
];

// Các thẻ đếm theo phạm vi hiển thị (công khai / riêng tư), bấm để lọc danh sách
export default function PostScopeTabs({ value, stats, onChange }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-3" role="tablist" aria-label="Lọc theo phạm vi bài viết">
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
