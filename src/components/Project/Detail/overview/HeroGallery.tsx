import { useState } from "react";
import { ChevronLeft, ChevronRight, Images } from "lucide-react";
import type { GalleryImage } from "../../../../data/project/detail/overview";

export default function HeroGallery({ images }: { images: GalleryImage[] }) {
  const [i, setI] = useState(0);
  const go = (d: number) => setI((i + d + images.length) % images.length);
  return (
    <div>
      <div className="relative overflow-hidden" style={{ height: "clamp(280px, 35vw, 500px)" }}>
        <img src={images[i].src} alt={images[i].label} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-footer/70 via-transparent to-transparent" />
        <span className="absolute right-5 top-5 flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-heading">
          <Images size={14} /> {i + 1} / 18
        </span>
        <button onClick={() => go(-1)} aria-label="Ảnh trước" className="absolute left-5 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-heading shadow">
          <ChevronLeft size={18} />
        </button>
        <button onClick={() => go(1)} aria-label="Ảnh sau" className="absolute right-5 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-heading shadow">
          <ChevronRight size={18} />
        </button>
        <div className="absolute bottom-6 left-7 text-white">
          <p className="text-xs font-semibold uppercase">{images[i].label}</p>
          <p className="mt-1 text-xl font-semibold">{images[i].caption}</p>
        </div>
        <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-1.5">
          {[0, 1, 2, 3, 4].map((k) => (
            <span key={k} className={`h-1.5 rounded-full ${k === i ? "w-6 bg-white" : "w-1.5 bg-white/50"}`} />
          ))}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-[repeat(4,1fr)_190px]">
        {images.map((g, k) => (
          <button
            key={g.src}
            onClick={() => setI(k)}
            className={`relative h-[88px] overflow-hidden border-2 ${k === i ? "border-primary-600" : "border-transparent"}`}
          >
            <img src={g.src} alt="" className="h-full w-full object-cover" />
            <span className="absolute bottom-1.5 left-2 text-[10px] font-medium text-white">{g.label}</span>
          </button>
        ))}
        <button className="col-span-2 flex h-[88px] items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-sm font-semibold text-white md:col-span-1">
          Xem tất cả 18 ảnh
        </button>
      </div>
    </div>
  );
}
