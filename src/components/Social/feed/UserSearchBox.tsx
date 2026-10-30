import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { Loader2, Search, X } from "lucide-react";
import Avatar from "../../common/Avatar";
import { useUserSearch } from "../../../hooks/social/useUserSearch";
import type { SocialUser } from "../../../types/social/social.types";

type Props = {
  // Chọn 1 người trong kết quả: bảng tin chuyển sang bài viết của người đó
  onSelect: (user: SocialUser) => void;
};

// Tô đậm phần tên khớp từ khóa (không phân biệt hoa thường)
function HighlightedName({ name, keyword }: { name: string; keyword: string }) {
  const start = name.toLowerCase().indexOf(keyword.toLowerCase());
  if (start < 0) return <>{name}</>;
  const end = start + keyword.length;
  return (
    <>
      {name.slice(0, start)}
      <mark className="bg-transparent font-semibold text-primary-700">{name.slice(start, end)}</mark>
      {name.slice(end)}
    </>
  );
}

// Ô tìm người dùng đầu bảng tin: gõ tên rồi bấm Tìm / Enter → danh sách kết quả, chọn người thì xem bài viết của họ
export default function UserSearchBox({ onSelect }: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();
  const { results, searched, loading, error, search } = useUserSearch();
  // Sửa từ khóa sau khi tìm thì ẩn kết quả cũ, chờ bấm tìm lại
  const showList = open && searched !== "" && !loading && query.trim() === searched;

  // Bấm ra ngoài thì đóng danh sách
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const choose = (user: SocialUser) => {
    onSelect(user);
    setQuery("");
    setOpen(false);
    setActiveIndex(-1);
    inputRef.current?.blur();
  };

  const clear = () => {
    setQuery("");
    setActiveIndex(-1);
    inputRef.current?.focus();
  };

  // Enter / nút Tìm: đang chọn 1 người bằng phím mũi tên thì mở người đó, không thì tìm
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (showList && activeIndex >= 0 && results[activeIndex]) {
      choose(results[activeIndex]);
      return;
    }
    if (!query.trim()) return;
    setOpen(true);
    setActiveIndex(-1);
    search(query);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      if (showList) setOpen(false);
      else if (query) clear();
      return;
    }
    if (!showList || results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? results.length - 1 : i - 1));
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <form
        role="search"
        onSubmit={submit}
        className="flex items-center gap-1 rounded-2xl border border-line bg-white py-1.5 pr-1.5 pl-4 ring-primary-100 focus-within:border-primary-300 focus-within:ring-2"
      >
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={showList && activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined}
          aria-label="Tìm người dùng"
          placeholder="Tìm người dùng theo tên…"
          value={query}
          maxLength={100}
          onChange={(e) => {
            setQuery(e.target.value);
            setActiveIndex(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          className="min-w-0 flex-1 bg-transparent py-1.5 text-sm text-gray-800 outline-none placeholder:text-gray-400"
        />
        {query && (
          <button
            type="button"
            onClick={clear}
            aria-label="Xóa từ khóa"
            className="shrink-0 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        )}
        <button
          type="submit"
          disabled={!query.trim() || loading}
          className="flex shrink-0 items-center gap-1.5 rounded-lg bg-primary-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? <Loader2 size={16} className="animate-spin" aria-hidden /> : <Search size={16} aria-hidden />}
          Tìm
        </button>
      </form>

      {showList && (
        <div className="absolute inset-x-0 top-full z-30 mt-2 overflow-hidden rounded-xl bg-white shadow-lg ring-1 ring-black/5">
          {results.length > 0 ? (
            <ul id={listId} role="listbox" aria-label="Kết quả tìm người dùng" className="max-h-80 overflow-y-auto py-1">
              {results.map((user, index) => (
                <li
                  key={user.id}
                  id={`${listId}-${index}`}
                  role="option"
                  aria-selected={index === activeIndex}
                  // mousedown thay vì click để chọn xong trước khi input mất focus
                  onMouseDown={(e) => {
                    e.preventDefault();
                    choose(user);
                  }}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={`flex cursor-pointer items-center gap-3 px-4 py-2 ${
                    index === activeIndex ? "bg-primary-50" : ""
                  }`}
                >
                  <Avatar src={user.avatarUrl} fullName={user.fullName} className="h-9 w-9 shrink-0 text-sm" />
                  <span className="min-w-0 flex-1 truncate text-sm text-gray-800">
                    <HighlightedName name={user.fullName} keyword={searched} />
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p id={listId} role="status" className="px-4 py-3 text-sm text-gray-500">
              {error ?? `Không tìm thấy người dùng nào tên "${searched}"`}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
