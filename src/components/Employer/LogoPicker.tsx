import { useEffect, useId, useState } from "react";
import { ImagePlus, RefreshCw, X } from "lucide-react";
import CompanyLogo from "./CompanyLogo";
import { LOGO_MAX_BYTES, LOGO_TYPES } from "../../types/job/company.types";

type Props = {
  companyName: string;
  // Logo đang dùng (khi sửa hồ sơ)
  currentUrl?: string | null;
  file: File | null;
  onChange: (file: File | null) => void;
};

// Chọn logo công ty (JPG/PNG/WEBP, tối đa 5MB), xem trước ngay như trên thẻ tin tuyển dụng
export default function LogoPicker({ companyName, currentUrl, file, onChange }: Props) {
  const inputId = useId();
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const pick = (f?: File) => {
    if (!f) return;
    if (!LOGO_TYPES.includes(f.type)) return setError("Logo chỉ nhận ảnh JPG, PNG hoặc WEBP");
    if (f.size > LOGO_MAX_BYTES) return setError("Logo tối đa 5MB");
    setError("");
    onChange(f);
  };

  return (
    <div>
      <p className="text-sm font-semibold text-heading">Logo công ty</p>
      <div className="mt-2 flex items-center gap-4">
        <CompanyLogo
          name={companyName.trim() || "Công ty"}
          logoUrl={preview ?? currentUrl}
          className="h-20 w-20"
          textSize="text-xl"
        />
        <div className="min-w-0 text-sm">
          <p className="text-xs text-body">
            Hiển thị trên tin tuyển dụng. Ảnh vuông, nền trong hoặc trắng, JPG / PNG / WEBP tối đa 5MB.
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <label
              htmlFor={inputId}
              className="flex cursor-pointer items-center gap-1.5 rounded-full border border-primary-200 bg-white px-3.5 py-2 text-xs font-semibold text-primary-700 transition hover:bg-primary-50 focus-within:outline-2 focus-within:outline-primary-600"
            >
              {file || currentUrl ? <RefreshCw size={13} aria-hidden /> : <ImagePlus size={13} aria-hidden />}
              {file || currentUrl ? "Đổi logo" : "Tải logo lên"}
            </label>
            {file && (
              <button
                type="button"
                onClick={() => onChange(null)}
                className="flex items-center gap-1 rounded-full px-3 py-2 text-xs font-semibold text-muted transition hover:text-danger"
              >
                <X size={13} aria-hidden /> {currentUrl ? "Giữ logo cũ" : "Bỏ chọn"}
              </button>
            )}
          </div>
          {error && <p role="alert" className="mt-1.5 text-xs text-danger">{error}</p>}
        </div>
        <input
          id={inputId}
          type="file"
          accept={LOGO_TYPES.join(",")}
          className="sr-only"
          onChange={(e) => {
            pick(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </div>
    </div>
  );
}
