import { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Loader2 } from "lucide-react";
import type { EmojiClickData } from "emoji-picker-react";

// Bảng emoji khá nặng → chỉ tải khi mở lần đầu
const EmojiPicker = lazy(() => import("emoji-picker-react"));

const PICKER_WIDTH = 320;
const PICKER_HEIGHT = 380;
const GAP = 8;

type Props = {
  onSelect: (emoji: string) => void;
  children: ReactNode;
  /** Mở bảng lên trên (ô nhập ở đáy modal) hoặc xuống dưới */
  placement?: "top" | "bottom";
  align?: "left" | "right";
  disabled?: boolean;
  className?: string;
  title?: string;
};

export default function EmojiPickerButton({
  onSelect,
  children,
  placement = "bottom",
  align = "left",
  disabled,
  className,
  title = "Thêm emoji",
}: Props) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Portal ra body (tránh bị overflow-hidden của modal cắt) nên tự tính vị trí theo nút
  useLayoutEffect(() => {
    if (!open) return;
    const update = () => {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (!rect) return;
      const top = placement === "top" ? rect.top - PICKER_HEIGHT - GAP : rect.bottom + GAP;
      const left = align === "right" ? rect.right - PICKER_WIDTH : rect.left;
      setPos({
        top: Math.max(GAP, Math.min(top, window.innerHeight - PICKER_HEIGHT - GAP)),
        left: Math.max(GAP, Math.min(left, window.innerWidth - PICKER_WIDTH - GAP)),
      });
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [open, placement, align]);

  // Click ra ngoài hoặc bấm Esc thì đóng (Esc không lan tới modal đang mở bên dưới)
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!buttonRef.current?.contains(target) && !popoverRef.current?.contains(target)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.stopPropagation();
      setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    window.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("mousedown", onClick);
      window.removeEventListener("keydown", onKey, true);
    };
  }, [open]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        title={title}
        aria-label={title}
        aria-expanded={open}
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className={className}
      >
        {children}
      </button>

      {open &&
        pos &&
        createPortal(
          <div ref={popoverRef} className="fixed z-[90]" style={{ top: pos.top, left: pos.left }}>
            <Suspense
              fallback={
                <div
                  className="flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 shadow-lg"
                  style={{ width: PICKER_WIDTH, height: PICKER_HEIGHT }}
                >
                  <Loader2 size={24} className="animate-spin" />
                </div>
              }
            >
              <EmojiPicker
                onEmojiClick={(data: EmojiClickData) => onSelect(data.emoji)}
                width={PICKER_WIDTH}
                height={PICKER_HEIGHT}
                searchPlaceHolder="Tìm emoji..."
                previewConfig={{ showPreview: false }}
                lazyLoadEmojis
              />
            </Suspense>
          </div>,
          document.body,
        )}
    </>
  );
}
