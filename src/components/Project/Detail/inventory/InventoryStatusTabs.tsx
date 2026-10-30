import { STATUS } from "./inventoryStatus";
import type { ProjectUnit } from "../../../../types/project/projectUnits.types";

type Props = {
  units: ProjectUnit[];
  value: string; // "" = tất cả
  onChange: (status: string) => void;
};

// Các tình trạng hiển thị trên thanh (căn "Đã cho thuê" vẫn tính trong Tất cả)
const TABS = ["", "available", "holding", "sold"] as const;

// Thanh tình trạng quỹ căn: số căn theo từng tình trạng, bấm để lọc nhanh
export default function InventoryStatusTabs({ units, value, onChange }: Props) {
  const count = (status: string) => (status ? units.filter((u) => u.status === status).length : units.length);

  return (
    <div role="tablist" aria-label="Lọc theo tình trạng" className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {TABS.map((status) => {
        const active = value === status;
        const meta = status ? STATUS[status] : null;
        const n = count(status);
        const pct = units.length && status ? Math.round((n / units.length) * 100) : null;
        return (
          <button
            key={status || "all"}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(status)}
            className={`group rounded-[1.5rem] border p-4 text-left transition md:p-5 ${
              active
                ? "border-primary-300 bg-primary-100 ring-2 ring-primary-200"
                : "border-white/80 bg-white/75 backdrop-blur hover:-translate-y-0.5 hover:border-primary-200"
            }`}
          >
            <span className={`flex items-center gap-2 font-heading text-[10px] font-bold uppercase tracking-[0.16em] ${active ? "text-primary-700" : "text-body"}`}>
              <span className={`h-2 w-2 rounded-full ${meta ? meta.dot : "bg-primary-400"}`} aria-hidden />
              {meta ? meta.label : "Tất cả căn"}
            </span>
            <span className="mt-2 flex items-baseline gap-2">
              <span className={`heading-display text-3xl tabular-nums md:text-4xl ${active ? "text-primary-700" : "text-heading"}`}>{n}</span>
              {pct !== null && <span className={`text-xs ${active ? "text-primary-600" : "text-muted"}`}>{pct}%</span>}
            </span>
          </button>
        );
      })}
    </div>
  );
}
