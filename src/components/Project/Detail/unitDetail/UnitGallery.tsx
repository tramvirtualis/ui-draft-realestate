import { useState } from "react";
import { ChevronLeft, ChevronRight, ImageOff, Maximize2 } from "lucide-react";
import SafeImage from "../../../common/SafeImage";
import Lightbox from "../../../common/Lightbox";

type Props = {
  code: string;
  images: string[];
  onViewerChange: (open: boolean) => void; // báo cho modal tạm nhường phím Esc/Tab cho trình xem ảnh
};

const navBtn =
  "absolute top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-navy shadow-md backdrop-blur transition hover:bg-white focus-visible:outline-2 focus-visible:outline-gold-400";

// Ảnh căn: ảnh lớn giữ đúng tỷ lệ (object-contain trên nền tối), dải ảnh nhỏ, bấm để xem toàn màn hình
export default function UnitGallery({ code, images, onViewerChange }: Props) {
  const [index, setIndex] = useState(0);
  const [viewer, setViewer] = useState(false);
  const total = images.length;

  const open = (state: boolean) => {
    setViewer(state);
    onViewerChange(state);
  };

  if (total === 0) {
    return (
      <div className="flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-primary-200 to-primary-100 text-primary-600">
        <ImageOff size={28} aria-hidden />
        <p className="text-sm">Căn chưa có hình ảnh</p>
      </div>
    );
  }

  const go = (dir: 1 | -1) => setIndex((i) => (i + dir + total) % total);

  return (
    <div>
      <div className="group relative aspect-[4/3] overflow-hidden bg-ink-950">
        {/* Nền mờ cùng ảnh để vùng trống quanh ảnh dọc/ngang không bị đen trơn */}
        <SafeImage src={images[index]} alt="" aria-hidden className="absolute inset-0 h-full w-full scale-110 object-cover opacity-40 blur-2xl" />
        <button type="button" onClick={() => open(true)} className="relative block h-full w-full cursor-zoom-in" aria-label={`Xem ảnh ${index + 1} của căn ${code} toàn màn hình`}>
          <SafeImage key={images[index]} src={images[index]} alt={`Căn ${code} – ảnh ${index + 1}`} className="animate-page-in h-full w-full object-contain" />
        </button>

        <span className="pointer-events-none absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-black/45 px-3 py-1 text-[11px] font-medium text-white backdrop-blur">
          <Maximize2 size={12} aria-hidden /> Phóng to
        </span>

        {total > 1 && (
          <>
            <button type="button" onClick={() => go(-1)} aria-label="Ảnh trước" className={`${navBtn} left-3`}>
              <ChevronLeft size={18} />
            </button>
            <button type="button" onClick={() => go(1)} aria-label="Ảnh sau" className={`${navBtn} right-3`}>
              <ChevronRight size={18} />
            </button>
            <span className="absolute bottom-3 right-3 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-semibold tabular-nums text-white">
              {index + 1} / {total}
            </span>
          </>
        )}
      </div>

      {total > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Chọn ảnh">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Ảnh ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-14 w-20 shrink-0 overflow-hidden ring-2 ring-offset-2 transition ${i === index ? "ring-gold-400" : "opacity-70 ring-transparent hover:opacity-100"}`}
            >
              <SafeImage src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {viewer && (
        <Lightbox
          images={images.map((src, i) => ({ src, title: `Căn ${code} – ảnh ${i + 1}`, date: null }))}
          index={index}
          onIndexChange={setIndex}
          onClose={() => open(false)}
        />
      )}
    </div>
  );
}
