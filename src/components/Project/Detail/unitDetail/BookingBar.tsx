import { Ban, CheckCircle2, Clock, KeyRound, Lock } from "lucide-react";
import type { ProjectUnit } from "../../../../types/project/projectUnits.types";
import { billion } from "./unitDetailFormat";

// Mỗi trạng thái căn một kiểu nút riêng: chỉ căn còn trống mới đặt giữ chỗ được
const STATE: Record<ProjectUnit["status"], { label: string; note: string; icon: typeof Lock; bookable: boolean; tone: string }> = {
  available: { label: "Giữ chỗ căn này", note: "Căn đang mở bán", icon: Lock, bookable: true, tone: "" },
  holding: { label: "Đang được giữ chỗ", note: "Căn đang có khách giữ chỗ, vui lòng chọn căn khác", icon: Clock, bookable: false, tone: "bg-warning/10 text-warning" },
  sold: { label: "Căn đã bán", note: "Căn này đã có chủ sở hữu", icon: CheckCircle2, bookable: false, tone: "bg-danger/10 text-danger" },
  closed: { label: "Đã cho thuê", note: "Căn hiện không mở bán", icon: Ban, bookable: false, tone: "bg-line text-body" },
};

type Props = { unit: ProjectUnit; onBook: () => void; bookingEnabled?: boolean };

// Thanh hành động cố định ở đáy modal (không nằm trong vùng cuộn nên không che nội dung)
export default function BookingBar({ unit, onBook, bookingEnabled = true }: Props) {
  const base = STATE[unit.status] ?? STATE.closed;
  // Dự án tạm ngừng nhận booking: căn vẫn xem được nhưng không giữ chỗ
  const s = base.bookable && !bookingEnabled
    ? { ...base, label: "Tạm ngừng nhận giữ chỗ", note: "Dự án đang tạm ngừng nhận giữ chỗ, vui lòng liên hệ chuyên viên", icon: Ban, bookable: false, tone: "bg-line text-body" }
    : base;
  const Icon = s.icon;
  return (
    <footer className="flex flex-col gap-3 border-t border-navy/10 bg-white/95 px-5 py-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between md:px-7">
      <div className="min-w-0">
        <p className="text-xs text-body">{s.note}</p>
        <p className="mt-0.5 truncate text-sm font-semibold text-navy">
          Căn {unit.code}
          {billion(unit.priceBillion) && <span className="text-body"> · {billion(unit.priceBillion)}</span>}
        </p>
      </div>
      {s.bookable ? (
        <button
          type="button"
          onClick={onBook}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gold-400 to-gold-500 px-8 py-3 text-sm font-semibold text-gold-950 shadow-lg shadow-gold-500/25 transition hover:-translate-y-0.5 hover:shadow-gold-500/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy active:translate-y-0"
        >
          <KeyRound size={16} aria-hidden /> {s.label}
        </button>
      ) : (
        <span role="status" className={`inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold ${s.tone}`}>
          <Icon size={16} aria-hidden /> {s.label}
        </span>
      )}
    </footer>
  );
}
