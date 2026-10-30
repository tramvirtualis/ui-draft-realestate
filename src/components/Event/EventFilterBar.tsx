import { useState, useEffect, type ChangeEvent, type FormEvent } from "react";
import { Search, RotateCcw } from "lucide-react";
import {
  DEFAULT_EVENT_FILTER,
  EVENT_STATUS_META,
  type EventFilter,
} from "../../types/event/event.types";

const fieldClass =
  "h-11 w-full rounded-xl border border-line bg-white px-4 text-sm text-heading outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100";

/**
 * Ô lọc: người dùng chỉnh thoải mái, chỉ khi bấm "Tìm kiếm" mới gửi lên trang cha.
 */
export default function EventFilterBar({
  value,
  onSearch,
}: {
  value: EventFilter;
  onSearch: (f: EventFilter) => void;
}) {
  const [draft, setDraft] = useState(value);

  // Đồng bộ khi trang cha reset filter
  useEffect(() => setDraft(value), [value]);

  const update =
    (key: keyof EventFilter) =>
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setDraft((d) => ({ ...d, [key]: e.target.value } as EventFilter));

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSearch(draft);
  };

  const handleReset = () => {
    setDraft(DEFAULT_EVENT_FILTER);
    onSearch(DEFAULT_EVENT_FILTER);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border-y border-heading/80 py-4"
    >
      {/* Điện thoại: ô tìm kiếm cả hàng, trạng thái + nút tìm chung một hàng, "Xóa bộ lọc" gọn bên phải */}
      <div className="grid grid-cols-[1fr_auto] gap-3 lg:grid-cols-[1fr_220px_auto_auto] lg:items-center">
        <div className="relative col-span-2 lg:col-span-1">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-body"
          />
          <input
            value={draft.keyword}
            onChange={update("keyword")}
            placeholder="Tìm kiếm sự kiện, địa điểm..."
            className={`${fieldClass} pl-11`}
          />
        </div>

        <select
          value={draft.status}
          onChange={(e) => {
            const next = { ...draft, status: e.target.value } as EventFilter;
            setDraft(next);
            onSearch(next);
          }}
          className={fieldClass}
        >
          <option value="">Tất cả trạng thái</option>
          {Object.entries(EVENT_STATUS_META).map(([key, meta]) => (
            <option key={key} value={key}>
              {meta.label}
            </option>
          ))}
        </select>

        <button
          type="submit"
          className="flex h-11 items-center justify-center gap-2 rounded-xl bg-ink-900 px-6 text-sm font-medium text-white transition hover:bg-primary-700"
        >
          Tìm kiếm <Search size={16} />
        </button>

        <button
          type="button"
          onClick={handleReset}
          className="col-span-2 flex h-8 items-center justify-end gap-1.5 px-1 text-sm font-medium text-primary-600 hover:text-primary-700 lg:col-span-1 lg:h-11 lg:justify-center lg:px-2"
        >
          <RotateCcw size={15} /> Xóa bộ lọc
        </button>
      </div>
    </form>
  );
}
