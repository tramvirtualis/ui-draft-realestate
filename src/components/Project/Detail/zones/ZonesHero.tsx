import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, ArrowDown, MapPin } from "lucide-react";
import SafeImage from "../../../common/SafeImage";
import type { ProjectZones } from "../../../../types/project/zone.types";

type Props = { base: string; data: ProjectZones; onJump: () => void };

const LINES = ["Khám phá", "từng phân khu"];

export default function ZonesHero({ base, data, onJump }: Props) {
  const { project, zones } = data;
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setScrollY(Math.min(window.scrollY, 700)));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section className="relative isolate flex min-h-[560px] items-end overflow-hidden bg-footer text-white">
      <SafeImage
        src={project.image}
        alt={`Phối cảnh dự án ${project.name}`}
        loading="eager"
        style={{ transform: `translateY(${scrollY * 0.25}px) scale(1.1)` }}
        className="absolute inset-0 -z-10 h-full w-full animate-[zoom-out_1.8s_ease-out_both] object-cover"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-footer via-footer/60 to-footer/20" />

      <div className="container mx-auto px-4 pb-14 pt-24 lg:px-8">
        <nav aria-label="Breadcrumb" className="animate-rise-in flex flex-wrap items-center gap-2 text-xs text-white/70">
          <Link to="/" className="hover:text-white">Trang chủ</Link> <ChevronRight size={12} />
          <Link to="/projects" className="hover:text-white">Dự án</Link> <ChevronRight size={12} />
          <Link to={base} className="hover:text-white">{project.name}</Link> <ChevronRight size={12} />
          <span className="font-semibold text-white">Phân khu</span>
        </nav>

        <p className="animate-rise-in mt-8 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-primary-300 [animation-delay:100ms]">
          <span className="h-px w-10 bg-primary-300" /> {project.name}
        </p>

        <h1 className="heading-display mt-4 text-5xl md:text-7xl">
          {LINES.map((l, i) => (
            // Chừa chỗ phía trên khung che để dấu chữ hoa (Ể, Ấ…) không bị cắt
            <span key={l} className="-mt-[0.2em] block overflow-hidden pt-[0.2em]">
              <span className="animate-rise-in block" style={{ animationDelay: `${200 + i * 150}ms` }}>{l}</span>
            </span>
          ))}
        </h1>

        <div className="animate-rise-in mt-6 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-white/80 [animation-delay:550ms]">
          <span className="flex items-center gap-1.5"><MapPin size={15} /> {project.location}</span>
          <span>Chủ đầu tư: <b className="font-semibold text-white">{project.investor}</b></span>
          <span><b className="font-semibold text-white">{zones.length}</b> phân khu</span>
        </div>

        <button
          onClick={onJump}
          className="animate-rise-in group mt-8 inline-flex items-center gap-3 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-primary-700 transition hover:bg-primary-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:scale-95 [animation-delay:700ms]"
        >
          Khám phá phân khu
          <ArrowDown size={16} className="transition group-hover:translate-y-1" />
        </button>
      </div>
    </section>
  );
}
