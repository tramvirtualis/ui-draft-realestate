import { useState, type FormEvent } from "react";
import { MapPin, Search } from "lucide-react";
import { LOCATION_LABEL, type JobFilter } from "../../types/job/job.types";

/** Ô tìm kiếm ở Hero (kiểu trang Dự án): từ khóa + khu vực + nút tìm (trang cha đặt `key` để đồng bộ khi URL đổi) */
export default function JobSearchBar({
  value,
  onSearch,
}: {
  value: JobFilter;
  onSearch: (f: JobFilter) => void;
}) {
  const [keyword, setKeyword] = useState(value.keyword);
  const [location, setLocation] = useState(value.location);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSearch({ ...value, keyword: keyword.trim(), location });
  };

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      className="flex flex-col gap-2 rounded-[1.4rem] bg-white p-2 shadow-sm ring-1 ring-primary-100 transition focus-within:ring-4 focus-within:ring-primary-200 md:flex-row md:items-center md:pl-3"
    >
      <label className="flex flex-1 items-center gap-3 px-3">
        <Search size={18} className="shrink-0 text-primary-500" aria-hidden />
        <span className="sr-only">Từ khóa công việc</span>
        <input
          type="search"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder='Vị trí, kỹ năng hoặc công ty, ví dụ "kinh doanh"'
          className="h-11 w-full bg-transparent text-sm text-heading outline-none placeholder:text-muted md:text-base"
        />
      </label>

      <label className="flex items-center gap-2 border-t border-line px-3 md:border-l md:border-t-0">
        <MapPin size={18} className="shrink-0 text-primary-500" aria-hidden />
        <span className="sr-only">Khu vực</span>
        <select
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="h-11 w-full bg-transparent text-sm text-heading outline-none md:w-44"
        >
          <option value="">Tất cả khu vực</option>
          {Object.entries(LOCATION_LABEL).map(([k, l]) => (
            <option key={k} value={k}>
              {l}
            </option>
          ))}
        </select>
      </label>

      <button
        type="submit"
        className="btn-gloss flex h-11 shrink-0 items-center justify-center gap-2 rounded-full px-6 font-heading text-xs font-bold uppercase tracking-widest text-white transition hover:-translate-y-0.5"
      >
        <Search size={15} aria-hidden /> Tìm việc
      </button>
    </form>
  );
}
