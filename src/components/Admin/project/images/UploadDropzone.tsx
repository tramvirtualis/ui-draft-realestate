import { useRef, useState } from "react";
import { ImagePlus, Loader2 } from "lucide-react";

type Props = {
  onFiles: (files: File[]) => void;
  busy?: boolean;
  large?: boolean; // dùng làm empty state khi chưa có ảnh
  inputId?: string;
};

// Vùng kéo thả (hoặc bấm để chọn) nhiều ảnh cùng lúc
export default function UploadDropzone({ onFiles, busy = false, large = false, inputId }: Props) {
  const [over, setOver] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  const take = (list: FileList | null) => {
    if (list && list.length > 0) onFiles(Array.from(list));
    if (input.current) input.current.value = ""; // cho phép chọn lại cùng một file
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        take(e.dataTransfer.files);
      }}
      className={`group rounded-3xl border-2 border-dashed text-center transition duration-300 ${
        over ? "scale-[1.01] border-primary-500 bg-primary-50" : "border-primary-200 bg-white hover:border-primary-400 hover:bg-primary-50/40"
      } ${large ? "px-6 py-20" : "px-6 py-7"}`}
    >
      <input ref={input} id={inputId} type="file" accept="image/*" multiple hidden onChange={(e) => take(e.target.files)} />
      <div className={`mx-auto flex items-center justify-center gap-4 ${large ? "flex-col" : "flex-col sm:flex-row"}`}>
        <span className={`flex items-center justify-center rounded-2xl bg-primary-100 text-primary-600 transition duration-300 group-hover:-translate-y-0.5 ${large ? "h-16 w-16" : "h-12 w-12"}`}>
          {busy ? <Loader2 size={large ? 28 : 22} className="animate-spin" /> : <ImagePlus size={large ? 28 : 22} />}
        </span>
        <div className={large ? "" : "sm:text-left"}>
          <p className={`font-semibold text-footer ${large ? "text-xl" : "text-sm"}`}>
            {busy ? "Đang tải ảnh lên..." : large ? "Dự án chưa có ảnh nào" : "Kéo thả ảnh vào đây"}
          </p>
          <p className="mt-1 text-xs text-body">
            {large ? "Kéo thả ảnh vào đây hoặc chọn từ máy để bắt đầu xây dựng bộ sưu tập." : "hoặc chọn nhiều ảnh từ máy · JPG, PNG, WebP, tối đa 10 MB mỗi ảnh"}
          </p>
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={() => input.current?.click()}
          className="rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-200 transition hover:bg-primary-700 active:scale-95 disabled:opacity-60"
        >
          Chọn ảnh
        </button>
      </div>
    </div>
  );
}
