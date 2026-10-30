import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, FileText, Loader2 } from "lucide-react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import useFocusTrap from "../../../common/useFocusTrap";
import { openPdf, renderPdfPage } from "../../../../utils/pdfToImage";

type Props = {
  file: File;
  onConfirm: (result: { pdf: File; page: number }) => void; // dùng trực tiếp trang PDF đã chọn
  onClose: () => void;
};

// Xem trước PDF và chọn trang dùng làm mặt bằng; PDF được tải lên và dùng trực tiếp, không chuyển thành ảnh
export default function PdfPagePicker({ file, onConfirm, onClose }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  useFocusTrap(root, true, onClose);

  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const converting = false;
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    openPdf(file)
      .then((doc) => !cancelled && setPdf(doc))
      .catch(() => !cancelled && setError("Không đọc được file PDF"));
    return () => {
      cancelled = true;
    };
  }, [file]);

  useEffect(() => {
    if (!pdf || !canvas.current) return;
    let cancelled = false;
    setLoading(true);
    renderPdfPage(pdf, page, canvas.current, 1100)
      .then(() => !cancelled && setLoading(false))
      .catch(() => {
        if (cancelled) return;
        setError("Không hiển thị được trang này");
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [pdf, page]);

  const confirm = () => {
    if (pdf) onConfirm({ pdf: file, page });
  };

  const total = pdf?.numPages ?? 0;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-footer/50 px-4 backdrop-blur-sm" onClick={onClose}>
      <div
        ref={root}
        role="dialog"
        aria-modal="true"
        aria-labelledby="pdf-picker-title"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="animate-page-in flex max-h-[94vh] w-full max-w-3xl flex-col rounded-2xl bg-white shadow-2xl"
      >
        <div className="flex items-start gap-3 border-b border-line p-5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-600"><FileText size={18} /></span>
          <div className="min-w-0">
            <h2 id="pdf-picker-title" className="text-lg font-bold text-footer">Chọn trang PDF làm mặt bằng</h2>
            <p className="mt-0.5 truncate text-sm text-body">{file.name}</p>
          </div>
        </div>

        <div className="relative flex min-h-64 flex-1 items-center justify-center overflow-auto bg-primary-50/50 p-4">
          {loading && !error && (
            <span className="absolute inset-0 flex items-center justify-center text-primary-600" aria-live="polite">
              <Loader2 size={28} className="animate-spin" />
            </span>
          )}
          <canvas ref={canvas} className={`max-h-[60vh] max-w-full rounded-lg bg-white shadow ${loading ? "opacity-30" : ""}`} />
        </div>

        {error && <p role="alert" className="px-5 pt-3 text-sm text-danger">{error}</p>}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || converting}
              aria-label="Trang trước"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-line transition hover:bg-primary-50 disabled:opacity-40"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="min-w-24 text-center text-sm font-semibold text-footer">Trang {page} / {total || "…"}</span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(total, p + 1))}
              disabled={page >= total || converting}
              aria-label="Trang sau"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-line transition hover:bg-primary-50 disabled:opacity-40"
            >
              <ChevronRight size={16} />
            </button>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} disabled={converting} className="rounded-lg border border-line px-5 py-2.5 text-sm font-semibold text-footer transition hover:bg-primary-50 disabled:opacity-60">Hủy</button>
            <button
              type="button"
              onClick={confirm}
              disabled={!pdf || loading || converting}
              className="rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 active:scale-95 disabled:opacity-60"
            >
              {converting ? "Đang chuyển thành ảnh..." : "Dùng trang này"}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
