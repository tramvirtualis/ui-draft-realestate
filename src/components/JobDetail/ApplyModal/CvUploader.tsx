import { useRef, useState } from "react";
import { FileText, UploadCloud, X } from "lucide-react";
import { CV_ACCEPT, formatCvSize } from "../../../types/job/myCv.types";

/** Ô kéo thả / chọn tệp CV, hiển thị tên/dung lượng và nút xóa (dùng ở modal ứng tuyển và trang CV của tôi) */
export default function CvUploader({
  file,
  onChange,
  error,
}: {
  file: File | null;
  onChange: (file: File | null) => void;
  error?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          onChange(e.dataTransfer.files?.[0] ?? null);
        }}
        className={`flex cursor-pointer flex-col items-center rounded-2xl border border-dashed px-4 py-7 text-center transition ${
          dragging ? "border-primary-500 bg-primary-100/60" : error ? "border-red-300 bg-red-50/40" : "border-primary-200 bg-primary-50/60"
        }`}
        onClick={() => inputRef.current?.click()}
      >
        <UploadCloud size={26} className="text-primary-500" aria-hidden />
        <p className="mt-2 text-sm font-medium text-heading">Kéo thả CV hoặc chọn tệp</p>
        <p className="mt-1 text-xs text-gray-400">PDF / DOC / DOCX · Tối đa 5MB</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={CV_ACCEPT}
        className="sr-only"
        aria-label="Chọn tệp CV"
        tabIndex={-1}
        onChange={(e) => {
          onChange(e.target.files?.[0] ?? null);
          e.target.value = "";
        }}
      />

      {file && (
        <div className="flex items-center gap-3 rounded-2xl border border-line bg-white p-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
            <FileText size={16} aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-heading">{file.name}</p>
            <p className="text-xs text-gray-400">
              {(file.name.split(".").pop() ?? "").toUpperCase()} · {formatCvSize(file.size)} · Đã chọn
            </p>
          </div>
          <button
            type="button"
            onClick={() => onChange(null)}
            aria-label="Xóa tệp đã chọn"
            className="rounded-full p-1.5 text-gray-400 hover:bg-primary-50 hover:text-red-500"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {error && (
        <p role="alert" className="text-xs text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}
