import { Lock, X } from "lucide-react";
import SafeImage from "../../../../common/SafeImage";
import { STATUS, fmt } from "../inventoryStatus";
import { UNIT_IMAGE_FALLBACK, canBook } from "../toBookingUnit";
import type { ProjectUnit } from "../../../../../types/project/projectUnits.types";

type Props = {
  unit: ProjectUnit;
  bookingEnabled: boolean;
  onRemove: () => void;
  onOpenPhotos: () => void;
  onOpen: () => void;
  onBook: () => void;
};

/**
 Đầu cột của một căn trong bảng so sánh. Mọi phần đều cao cố định (chữ dài thì cắt "...")
 để các cột luôn bằng nhau: mã + nút xóa, ảnh, phân khu, khung giá, nút thao tác.
 Phần có data-export-ignore không xuất hiện trong ảnh tải về.
 */
export default function CompareUnitHeader({ unit, bookingEnabled, onRemove, onOpenPhotos, onOpen, onBook }: Props) {
  const st = STATUS[unit.status];
  const bookable = bookingEnabled && canBook(unit);
  const summary = [unit.area ? `${unit.area} m²` : null, unit.type !== "—" ? unit.type : null, unit.direction || null].filter(Boolean).join(" · ");

  return (
    <div className="text-center">
      <div className="flex h-7 items-center justify-between gap-2">
        <span className="truncate rounded-md bg-primary-600 px-2 py-1 text-xs font-bold tracking-wide text-white">{unit.code}</span>
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Bỏ căn ${unit.code} khỏi so sánh`}
          data-export-ignore
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted transition hover:bg-danger/10 hover:text-danger"
        >
          <X size={15} aria-hidden />
        </button>
      </div>

      <button
        type="button"
        onClick={onOpenPhotos}
        aria-label={`Xem ảnh căn ${unit.code}`}
        className="group relative mt-3 block aspect-4/3 w-full overflow-hidden bg-primary-50"
      >
        <SafeImage src={unit.image ?? UNIT_IMAGE_FALLBACK} alt={`Căn ${unit.code}`} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        <span className={`absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-0.5 text-[10px] font-semibold shadow-sm ${st.text}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} aria-hidden /> {st.label}
        </span>
      </button>

      <p className="mt-3 truncate text-[11px] font-semibold uppercase tracking-wider text-body">Phân khu {unit.zone}</p>

      <div className="mt-2 rounded-xl bg-primary-50/70 px-3 py-2.5">
        <p className="text-[11px] font-semibold text-body">GIÁ NIÊM YẾT</p>
        <p className="font-heading text-lg font-bold leading-tight text-danger">{unit.priceBillion ? fmt(unit.priceBillion) : "Liên hệ"}</p>
        <p className="mt-0.5 truncate text-[11px] text-body" title={summary}>{summary || " "}</p>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-1.5" data-export-ignore>
        <button
          type="button"
          onClick={onOpen}
          className={`rounded-lg border border-line py-2 text-xs font-semibold text-heading transition hover:bg-primary-50 ${bookable ? "" : "col-span-2"}`}
        >
          Chi tiết
        </button>
        {bookable && (
          <button
            type="button"
            onClick={onBook}
            className="flex items-center justify-center gap-1 rounded-lg bg-gradient-to-r from-gold-400 to-gold-500 py-2 text-xs font-semibold text-gold-950 transition hover:brightness-105"
          >
            <Lock size={12} aria-hidden /> Giữ chỗ
          </button>
        )}
      </div>
    </div>
  );
}
