type Props = {
  categories: { id: number; name: string; count: number }[];
  total: number;
  categoryId: number | null;
  setCategoryId: (id: number | null) => void;
};

// Cùng kiểu cột chuyên mục của trang Tin tức chung: mục lục đánh số, kẻ đường mảnh
export default function NewsSidebar({ categories, total, categoryId, setCategoryId }: Props) {
  const rows: { id: number | null; name: string; count: number }[] = [{ id: null, name: "Tất cả", count: total }, ...categories];

  return (
    <aside className="lg:sticky lg:top-40">
      <p className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.25em] text-heading">
        Chuyên mục <span className="h-px flex-1 bg-heading/80" />
      </p>
      <ul className="mt-2 divide-y divide-line">
        {rows.map((c, i) => {
          const active = categoryId === c.id;
          return (
            <li key={c.id ?? "all"}>
              <button onClick={() => setCategoryId(c.id)} aria-pressed={active} className="group flex w-full items-baseline gap-3 py-3 text-left">
                <span className={`font-heading text-xs tabular-nums ${active ? "text-primary-600" : "text-muted"}`}>{String(i + 1).padStart(2, "0")}</span>
                <span className={`flex-1 text-sm transition ${active ? "font-semibold text-primary-700" : "text-heading group-hover:translate-x-1 group-hover:text-primary-700"}`}>
                  {c.name}
                </span>
                <span className={`text-xs tabular-nums ${active ? "text-primary-700" : "text-muted"}`}>{c.count}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
