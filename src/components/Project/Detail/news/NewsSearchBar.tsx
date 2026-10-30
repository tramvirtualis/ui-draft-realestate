import { Search } from "lucide-react";

type Props = {
  draft: string;
  setDraft: (value: string) => void;
  setQuery: (value: string) => void;
  setPage: (page: number) => void;
};

// Cùng kiểu thanh tìm kiếm của trang Tin tức chung: nằm giữa 2 đường kẻ, nút navy
export default function NewsSearchBar({ draft, setDraft, setQuery, setPage }: Props) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setQuery(draft);
        setPage(1);
      }}
      className="grid gap-3 border-y border-heading/80 py-4 md:grid-cols-[1fr_auto]"
    >
      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-body" />
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Tìm kiếm tin tức dự án…"
          className="h-12 w-full rounded-xl border border-line bg-white pl-11 pr-4 text-sm text-heading outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
        />
      </div>
      <button className="flex h-12 items-center justify-center gap-2 rounded-xl bg-ink-900 px-6 text-sm font-medium text-white transition hover:bg-primary-700">
        Tìm kiếm <Search size={16} />
      </button>
    </form>
  );
}
