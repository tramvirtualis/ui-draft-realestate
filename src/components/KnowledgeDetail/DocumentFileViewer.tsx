import { Download, Maximize2 } from "lucide-react";
import { downloadUrl, isDocx, officeViewerUrl } from "../Knowledge/knowledgeHelpers";
import type { DocumentItem } from "../../types/document.types";

// Xem file ngay trên trang: PDF dùng trình xem của trình duyệt, Word qua Office Online
export default function DocumentFileViewer({ doc }: { doc: DocumentItem }) {
  if (!doc.fileUrl) return null;
  const src = isDocx(doc) ? officeViewerUrl(doc.fileUrl) : doc.fileUrl;

  return (
    <div className="overflow-hidden rounded-3xl border border-line bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3">
        <p className="min-w-0 truncate text-sm font-semibold text-heading">{doc.originalFileName ?? doc.title}</p>
        <div className="flex gap-2">
          <a
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-heading hover:bg-primary-50"
          >
            <Maximize2 size={13} /> Toàn màn hình
          </a>
          <a
            href={downloadUrl(doc.fileUrl)}
            className="flex items-center gap-1.5 rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-700"
          >
            <Download size={13} /> Tải xuống
          </a>
        </div>
      </div>
      <iframe src={src} title={doc.title} className="h-[75vh] min-h-[480px] w-full bg-primary-50/40" />
      <p className="border-t border-line px-5 py-3 text-[11px] text-muted">
        Không xem được trên điện thoại? Bấm “Toàn màn hình” hoặc “Tải xuống” để mở bằng ứng dụng trên máy.
      </p>
    </div>
  );
}
