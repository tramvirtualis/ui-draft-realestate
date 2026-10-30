import type { DocumentCategoryWithCount } from "../../types/document.types";

type Props = {
  categories: DocumentCategoryWithCount[];
  total: number;
  categoryId: number | null;
  setCategoryId: (id: number | null) => void;
};

export default function ArticleSidebar({ categories, total, categoryId, setCategoryId }: Props) {
  const rows = [{ id: null as number | null, name: "Tất cả", n: total }, ...categories.map((c) => ({ id: c.id as number | null, name: c.name, n: c.documentCount }))];

  return (
    <aside className="space-y-5 lg:sticky lg:top-24">
      <div className="rounded-3xl border border-line bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-heading">Danh mục</h3>
        <ul className="mt-3">
          {rows.map((c) => (
            <li key={c.id ?? "all"}>
              <button
                type="button"
                onClick={() => setCategoryId(c.id)}
                className={`flex w-full items-center justify-between py-2.5 text-left text-xs ${categoryId === c.id ? "font-semibold text-primary-600" : "text-heading hover:text-primary-600"}`}
              >
                {c.name}
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] ${categoryId === c.id ? "bg-primary-100 text-primary-700" : "bg-line text-muted"}`}>{c.n}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
