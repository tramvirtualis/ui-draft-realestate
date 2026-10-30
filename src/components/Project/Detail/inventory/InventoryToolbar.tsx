import type { ReactNode } from "react";
import { ChevronDown, LayoutGrid, List, RotateCcw, Search } from "lucide-react";
import { DIRECTION_OPTIONS, PRICE_OPTIONS, type InventoryFilter } from "./inventoryFilter";

export type InventoryView = "grid" | "table";

type Props = {
  filter: InventoryFilter;
  onChange: (filter: InventoryFilter) => void;
  zones: { id: number; name: string }[];
  types: string[]; // loại hình có trong quỹ căn của dự án
  sort: string;
  onSort: (sort: string) => void;
  view: InventoryView;
  onView: (view: InventoryView) => void;
  total: number; // số căn khớp bộ lọc
};

const control = "h-11 w-full appearance-none rounded-xl border border-line bg-white pl-4 pr-9 text-sm text-heading outline-none transition focus:border-primary-300 focus:ring-4 focus:ring-primary-100";

function Select({ label, value, onChange, children }: { label: string; value: string; onChange: (v: string) => void; children: ReactNode }) {
  return (
    <label className="relative block">
      <span className="sr-only">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={`${control} ${value ? "border-primary-300 bg-primary-50/50 font-semibold" : ""}`}>
        {children}
      </select>
      <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-body" aria-hidden />
    </label>
  );
}

// Thanh công cụ quỹ căn: tìm mã căn, lọc (áp dụng ngay), sắp xếp và chuyển kiểu xem thẻ / bảng
export default function InventoryToolbar({ filter, onChange, zones, types, sort, onSort, view, onView, total }: Props) {
  const set = (patch: Partial<InventoryFilter>) => onChange({ ...filter, ...patch });
  const filtered = Boolean(filter.q || filter.zone || filter.type || filter.price || filter.dir);

  return (
    <div className="rounded-[1.75rem] border border-white/80 bg-white/75 p-4 shadow-[0_24px_50px_-30px_rgba(10,15,26,0.45)] backdrop-blur md:p-5">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.4fr)_repeat(4,minmax(0,1fr))]">
        <label className="relative block sm:col-span-2 lg:col-span-1">
          <span className="sr-only">Tìm theo mã căn</span>
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-body" aria-hidden />
          <input
            value={filter.q}
            onChange={(e) => set({ q: e.target.value })}
            placeholder="Tìm mã căn, ví dụ A1-1208"
            className={`${control} pl-10 pr-4`}
          />
        </label>
        <Select label="Phân khu" value={filter.zone} onChange={(zone) => set({ zone })}>
          <option value="">Tất cả phân khu</option>
          {zones.map((z) => <option key={z.id} value={String(z.id)}>{z.name}</option>)}
        </Select>
        <Select label="Loại hình" value={filter.type} onChange={(type) => set({ type })}>
          <option value="">Tất cả loại hình</option>
          {types.map((t) => <option key={t} value={t}>{t}</option>)}
        </Select>
        <Select label="Khoảng giá" value={filter.price} onChange={(price) => set({ price })}>
          {PRICE_OPTIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </Select>
        <Select label="Hướng" value={filter.dir} onChange={(dir) => set({ dir })}>
          <option value="">Tất cả hướng</option>
          {DIRECTION_OPTIONS.map((d) => <option key={d} value={d}>{d}</option>)}
        </Select>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-primary-100 pt-4">
        <p className="text-sm text-body" aria-live="polite">
          <span className="font-semibold text-heading">{total}</span> căn phù hợp
        </p>
        {filtered && (
          <button
            type="button"
            onClick={() => onChange({ ...filter, q: "", zone: "", type: "", price: "", dir: "" })}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-primary-700 transition hover:bg-primary-50"
          >
            <RotateCcw size={13} aria-hidden /> Xóa bộ lọc
          </button>
        )}

        <div className="ml-auto flex items-center gap-2">
          <label className="relative">
            <span className="sr-only">Sắp xếp</span>
            <select value={sort} onChange={(e) => onSort(e.target.value)} className={`${control} h-10 w-auto text-xs font-semibold`}>
              <option value="default">Sắp xếp: mặc định</option>
              <option value="price-asc">Giá tăng dần</option>
              <option value="price-desc">Giá giảm dần</option>
              <option value="area-desc">Diện tích lớn nhất</option>
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-body" aria-hidden />
          </label>
          <div role="group" aria-label="Kiểu xem" className="flex rounded-full border border-primary-100 bg-white p-1">
            {([["grid", LayoutGrid, "Xem dạng thẻ"], ["table", List, "Xem dạng bảng"]] as const).map(([key, Icon, label]) => (
              <button
                key={key}
                type="button"
                aria-pressed={view === key}
                aria-label={label}
                title={label}
                onClick={() => onView(key)}
                className={`flex h-8 w-9 items-center justify-center rounded-full transition ${view === key ? "btn-gloss text-white" : "text-body hover:bg-primary-50"}`}
              >
                <Icon size={15} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
