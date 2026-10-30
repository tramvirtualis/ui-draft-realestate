import type { ReactNode } from "react";
import { Eye, Lock, MousePointerClick } from "lucide-react";
import { STATUS } from "./floorPlanStatus";
import { fmt } from "../inventory/inventoryStatus";
import { canBook } from "../inventory/toBookingUnit";
import { UNIT_IMAGE_FALLBACK } from "../../../../data/project/detail/floorPlan";
import type { ProjectUnit } from "../../../../types/project/projectUnits.types";

type Props = {
  unit: ProjectUnit | null;
  setBooking: (open: boolean) => void;
  bookingEnabled?: boolean;
  /** Mở lại popup chi tiết căn đang chọn */
  onDetail?: () => void;
  /** Lời nhắc khi chưa chọn căn nào */
  emptyText?: string;
  /** Nhãn phụ dưới mã căn (vd. quỹ căn, tên tòa trên bảng hàng) */
  meta?: ReactNode;
};

const CARD = "rounded-[1.75rem] border border-white/80 bg-white/80 p-5 shadow-[0_24px_50px_-30px_rgba(10,15,26,0.45)] backdrop-blur";

// Thẻ "Căn đang chọn" cạnh mặt bằng / bảng hàng: ảnh, tình trạng, thông số, giá dự kiến, xem chi tiết và giữ chỗ
export default function SelectedUnitCard({ unit, setBooking, bookingEnabled = true, onDetail, emptyText = "Bấm vào một căn để xem thông tin.", meta }: Props) {
  if (!unit) {
    return (
      <aside className={`${CARD} flex min-h-64 flex-col items-center justify-center text-center lg:sticky lg:top-36 lg:self-start`}>
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-100 text-primary-600">
          <MousePointerClick size={20} aria-hidden />
        </span>
        <p className="mt-3 max-w-56 text-sm text-body">{emptyText}</p>
      </aside>
    );
  }

  const s = STATUS[unit.status];
  const rows: [string, string][] = [
    ["Phân khu / tầng", `${unit.zone}${unit.floor ? ` · Tầng ${unit.floor}` : ""}`],
    ["Diện tích", unit.area ? `${unit.area} m²` : "—"],
    ["Loại hình", unit.type],
    ["Hướng", unit.direction || "—"],
  ];

  return (
    <aside className={`${CARD} lg:sticky lg:top-36 lg:self-start`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-heading text-[10px] font-bold uppercase tracking-[0.16em] text-primary-600">Căn đang chọn</p>
          <p className="heading-display mt-1 truncate text-3xl text-heading">{unit.code}</p>
          {meta && <div className="mt-1.5">{meta}</div>}
        </div>
        <span className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold ${s.badge}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} /> {s.label}
        </span>
      </div>
      <img src={unit.image ?? UNIT_IMAGE_FALLBACK} alt={unit.code} className="mt-4 w-full object-cover" style={{ height: 145 }} />
      <dl className="mt-4">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-3 border-b border-primary-100 py-3 text-sm">
            <dt className="text-body">{k}</dt>
            <dd className="text-right font-medium text-heading">{v}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-4 rounded-2xl bg-primary-50 p-4">
        <p className="font-heading text-[10px] font-bold uppercase tracking-[0.16em] text-body">Giá dự kiến</p>
        <p className="heading-display mt-1 text-3xl text-primary-700">{unit.priceBillion ? fmt(unit.priceBillion) : "Liên hệ"}</p>
        {unit.unitPriceMillion && (
          <p className="mt-1 text-[11px] text-muted">≈ {unit.unitPriceMillion.toFixed(1).replace(".", ",")} triệu/m²</p>
        )}
      </div>
      <div className="mt-4 flex gap-2">
        {onDetail && (
          <button
            type="button"
            onClick={onDetail}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-primary-300 px-4 py-3 font-heading text-[11px] font-bold uppercase tracking-widest text-primary-700 transition hover:bg-primary-50"
          >
            <Eye size={14} aria-hidden /> Chi tiết
          </button>
        )}
        <button
          type="button"
          onClick={() => setBooking(true)}
          disabled={!canBook(unit) || !bookingEnabled}
          className="btn-gloss flex flex-[1.4] items-center justify-center gap-1.5 rounded-full px-4 py-3 font-heading text-[11px] font-bold uppercase tracking-widest text-white disabled:opacity-50"
        >
          <Lock size={14} aria-hidden />
          {!bookingEnabled ? "Tạm ngừng giữ chỗ" : canBook(unit) ? "Giữ chỗ" : "Không còn trống"}
        </button>
      </div>
    </aside>
  );
}
