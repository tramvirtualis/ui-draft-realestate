import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Reveal from "../../../common/Reveal";
import SafeImage from "../../../common/SafeImage";
import { formatFull } from "./progressFormat";
import type { ViewImage } from "../../../../types/project/progress.types";

type Props = {
  images: ViewImage[];
  onOpen: (images: ViewImage[], index: number) => void;
};

// Thư viện ảnh tiến độ: một hàng ảnh cùng kích thước, góc vuông, dừng ngay ngắn theo từng ảnh (scroll-snap);
// mũi tên trượt mỗi lần đúng 1 ảnh, kéo / vuốt ngang cũng được; bấm ảnh mở lightbox
export default function ProgressGallery({ images, onOpen }: Props) {
  const track = useRef<HTMLUListElement>(null);
  const [index, setIndex] = useState(0); // ảnh đang ở mép trái
  const [atEnd, setAtEnd] = useState(false);

  // Bước trượt = bề rộng 1 ảnh + khoảng cách
  const step = () => {
    const el = track.current;
    const first = el?.firstElementChild as HTMLElement | null;
    if (!el || !first) return 0;
    return first.offsetWidth + parseFloat(getComputedStyle(el).columnGap || "0");
  };

  // Theo dõi vị trí cuộn để cập nhật bộ đếm và khoá nút ở hai đầu
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const update = () => {
      const s = step();
      if (s) setIndex(Math.round(el.scrollLeft / s));
      setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4);
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [images.length]);

  if (images.length === 0) return null;

  const slide = (dir: 1 | -1) => track.current?.scrollBy({ left: dir * step(), behavior: "smooth" });

  return (
    <section className="bg-primary-100/70 py-16 md:py-24">
      <div className="container mx-auto px-4 lg:px-8">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="flex items-center gap-3 font-heading text-xs font-bold uppercase tracking-[0.16em] text-primary-600">
              <span className="h-px w-10 bg-primary-400/70" aria-hidden /> Thư viện hình ảnh
            </p>
            <h2 className="heading-display mt-4 text-3xl text-heading md:text-5xl">Công trình qua từng khoảnh khắc</h2>
          </div>

          <div className="flex items-center gap-4">
            <p className="font-heading text-sm font-bold tabular-nums tracking-widest text-primary-700" aria-live="polite">
              {String(Math.min(index + 1, images.length)).padStart(2, "0")}
              <span className="text-muted"> / {String(images.length).padStart(2, "0")}</span>
            </p>
            <div className="flex">
              <button
                type="button"
                onClick={() => slide(-1)}
                disabled={index <= 0}
                aria-label="Ảnh trước"
                className="flex h-12 w-12 items-center justify-center bg-white text-primary-700 transition hover:bg-primary-50 disabled:pointer-events-none disabled:opacity-40"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                type="button"
                onClick={() => slide(1)}
                disabled={atEnd}
                aria-label="Ảnh sau"
                className="flex h-12 w-12 items-center justify-center bg-primary-600 text-white transition hover:bg-primary-700 disabled:pointer-events-none disabled:opacity-40"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </Reveal>

        <ul
          ref={track}
          className="mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {images.map((img, i) => (
            <li key={img.src + i} className="w-[85%] shrink-0 snap-start sm:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-2rem)/3)]">
              <button
                type="button"
                onClick={() => onOpen(images, i)}
                aria-label={`Xem ảnh: ${img.title}`}
                className="group block w-full text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-600"
              >
                <span className="relative block aspect-[4/3] overflow-hidden bg-white">
                  <SafeImage
                    src={img.src}
                    alt={img.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                  <span className="absolute left-0 top-0 bg-primary-600 px-3 py-1.5 font-heading text-[11px] font-bold tabular-nums tracking-widest text-white">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </span>
                <span className="mt-3 block truncate text-sm font-semibold text-heading transition group-hover:text-primary-700">{img.title}</span>
                {img.date && <span className="mt-0.5 block text-xs text-muted">{formatFull(new Date(img.date))}</span>}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
