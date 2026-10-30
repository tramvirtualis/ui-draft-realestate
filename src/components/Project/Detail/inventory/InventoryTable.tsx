import { Lock } from "lucide-react";
import { MAX_COMPARE } from "./compare/useCompareSelection";
import { STATUS, fmt, dash } from "./inventoryStatus";
import { canBook } from "./toBookingUnit";
import type { ProjectUnit } from "../../../../types/project/projectUnits.types";

type Props = {
  rows: ProjectUnit[]; // các căn của trang hiện tại
  bookingEnabled: boolean;
  onOpen: (row: ProjectUnit) => void;
  onBook: (row: ProjectUnit) => void;
  compareIds: number[];
  compareFull: boolean;
  onToggleCompare: (row: ProjectUnit) => void;
};

const COLUMNS = [
  "So sánh",
  "Mã căn",
  "Phân khu",
  "Loại hình",
  "Diện tích",
  "Hướng",
  "Tầng",
  "Đơn giá",
  "Giá niêm yết",
  "Tình trạng",
  "",
];

// Bảng quỹ căn; bấm dòng xem chi tiết, ô đầu dòng chọn căn để so sánh, căn còn trống có nút Giữ chỗ
export default function InventoryTable({
  rows,
  bookingEnabled,
  onOpen,
  onBook,
  compareIds,
  compareFull,
  onToggleCompare,
}: Props) {
  return (
    <div className="overflow-x-auto rounded-[1.75rem] border border-white/80 bg-white/85 shadow-[0_24px_50px_-30px_rgba(10,15,26,0.45)] backdrop-blur">
      <table className="w-full min-w-[960px] text-left text-sm">
        <thead className="bg-primary-100 font-heading text-[10px] uppercase tracking-[0.14em] text-primary-700">
          <tr>
            {COLUMNS.map((h, i) => (
              <th key={h || i} className="px-4 py-3.5 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-primary-100">
          {rows.map((r) => {
            const st = STATUS[r.status];
            const bookable = bookingEnabled && canBook(r);
            const compared = compareIds.includes(r.id);
            return (
              <tr
                key={r.id}
                onClick={() => onOpen(r)}
                title="Bấm để xem chi tiết căn"
                className={`cursor-pointer text-heading transition ${
                  compared
                    ? "bg-navy/4 hover:bg-navy/6"
                    : "hover:bg-primary-50/40"
                }`}
              >
                <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={compared}
                    disabled={compareFull && !compared}
                    onChange={() => onToggleCompare(r)}
                    aria-label={`So sánh căn ${r.code}`}
                    title={
                      compareFull && !compared
                        ? `Chỉ so sánh tối đa ${MAX_COMPARE} căn`
                        : undefined
                    }
                    className="h-4 w-4 cursor-pointer accent-navy disabled:cursor-not-allowed"
                  />
                </td>
                <td className="px-4 py-4 font-bold text-primary-700">
                  {r.code}
                </td>
                <td className="px-4 py-4">{r.zone}</td>
                <td className="px-4 py-4">{r.type}</td>
                <td className="px-4 py-4 tabular-nums">
                  {r.area ? `${r.area} m²` : dash}
                </td>
                <td className="px-4 py-4 text-body">{r.direction || dash}</td>
                <td className="px-4 py-4 tabular-nums">{r.floor ?? dash}</td>
                <td className="px-4 py-4 tabular-nums text-body">
                  {r.unitPriceMillion
                    ? `${r.unitPriceMillion.toFixed(1).replace(".", ",")} tr/m²`
                    : dash}
                </td>
                <td className="px-4 py-4 font-semibold tabular-nums text-navy">
                  {r.priceBillion ? fmt(r.priceBillion) : "Liên hệ"}
                </td>
                <td className="px-4 py-4 font-semibold tabular-nums text-navy">
                  {r.priceBillion ? fmt(r.priceBillion) : "Liên hệ"}
                </td>
                <td className="px-4 py-4">
                  <span
                    className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold ${st.badge}`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${st.dot}`}
                      aria-hidden
                    />{" "}
                    {st.label}
                  </span>
                </td>
                <td className="px-4 py-4 text-right">
                  {bookable && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onBook(r);
                      }}
                      className="btn-gloss inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-semibold text-white"
                    >
                      <Lock size={12} aria-hidden /> Giữ chỗ
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
