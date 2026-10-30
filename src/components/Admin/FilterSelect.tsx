import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Check, ChevronDown, type LucideIcon } from "lucide-react";

export type FilterOption<T extends string> = {
  value: T;
  label: string;
  desc?: string;
  icon?: LucideIcon;
};

type Props<T extends string> = {
  label: string; // tiền tố trên nút, vd "Trạng thái" → "Trạng thái: Tất cả"
  value: T;
  options: FilterOption<T>[];
  onChange: (value: T) => void;
  icon?: LucideIcon; // icon mặc định cho mục không tự khai báo icon
};

/**
 Dropdown lọc dạng menu (icon tròn + tên + mô tả, dấu ✓ ở mục đang chọn), thay cho <select> mặc định của trình duyệt.
 Bàn phím: ↑ ↓ chuyển mục, Enter chọn, Esc đóng.
   <FilterSelect label="Trạng thái" value={status} onChange={setStatus} options={[{ value: "all", label: "Tất cả" }, ...]} />
 */
export default function FilterSelect<T extends string>({ label, value, options, onChange, icon }: Props<T>) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const items = useRef<(HTMLButtonElement | null)[]>([]);
  const current = options.find((o) => o.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const close = () => {
    setOpen(false);
    trigger.current?.focus();
  };

  const choose = (next: T) => {
    if (next !== value) onChange(next);
    close();
  };

  const onMenuKey = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      return close();
    }
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    const at = items.current.findIndex((el) => el === document.activeElement);
    const next = (at + (e.key === "ArrowDown" ? 1 : -1) + options.length) % options.length;
    items.current[next]?.focus();
  };

  return (
    <div ref={root} className="relative">
      <button
        ref={trigger}
        type="button"
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => e.key === "ArrowDown" && (e.preventDefault(), setOpen(true))}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`${label}: ${current?.label ?? ""}`}
        className={`flex h-11 items-center gap-2 rounded-full border bg-white pl-4 pr-3 text-sm text-heading outline-none transition hover:border-primary-300 focus-visible:border-primary-300 focus-visible:ring-4 focus-visible:ring-primary-100 ${
          open ? "border-primary-300 ring-4 ring-primary-100" : "border-line"
        }`}
      >
        <span className="whitespace-nowrap">
          <span className="text-body">{label}:</span> <span className="font-semibold">{current?.label}</span>
        </span>
        <ChevronDown size={15} className={`text-muted transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label={label}
          onKeyDown={onMenuKey}
          className="absolute left-0 top-full z-30 mt-2 max-h-80 w-64 overflow-y-auto rounded-2xl border border-line bg-white p-1.5 shadow-lg"
        >
          {options.map((o, i) => {
            const selected = o.value === value;
            const Icon = o.icon ?? icon;
            return (
              <button
                key={o.value}
                ref={(el) => {
                  items.current[i] = el;
                }}
                type="button"
                role="option"
                aria-selected={selected}
                // Mở menu thì focus vào mục đang chọn
                autoFocus={selected || (!options.some((x) => x.value === value) && i === 0)}
                onClick={() => choose(o.value)}
                className={`flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left outline-none transition hover:bg-primary-50/70 focus-visible:bg-primary-50/70 ${
                  selected ? "bg-primary-50" : ""
                }`}
              >
                {Icon && (
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                      selected ? "bg-primary-600 text-white" : "bg-primary-50 text-body"
                    }`}
                  >
                    <Icon size={16} />
                  </span>
                )}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-heading">{o.label}</span>
                  {o.desc && <span className="block truncate text-xs text-muted">{o.desc}</span>}
                </span>
                {selected && <Check size={16} className="shrink-0 text-primary-600" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
