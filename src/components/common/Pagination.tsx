import { ChevronLeft, ChevronRight } from "lucide-react";

function getPages(current: number, total: number) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i);

  const pages = new Set([0, total - 1, current - 1, current, current + 1]);
  if (current < 3) [1, 2, 3].forEach((p) => pages.add(p));
  if (current > total - 4)
    [total - 4, total - 3, total - 2].forEach((p) => pages.add(p));

  const sorted = [...pages]
    .filter((p) => p >= 0 && p < total)
    .sort((a, b) => a - b);
  const result: (number | string)[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) result.push("...");
    result.push(p);
  });
  return result;
}

/**
 * @param {{ page: number, totalPages: number, onChange: (page: number) => void }} props
 * page bắt đầu từ 0 (giống Spring), hiển thị +1
 */
export default function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  const btn =
    "flex h-9 w-9 items-center justify-center rounded-full text-sm transition disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <nav
      className="flex items-center justify-center gap-2"
      aria-label="Phân trang"
    >
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 0}
        aria-label="Trang trước"
        className={`${btn} border border-line bg-white text-body hover:text-primary-600`}
      >
        <ChevronLeft size={16} />
      </button>

      {getPages(page, totalPages).map((p, i) =>
        typeof p === "string" ? (
          <span key={`dots-${i}`} className="px-1 text-body">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p)}
            aria-current={p === page ? "page" : undefined}
            className={`${btn} ${
              p === page
                ? "bg-primary-600 font-semibold text-white shadow-md shadow-primary-300"
                : "text-body hover:bg-primary-50 hover:text-primary-600"
            }`}
          >
            {p + 1}
          </button>
        )
      )}

      <button
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages - 1}
        aria-label="Trang sau"
        className={`${btn} border border-line bg-white text-body hover:text-primary-600`}
      >
        <ChevronRight size={16} />
      </button>
    </nav>
  );
}
