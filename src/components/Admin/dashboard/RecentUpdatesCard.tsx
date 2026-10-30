import { RATE_UPDATES, type UpdateTone } from "../../../data/mockInterestRates";
import BankBadge from "./BankBadge";

const BADGE: Record<UpdateTone, { wrap: string; dot: string }> = {
  success: { wrap: "bg-success/10 text-success", dot: "bg-success" },
  primary: { wrap: "bg-primary-100 text-primary-700", dot: "bg-primary-500" },
  warning: { wrap: "bg-amber-100 text-warning", dot: "bg-warning" },
  violet: { wrap: "bg-primary-100 text-primary-700", dot: "bg-primary-500" },
};

export default function RecentUpdatesCard() {
  return (
    <section className="rounded-2xl border border-line bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-footer">Cập nhật gần đây</h2>
          <p className="mt-1 text-xs text-body">Các thay đổi lãi suất và điều kiện vay mới nhất</p>
        </div>
        <button type="button" className="text-xs font-semibold text-primary-600 hover:underline">Xem lịch sử</button>
      </div>
      <ul className="mt-4 divide-y divide-line border-t border-line">
        {RATE_UPDATES.map((u) => (
          <li key={u.id} className="flex items-center gap-3 py-3.5">
            <BankBadge bank={u.bank} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-footer">{u.text}</p>
              <p className="mt-0.5 truncate text-[11px] text-muted">{u.meta}</p>
            </div>
            <span className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold ${BADGE[u.tone].wrap}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${BADGE[u.tone].dot}`} /> {u.badge}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
