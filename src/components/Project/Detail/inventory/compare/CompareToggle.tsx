import { Check, Plus } from "lucide-react";
import { MAX_COMPARE } from "./useCompareSelection";

type Props = {
  code: string;
  selected: boolean;
  full: boolean; // đã chọn đủ số căn tối đa
  onToggle: () => void;
};

// Nút chọn / bỏ chọn một căn để so sánh (nổi trên ảnh của thẻ căn)
export default function CompareToggle({ code, selected, full, onToggle }: Props) {
  const disabled = full && !selected;
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      aria-pressed={selected}
      aria-label={selected ? `Bỏ căn ${code} khỏi so sánh` : `Thêm căn ${code} vào so sánh`}
      title={disabled ? `Chỉ so sánh tối đa ${MAX_COMPARE} căn` : undefined}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold shadow-sm backdrop-blur-md transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:cursor-not-allowed disabled:opacity-50 ${
        selected ? "bg-primary-600 text-white" : "bg-white/85 text-heading hover:bg-white"
      }`}
    >
      <span className={`flex h-3.5 w-3.5 items-center justify-center rounded-full ${selected ? "bg-white text-primary-700" : "bg-primary-100 text-primary-700"}`} aria-hidden>
        {selected ? <Check size={10} strokeWidth={3} /> : <Plus size={9} strokeWidth={3} />}
      </span>
      {selected ? "Đang so sánh" : "So sánh"}
    </button>
  );
}
