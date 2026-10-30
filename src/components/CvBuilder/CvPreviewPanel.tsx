import { useCallback, useEffect, useRef, useState } from "react";
import CvStylePanel from "./CvStylePanel";
import CvPreview, { A4_HEIGHT_PX, A4_WIDTH_PX } from "./CvPreview";
import CvPreviewToolbar from "./CvPreviewToolbar";
import CvPreExportChecklist from "./CvPreExportChecklist";
import { useToast } from "../common/toastContext";
import { useCvBuilder } from "./cvBuilderContext";
import { toFileName } from "./cvHelpers";
import { CvEditContext } from "./templates/EditText";

export default function CvPreviewPanel({
  expandTemplates,
  showStyle = true,
}: {
  expandTemplates?: boolean;
  showStyle?: boolean;
}) {
  const data = useCvBuilder((s) => s.data);
  const style = useCvBuilder((s) => s.style);
  const updateFromPreview = useCvBuilder((s) => s.updateFromPreview);
  const toast = useToast();

  const pageRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(0.85);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [exporting, setExporting] = useState(false);

  // Lần đầu: thu nhỏ vừa khung nếu khung hẹp hơn khổ A4 ở 85%
  useEffect(() => {
    const w = scrollRef.current?.clientWidth;
    if (w)
      setZoom((z) =>
        Math.min(z, Math.max(0.4, +((w - 24) / A4_WIDTH_PX).toFixed(2)))
      );
  }, []);

  const onPageCount = useCallback((n: number) => {
    setPages(n);
    setPage((p) => Math.min(p, n));
  }, []);

  const goToPage = (n: number) => {
    setPage(n);
    scrollRef.current?.scrollTo({
      top: (n - 1) * A4_HEIGHT_PX * zoom,
      behavior: "smooth",
    });
  };

  // Tải thẳng file PDF về máy; thư viện tạo PDF chỉ tải về khi bấm nút
  const downloadPdf = async () => {
    if (!pageRef.current || exporting) return;
    setExporting(true);
    try {
      const { downloadCvPdf } = await import("./exportCvPdf");
      await downloadCvPdf(pageRef.current, toFileName(data.personal.fullName));
      toast.show("Đã tải CV về máy");
    } catch {
      toast.show("Không tạo được file PDF, vui lòng thử lại", "error");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-5">
      {showStyle && <CvStylePanel expandTemplates={expandTemplates} />}

      <section
        className="rounded-3xl border border-line bg-white p-4 shadow-sm md:p-5"
        aria-label="Xem trước CV"
      >
        <div
          ref={scrollRef}
          tabIndex={0}
          aria-label="Bản xem trước CV khổ A4"
          className="max-h-[70vh] overflow-auto rounded-2xl bg-primary-50/60 p-3"
          onScroll={(e) => {
            const n = Math.min(
              pages,
              Math.floor(
                (e.currentTarget.scrollTop + 120) / (A4_HEIGHT_PX * zoom)
              ) + 1
            );
            if (n !== page) setPage(n);
          }}
        >
          <CvEditContext.Provider value={updateFromPreview}>
            <CvPreview
              data={data}
              style={style}
              zoom={zoom}
              onPageCount={onPageCount}
              pageRef={pageRef}
            />
          </CvEditContext.Provider>
        </div>
        <div className="mt-4">
          <CvPreviewToolbar
            page={page}
            pages={pages}
            zoom={zoom}
            onPageChange={goToPage}
            onZoomChange={setZoom}
            exporting={exporting}
            onExport={downloadPdf}
          />
        </div>
      </section>
      <CvPreExportChecklist pageCount={pages} />
    </div>
  );
}
