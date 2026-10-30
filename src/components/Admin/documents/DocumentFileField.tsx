import { useRef, useState } from "react";
import { ExternalLink, FileUp, X } from "lucide-react";
import DocumentKindBadge from "../../Knowledge/DocumentKindBadge";
import { formatFileSize } from "../../Knowledge/knowledgeHelpers";
import { DOCX_MIME, PDF_MIME, type DocumentItem } from "../../../types/document.types";

type Props = {
  file: File | null; // file mới chọn
  saved: DocumentItem | null; // tài liệu đang lưu (khi sửa)
  showSaved: boolean; // file đang lưu chưa bị gỡ
  onPick: (file: File | null) => void;
  onClear: () => void;
  disabled?: boolean;
};

// Ô chọn file PDF / DOCX: kéo thả hoặc bấm để chọn, hiện file đang lưu / file mới
export default function DocumentFileField({ file, saved, showSaved, onPick, onClear, disabled }: Props) {
  const picker = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const current = file
    ? { name: file.name, size: file.size, mimeType: file.name.toLowerCase().endsWith(".docx") ? DOCX_MIME : PDF_MIME, url: null as string | null, isNew: true }
    : showSaved && saved?.fileUrl
      ? { name: saved.originalFileName ?? "Tệp đã tải lên", size: saved.fileSize, mimeType: saved.mimeType, url: saved.fileUrl, isNew: false }
      : null;

  return (
    <div>
      {current ? (
        <div className="flex items-center gap-3 rounded-2xl border border-line bg-primary-50/40 p-4">
          <DocumentKindBadge doc={{ type: "FILE", mimeType: current.mimeType }} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-heading">{current.name}</p>
            <p className="text-xs text-body">
              {formatFileSize(current.size)} {current.isNew ? "· file mới, sẽ tải lên khi lưu" : "· đang dùng"}
            </p>
          </div>
          {current.url && (
            <a href={current.url} target="_blank" rel="noopener noreferrer" title="Mở file" className="rounded-lg p-2 text-body hover:bg-white"><ExternalLink size={16} /></a>
          )}
          <button type="button" onClick={() => picker.current?.click()} disabled={disabled} className="rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-semibold text-heading hover:bg-primary-50">
            Đổi file
          </button>
          <button type="button" onClick={onClear} disabled={disabled} aria-label="Bỏ file" className="rounded-lg p-2 text-danger hover:bg-danger/10"><X size={16} /></button>
        </div>
      ) : (
        <button
          type="button"
          disabled={disabled}
          onClick={() => picker.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); onPick(e.dataTransfer.files[0] ?? null); }}
          className={`flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition ${
            dragging ? "border-primary-500 bg-primary-50" : "border-primary-200 bg-primary-50/30 hover:bg-primary-50"
          }`}
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-primary-600 shadow-sm"><FileUp size={22} /></span>
          <span className="text-sm font-semibold text-heading">Kéo thả file vào đây hoặc bấm để chọn</span>
          <span className="text-xs text-body">PDF tối đa 20MB · Word (.docx) tối đa 10MB</span>
        </button>
      )}
      <input
        ref={picker}
        type="file"
        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        hidden
        onChange={(e) => {
          onPick(e.target.files?.[0] ?? null);
          e.target.value = "";
        }}
      />
    </div>
  );
}
