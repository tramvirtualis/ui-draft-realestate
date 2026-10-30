import { useRef, type ReactNode } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import useFocusTrap from "../common/useFocusTrap";

/** Bottom sheet chứa bộ lọc trên mobile; Esc hoặc bấm nền để đóng */
export default function JobFilterSheet({
  onClose,
  onApply,
  children,
}: {
  onClose: () => void;
  onApply: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, true, onClose);

  return (
    <div className="fixed inset-0 z-[60] md:hidden" role="dialog" aria-modal="true" aria-label="Bộ lọc việc làm">
      <div className="absolute inset-0 bg-heading/50" onClick={onClose} aria-hidden />
      <div
        ref={ref}
        tabIndex={-1}
        className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-white p-5"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-heading">Bộ lọc</h2>
          <button type="button" onClick={onClose} aria-label="Đóng" className="p-1 text-body">
            <X size={20} />
          </button>
        </div>
        {children}
        <button
          type="button"
          onClick={onApply}
          className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary-500 to-primary-700 text-sm font-medium text-white shadow-lg shadow-primary-300/50"
        >
          <SlidersHorizontal size={16} aria-hidden /> Áp dụng bộ lọc
        </button>
      </div>
    </div>
  );
}
