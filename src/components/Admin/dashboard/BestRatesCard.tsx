import { BANKS, BEST_RATES } from "../../../data/mockInterestRates";
import BankBadge from "./BankBadge";

export default function BestRatesCard() {
  return (
    <section className="flex flex-col rounded-2xl border border-line bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-footer">Mức tốt nhất hiện tại</h2>
        <button type="button" className="text-xs font-semibold text-primary-600 hover:underline">Xem tất cả</button>
      </div>
      <ul className="mt-3 divide-y divide-line border-t border-line">
        {BEST_RATES.map((r) => (
          <li key={r.bank} className="flex items-center gap-3 py-4">
            <BankBadge bank={r.bank} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-footer">{BANKS[r.bank]?.name}</p>
              <p className="truncate text-[11px] text-body">{r.plan}</p>
            </div>
            <p className="text-lg font-bold text-success">{r.rate}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
