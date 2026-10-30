import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  total: number;
  perPage: number;
  page: number;
  setPage: (page: number) => void;
};

// Số trang cần hiện: đầu, cuối và 1 trang mỗi bên trang hiện tại; chỗ bị lược bỏ là "…"
function pageItems(page: number, totalPages: number): (number | "…")[] {
  const keep = new Set([1, totalPages, page - 1, page, page + 1]);
  const items: (number | "…")[] = [];
  for (let n = 1; n <= totalPages; n++) {
    if (!keep.has(n)) continue;
    const prev = items[items.length - 1];
    if (typeof prev === "number" && n - prev > 1) items.push("…");
    items.push(n);
  }
  return items;
}

const btn = "flex h-10 min-w-10 items-center justify-center rounded-full px-3 text-sm font-semibold tabular-nums transition";

export default function InventoryPagination({ total, perPage, page, setPage }: Props) {
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  if (total === 0) return null;
  const from = (page - 1) * perPage + 1;
  const to = Math.min(total, page * perPage);

  return (
    <nav aria-label="Phân trang quỹ căn" className="mt-8 flex flex-wrap items-center justify-between gap-4 text-xs text-body">
      <p>Hiển thị {from}–{to} trong {total} căn</p>
      {totalPages > 1 && (
        <div className="flex items-center gap-1.5">
          <button type="button" aria-label="Trang trước" disabled={page <= 1} onClick={() => setPage(page - 1)} className={`${btn} border border-line bg-white text-heading hover:bg-primary-50 disabled:opacity-40`}>
            <ChevronLeft size={15} />
          </button>
          {pageItems(page, totalPages).map((n, i) =>
            n === "…" ? (
              <span key={`gap-${i}`} className="px-1 text-muted">…</span>
            ) : (
              <button
                key={n}
                type="button"
                aria-current={page === n ? "page" : undefined}
                onClick={() => setPage(n)}
                className={`${btn} ${page === n ? "btn-gloss text-white" : "border border-line bg-white text-heading hover:bg-primary-50"}`}
              >
                {n}
              </button>
            ),
          )}
          <button type="button" aria-label="Trang sau" disabled={page >= totalPages} onClick={() => setPage(page + 1)} className={`${btn} border border-line bg-white text-heading hover:bg-primary-50 disabled:opacity-40`}>
            <ChevronRight size={15} />
          </button>
        </div>
      )}
    </nav>
  );
}
