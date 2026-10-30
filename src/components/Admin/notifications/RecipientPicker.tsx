import { useEffect, useRef, useState } from "react";
import { Loader2, Search, X } from "lucide-react";
import Avatar from "../../common/Avatar";
import { adminUserService } from "../../../services/user/adminUserService";
import type { AdminUser } from "../../../types/admin/adminUser.types";

const SEARCH_SIZE = 8;

export type Recipient = Pick<
  AdminUser,
  "id" | "fullName" | "email" | "avatarUrl"
>;

interface Props {
  value: Recipient[];
  onChange: (value: Recipient[]) => void;
}

const nameOf = (u: Recipient) => u.fullName?.trim() || u.email || `#${u.id}`;

function UserAvatar({ user, small }: { user: Recipient; small?: boolean }) {
  return (
    <Avatar
      src={user.avatarUrl}
      fullName={nameOf(user)}
      className={`${small ? "h-[22px] w-[22px] text-[10px]" : "h-7 w-7 text-xs"} shrink-0`}
    />
  );
}

/**
 Chọn người nhận thông báo: gõ tên / email / SĐT → tìm ở GET /api/admin/users (chỉ tài khoản đang hoạt động),
 bấm để thêm; người đã chọn hiện dạng chip, bấm X để bỏ.
 */
export default function RecipientPicker({ value, onChange }: Props) {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);

  // Tìm sau khi ngừng gõ 300ms; bỏ kết quả của lần gõ cũ
  useEffect(() => {
    const q = keyword.trim();
    if (!q) {
      setResults([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const timer = setTimeout(() => {
      adminUserService
        .search({ keyword: q, status: "ACTIVE", page: 0, size: SEARCH_SIZE })
        .then((p) => {
          if (cancelled) return;
          setResults(p.content);
          setError(false);
          setActive(0);
        })
        .catch(() => !cancelled && setError(true))
        .finally(() => !cancelled && setLoading(false));
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [keyword]);

  // Bấm ra ngoài thì đóng danh sách gợi ý
  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const selectedIds = new Set(value.map((u) => u.id));
  const options = results.filter((u) => !selectedIds.has(u.id));

  const add = (u: AdminUser) => {
    onChange([
      ...value,
      {
        id: u.id,
        fullName: u.fullName,
        email: u.email,
        avatarUrl: u.avatarUrl,
      },
    ]);
    setKeyword("");
    setResults([]);
  };

  const remove = (id: number) => onChange(value.filter((u) => u.id !== id));

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((i) => Math.min(i + 1, options.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      // Không để Enter submit form khi đang chọn người
      e.preventDefault();
      if (options[active]) add(options[active]);
    } else if (e.key === "Escape") {
      setOpen(false);
    } else if (e.key === "Backspace" && !keyword && value.length) {
      remove(value[value.length - 1].id);
    }
  };

  const showList = open && keyword.trim().length > 0;

  return (
    <div ref={boxRef} className="relative mt-1.5">
      <div className="flex min-h-[44px] flex-wrap items-center gap-1.5 rounded-xl border border-line px-2.5 py-1.5 focus-within:border-primary-600">
        {value.map((u) => (
          <span
            key={u.id}
            className="flex max-w-full items-center gap-1.5 rounded-full bg-primary-50 py-0.5 pl-0.5 pr-2 text-xs font-semibold text-primary-700"
          >
            <UserAvatar user={u} small />
            <span className="truncate" title={u.email ?? undefined}>
              {nameOf(u)}
            </span>
            <button
              type="button"
              onClick={() => remove(u.id)}
              aria-label={`Bỏ ${nameOf(u)}`}
              className="rounded-full p-0.5 hover:bg-primary-100"
            >
              <X size={12} />
            </button>
          </span>
        ))}
        <span className="flex min-w-[160px] flex-1 items-center gap-2 px-1">
          <Search size={15} className="shrink-0 text-muted" />
          <input
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKeyDown}
            placeholder={
              value.length
                ? "Thêm người nhận..."
                : "Tìm theo tên, email hoặc số điện thoại"
            }
            aria-label="Tìm người nhận"
            role="combobox"
            aria-expanded={showList}
            aria-controls="recipient-options"
            className="min-w-0 flex-1 bg-transparent py-1 text-sm font-normal outline-none placeholder:text-muted"
          />
          {loading && (
            <Loader2 size={15} className="shrink-0 animate-spin text-muted" />
          )}
        </span>
      </div>

      {showList && (
        <ul
          id="recipient-options"
          role="listbox"
          className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-xl border border-line bg-white py-1 shadow-lg"
        >
          {error ? (
            <li className="px-3 py-2.5 text-sm text-danger">
              Không tìm được người dùng, thử lại sau
            </li>
          ) : options.length === 0 ? (
            <li className="px-3 py-2.5 text-sm text-muted">
              {loading ? "Đang tìm..." : "Không có người dùng phù hợp"}
            </li>
          ) : (
            options.map((u, i) => (
              <li
                key={u.id}
                role="option"
                aria-selected={i === active}
                // mousedown thay vì click: chọn trước khi input mất focus
                onMouseDown={(e) => {
                  e.preventDefault();
                  add(u);
                }}
                onMouseEnter={() => setActive(i)}
                className={`flex cursor-pointer items-center gap-2.5 px-3 py-2 ${
                  i === active ? "bg-primary-50" : ""
                }`}
              >
                <UserAvatar user={u} />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-heading">
                    {nameOf(u)}
                  </span>
                  <span className="block truncate text-xs font-normal text-muted">
                    {[u.email, u.phone].filter(Boolean).join(" · ") ||
                      `ID ${u.id}`}
                  </span>
                </span>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
