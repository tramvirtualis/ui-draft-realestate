import { useEffect, useRef, useState } from "react";
import { ChevronsDownUp, ChevronsUpDown } from "lucide-react";
import TimelineItem from "./TimelineItem";
import type { Progress, ViewImage } from "../../../../types/project/progress.types";

type Props = {
  items: Progress[];
  onOpen: (images: ViewImage[], index: number) => void;
};

// Lịch sử tiến độ: các mốc mặc định thu gọn, bấm từng mốc để mở / thu gọn, hoặc mở / thu gọn tất cả
export default function ProgressTimeline({ items, onOpen }: Props) {
  const box = useRef<HTMLDivElement>(null);
  const [fill, setFill] = useState(0);
  const [openIds, setOpenIds] = useState<Set<number>>(() => new Set());

  const allOpen = items.length > 0 && items.every((it) => openIds.has(it.id));
  const toggle = (id: number) =>
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const toggleAll = () => setOpenIds(allOpen ? new Set() : new Set(items.map((it) => it.id)));

  // Đường timeline được "tô" dần theo vị trí cuộn (tính lại khi mở / thu gọn vì chiều cao đổi)
  useEffect(() => {
    let raf = 0;
    const update = () => {
      const el = box.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const reached = window.innerHeight * 0.6 - r.top;
      setFill(Math.max(0, Math.min(1, reached / r.height)));
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [items.length, openIds]);

  return (
    <>
      <div className="mb-8 flex justify-end">
        <button
          type="button"
          onClick={toggleAll}
          className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm font-medium text-heading transition hover:border-primary-600 hover:text-primary-700 active:scale-95"
        >
          {allOpen ? <ChevronsDownUp size={15} /> : <ChevronsUpDown size={15} />}
          {allOpen ? "Thu gọn tất cả" : "Mở tất cả"}
        </button>
      </div>

      <div ref={box} className="relative">
        <span aria-hidden className="absolute bottom-0 left-7 top-0 w-px bg-primary-100 md:left-1/2" />
        <span
          aria-hidden
          className="absolute left-7 top-0 h-full w-px origin-top bg-primary-600 md:left-1/2"
          style={{ transform: `scaleY(${fill})` }}
        />
        {items.map((it, i) => (
          <TimelineItem
            key={it.id}
            item={it}
            index={i}
            current={i === items.length - 1}
            open={openIds.has(it.id)}
            onToggle={() => toggle(it.id)}
            onOpen={onOpen}
          />
        ))}
      </div>
    </>
  );
}
