import { Link } from "react-router-dom";
import { MapPin, Building2, ArrowRight, ArrowUpRight } from "lucide-react";
import { projectPath } from "../../../utils/slug";
import type { ProjectCardData } from "./projectCardData";

type Props = {
  project: ProjectCardData;
  view?: "grid" | "list";
  /** Số thứ tự hiển thị (01, 02…) */
  index: number;
};

const no = (n: number) => String(n).padStart(2, "0");

// Số thứ tự chữ viền đặt góc ảnh
function IndexMark({ n, className = "" }: { n: number; className?: string }) {
  return (
    <span
      aria-hidden
      className={`heading-display pointer-events-none select-none text-transparent [-webkit-text-stroke:1.5px_rgba(255,255,255,0.85)] ${className}`}
    >
      {no(n)}
    </span>
  );
}

// Nhãn loại hình / nhãn dự án trên ảnh
function Chips({ project }: { project: ProjectCardData }) {
  return (
    <div className="flex flex-wrap justify-end gap-1.5">
      {project.tag && (
        <span className="btn-gloss rounded-full px-3 py-1 text-[11px] font-semibold text-white">{project.tag}</span>
      )}
      <span className="rounded-full bg-white/85 px-3 py-1 text-[11px] font-semibold text-primary-700 backdrop-blur">
        {project.type}
      </span>
    </div>
  );
}

// Khoảng giá + thanh tiến độ: BE chưa có dữ liệu nên hiện khi có (ẩn nếu rỗng)
function PriceProgress({ project }: { project: ProjectCardData }) {
  if (!project.price && !project.note) return null;
  return (
    <div className="mt-4 space-y-3">
      {project.price && (
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted">Khoảng giá</span>
          <span className="text-sm font-bold text-primary-600">{project.price}</span>
        </div>
      )}
      {project.note && (
        <div>
          <div className="flex items-center justify-between text-[11px] text-muted">
            <span>Tiến độ</span>
            <span>{project.note}</span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-primary-100">
            <div className="btn-gloss h-full rounded-full" style={{ width: `${project.progress}%` }} />
          </div>
        </div>
      )}
    </div>
  );
}

const CARD =
  "group relative flex overflow-hidden border border-white/80 bg-white/70 shadow-[0_24px_50px_-30px_rgba(63,42,107,0.45)] backdrop-blur transition duration-500 ease-out hover:-translate-y-2 hover:border-primary-200 hover:shadow-[0_40px_70px_-30px_rgba(201,153,31,0.6)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-500";

export default function ProjectCard({ project, view = "grid", index }: Props) {
  const to = projectPath(project.id, project.name);

  // Dạng danh sách: ảnh trái, nội dung phải với số thứ tự gradient cỡ lớn
  if (view === "list") {
    return (
      <Link to={to} className={`${CARD} flex-col p-2 md:flex-row`}>
        <div className="relative h-64 shrink-0 overflow-hidden md:h-auto md:min-h-64 md:w-[42%]">
          <img
            src={project.image}
            alt={project.name}
            className="h-full w-full object-cover transition duration-1000 ease-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-ink-900/50 to-transparent" />
          <div className="absolute right-4 top-4">
            <Chips project={project} />
          </div>
        </div>

        <div className="flex flex-1 flex-col p-5 md:p-8">
          <div className="flex items-start justify-between gap-4">
            <h3 className="heading-display text-3xl leading-[1.2]! text-heading transition group-hover:text-primary-700">
              {project.name}
            </h3>
            <span aria-hidden className="heading-display text-5xl text-gradient-accent">
              {no(index)}
            </span>
          </div>
          <dl className="mt-5 grid gap-4 border-t border-primary-100 pt-5 text-sm sm:grid-cols-3">
            {[
              ["Chủ đầu tư", project.investor],
              ["Vị trí", project.location],
              ["Loại hình", project.type],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="font-heading text-[10px] font-bold uppercase tracking-[0.18em] text-muted">{label}</dt>
                <dd className="mt-1 font-semibold text-heading">{value}</dd>
              </div>
            ))}
          </dl>
          <PriceProgress project={project} />
          <span className="mt-auto flex items-center gap-2 pt-6 font-heading text-xs font-bold uppercase tracking-widest text-primary-600">
            Xem chi tiết
            <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1.5" />
          </span>
        </div>
      </Link>
    );
  }

  // Dạng lưới: ảnh bo trong khung kính, tên dự án đè chân ảnh, thông tin bên dưới
  return (
    <Link to={to} className={`${CARD} h-full flex-col p-2`}>
      <div className="relative h-64 overflow-hidden">
        <img
          src={project.image}
          alt={project.name}
          className="h-full w-full object-cover transition duration-1000 ease-out group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900/85 via-ink-900/10 to-transparent transition duration-500 group-hover:from-primary-900/90" />
        <IndexMark n={index} className="absolute left-4 top-2 text-5xl" />
        <div className="absolute right-4 top-4">
          <Chips project={project} />
        </div>
        <span className="absolute bottom-4 right-4 flex h-11 w-11 translate-y-3 items-center justify-center rounded-full bg-white text-primary-600 opacity-0 shadow-lg transition duration-500 group-hover:translate-y-0 group-hover:opacity-100">
          <ArrowUpRight size={20} />
        </span>
        <h3 className="heading-display absolute inset-x-4 bottom-4 line-clamp-2 pr-14 text-2xl leading-[1.2]! text-white">
          {project.name}
        </h3>
      </div>

      <div className="flex flex-1 flex-col px-4 pb-4 pt-5">
        <p className="flex items-start gap-1.5 text-sm text-body" title={project.location}>
          <MapPin size={14} className="mt-0.5 shrink-0 text-primary-500" />
          <span className="line-clamp-1">{project.location}</span>
        </p>
        <p className="mt-2 flex items-start gap-1.5 text-sm text-body" title={project.investor}>
          <Building2 size={14} className="mt-0.5 shrink-0 text-primary-500" />
          <span className="line-clamp-1">
            Chủ đầu tư: <span className="font-semibold text-heading">{project.investor}</span>
          </span>
        </p>
        <PriceProgress project={project} />
        <span aria-hidden className="min-h-5 flex-1" />
        <span className="flex items-center justify-between border-t border-primary-100 pt-4 font-heading text-[11px] font-bold uppercase tracking-widest text-primary-600">
          Xem chi tiết
          <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1.5" />
        </span>
      </div>
    </Link>
  );
}
