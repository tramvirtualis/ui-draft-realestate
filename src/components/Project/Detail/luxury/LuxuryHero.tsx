import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronDown, ChevronRight, Heart, MapPin } from "lucide-react";
import { useFavoriteProject } from "../../../../hooks/project/useFavoriteProject";
import { imageSrcSet, optimizedImage } from "../../../../utils/imageUrl";

type Props = {
  projectId: number;
  basePath: string; // /projects/12-ten-du-an
  name: string;
  location: string;
  image: string;
  status: string | null;
  price: string;
};

const WIDTHS = [768, 1280, 1920];

// Hero toàn màn hình (cùng kiểu trang chủ): ảnh lớn có parallax nhẹ phủ tím than mờ dần, tên dự án grotesk viết hoa,
// trạng thái dạng viên kính, giá tham khảo và CTA (xem quỹ căn, lưu dự án)
export default function LuxuryHero({ projectId, basePath, name, location, image, status, price }: Props) {
  const { favorited, busy, toggle } = useFavoriteProject(projectId);
  const mediaRef = useRef<HTMLDivElement>(null);

  // Parallax nhẹ: chỉ dịch ảnh theo scroll bằng transform (rAF), tắt khi người dùng chọn giảm chuyển động
  useEffect(() => {
    const el = mediaRef.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const y = Math.min(window.scrollY, 900);
      el.style.transform = `translate3d(0, ${y * 0.22}px, 0) scale(1.06)`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <header className="relative isolate overflow-hidden bg-ink-900">
      <div className="relative min-h-[82svh] md:min-h-[88svh]">
        <div ref={mediaRef} className="absolute inset-0 will-change-transform">
          {/* Ảnh LCP: tải ưu tiên, không lazy */}
          <img
            src={optimizedImage(image, 1920)}
            srcSet={imageSrcSet(image, WIDTHS)}
            sizes="100vw"
            alt={`Phối cảnh dự án ${name}`}
            width={1920}
            height={1080}
            fetchPriority="high"
            decoding="async"
            className="h-full w-full object-cover"
          />
        </div>
        {/* Phủ tím than nhẹ: chỉ đậm ở chân và mép trái (chỗ chữ) cho dễ đọc, phần còn lại giữ gần nguyên màu ảnh */}
        <div className="absolute inset-0 bg-linear-to-t from-ink-900/80 via-ink-900/15 to-transparent" aria-hidden />
        <div className="absolute inset-0 bg-linear-to-r from-ink-900/45 via-transparent to-transparent" aria-hidden />

        <div className="container relative mx-auto flex min-h-[82svh] flex-col justify-between px-4 pb-28 pt-8 md:min-h-[88svh] md:pb-32 lg:px-8">
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-2 font-heading text-[11px] font-semibold uppercase tracking-[0.14em] text-white/65">
              <li><Link to="/" className="transition hover:text-white">Trang chủ</Link></li>
              <li aria-hidden><ChevronRight size={12} /></li>
              <li><Link to="/projects" className="transition hover:text-white">Dự án</Link></li>
              <li aria-hidden><ChevronRight size={12} /></li>
              <li aria-current="page" className="text-primary-200">{name}</li>
            </ol>
          </nav>

          <div className="mt-16 max-w-5xl animate-rise-in">
            {status && (
              <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 font-heading text-[11px] font-bold uppercase tracking-[0.16em] text-white backdrop-blur">
                <span className="h-2 w-2 animate-pulse rounded-full bg-pop-500" aria-hidden />
                {status}
              </span>
            )}

            <h1 className="heading-display mt-5 text-[2.5rem] text-white drop-shadow-[0_4px_30px_rgba(0,0,0,0.35)] sm:text-6xl md:text-7xl lg:text-8xl">
              {name}
            </h1>
            {location && (
              <p className="mt-5 flex items-center gap-2 text-base text-white/85 md:text-lg">
                <MapPin size={18} className="shrink-0 text-primary-300" aria-hidden /> {location}
              </p>
            )}

            <div className="mt-9 flex flex-wrap items-end gap-x-10 gap-y-6">
              <div className="border-l border-primary-300/60 pl-5">
                <p className="font-heading text-[11px] font-bold uppercase tracking-[0.18em] text-white/55">Giá tham khảo</p>
                <p className="heading-display mt-1 text-3xl text-white md:text-4xl">
                  {price}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  to={`${basePath}/inventory`}
                  className="btn-gloss group flex items-center gap-2 rounded-full px-7 py-3.5 font-heading text-xs font-bold uppercase tracking-widest text-white transition hover:-translate-y-0.5 active:scale-95"
                >
                  Xem quỹ căn <ArrowRight size={16} className="transition group-hover:translate-x-1" />
                </Link>
                <button
                  type="button"
                  onClick={() => void toggle()}
                  disabled={busy}
                  aria-pressed={favorited}
                  className="flex items-center gap-2 rounded-full border border-white/35 bg-white/10 px-6 py-3.5 font-heading text-xs font-bold uppercase tracking-widest text-white backdrop-blur transition hover:bg-white/20 active:scale-95 disabled:opacity-60"
                >
                  <Heart size={16} className={favorited ? "fill-primary-300 text-primary-300" : ""} aria-hidden />
                  {favorited ? "Đã lưu" : "Lưu dự án"}
                </button>
              </div>
            </div>
          </div>
        </div>

        <a
          href="#gioi-thieu"
          aria-label="Cuộn xuống phần giới thiệu"
          className="absolute bottom-24 left-1/2 hidden -translate-x-1/2 text-white/70 transition hover:text-white md:block"
        >
          <ChevronDown size={26} className="animate-bounce" />
        </a>
      </div>
    </header>
  );
}
