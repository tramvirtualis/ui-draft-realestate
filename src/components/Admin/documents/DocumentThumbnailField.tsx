import { useRef } from "react";
import { ImagePlus, X } from "lucide-react";

type Props = {
  src: string | null; // ảnh đang hiển thị (mới chọn hoặc đang lưu)
  onPick: (file: File | null) => void;
  onClear: () => void;
  hint?: string;
  disabled?: boolean;
};

// Ô chọn ảnh đại diện có xem trước
export default function DocumentThumbnailField({ src, onPick, onClear, hint, disabled }: Props) {
  const picker = useRef<HTMLInputElement>(null);

  return (
    <div>
      {src ? (
        <div className="relative overflow-hidden rounded-2xl border border-line">
          <img src={src} alt="Ảnh đại diện" className="aspect-[16/10] w-full object-cover" />
          <div className="absolute right-2 top-2 flex gap-1.5">
            <button type="button" onClick={() => picker.current?.click()} disabled={disabled} className="rounded-lg bg-white/90 px-2.5 py-1.5 text-xs font-semibold text-heading shadow">Đổi ảnh</button>
            <button type="button" onClick={onClear} disabled={disabled} aria-label="Gỡ ảnh" className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/90 text-danger shadow"><X size={14} /></button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={disabled}
          onClick={() => picker.current?.click()}
          className="flex aspect-[16/10] w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-primary-200 bg-primary-50/30 text-primary-700 transition hover:bg-primary-50"
        >
          <ImagePlus size={22} />
          <span className="text-xs font-semibold">Chọn ảnh đại diện</span>
        </button>
      )}
      {hint && <p className="mt-2 text-[11px] text-muted">{hint}</p>}
      <input
        ref={picker}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          onPick(e.target.files?.[0] ?? null);
          e.target.value = "";
        }}
      />
    </div>
  );
}
