import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Globe, Loader2, Lock, type LucideIcon } from "lucide-react";
import { POST_SCOPE_LABEL, type PostScope } from "../../../types/social/social.types";

type Props = {
  scope: PostScope;
  // Lỗi do bên gọi tự hiển thị; hàm này resolve xong thì menu đóng
  onChange: (scope: PostScope) => Promise<void>;
};

const OPTIONS: { value: PostScope; icon: LucideIcon; desc: string }[] = [
  { value: "PUBLIC", icon: Globe, desc: "Ai cũng xem được" },
  { value: "PRIVATE", icon: Lock, desc: "Chỉ mình tôi xem được" },
];

// Nút đổi phạm vi (công khai / riêng tư) cạnh thời gian đăng, chỉ dành cho người đăng bài
export default function PostScopeMenu({ scope, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const root = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const Current = scope === "PRIVATE" ? Lock : Globe;

  const choose = async (next: PostScope) => {
    if (next === scope) return setOpen(false);
    setBusy(true);
    try {
      await onChange(next);
    } finally {
      setBusy(false);
      setOpen(false);
    }
  };

  return (
    <span ref={root} className="relative inline-flex">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        disabled={busy}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Phạm vi bài viết: ${POST_SCOPE_LABEL[scope]}. Bấm để đổi`}
        title={`${POST_SCOPE_LABEL[scope]} · bấm để đổi`}
        className="flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-gray-500 transition hover:bg-gray-100 disabled:opacity-60"
      >
        {busy ? <Loader2 size={13} className="animate-spin" /> : <Current size={13} />}
        <ChevronDown size={11} />
      </button>

      {open && (
        <div role="menu" className="absolute left-0 top-full z-20 mt-1 w-56 rounded-xl border border-gray-200 bg-white p-1.5 shadow-lg">
          {OPTIONS.map(({ value, icon: Icon, desc }) => {
            const selected = value === scope;
            return (
              <button
                key={value}
                type="button"
                role="menuitemradio"
                aria-checked={selected}
                onClick={() => void choose(value)}
                className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition hover:bg-gray-100 ${selected ? "bg-primary-50" : ""}`}
              >
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${selected ? "bg-primary-600 text-white" : "bg-gray-100 text-gray-600"}`}>
                  <Icon size={16} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-gray-800">{POST_SCOPE_LABEL[value]}</span>
                  <span className="block text-xs text-gray-500">{desc}</span>
                </span>
                {selected && <Check size={16} className="shrink-0 text-primary-600" />}
              </button>
            );
          })}
        </div>
      )}
    </span>
  );
}
