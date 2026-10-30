import { Search, Filter, RotateCcw } from "lucide-react";
import { MODULE_OPTIONS, METHOD_OPTIONS, TIME_OPTIONS } from "./auditLogUtils";

interface AuditLogFiltersProps {
  searchInput: string;
  onSearchChange: (value: string) => void;
  selectedModule: string;
  onModuleChange: (value: string) => void;
  selectedMethod: string;
  onMethodChange: (value: string) => void;
  selectedHours: number;
  onHoursChange: (value: number) => void;
  from: string;
  to: string;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  onReset?: () => void;
}

export default function AuditLogFilters({
  searchInput,
  onSearchChange,
  selectedModule,
  onModuleChange,
  selectedMethod,
  onMethodChange,
  selectedHours,
  onHoursChange,
  from,
  to,
  onFromChange,
  onToChange,
  onReset,
}: AuditLogFiltersProps) {
  const isCustomDate = Boolean(from || to);

  return (
    <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-line bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
      {/* Ô tìm kiếm */}
      <div className="relative flex-1">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        <input
          type="text"
          value={searchInput}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Tìm theo email, tên đối tượng, hành vi, URL API, Trace ID, IP..."
          className="h-10 w-full rounded-xl border border-line bg-slate-50/50 pl-10 pr-4 text-xs font-medium text-heading transition-colors focus:border-primary-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-100"
        />
      </div>

      {/* Nhóm Bộ lọc */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted">
          <Filter size={14} />
          <span>Lọc:</span>
        </div>

        {/* Lọc Phân hệ */}
        <select
          value={selectedModule}
          onChange={(e) => onModuleChange(e.target.value)}
          className="h-10 rounded-xl border border-line bg-white px-3 text-xs font-medium text-heading focus:border-primary-400 focus:outline-none focus:ring-4 focus:ring-primary-100"
        >
          {MODULE_OPTIONS.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>

        {/* Lọc Phương thức HTTP */}
        <select
          value={selectedMethod}
          onChange={(e) => onMethodChange(e.target.value)}
          className="h-10 rounded-xl border border-line bg-white px-3 text-xs font-medium text-heading focus:border-primary-400 focus:outline-none focus:ring-4 focus:ring-primary-100"
        >
          {METHOD_OPTIONS.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>

        {/* Lọc Thời gian nhanh (Presets) */}
        <select
          value={isCustomDate ? "" : selectedHours}
          onChange={(e) => {
            const val = Number(e.target.value);
            onHoursChange(val);
            if (from || to) {
              onFromChange("");
              onToChange("");
            }
          }}
          className={`h-10 rounded-xl border border-line bg-white px-3 text-xs font-medium focus:border-primary-400 focus:outline-none focus:ring-4 focus:ring-primary-100 ${
            isCustomDate ? "text-muted italic" : "text-heading"
          }`}
        >
          {isCustomDate && <option value="">Tùy chọn ngày</option>}
          {TIME_OPTIONS.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>

        {/* Chọn khoảng ngày (From -> To) */}
        <div className="flex items-center gap-1.5 rounded-xl border border-line bg-white px-2 py-1 shadow-sm">
          <input
            type="date"
            value={from}
            max={to || undefined}
            onChange={(e) => onFromChange(e.target.value)}
            className="h-8 border-none bg-transparent px-1 text-xs font-medium text-heading focus:outline-none"
            aria-label="Từ ngày"
            title="Từ ngày"
          />
          <span className="text-xs text-muted">→</span>
          <input
            type="date"
            value={to}
            min={from || undefined}
            onChange={(e) => onToChange(e.target.value)}
            className="h-8 border-none bg-transparent px-1 text-xs font-medium text-heading focus:outline-none"
            aria-label="Đến ngày"
            title="Đến ngày"
          />
        </div>

        {/* Nút đặt lại bộ lọc */}
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="flex h-10 items-center gap-1.5 rounded-xl border border-line bg-white px-3 text-xs font-semibold text-body hover:bg-slate-50 active:scale-95"
            title="Đặt lại bộ lọc"
          >
            <RotateCcw size={13} />
            <span className="hidden sm:inline">Đặt lại</span>
          </button>
        )}
      </div>
    </div>
  );
}
