import { useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import useFocusTrap from "./useFocusTrap";
import SafeImage from "./SafeImage";
import { formatFull } from "../Project/Detail/progress/progressFormat";
import type { ViewImage } from "../../types/project/progress.types";

type Props = {
  images: ViewImage[];
  index: number;
  onIndexChange: (i: number) => void;
  onClose: () => void;
};

// Render qua portal vì trang cha có transform (animation chuyển trang) làm lệch position: fixed
export default function Lightbox({ images, index, onIndexChange, onClose }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const touchX = useRef<number | null>(null);
  const total = images.length;
  const current = images[index];

  const go = useCallback((dir: 1 | -1) => onIndexChange((index + dir + total) % total), [index, total, onIndexChange]);

  useFocusTrap(root, true, onClose);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [go]);

  if (!current) return null;

  return createPortal(
    <div
      ref={root}
      role="dialog"
      aria-modal="true"
      aria-label="Xem ảnh tiến độ"
      tabIndex={-1}
      className="fixed inset-0 z-[100] flex flex-col bg-footer/95 backdrop-blur animate-page-in"
      onClick={onClose}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
        touchX.current = null;
      }}
    >
      <div className="flex items-center justify-between px-4 py-3 text-white md:px-8" onClick={(e) => e.stopPropagation()}>
        <span className="text-sm text-white/70">
          {index + 1} / {total}
        </span>
        <button
          onClick={onClose}
          aria-label="Đóng"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/25 focus-visible:outline-2 focus-visible:outline-white"
        >
          <X size={20} />
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 md:px-20">
        <SafeImage
          key={current.src}
          src={current.src}
          alt={current.title}
          loading="eager"
          onClick={(e) => e.stopPropagation()}
          className="animate-page-in max-h-full max-w-full rounded-lg object-contain"
        />
        {total > 1 &&
          ([-1, 1] as const).map((d) => (
            <button
              key={d}
              aria-label={d < 0 ? "Ảnh trước" : "Ảnh sau"}
              onClick={(e) => {
                e.stopPropagation();
                go(d);
              }}
              className={`absolute top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/25 focus-visible:outline-2 focus-visible:outline-white md:flex ${
                d < 0 ? "left-4" : "right-4"
              }`}
            >
              {d < 0 ? <ChevronLeft size={22} /> : <ChevronRight size={22} />}
            </button>
          ))}
      </div>

      <div className="px-4 py-5 text-center text-white md:px-8" onClick={(e) => e.stopPropagation()}>
        <p className="font-semibold">{current.title}</p>
        {current.date && <p className="mt-1 text-xs text-white/60">{formatFull(new Date(current.date))}</p>}
      </div>
    </div>,
    document.body,
  );
}
