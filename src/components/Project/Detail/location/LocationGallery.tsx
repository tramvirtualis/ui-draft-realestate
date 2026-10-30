import { useRef, useState, type KeyboardEvent } from "react";
import { ChevronLeft, ChevronRight, Expand } from "lucide-react";
import SafeImage from "../../../common/SafeImage";
import LuxuryHeading from "../luxury/LuxuryHeading";
import type { LocationImageDto } from "../../../../types/project/location.types";

type Props = {
  name: string;
  images: LocationImageDto[];
  onOpen: (index: number) => void;
};

// Hình ảnh vị trí (sơ đồ / bản đồ dạng ảnh do admin tải lên): trượt ngang (vuốt trên điện thoại),
// nút trước / sau, bộ đếm và dải ảnh nhỏ; bấm ảnh để phóng to
export default function LocationGallery({ name, images, onOpen }: Props) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);
  if (images.length === 0) return null;
  const multiple = images.length > 1;

  const goTo = (i: number) => {
    const track = trackRef.current;
    if (!track) return;
    const index = (i + images.length) % images.length;
    track.scrollTo({ left: index * track.clientWidth, behavior: "smooth" });
  };

  // Ảnh đang xem suy ra từ vị trí cuộn, đúng cả khi người dùng tự vuốt
  const onScroll = () => {
    const track = trackRef.current;
    if (track) setActive(Math.round(track.scrollLeft / track.clientWidth));
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight") goTo(active + 1);
    else if (e.key === "ArrowLeft") goTo(active - 1);
    else return;
    e.preventDefault();
  };

  const navButton =
    "absolute top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-heading shadow-lg transition hover:bg-white hover:scale-105 focus-visible:outline-2 focus-visible:outline-primary-600 sm:flex";

  return (
    <section
      id="hinh-anh"
      aria-label="Hình ảnh vị trí"
      className="scroll-mt-36 py-16 md:py-24"
    >
      <div className="container mx-auto px-4 lg:px-8">
        <LuxuryHeading
          eyebrow="Hình ảnh vị trí"
          title={`Vị trí ${name} trong khu vực`}
          action={
            multiple ? (
              <p
                className="text-sm font-medium tabular-nums text-body"
                aria-live="polite"
              >
                <span className="text-heading">
                  {String(active + 1).padStart(2, "0")}
                </span>{" "}
                / {String(images.length).padStart(2, "0")}
              </p>
            ) : undefined
          }
        />

        <div className="relative">
          <ul
            ref={trackRef}
            onScroll={onScroll}
            onKeyDown={onKeyDown}
            tabIndex={multiple ? 0 : undefined}
            aria-label="Trình xem hình ảnh vị trí"
            className="flex snap-x snap-mandatory overflow-x-auto rounded-3xl border border-line bg-primary-50/40 [scrollbar-width:none] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-600"
          >
            {images.map((img, i) => (
              <li
                key={img.id}
                className="w-full shrink-0 snap-center p-2 md:p-3"
              >
                <button
                  type="button"
                  onClick={() => onOpen(i)}
                  aria-label={`Phóng to hình ảnh vị trí ${i + 1}`}
                  className="group relative flex aspect-4/3 w-full items-center justify-center overflow-hidden bg-white md:aspect-video"
                >
                  {/* object-contain: giữ trọn sơ đồ, không cắt mất chú thích ở mép ảnh */}
                  <SafeImage
                    src={img.imageUrl}
                    alt={`Hình ảnh vị trí dự án ${name} (${i + 1})`}
                    className="h-full w-full object-contain transition duration-500 group-hover:scale-[1.02]"
                  />
                  <span className="absolute bottom-4 right-4 flex items-center gap-2 rounded-full bg-ink-950/75 px-4 py-2 text-xs font-semibold text-white backdrop-blur transition group-hover:bg-ink-950">
                    <Expand size={14} aria-hidden /> Phóng to
                  </span>
                </button>
              </li>
            ))}
          </ul>

          {multiple && (
            <>
              <button
                type="button"
                onClick={() => goTo(active - 1)}
                aria-label="Ảnh trước"
                className={`${navButton} left-5`}
              >
                <ChevronLeft size={20} aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => goTo(active + 1)}
                aria-label="Ảnh sau"
                className={`${navButton} right-5`}
              >
                <ChevronRight size={20} aria-hidden />
              </button>
            </>
          )}
        </div>

        {multiple && (
          <ul
            className="mt-4 flex gap-3 overflow-x-auto pb-1"
            aria-label="Chọn hình ảnh vị trí"
          >
            {images.map((img, i) => (
              <li key={img.id} className="shrink-0">
                <button
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`Xem hình ảnh vị trí ${i + 1}`}
                  aria-current={i === active ? "true" : undefined}
                  className={`block h-16 w-24 overflow-hidden border-2 transition md:h-20 md:w-32 ${
                    i === active
                      ? "border-gold-400 shadow-md"
                      : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <SafeImage
                    src={img.imageUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
