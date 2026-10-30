import { Link } from "react-router-dom";
import { ChevronRight, Building2 } from "lucide-react";

type Props = {
  base: string;
  project: { name: string; image: string; location: string };
  total: number;
};

export default function DocumentsHero({ base, project, total }: Props) {
  return (
    <section className="bg-page-glow pb-14 pt-8">
      <div className="container mx-auto px-4 lg:px-8">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 font-heading text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
          <Link to="/" className="transition hover:text-primary-600">Trang chủ</Link> <ChevronRight size={12} aria-hidden />
          <Link to={base} className="transition hover:text-primary-600">{project.name}</Link> <ChevronRight size={12} aria-hidden />
          <span aria-current="page" className="text-primary-600">Tài liệu</span>
        </nav>
        <div className="mt-6 grid items-center gap-10 lg:grid-cols-[1fr_450px]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/70 px-3 py-1.5 font-heading text-[10px] font-bold uppercase tracking-[0.14em] text-primary-700 backdrop-blur">
              <Building2 size={12} /> {project.name}
            </span>
            <h1 className="heading-display mt-4 text-4xl text-heading md:text-6xl">Thư viện tài liệu dự án</h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-body">
              Truy cập tập trung hồ sơ dự án và bộ tài liệu mới nhất của {project.name}.
            </p>
            <p className="mt-4 text-sm text-body"><b className="text-heading">{total} tài liệu</b></p>
          </div>
          <div className="relative overflow-hidden shadow-[0_30px_60px_-30px_rgba(10,15,26,0.55)]" style={{ height: 220 }}>
            <img src={project.image} alt={project.name} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-900/75 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-5 text-white">
              <p className="text-lg font-semibold">{project.name}</p>
              {project.location && <p className="text-[11px] text-white/80">{project.location}</p>}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
