import { Calendar, ArrowDownUp, Search } from "lucide-react";
import {
  APPLICATION_RANGE_LABEL,
  APPLICATION_SORT_LABEL,
  type ApplicationRange,
  type ApplicationSort,
} from "../../types/applicationHistory.types";

const selectWrap =
  "flex h-11 items-center gap-2 rounded-xl border border-line bg-white px-3 text-sm text-heading focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-100";

// Thanh tìm kiếm + khoảng thời gian + sắp xếp
export default function ApplicationToolbar({
  keyword,
  onKeywordChange,
  range,
  onRangeChange,
  sort,
  onSortChange,
}: {
  keyword: string;
  onKeywordChange: (v: string) => void;
  range: ApplicationRange;
  onRangeChange: (v: ApplicationRange) => void;
  sort: ApplicationSort;
  onSortChange: (v: ApplicationSort) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]" role="search">
      <label className={selectWrap}>
        <Search size={16} className="shrink-0 text-gray-400" aria-hidden />
        <span className="sr-only">Tìm theo vị trí hoặc công ty</span>
        <input
          value={keyword}
          onChange={(e) => onKeywordChange(e.target.value)}
          placeholder="Tìm theo vị trí hoặc công ty..."
          className="h-full w-full bg-transparent outline-none placeholder:text-gray-400"
        />
      </label>

      <label className={selectWrap}>
        <Calendar size={16} className="shrink-0 text-gray-400" aria-hidden />
        <span className="sr-only">Khoảng thời gian</span>
        <select
          value={range}
          onChange={(e) => onRangeChange(e.target.value as ApplicationRange)}
          className="h-full w-full bg-transparent outline-none sm:w-40"
        >
          {Object.entries(APPLICATION_RANGE_LABEL).map(([k, l]) => (
            <option key={k} value={k}>
              {l}
            </option>
          ))}
        </select>
      </label>

      <label className={selectWrap}>
        <ArrowDownUp size={16} className="shrink-0 text-gray-400" aria-hidden />
        <span className="sr-only">Sắp xếp</span>
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value as ApplicationSort)}
          className="h-full w-full bg-transparent outline-none sm:w-36"
        >
          {Object.entries(APPLICATION_SORT_LABEL).map(([k, l]) => (
            <option key={k} value={k}>
              {l}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
