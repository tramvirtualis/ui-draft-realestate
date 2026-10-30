import { ChevronLeft, ChevronRight, Download, LoaderCircle, Minus, Plus } from "lucide-react";

export default function CvPreviewToolbar({
  page,
  pages,
  zoom,
  onPageChange,
  onZoomChange,
  onExport,
  exporting = false,
}: {
  page: number;
  pages: number;
  zoom: number;
  onPageChange: (page: number) => void;
  onZoomChange: (zoom: number) => void;
  onExport: () => void;
  exporting?: boolean;
}) {
  const btn =
    "flex h-8 w-8 items-center justify-center rounded-lg text-body transition hover:bg-primary-50 hover:text-primary-600 disabled:opacity-40";
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <div className="flex items-center gap-1">
          <button type="button" className={btn} disabled={page <= 1} onClick={() => onPageChange(page - 1)} aria-label="Trang trước">
            <ChevronLeft size={16} />
          </button>
          <span className="text-body" aria-live="polite">
            Trang {page} / {pages}
          </span>
          <button type="button" className={btn} disabled={page >= pages} onClick={() => onPageChange(page + 1)} aria-label="Trang sau">
            <ChevronRight size={16} />
          </button>
        </div>
        <span className="rounded-md bg-primary-50 px-2 py-1 text-xs font-medium text-primary-700">A4</span>
        <div className="flex items-center gap-1">
          <button type="button" className={btn} disabled={zoom <= 0.4} onClick={() => onZoomChange(Math.max(0.4, +(zoom - 0.05).toFixed(2)))} aria-label="Thu nhỏ">
            <Minus size={16} />
          </button>
          <span className="w-12 text-center text-body">{Math.round(zoom * 100)}%</span>
          <button type="button" className={btn} disabled={zoom >= 1.5} onClick={() => onZoomChange(Math.min(1.5, +(zoom + 0.05).toFixed(2)))} aria-label="Phóng to">
            <Plus size={16} />
          </button>
        </div>
      </div>
      <button
        type="button"
        onClick={onExport}
        disabled={exporting}
        aria-busy={exporting}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary-500 to-primary-700 text-sm font-medium text-white shadow-lg shadow-primary-300/50 transition hover:opacity-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:cursor-wait disabled:opacity-80"
      >
        {exporting ? (
          <>
            <LoaderCircle size={16} className="animate-spin" aria-hidden /> Đang tạo PDF…
          </>
        ) : (
          <>
            <Download size={16} aria-hidden /> Tải PDF
          </>
        )}
      </button>
    </div>
  );
}
