import { useEffect, useRef, useState } from "react";
import { ChevronDown, Check } from "lucide-react";
import PropertyStatusBadge from "./PropertyStatusBadge";
import { PROPERTY_STATUS } from "../../../../data/project/mockProperties";
import type { PropertyStatus } from "../../../../types/project/property.types";

type Props = { status: PropertyStatus; onChange: (s: PropertyStatus) => void; label: string };

// Badge trạng thái bấm được: mở danh sách để đổi trạng thái ngay trong bảng
export default function PropertyStatusMenu({ status, onChange, label }: Props) {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const open = pos !== null;
  const box = useRef<HTMLDivElement>(null);
  const setOpen = (v: boolean) => {
    if (!v) return setPos(null);
    const r = box.current?.getBoundingClientRect();
    // Menu đặt fixed theo vị trí nút để không bị bảng (overflow) cắt; mở lên trên nếu sát đáy màn hình
    if (r) setPos({ top: r.bottom + 220 > window.innerHeight ? r.top - 188 : r.bottom + 6, left: r.left });
  };

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => !box.current?.contains(e.target as Node) && setPos(null);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setPos(null);
    document.addEventListener("mousedown", onDown);
    const close = () => setPos(null);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={box} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Đổi trạng thái ${label}`}
        className="flex items-center gap-1 rounded-full transition hover:opacity-80 focus-visible:outline-2 focus-visible:outline-primary-600"
      >
        <PropertyStatusBadge status={status} />
        <ChevronDown size={13} className="text-muted" />
      </button>
      {pos && (
        <ul role="listbox" style={{ top: pos.top, left: pos.left }} className="animate-page-in fixed z-50 w-44 rounded-xl border border-line bg-white p-1 shadow-lg">
          {(Object.keys(PROPERTY_STATUS) as PropertyStatus[]).map((s) => (
            <li key={s}>
              <button
                type="button"
                role="option"
                aria-selected={s === status}
                onClick={() => {
                  setPos(null);
                  if (s !== status) onChange(s);
                }}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition hover:bg-primary-50"
              >
                <span className="flex items-center gap-2"><span className={`h-2 w-2 rounded-full ${PROPERTY_STATUS[s].dot}`} /> {PROPERTY_STATUS[s].label}</span>
                {s === status && <Check size={14} className="text-primary-600" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
