import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Search, LayoutGrid, ArrowUpDown } from "lucide-react";
import { NEWS_SORT_LABEL } from "../../types/new/news.types";
import type {
  NewsCategory,
  NewsFilter,
  NewsSort,
} from "../../types/new/news.types";

interface NewsSearchBarProps {
  filter: NewsFilter;
  sort: NewsSort;
  categories: NewsCategory[];
  onSearch: (filter: NewsFilter) => void;
  onSortChange: (sort: NewsSort) => void;
}

const selectClass =
  "h-12 w-full appearance-none rounded-xl border border-line bg-white pl-10 pr-4 text-sm text-heading outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100";

export default function NewsSearchBar({
  filter,
  sort,
  categories,
  onSearch,
  onSortChange,
}: NewsSearchBarProps) {
  const [keyword, setKeyword] = useState<string>(filter.keyword);

  // Đồng bộ khi trang cha đổi filter (VD: bấm "Xóa tất cả")
  useEffect(() => setKeyword(filter.keyword), [filter.keyword]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSearch({ ...filter, keyword });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="relative z-10 grid gap-3 border-y border-heading/80 bg-page py-4 md:grid-cols-[1fr_auto_200px_170px]"
    >
      <div className="relative">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-body"
        />
        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Tìm kiếm tin tức, thị trường, dự án..."
          className="h-12 w-full rounded-xl border border-line pl-11 pr-4 text-sm text-heading outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
        />
      </div>

      <button
        type="submit"
        className="flex h-12 items-center justify-center gap-2 rounded-xl bg-ink-900 px-6 text-sm font-medium text-white transition hover:bg-primary-700"
      >
        Tìm kiếm <Search size={16} />
      </button>

      <div className="relative">
        <LayoutGrid
          size={16}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-body"
        />
        <select
          value={filter.categoryId ?? ""}
          onChange={(e) =>
            onSearch({
              ...filter,
              keyword,
              categoryId: e.target.value ? Number(e.target.value) : null,
            })
          }
          className={selectClass}
        >
          <option value="">Tất cả chuyên mục</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="relative">
        <ArrowUpDown
          size={16}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-body"
        />
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value as NewsSort)}
          className={selectClass}
        >
          {Object.entries(NEWS_SORT_LABEL).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>
    </form>
  );
}
