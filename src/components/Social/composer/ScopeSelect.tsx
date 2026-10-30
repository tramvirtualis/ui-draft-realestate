import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Globe, Lock, type LucideIcon } from "lucide-react";
import {
  POST_SCOPE,
  POST_SCOPE_LABEL,
  type PostScope,
} from "../../../types/social/social.types";

const SCOPE_META: Record<PostScope, { icon: LucideIcon; description: string }> = {
  PUBLIC: { icon: Globe, description: "Mọi người đều xem được" },
  PRIVATE: { icon: Lock, description: "Chỉ bạn xem được" },
};

type Props = {
  value: PostScope;
  onChange: (scope: PostScope) => void;
  disabled?: boolean;
  // Phía mở danh sách: "right" (mặc định) canh mép phải nút, "left" canh mép trái
  align?: "left" | "right";
};

// Chọn ai được xem bài viết: nút hiện lựa chọn hiện tại, bấm mở danh sách thả xuống
export default function ScopeSelect({ value, onChange, disabled, align = "right" }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const Current = SCOPE_META[value].icon;

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Ai có thể xem bài viết này"
        className="flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-200 disabled:opacity-40"
      >
        <Current size={16} />
        {POST_SCOPE_LABEL[value]}
        <ChevronDown size={14} className={`transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <ul
          role="listbox"
          className={`absolute ${align === "left" ? "left-0" : "right-0"} top-full z-20 mt-1.5 w-60 overflow-hidden rounded-xl bg-white p-1.5 shadow-lg ring-1 ring-gray-200`}
        >
          {Object.values(POST_SCOPE).map((scope) => {
            const { icon: Icon, description } = SCOPE_META[scope];
            const selected = scope === value;
            return (
              <li key={scope} role="option" aria-selected={selected}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(scope);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition ${
                    selected ? "bg-primary-50" : "hover:bg-gray-100"
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                      selected ? "bg-primary-100 text-primary-600" : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    <Icon size={18} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-gray-800">{POST_SCOPE_LABEL[scope]}</span>
                    <span className="block text-xs text-gray-500">{description}</span>
                  </span>
                  {selected && <Check size={16} className="shrink-0 text-primary-600" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
