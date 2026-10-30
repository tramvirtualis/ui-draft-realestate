import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { CATEGORIES_PATH, categoryIcon, categoryPath } from "../Knowledge/knowledgeHelpers";
import type { DocumentCategoryWithCount } from "../../types/document.types";

type Props = {
  categories: DocumentCategoryWithCount[];
  currentId: number | null;
};

// Cột phải trang 1 danh mục: chuyển nhanh sang danh mục khác
export default function CategorySidebar({ categories, currentId }: Props) {
  return (
    <aside className="lg:sticky lg:top-24">
      <div className="rounded-3xl border border-line bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-heading">Danh mục khác</h2>
        <ul className="mt-3 space-y-1">
          {categories.map((c, i) => {
            const Icon = categoryIcon(i);
            const active = c.id === currentId;
            return (
              <li key={c.id}>
                <Link
                  to={categoryPath(c.slug)}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-3 rounded-xl px-2.5 py-2 text-xs transition ${
                    active ? "bg-primary-50 font-semibold text-primary-700" : "text-heading hover:bg-primary-50/70 hover:text-primary-600"
                  }`}
                >
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${active ? "bg-primary-600 text-white" : "bg-primary-50 text-primary-600"}`}>
                    <Icon size={15} />
                  </span>
                  <span className="min-w-0 flex-1 truncate">{c.name}</span>
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] ${active ? "bg-primary-100 text-primary-700" : "bg-line text-muted"}`}>{c.documentCount}</span>
                </Link>
              </li>
            );
          })}
        </ul>
        <Link to={CATEGORIES_PATH} className="mt-3 flex items-center justify-center gap-1.5 rounded-xl border border-line py-2.5 text-xs font-semibold text-primary-600 transition hover:bg-primary-50">
          Tất cả danh mục <ArrowRight size={14} />
        </Link>
      </div>
    </aside>
  );
}
