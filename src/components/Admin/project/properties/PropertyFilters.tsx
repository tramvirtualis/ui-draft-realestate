import { useState } from "react";
import { Search, SlidersHorizontal, ChevronDown } from "lucide-react";
import { PROPERTY_STATUS } from "../../../../data/project/mockProperties";
import type { PropertyCatalog, PropertyFilter } from "../../../../types/project/property.types";

type Props = {
  filter: PropertyFilter;
  onChange: (next: PropertyFilter) => void;
  onClear: () => void;
  catalog: PropertyCatalog;
  shown: number;
  total: number;
  lockProject?: boolean; // đang xem quỹ căn của một dự án: ẩn ô chọn dự án
};

const field = "h-11 w-full rounded-xl border border-line bg-white px-4 text-sm text-heading outline-none transition focus:border-primary-300 focus:ring-4 focus:ring-primary-100";

function Select({ label, value, onChange, children }: { label: string; value: string; onChange: (v: string) => void; children: React.ReactNode }) {
  return (
    <label className="relative block">
      <select aria-label={label} value={value} onChange={(e) => onChange(e.target.value)} className={`${field} appearance-none pr-9`}>
        {children}
      </select>
      <ChevronDown size={14} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-muted" />
    </label>
  );
}

function Range({ label, unit, min, max, onMin, onMax }: { label: string; unit: string; min: string; max: string; onMin: (v: string) => void; onMax: (v: string) => void }) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-semibold text-footer">{label} <span className="font-normal text-muted">({unit})</span></p>
      <div className="flex items-center gap-2">
        <input type="number" min={0} value={min} onChange={(e) => onMin(e.target.value)} placeholder="Từ" aria-label={`${label} từ`} className={field} />
        <span className="text-muted">–</span>
        <input type="number" min={0} value={max} onChange={(e) => onMax(e.target.value)} placeholder="Đến" aria-label={`${label} đến`} className={field} />
      </div>
    </div>
  );
}

export default function PropertyFilters({ filter, onChange, onClear, catalog, shown, total, lockProject = false }: Props) {
  const [open, setOpen] = useState(false);
  const zones = catalog.zones.filter((z) => filter.projectId === null || z.projectId === filter.projectId);
  // Tòa nhà của các phân khu đang lọc (chỉ dự án cao tầng có)
  const buildings = catalog.buildings.filter((b) => (filter.zoneId === null ? zones.some((z) => z.id === b.zoneId) : b.zoneId === filter.zoneId));
  const set = (patch: Partial<PropertyFilter>) => onChange({ ...filter, ...patch });
  const advancedCount = [filter.areaMin, filter.areaMax, filter.priceMin, filter.priceMax].filter(Boolean).length;
  const filtering = advancedCount > 0 || filter.keyword.trim() !== "" || filter.status !== "" || filter.projectId !== null || filter.zoneId !== null || filter.buildingId !== null;

  return (
    <div>
      <div
        className={`grid gap-3 sm:grid-cols-2 ${
          lockProject
            ? buildings.length > 0 ? "lg:grid-cols-[1fr_1fr_1.1fr_1fr_auto_auto]" : "lg:grid-cols-[1fr_1.1fr_1fr_auto_auto]"
            : "lg:grid-cols-[1.2fr_1fr_1.1fr_1fr_auto_auto]"
        }`}
      >
        {!lockProject && <Select
          label="Dự án"
          value={filter.projectId === null ? "" : String(filter.projectId)}
          onChange={(v) => set({ projectId: v ? Number(v) : null, zoneId: null, buildingId: null })}
        >
          <option value="">Tất cả dự án</option>
          {catalog.projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </Select>}

        <Select label="Phân khu" value={filter.zoneId === null ? "" : String(filter.zoneId)} onChange={(v) => set({ zoneId: v ? Number(v) : null, buildingId: null })}>
          <option value="">Tất cả phân khu</option>
          {zones.map((z) => <option key={z.id} value={z.id}>{z.name}</option>)}
        </Select>

        {buildings.length > 0 && (
          <Select label="Tòa nhà" value={filter.buildingId === null ? "" : String(filter.buildingId)} onChange={(v) => set({ buildingId: v ? Number(v) : null })}>
            <option value="">Tất cả tòa nhà</option>
            {buildings.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </Select>
        )}

        <label className="relative block">
          <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input value={filter.keyword} onChange={(e) => set({ keyword: e.target.value })} placeholder="Tìm theo mã căn..." aria-label="Tìm theo mã căn" className={`${field} pl-10`} />
        </label>

        <Select label="Trạng thái" value={filter.status} onChange={(v) => set({ status: v as PropertyFilter["status"] })}>
          <option value="">Tất cả trạng thái</option>
          {Object.entries(PROPERTY_STATUS).map(([k, s]) => <option key={k} value={k}>{s.label}</option>)}
        </Select>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className={`flex h-11 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-medium transition hover:bg-primary-50 ${open || advancedCount ? "border-primary-300 bg-primary-50 text-primary-700" : "border-line text-heading"}`}
        >
          <SlidersHorizontal size={15} /> Nâng cao{advancedCount > 0 && ` (${advancedCount})`}
        </button>

        <button type="button" onClick={onClear} className="h-11 rounded-xl border border-line px-5 text-sm font-medium text-heading transition hover:bg-primary-50 active:scale-95">
          Xóa bộ lọc
        </button>
      </div>

      {open && (
        <div className="animate-page-in mt-3 grid gap-4 rounded-xl bg-primary-50/50 p-4 sm:grid-cols-2">
          <Range label="Diện tích" unit="m²" min={filter.areaMin} max={filter.areaMax} onMin={(v) => set({ areaMin: v })} onMax={(v) => set({ areaMax: v })} />
          <Range label="Khoảng giá" unit="tỷ VNĐ" min={filter.priceMin} max={filter.priceMax} onMin={(v) => set({ priceMin: v })} onMax={(v) => set({ priceMax: v })} />
        </div>
      )}

      <p className="mt-3 text-sm text-body" aria-live="polite">
        {filtering ? <>Tìm thấy <b className="text-footer">{shown}</b> / {total} căn</> : <>Tổng <b className="text-footer">{total}</b> căn</>}
      </p>
    </div>
  );
}
