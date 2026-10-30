import { Building2 } from "lucide-react";
import type { NewsCategoryWithCount, ProjectWithCount } from "../../types/new/news.types";

interface NewsSidebarProps {
  categories: NewsCategoryWithCount[];
  projects: ProjectWithCount[];
  activeCategoryId: number | null;
  activeProjectId: number | null;
  onCategoryClick: (id: number | null) => void;
  onProjectClick: (id: number | null) => void;
}

// Cột phải kiểu mục lục tạp chí: chuyên mục đánh số kẻ đường mảnh, khối "Theo dự án" nền navy
export default function NewsSidebar({
  categories,
  projects,
  activeCategoryId,
  activeProjectId,
  onCategoryClick,
  onProjectClick,
}: NewsSidebarProps) {
  return (
    <aside className="space-y-10 lg:sticky lg:top-24">
      <div>
        <p className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.25em] text-heading">
          Chuyên mục <span className="h-px flex-1 bg-heading/80" />
        </p>
        <ul className="mt-2 divide-y divide-line">
          {categories.map((c, i) => {
            const active = activeCategoryId === c.id;
            return (
              <li key={c.id}>
                <button
                  onClick={() => onCategoryClick(active ? null : c.id)}
                  aria-pressed={active}
                  className="group flex w-full items-baseline gap-3 py-3 text-left"
                >
                  <span className={`font-heading text-xs tabular-nums ${active ? "text-primary-600" : "text-muted"}`}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className={`flex-1 text-sm transition ${active ? "font-semibold text-primary-700" : "text-heading group-hover:translate-x-1 group-hover:text-primary-700"}`}>
                    {c.name}
                  </span>
                  <span className={`text-xs tabular-nums ${active ? "text-primary-700" : "text-muted"}`}>{c.newsCount}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="bg-ink-900 p-6 text-white">
        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-primary-300">Theo dự án</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {projects.map((p) => {
            const active = activeProjectId === p.id;
            return (
              <button
                key={p.id}
                onClick={() => onProjectClick(active ? null : p.id)}
                aria-pressed={active}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs transition ${
                  active ? "bg-primary-600 text-white" : "border border-white/20 text-white/80 hover:border-primary-300 hover:text-white"
                }`}
              >
                <Building2 size={11} />
                {p.name}
                <span className="opacity-60">{p.newsCount}</span>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
