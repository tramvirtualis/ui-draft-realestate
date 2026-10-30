import { useRef, useState } from "react";
import { Camera, Trash2 } from "lucide-react";

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPT = ["image/jpeg", "image/png"];
const OUTPUT_SIZE = 400;

/** Cắt vuông và thu nhỏ về 400px (JPEG) để bản nháp không vượt hạn mức localStorage */
function resizeToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const side = Math.min(img.width, img.height);
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = OUTPUT_SIZE;
      canvas
        .getContext("2d")!
        .drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Không đọc được ảnh"));
    };
    img.src = url;
  });
}

export default function AvatarUploader({
  value,
  name,
  onChange,
}: {
  value: string;
  name: string;
  onChange: (dataUrl: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");

  const handleFile = async (file?: File) => {
    if (!file) return;
    if (!ACCEPT.includes(file.type)) return setError("Chỉ chấp nhận ảnh JPG hoặc PNG");
    if (file.size > MAX_BYTES) return setError("Ảnh vượt quá 5MB");
    try {
      onChange(await resizeToDataUrl(file));
      setError("");
    } catch {
      setError("Không đọc được ảnh, vui lòng chọn ảnh khác");
    }
  };

  return (
    <div className="rounded-2xl border border-primary-100 bg-primary-50/50 p-4">
      <div className="flex items-center gap-4">
        {value ? (
          <img src={value} alt={`Ảnh đại diện ${name}`} className="h-16 w-16 rounded-xl object-cover" />
        ) : (
          <span className="flex h-16 w-16 items-center justify-center rounded-xl bg-white text-muted ring-1 ring-line">
            <Camera size={22} aria-hidden />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-heading">Ảnh đại diện chuyên nghiệp</p>
          <p className="text-xs text-body">JPG/PNG, tối đa 5MB</p>
          <div className="mt-2 flex gap-3 text-xs font-medium">
            <button type="button" onClick={() => inputRef.current?.click()} className="text-primary-600 hover:text-primary-700">
              {value ? "Thay ảnh" : "Tải ảnh lên"}
            </button>
            {value && (
              <button type="button" onClick={() => onChange("")} className="flex items-center gap-1 text-muted hover:text-danger">
                <Trash2 size={12} aria-hidden /> Xóa ảnh
              </button>
            )}
          </div>
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,image/jpeg,image/png"
        className="sr-only"
        aria-label="Chọn ảnh đại diện"
        onChange={(e) => {
          handleFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      {error && (
        <p role="alert" className="mt-2 text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
