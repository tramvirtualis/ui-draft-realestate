import { useEffect, useId, useRef, useState } from "react";
import { FileText, ImagePlus, RefreshCw, X } from "lucide-react";
import {
  DOCUMENT_ACCEPT,
  DOCUMENT_MAX_BYTES,
  DOCUMENT_TYPES,
} from "../../types/job/company.types";

type Props = {
  label: string;
  hint?: string;
  file: File | null;
  onChange: (file: File | null) => void;
  // Đang sửa hồ sơ đã có file: không chọn file mới thì giữ file cũ
  hasExisting?: boolean;
  error?: string;
};

const formatSize = (bytes: number) =>
  bytes >= 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(1)}MB`
    : `${Math.ceil(bytes / 1024)}KB`;

// Ô chọn 1 giấy tờ (ảnh JPG/PNG/WEBP hoặc PDF, tối đa 10MB), có xem trước ảnh
export default function DocumentPicker({
  label,
  hint,
  file,
  onChange,
  hasExisting = false,
  error,
}: Props) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [localError, setLocalError] = useState("");
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!file || !file.type.startsWith("image/")) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const pick = (f?: File) => {
    if (!f) return;
    if (!DOCUMENT_TYPES.includes(f.type))
      return setLocalError("Chỉ nhận ảnh JPG, PNG, WEBP hoặc file PDF");
    if (f.size > DOCUMENT_MAX_BYTES) return setLocalError("File tối đa 10MB");
    setLocalError("");
    onChange(f);
  };

  const message = localError || error;

  return (
    <div>
      <p className="text-sm font-semibold text-heading">{label}</p>
      {hint && <p className="mt-0.5 text-xs text-muted">{hint}</p>}

      <div
        className={`mt-2 flex items-center gap-3 rounded-2xl border border-dashed p-3 ${
          message
            ? "border-red-300 bg-red-50/40"
            : "border-primary-200 bg-primary-50/40"
        }`}
      >
        <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white ring-1 ring-line">
          {preview ? (
            <img
              src={preview}
              alt={`Xem trước ${label}`}
              className="h-full w-full object-cover"
            />
          ) : file ? (
            <FileText size={24} className="text-primary-600" aria-hidden />
          ) : (
            <ImagePlus size={22} className="text-muted" aria-hidden />
          )}
        </span>

        <div className="min-w-0 flex-1 text-sm">
          {file ? (
            <>
              <p
                className="truncate font-medium text-heading"
                title={file.name}
              >
                {file.name}
              </p>
              <p className="text-xs text-muted">{formatSize(file.size)}</p>
            </>
          ) : hasExisting ? (
            <p className="text-xs text-body">
              Đã tải lên trước đó. Chọn file mới nếu muốn thay.
            </p>
          ) : (
            <p className="text-xs text-body">
              Ảnh JPG, PNG, WEBP hoặc PDF, tối đa 10MB
            </p>
          )}
        </div>

        <div className="flex shrink-0 gap-1.5">
          <label
            htmlFor={inputId}
            className="flex cursor-pointer items-center gap-1.5 rounded-full border border-primary-200 bg-white px-3.5 py-2 text-xs font-semibold text-primary-700 transition hover:bg-primary-50 focus-within:outline-2 focus-within:outline-primary-600"
          >
            {file || hasExisting ? (
              <RefreshCw size={13} aria-hidden />
            ) : (
              <ImagePlus size={13} aria-hidden />
            )}
            {file || hasExisting ? "Đổi file" : "Chọn file"}
          </label>
          {file && (
            <button
              type="button"
              onClick={() => onChange(null)}
              aria-label={`Bỏ file ${label}`}
              className="rounded-full p-2 text-muted transition hover:bg-white hover:text-danger"
            >
              <X size={15} />
            </button>
          )}
        </div>
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={DOCUMENT_ACCEPT}
          className="sr-only"
          onChange={(e) => {
            pick(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </div>
      {message && (
        <p role="alert" className="mt-1.5 text-xs text-danger">
          {message}
        </p>
      )}
    </div>
  );
}
