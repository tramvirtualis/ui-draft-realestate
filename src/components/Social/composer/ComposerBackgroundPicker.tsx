import { Ban, Check } from "lucide-react";
import type { PostBackground } from "../../../types/social/social.types";

type Props = {
  backgrounds: PostBackground[];
  selectedId: number | null;
  onSelect: (background: PostBackground | null) => void;
  disabled?: boolean;
  // Có thì khóa các ô màu và hiện lý do (chữ quá dài...)
  disabledReason?: string | null;
};

const swatch =
  "relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100";

// Hàng ô màu nền trong modal tạo bài viết (chỉ cho bài chỉ có chữ)
export default function ComposerBackgroundPicker({ backgrounds, selectedId, onSelect, disabled, disabledReason }: Props) {
  if (backgrounds.length === 0) return null;
  const locked = disabled || !!disabledReason;

  return (
    <div className="mt-3">
      <div className="flex items-center gap-2 overflow-x-auto p-1" role="radiogroup" aria-label="Màu nền bài viết">
        {/* Ô đầu: không dùng màu nền */}
        <button
          type="button"
          role="radio"
          aria-checked={selectedId === null}
          onClick={() => onSelect(null)}
          disabled={disabled}
          aria-label="Không dùng màu nền"
          title="Không dùng màu nền"
          className={`${swatch} border bg-white ${selectedId === null ? "border-primary-600 ring-2 ring-primary-200" : "border-gray-300"}`}
        >
          <Ban size={16} className="text-gray-400" />
        </button>
        {backgrounds.map((bg) => {
          const selected = selectedId === bg.id;
          return (
            <button
              key={bg.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onSelect(bg)}
              disabled={locked}
              aria-label={`Màu nền ${bg.name}`}
              title={bg.name}
              className={`${swatch} shadow-sm ${selected ? "ring-2 ring-primary-600 ring-offset-2" : ""}`}
              style={{ background: bg.value }}
            >
              {selected && <Check size={16} strokeWidth={3} style={{ color: bg.textColor }} />}
            </button>
          );
        })}
      </div>
      {disabledReason && (
        <p className="mt-1 text-xs text-gray-500" role="status">
          {disabledReason}
        </p>
      )}
    </div>
  );
}
