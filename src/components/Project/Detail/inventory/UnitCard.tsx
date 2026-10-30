import { ArrowUpRight, Compass, Layers, Lock, Ruler } from "lucide-react";
import SafeImage from "../../../common/SafeImage";
import CompareToggle from "./compare/CompareToggle";
import { STATUS, fmt } from "./inventoryStatus";
import { UNIT_IMAGE_FALLBACK, canBook } from "./toBookingUnit";
import type { ProjectUnit } from "../../../../types/project/projectUnits.types";

type Props = {
  unit: ProjectUnit;
  bookingEnabled: boolean;
  onOpen: () => void;
  onBook: () => void;
  compare: { selected: boolean; full: boolean; onToggle: () => void };
};

// Thẻ một căn kiểu tối giản như trang chủ: góc vuông, không viền, nền trắng đặc; ảnh có tình trạng / phân khu,
// mã căn chữ hoa, giá, thông số; bấm thẻ xem chi tiết, nút Giữ chỗ cho căn còn trống, chọn để so sánh
export default function UnitCard({ unit, bookingEnabled, onOpen, onBook, compare }: Props) {
  const st = STATUS[unit.status];
  const bookable = bookingEnabled && canBook(unit);
  const specs = [
    unit.area ? { icon: Ruler, text: `${unit.area} m²` } : null,
    unit.direction ? { icon: Compass, text: unit.direction } : null,
    unit.floor ? { icon: Layers, text: `Tầng ${unit.floor}` } : null,
  ].filter((s): s is { icon: typeof Ruler; text: string } => s !== null);

  return (
    <article className={`group relative flex h-full flex-col transition duration-300 ${compare.selected ? "bg-primary-50" : "bg-white"}`}>
      {/* Căn đang được chọn để so sánh: vạch tím trên đầu thẻ (thay cho viền) */}
      {compare.selected && <span className="absolute inset-x-0 top-0 z-10 h-1 bg-primary-600" aria-hidden />}

      <div className="relative">
        <button type="button" onClick={onOpen} aria-label={`Xem chi tiết căn ${unit.code}`} className="relative block aspect-[4/3] w-full overflow-hidden bg-primary-50">
          <SafeImage
            src={unit.image ?? UNIT_IMAGE_FALLBACK}
            alt={`Căn ${unit.code}`}
            className={`h-full w-full object-cover transition duration-700 group-hover:scale-105 ${unit.status === "sold" ? "grayscale-[60%]" : ""}`}
          />
          <span className="absolute inset-0 bg-gradient-to-t from-primary-900/55 via-transparent to-transparent" aria-hidden />
          {/* Nhãn tình trạng dạng viên kính mờ */}
          <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/85 px-3 py-1 text-[11px] font-semibold text-heading shadow-sm backdrop-blur-md">
            <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} aria-hidden /> {st.label}
          </span>
          <span className="absolute bottom-3 left-4 font-heading text-[11px] font-bold uppercase tracking-[0.14em] text-white">{unit.zone}</span>
          <span className="absolute bottom-3 right-3 flex h-9 w-9 translate-y-1 items-center justify-center bg-white text-primary-700 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100" aria-hidden>
            <ArrowUpRight size={17} />
          </span>
        </button>
        {/* Nằm ngoài nút ảnh: không lồng button trong button */}
        <div className="absolute right-3 top-3">
          <CompareToggle code={unit.code} {...compare} />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <button type="button" onClick={onOpen} className="min-w-0 text-left">
            <p className="heading-display truncate text-xl text-heading transition group-hover:text-primary-700">{unit.code}</p>
            <p className="mt-1 text-xs text-body">{unit.type}</p>
          </button>
          <div className="shrink-0 text-right">
            <p className="text-xl font-bold leading-tight text-primary-700">{unit.priceBillion ? fmt(unit.priceBillion) : "Liên hệ"}</p>
            {unit.unitPriceMillion && (
              <p className="mt-1 text-[11px] text-muted">{unit.unitPriceMillion.toFixed(1).replace(".", ",")} tr/m²</p>
            )}
          </div>
        </div>

        {specs.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-body">
            {specs.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-1.5">
                <Icon size={13} className="text-primary-500" aria-hidden /> {text}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-auto flex gap-2 pt-5">
          <button
            type="button"
            onClick={onOpen}
            className="flex-1 bg-primary-50 py-3 font-heading text-[11px] font-bold uppercase tracking-widest text-heading transition hover:bg-primary-100"
          >
            Xem chi tiết
          </button>
          {bookable && (
            <button
              type="button"
              onClick={onBook}
              className="flex flex-1 items-center justify-center gap-1.5 bg-primary-600 py-3 font-heading text-[11px] font-bold uppercase tracking-widest text-white transition hover:bg-primary-700"
            >
              <Lock size={13} aria-hidden /> Giữ chỗ
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
