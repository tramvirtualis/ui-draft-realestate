import { ArrowLeftRight, X } from "lucide-react";
import SafeImage from "../../../../common/SafeImage";
import { UNIT_IMAGE_FALLBACK } from "../toBookingUnit";
import { MAX_COMPARE } from "./useCompareSelection";
import type { ProjectUnit } from "../../../../../types/project/projectUnits.types";

type Props = {
  units: ProjectUnit[]; // các căn đã chọn, theo thứ tự chọn
  onRemove: (id: number) => void;
  onClear: () => void;
  onCompare: () => void;
};

// Thanh so sánh nổi ở đáy màn hình: các ô căn đã chọn (ô trống tới đủ MAX_COMPARE), xóa hết và nút So sánh
export default function CompareTray({ units, onRemove, onClear, onCompare }: Props) {
  if (units.length === 0) return null;
  const ready = units.length >= 2;
  const empty = MAX_COMPARE - units.length;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4" role="region" aria-label="So sánh căn">
      <div className="animate-rise-in pointer-events-auto flex w-full max-w-4xl items-center gap-3 rounded-2xl border border-navy/10 bg-white/95 p-3 shadow-[0_20px_50px_-12px_rgba(19,41,75,0.35)] backdrop-blur md:gap-4 md:p-4">
        <div className="shrink-0">
          <p className="text-sm font-semibold text-heading">So sánh căn</p>
          <p className="text-xs tabular-nums text-body">
            {units.length}/{MAX_COMPARE} căn
            <button type="button" onClick={onClear} className="ml-2 font-semibold text-primary-600 hover:underline">
              Xóa hết
            </button>
          </p>
        </div>

        <ul className="flex min-w-0 flex-1 gap-2 overflow-x-auto py-0.5 [scrollbar-width:none]">
          {units.map((u) => (
            <li key={u.id} className="flex shrink-0 items-center gap-2 rounded-xl border border-navy/10 bg-primary-50/50 py-1 pl-1 pr-1.5">
              <SafeImage src={u.image ?? UNIT_IMAGE_FALLBACK} alt="" className="h-8 w-8 object-cover" />
              <span className="text-xs font-bold text-heading">{u.code}</span>
              <button
                type="button"
                onClick={() => onRemove(u.id)}
                aria-label={`Bỏ căn ${u.code} khỏi so sánh`}
                className="flex h-6 w-6 items-center justify-center rounded-full text-body transition hover:bg-white hover:text-danger"
              >
                <X size={13} aria-hidden />
              </button>
            </li>
          ))}
          {Array.from({ length: empty }, (_, i) => (
            <li key={`empty-${i}`} className="hidden h-10 w-24 shrink-0 items-center justify-center rounded-xl border border-dashed border-navy/15 text-[11px] text-muted md:flex" aria-hidden>
              Trống
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={onCompare}
          disabled={!ready}
          title={ready ? undefined : "Chọn ít nhất 2 căn để so sánh"}
          className="flex shrink-0 items-center gap-2 rounded-xl bg-primary-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-700 active:scale-95 disabled:cursor-not-allowed disabled:bg-navy/30 md:px-5"
        >
          <ArrowLeftRight size={16} aria-hidden />
          <span className="hidden sm:inline">{ready ? "So sánh ngay" : "Chọn thêm căn"}</span>
        </button>
      </div>
    </div>
  );
}
