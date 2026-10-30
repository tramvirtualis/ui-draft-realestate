import { Link } from "react-router-dom";
import { Building2, ChevronRight } from "lucide-react";

type Props = {
  base: string; // /projects/12-ten-du-an
  projectName: string;
  title: string;
  desc: string;
  statLabel: string;
  statValue: string;
};

// Đầu trang con của dự án (Mặt bằng, Bảng hàng, Quỹ căn): breadcrumb, tên dự án, tiêu đề grotesk viết hoa, mô tả và một ô số liệu
export default function ProjectSubHero({ base, projectName, title, desc, statLabel, statValue }: Props) {
  return (
    <section className="bg-page-glow pb-12 pt-8 md:pb-14">
      <div className="container mx-auto px-4 lg:px-8">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 font-heading text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
          <Link to="/" className="transition hover:text-primary-600">Trang chủ</Link>
          <ChevronRight size={12} aria-hidden />
          <Link to={base} className="transition hover:text-primary-600">{projectName}</Link>
          <ChevronRight size={12} aria-hidden />
          <span aria-current="page" className="text-primary-600">{title}</span>
        </nav>
        <div className="mt-6 flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/70 px-3 py-1.5 font-heading text-[10px] font-bold uppercase tracking-[0.14em] text-primary-700 backdrop-blur">
              <Building2 size={12} aria-hidden /> {projectName}
            </span>
            <h1 className="heading-display mt-4 text-4xl text-heading md:text-6xl">{title}</h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-body">{desc}</p>
          </div>
          <div className="rounded-[1.5rem] border border-white/80 bg-white/70 px-6 py-4 text-center shadow-[0_24px_50px_-30px_rgba(10,15,26,0.45)] backdrop-blur">
            <p className="font-heading text-[10px] font-bold uppercase tracking-[0.16em] text-muted">{statLabel}</p>
            <p className="heading-display mt-1 text-3xl tabular-nums text-heading">{statValue}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
