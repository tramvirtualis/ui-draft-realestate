import { useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { ChevronLeft, ChevronRight, Images, Maximize2 } from "lucide-react";
import Container from "../Container";
import Reveal from "../../../common/Reveal";
import Lightbox from "../../../common/Lightbox";
import SafeImage from "../../../common/SafeImage";
import LuxuryHeading from "./LuxuryHeading";
import { imageSrcSet, optimizedImage } from "../../../../utils/imageUrl";
import type { GalleryImage } from "../../../../types/project/projectOverview.types";

type Props = { name: string; images: GalleryImage[] };

// Vị trí từng tầng theo khoảng cách tới ảnh giữa (kiểu vòng cung 3D): dịch ngang (theo % bề rộng ảnh giữa), lùi sâu (px),
// xoay nghiêng vào trong về phía ảnh giữa (độ), thu nhỏ, độ mờ
const TIERS = [
  { x: 0, z: 0, rotate: 0, scale: 1, opacity: 1 },
  { x: 78, z: -120, rotate: 38, scale: 0.78, opacity: 1 },
  { x: 132, z: -260, rotate: 52, scale: 0.6, opacity: 0.85 },
];
// Mỗi ảnh tự có phối cảnh riêng (không dùng không gian 3D chung) để ảnh nghiêng không đâm xuyên ảnh khác; thứ tự chồng theo z-index
const PERSPECTIVE = "perspective(1600px)";
const SWIPE = 40; // px kéo tối thiểu để tính là vuốt

// Khoảng cách vòng tròn từ ảnh i tới ảnh đang giữa: âm = bên trái, dương = bên phải
const offsetOf = (i: number, active: number, n: number) => {
  let d = (((i - active) % n) + n) % n;
  if (d > n / 2) d -= n;
  return d;
};

// Thư viện ảnh kiểu băng chuyền 3D (coverflow): ảnh giữa thẳng và lớn nhất, hai bên nghiêng vào trong, nhỏ dần và lùi sâu ra mép;
// mũi tên / phím ← → / vuốt để chuyển
// (vòng tròn qua hết ảnh), bấm ảnh bên cạnh để đưa vào giữa, bấm ảnh giữa để xem lớn trong lightbox
export default function EditorialGallery({ name, images }: Props) {
  const [active, setActive] = useState(0);
  const [viewing, setViewing] = useState<number | null>(null);
  const dragX = useRef<number | null>(null);
  // Vừa vuốt xong thì bỏ qua cú bấm đi kèm (tránh mở lightbox / nhảy ảnh ngoài ý muốn)
  const swiped = useRef(false);
  const n = images.length;

  const viewImages = useMemo(
    () => images.map((g) => ({ src: g.src, title: g.caption || g.label, date: null })),
    [images],
  );

  if (n === 0) return null;

  const go = (step: number) => setActive((a) => (((a + step) % n) + n) % n);
  const current = images[active];

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft") go(-1);
    if (e.key === "ArrowRight") go(1);
  };
  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    dragX.current = e.clientX;
    swiped.current = false;
  };
  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    if (dragX.current === null) return;
    const dx = e.clientX - dragX.current;
    dragX.current = null;
    if (Math.abs(dx) > SWIPE) {
      swiped.current = true;
      go(dx < 0 ? 1 : -1);
    }
  };
  const select = (i: number, center: boolean) => {
    if (swiped.current) {
      swiped.current = false;
      return;
    }
    if (center) setViewing(i);
    else setActive(i);
  };

  return (
    <section className="overflow-hidden bg-page-glow py-20 md:py-28" aria-labelledby="thu-vien-title">
      <Container>
        <LuxuryHeading
          id="thu-vien"
          eyebrow="Thư viện hình ảnh"
          title="Không gian sống qua từng khung hình"
          action={
            <span className="flex items-center gap-2 rounded-full border border-white/80 bg-white/70 px-4 py-2 font-heading text-[11px] font-bold uppercase tracking-[0.12em] text-primary-700 backdrop-blur">
              <Images size={14} aria-hidden /> {n} hình ảnh
            </span>
          }
        />
        <h2 id="thu-vien-title" className="sr-only">Thư viện hình ảnh dự án {name}</h2>

        <Reveal variant="zoom">
          <div
            role="region"
            aria-roledescription="carousel"
            aria-label={`Ảnh dự án ${name}`}
            tabIndex={0}
            onKeyDown={onKeyDown}
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
            onPointerCancel={() => (dragX.current = null)}
            className="relative mx-auto aspect-[16/10] w-[78%] touch-pan-y select-none outline-none focus-visible:ring-4 focus-visible:ring-primary-200 sm:w-[60%] lg:w-[52%]"
          >
            {images.map((g, i) => {
              const d = offsetOf(i, active, n);
              const tier = TIERS[Math.abs(d)];
              const center = d === 0;
              // Chỉ hiện ảnh giữa và 2 tầng mỗi bên; ảnh xa hơn ẩn hẳn (vẫn nằm sẵn để trượt vào mượt)
              // Ảnh bên phải xoay dương, bên trái xoay âm: mép trong (sát ảnh giữa) nhô ra, mép ngoài lùi vào trong
              const side = Math.sign(d);
              const style = tier
                ? {
                    transform: `${PERSPECTIVE} translateX(${side * tier.x}%) translateZ(${tier.z}px) rotateY(${side * tier.rotate}deg) scale(${tier.scale})`,
                    opacity: tier.opacity,
                    zIndex: 10 - Math.abs(d),
                  }
                : {
                    transform: `${PERSPECTIVE} translateX(${side * 170}%) translateZ(-360px) rotateY(${side * 60}deg) scale(0.45)`,
                    opacity: 0,
                    zIndex: 0,
                    pointerEvents: "none" as const,
                  };
              return (
                <button
                  key={`${g.src}-${i}`}
                  type="button"
                  onClick={() => select(i, center)}
                  aria-label={center ? `Xem ảnh lớn: ${g.caption || g.label}` : `Chuyển tới ảnh: ${g.caption || g.label}`}
                  aria-hidden={!tier || undefined}
                  tabIndex={tier ? 0 : -1}
                  style={style}
                  className={`group absolute inset-0 overflow-hidden bg-primary-100 outline-none ring-primary-500 transition-[transform,opacity] duration-700 ease-out focus-visible:ring-4 ${
                    center ? "shadow-[0_40px_80px_-40px_rgba(10,15,26,0.7)]" : "shadow-[0_24px_50px_-30px_rgba(10,15,26,0.5)]"
                  }`}
                >
                  <SafeImage
                    src={optimizedImage(g.src, 1280)}
                    srcSet={imageSrcSet(g.src, [640, 1024, 1280])}
                    sizes="(min-width: 1024px) 56vw, (min-width: 640px) 64vw, 82vw"
                    alt={`${name} - ${g.caption || g.label}`}
                    loading={Math.abs(d) <= 1 ? "eager" : "lazy"}
                    decoding="async"
                    draggable={false}
                    className={`h-full w-full object-cover transition duration-700 ${center ? "group-hover:scale-105" : ""}`}
                  />
                  {/* Ảnh hai bên phủ mờ để ảnh giữa nổi bật */}
                  <span
                    className={`absolute inset-0 transition duration-500 ${center ? "bg-transparent" : "bg-ink-900/35 group-hover:bg-ink-900/15"}`}
                    aria-hidden
                  />
                  {center && (
                    <span className="absolute right-0 top-0 flex h-10 w-10 items-center justify-center bg-white/90 text-primary-700 opacity-0 transition duration-300 group-hover:opacity-100">
                      <Maximize2 size={16} aria-hidden />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </Reveal>

        {/* Chú thích ảnh giữa + điều hướng */}
        <div className="mx-auto mt-8 flex max-w-3xl items-center justify-between gap-6">
          <button
            type="button"
            onClick={() => go(-1)}
            disabled={n < 2}
            aria-label="Ảnh trước"
            className="flex h-12 w-12 shrink-0 items-center justify-center bg-white text-primary-700 transition hover:bg-primary-100 disabled:opacity-40"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="min-w-0 text-center" aria-live="polite">
            <p className="font-heading text-[11px] font-bold uppercase tracking-[0.18em] text-primary-600">
              {String(active + 1).padStart(2, "0")} / {String(n).padStart(2, "0")} · {current.label}
            </p>
            {current.caption && <p className="mt-1 truncate font-semibold text-heading">{current.caption}</p>}
          </div>
          <button
            type="button"
            onClick={() => go(1)}
            disabled={n < 2}
            aria-label="Ảnh sau"
            className="flex h-12 w-12 shrink-0 items-center justify-center bg-primary-600 text-white transition hover:bg-primary-700 disabled:opacity-40"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </Container>

      {viewing !== null && (
        <Lightbox images={viewImages} index={viewing} onIndexChange={setViewing} onClose={() => setViewing(null)} />
      )}
    </section>
  );
}
