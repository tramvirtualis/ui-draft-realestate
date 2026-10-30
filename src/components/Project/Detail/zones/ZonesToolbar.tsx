import { Search, X } from "lucide-react";

export type ZoneSort = "default" | "name";

type Props = {
  keyword: string;
  onKeyword: (v: string) => void;
  statuses: string[];
  status: string;
  onStatus: (v: string) => void;
  sort: ZoneSort;
  onSort: (v: ZoneSort) => void;
  total: number;
  shown: number;
  onClear: () => void;
};

const chip = (active: boolean) =>
  `whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 active:scale-95 ${
    active ? "border-primary-600 bg-primary-600 text-white" : "border-line bg-white text-body hover:border-primary-300 hover:text-primary-600"
  }`;

export default function ZonesToolbar({ keyword, onKeyword, statuses, status, onStatus, sort, onSort, total, shown, onClear }: Props) {
  const filtering = keyword.trim() !== "" || status !== "";

  return (
    <div className="flex flex-col gap-4 border-b border-line pb-6">
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex h-12 min-w-64 flex-1 items-center gap-3 rounded-full border border-line bg-white px-5 transition focus-within:border-primary-300 focus-within:ring-4 focus-within:ring-primary-100 md:max-w-md">
          <Search size={16} className="text-muted" />
          <input
            value={keyword}
            onChange={(e) => onKeyword(e.target.value)}
            placeholder="Tìm theo tên phân khu"
            aria-label="Tìm phân khu"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
          />
          {keyword && (
            <button onClick={() => onKeyword("")} aria-label="Xóa từ khóa" className="text-muted hover:text-heading">
              <X size={15} />
            </button>
          )}
        </label>

        <label className="ml-auto flex items-center gap-2 text-sm text-body">
          Sắp xếp
          <select
            value={sort}
            onChange={(e) => onSort(e.target.value as ZoneSort)}
            className="h-12 rounded-full border border-line bg-white px-4 text-sm text-heading outline-none focus-visible:border-primary-300"
          >
            <option value="default">Mặc định</option>
            <option value="name">Tên A → Z</option>
          </select>
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {statuses.length > 0 && (
          <>
            <button onClick={() => onStatus("")} className={chip(status === "")}>Tất cả</button>
            {statuses.map((s) => (
              <button key={s} onClick={() => onStatus(s)} className={chip(status === s)}>{s}</button>
            ))}
          </>
        )}
        <p className="ml-auto text-sm text-body" aria-live="polite">
          {shown}/{total} phân khu
          {filtering && (
            <button onClick={onClear} className="ml-3 font-medium text-primary-600 hover:underline">Xóa bộ lọc</button>
          )}
        </p>
      </div>
    </div>
  );
}
