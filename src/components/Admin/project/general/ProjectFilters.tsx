import { Search, ChevronDown } from "lucide-react";
import type { AdminProjectFilter } from "../../../../types/project/adminProject.types";

type Props = {
  filter: AdminProjectFilter;
  onChange: (next: AdminProjectFilter) => void;
  onClear: () => void;
  options: { investors: string[]; locations: string[]; buildingTypes: string[] };
};

const base =
  "h-11 w-full appearance-none rounded-xl border border-line bg-white pl-10 pr-8 text-sm text-heading outline-none transition focus:border-primary-300 focus:ring-4 focus:ring-primary-100";

function Select({ label, value, onChange, children }: { label: string; value: string; onChange: (v: string) => void; children: React.ReactNode }) {
  return (
    <label className="relative block">
      <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
      <select aria-label={label} value={value} onChange={(e) => onChange(e.target.value)} className={base}>
        <option value="">{label}</option>
        {children}
      </select>
      <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted" />
    </label>
  );
}

export default function ProjectFilters({ filter, onChange, onClear, options }: Props) {
  const set = <K extends keyof AdminProjectFilter>(k: K, v: AdminProjectFilter[K]) => onChange({ ...filter, [k]: v });

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1.6fr_repeat(3,1fr)_auto]">
      <label className="relative block sm:col-span-2 lg:col-span-1">
        <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
        <input
          value={filter.keyword}
          onChange={(e) => set("keyword", e.target.value)}
          placeholder="Tìm theo tên dự án..."
          aria-label="Tìm dự án"
          className={`${base} pr-3 placeholder:text-muted`}
        />
      </label>

      <Select label="Chủ đầu tư" value={filter.investor} onChange={(v) => set("investor", v)}>
        {options.investors.map((o) => <option key={o}>{o}</option>)}
      </Select>
      <Select label="Địa điểm" value={filter.location} onChange={(v) => set("location", v)}>
        {options.locations.map((o) => <option key={o}>{o}</option>)}
      </Select>
      <Select label="Loại hình" value={filter.buildingType} onChange={(v) => set("buildingType", v)}>
        {options.buildingTypes.map((o) => <option key={o}>{o}</option>)}
      </Select>

      <button onClick={onClear} className="h-11 rounded-xl border border-line px-5 text-sm font-medium text-heading transition hover:bg-primary-50 active:scale-95">
        Xóa bộ lọc
      </button>
    </div>
  );
}
