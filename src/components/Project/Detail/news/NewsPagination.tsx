import { ChevronRight, ChevronLeft } from "lucide-react";

type Props = {
  page: number;
  totalPages: number;
  setPage: (page: number) => void;
};

export default function NewsPagination({ page, totalPages, setPage }: Props) {
  if (totalPages <= 1) return null;
  return (
    <div className="mt-12 flex flex-wrap items-center justify-center gap-2 text-xs">
      <button disabled={page <= 1} onClick={() => setPage(Math.max(1, page - 1))} className="flex h-10 items-center gap-1 rounded-full border border-line bg-white px-4 text-heading disabled:text-muted">
        <ChevronLeft size={13} /> Trang trước
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
        <button key={n} onClick={() => setPage(n)} className={`h-10 w-10 rounded-full font-medium ${page === n ? "bg-ink-900 text-white" : "border border-line bg-white text-heading"}`}>{n}</button>
      ))}
      <button disabled={page >= totalPages} onClick={() => setPage(Math.min(totalPages, page + 1))} className="flex h-10 items-center gap-1 rounded-full border border-line bg-white px-4 text-heading disabled:text-muted">
        Trang sau <ChevronRight size={13} />
      </button>
    </div>
  );
}
