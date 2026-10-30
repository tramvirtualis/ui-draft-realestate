import { Link } from "react-router-dom";
import { ArrowDown, ChevronRight, Expand, MapPin, Navigation } from "lucide-react";
import { imageSrcSet, optimizedImage } from "../../../../utils/imageUrl";

export type LocationSectionLink = { id: string; label: string };

type Props = {
  basePath: string;
  name: string;
  address: string;
  intro: string | null;
  image: string;
  directionsUrl: string | null;
  sections: LocationSectionLink[]; // các mục đang có nội dung, để nhảy nhanh trong trang
  onOpenImage: () => void;
};

const WIDTHS = [768, 1280, 1920];

// Hero trang Vị trí: ảnh dự án tràn màn hình, nội dung neo đáy, nút hành động và thanh mục lục của trang
export default function LocationHero({ basePath, name, address, intro, image, directionsUrl, sections, onOpenImage }: Props) {
  const hasMap = sections.some((s) => s.id === "ban-do");

  return (
    <header className="relative isolate overflow-hidden bg-ink-950">
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
        className="absolute inset-0 -z-10 h-full w-full object-cover"
      />
      <div className="absolute inset-0 -z-10 bg-linear-to-t from-ink-950 via-ink-950/50 to-ink-950/20" aria-hidden />
      <div className="absolute inset-0 -z-10 bg-linear-to-r from-ink-950/70 via-transparent to-transparent" aria-hidden />

      <div className="container mx-auto flex min-h-[72svh] flex-col px-4 pb-6 pt-6 md:min-h-[78svh] md:pb-8 lg:px-8">
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-2 text-xs text-white/70">
            <li><Link to="/" className="transition hover:text-white">Trang chủ</Link></li>
            <li aria-hidden><ChevronRight size={12} /></li>
            <li><Link to={basePath} className="transition hover:text-white">{name}</Link></li>
            <li aria-hidden><ChevronRight size={12} /></li>
            <li aria-current="page" className="font-semibold text-gold-200">Vị trí</li>
          </ol>
        </nav>

        <div className="mt-auto grid gap-8 pt-24 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:gap-12">
          <div className="max-w-3xl animate-rise-in">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold-300/50 bg-gold-300/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-gold-200 backdrop-blur">
              <MapPin size={13} aria-hidden /> Vị trí dự án
            </span>
            <h1 className="heading-display mt-5 text-balance text-4xl text-white sm:text-5xl lg:text-6xl xl:text-7xl">
              {name}
            </h1>
            {address && (
              <p className="mt-4 flex items-start gap-2 text-base text-white/85 md:text-lg">
                <MapPin size={18} className="mt-1 shrink-0 text-gold-300" aria-hidden /> {address}
              </p>
            )}
            {intro && <p className="mt-4 max-w-2xl whitespace-pre-line wrap-break-word text-sm leading-7 text-white/75 md:text-base">{intro}</p>}
          </div>

          <div className="flex flex-wrap gap-3 lg:flex-col lg:items-stretch">
            {hasMap && (
              <a
                href="#ban-do"
                className="group flex items-center justify-center gap-2 rounded-full bg-gold-300 px-6 py-3 text-sm font-semibold text-gold-950 shadow-xl shadow-gold-500/20 transition hover:bg-gold-200 active:scale-95"
              >
                Xem bản đồ <ArrowDown size={16} className="transition group-hover:translate-y-0.5" aria-hidden />
              </a>
            )}
            {directionsUrl && (
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-full border border-white/40 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20 active:scale-95"
              >
                <Navigation size={16} aria-hidden /> Chỉ đường
              </a>
            )}
            <button
              type="button"
              onClick={onOpenImage}
              className="flex items-center justify-center gap-2 rounded-full border border-white/40 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20 active:scale-95"
            >
              <Expand size={16} aria-hidden /> Xem ảnh lớn
            </button>
          </div>
        </div>

        {sections.length > 1 && (
          <nav aria-label="Mục trong trang" className="-mx-4 mt-10 border-t border-white/15 px-4 pt-5 lg:mx-0 lg:px-0">
            <ul className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
              {sections.map((s, i) => (
                <li key={s.id} className="shrink-0">
                  <a
                    href={`#${s.id}`}
                    className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white/85 backdrop-blur transition hover:border-white hover:bg-white hover:text-heading"
                  >
                    <span className="text-xs font-semibold tabular-nums text-gold-300">{String(i + 1).padStart(2, "0")}</span>
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
}
