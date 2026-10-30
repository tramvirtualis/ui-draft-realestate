import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MapPin, X } from "lucide-react";
import useFocusTrap from "../../../common/useFocusTrap";
import { STATUS } from "./inventoryStatus";
import { canBook } from "./toBookingUnit";
import UnitGallery from "../unitDetail/UnitGallery";
import BookingBar from "../unitDetail/BookingBar";
import { FinanceCard, HandoverCard, PolicyCard, QuickSpecs } from "../unitDetail/UnitSections";
import { billion } from "../unitDetail/unitDetailFormat";
import ContactCards from "../unitDetail/ContactCards";
import type { ProjectUnit } from "../../../../types/project/projectUnits.types";

type Props = {
  projectId: number | null; // dự án của căn: hiện liên hệ giám đốc / admin dự án
  unit: ProjectUnit;
  onClose: () => void;
  onBook: () => void; // mở form giữ chỗ
  bookingEnabled?: boolean; // dự án đang nhận booking
};

/**
 Chi tiết một căn: header (mã căn, trạng thái, giá), ảnh + thông số nhanh, tài chính, chính sách, bàn giao
 và thanh giữ chỗ cố định ở đáy. Chỉ phần thân modal cuộn; trên desktop cột ảnh dính lại khi cuộn cột thông tin.
 */
export default function UnitDetailModal({ projectId, unit, onClose, onBook, bookingEnabled = true }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  // Khi đang xem ảnh toàn màn hình, nhường Esc/Tab cho trình xem ảnh
  useFocusTrap(root, !viewerOpen, onClose);

  const st = STATUS[unit.status];
  const price = billion(unit.priceBillion);

  const book = () => {
    if (canBook(unit) && bookingEnabled) onBook();
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-ink-950/60 backdrop-blur-sm sm:items-center sm:p-4" onClick={onClose} role="presentation">
      <div
        ref={root}
        role="dialog"
        aria-modal="true"
        aria-labelledby="unit-detail-title"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="animate-page-in flex max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-t-3xl bg-[#fbfaf7] shadow-2xl outline-none sm:rounded-3xl"
      >
        {/* Header */}
        <header className="flex items-start justify-between gap-4 border-b border-navy/10 bg-white px-5 py-4 md:px-7">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 id="unit-detail-title" className="font-heading text-2xl font-semibold tracking-tight text-navy md:text-3xl">{unit.code}</h2>
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${st.badge}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} aria-hidden /> {st.label}
              </span>
            </div>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-body">
              <MapPin size={14} className="shrink-0 text-gold-500" aria-hidden />
              <span className="truncate">Phân khu {unit.zone}{unit.floor ? ` · Tầng ${unit.floor}` : ""}</span>
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-[11px] uppercase tracking-[0.14em] text-body">Giá niêm yết</p>
              <p className="font-heading text-2xl font-semibold tabular-nums text-navy md:text-3xl">{price ?? "Liên hệ"}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-navy/10 text-navy transition hover:bg-primary-50 focus-visible:outline-2 focus-visible:outline-gold-400"
            >
              <X size={18} />
            </button>
          </div>
        </header>

        {/* Thân: vùng cuộn duy nhất */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <div className="grid gap-6 p-5 md:p-7 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
            <div className="space-y-4 lg:sticky lg:top-0 lg:self-start">
              <UnitGallery code={unit.code} images={unit.images} onViewerChange={setViewerOpen} />
              <QuickSpecs unit={unit} />
            </div>
            <div className="space-y-4">
              <FinanceCard unit={unit} />
              <PolicyCard unit={unit} />
              <HandoverCard unit={unit} />
              <ContactCards projectId={projectId} />
            </div>
          </div>
        </div>

        <BookingBar unit={unit} onBook={book} bookingEnabled={bookingEnabled} />
      </div>
    </div>,
    document.body,
  );
}
