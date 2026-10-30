import { ChevronRight, ChevronLeft } from "lucide-react";

type Props = {
  page: number;
  totalPages: number;
  setPage: (page: number) => void;
};

export default function ArticlePagination({ page, totalPages, setPage }: Props) {
  return (
    <div className="mt-6 flex items-center justify-center gap-2 text-xs">
      <button aria-label="Trang trước" onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-white text-body disabled:opacity-40">
        <ChevronLeft size={14} />
      </button>
      {Array.from({ length: totalPages }, (_, i) => (
        <button key={i} onClick={() => setPage(i)} className={`h-9 w-9 rounded-full font-medium ${page === i ? "bg-primary-600 text-white shadow-md shadow-primary-300" : "text-body hover:bg-white"}`}>
          {i + 1}
        </button>
      ))}
      <button aria-label="Trang sau" onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page === totalPages - 1} className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-white text-body disabled:opacity-40">
        <ChevronRight size={14} />
      </button>
    </div>
  );
}
