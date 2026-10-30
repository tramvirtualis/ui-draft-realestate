import { Link } from "react-router-dom";
import { Building2, ArrowRight, MapPin, NotebookPen } from "lucide-react";
import type { News, ProjectSummary } from "../../types/new/news.types";
import type { TocItem } from "./useArticleToc";
import { formatDate } from "../../utils/formatDate";
import { useProjectData } from "../../hooks/project/useProjectData";
import { projectService } from "../../services/project/projectService";

// Tin tức chỉ kèm id + tên dự án; tải chi tiết để lấy ảnh tổng quan và vị trí cho thẻ dự án liên quan
const loadProject = (id: number) => projectService.getProject(id);

interface NewsDetailSidebarProps {
  project: ProjectSummary | null;
  latest: News[];
  toc: TocItem[];
  activeId: string | null;
}

const FALLBACK_THUMB =
  "https://images.unsplash.com/photo-1460317442991-0ec209397118?w=300&q=70";

// Cột phải bám theo khi cuộn: mục lục (tô sáng mục đang đọc), dự án liên quan, tin mới nhất
export default function NewsDetailSidebar({
  project,
  latest,
  toc,
  activeId,
}: NewsDetailSidebarProps) {
  const detail = useProjectData(project?.id, loadProject);
  const projectInfo = detail.status === "ready" ? detail.data : null;

  return (
    <aside className="space-y-5 lg:sticky lg:top-28">
      {toc.length > 1 && (
        <nav
          className="hidden rounded-3xl border border-line bg-white p-5 shadow-sm lg:block"
          aria-label="Mục lục"
        >
          <h3 className="flex items-center gap-2 text-sm font-semibold text-heading">
            <NotebookPen size={16} className="text-primary-600" /> Mục lục
          </h3>
          <ol className="relative mt-4 space-y-1 border-l border-line">
            {toc.map((item) => {
              const active = item.id === activeId;
              return (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      document
                        .getElementById(item.id)
                        ?.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        });
                    }}
                    className={`-ml-px block border-l-2 py-1.5 text-[13px] leading-snug transition ${
                      item.level === 3 ? "pl-6" : "pl-4"
                    } ${
                      active
                        ? "border-primary-600 font-semibold text-primary-700"
                        : "border-transparent text-body hover:border-primary-200 hover:text-heading"
                    }`}
                  >
                    <span className="line-clamp-2">{item.text}</span>
                  </a>
                </li>
              );
            })}
          </ol>
        </nav>
      )}

      {project && (
        <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 to-primary-900 p-6 text-white shadow-xl shadow-primary-200">
          {/* Ảnh dự án làm nền, phủ tím đậm dần xuống dưới cho chữ trắng dễ đọc; chưa có ảnh thì giữ nền gradient + icon chìm */}
          {projectInfo?.overviewImage ? (
            <>
              <img
                src={projectInfo.overviewImage}
                alt=""
                className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
              />
              <div
                className="absolute inset-0 bg-gradient-to-b from-primary-900/30 via-primary-900/60 to-ink-950/90"
                aria-hidden
              />
            </>
          ) : (
            <Building2
              size={120}
              strokeWidth={1}
              className="absolute -bottom-6 -right-6 text-white/10"
              aria-hidden
            />
          )}
          <span className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
            <Building2 size={20} />
          </span>
          <p className="relative mt-16 text-[11px] uppercase tracking-[0.18em] text-white/75">
            Dự án liên quan
          </p>
          <p className="relative mt-1 text-xl font-semibold drop-shadow">{project.name}</p>
          {projectInfo?.location && (
            <p className="relative mt-1.5 flex items-start gap-1.5 text-xs text-white/80">
              <MapPin size={13} className="mt-0.5 shrink-0" />
              <span className="line-clamp-2">{projectInfo.location}</span>
            </p>
          )}
          <Link
            to={`/projects/${project.id}`}
            className="relative mt-5 flex items-center justify-center gap-2 rounded-full bg-white py-2.5 text-sm font-semibold text-primary-700 transition hover:bg-primary-50"
          >
            Xem dự án <ArrowRight size={15} />
          </Link>
        </div>
      )}

      {latest.length > 0 && (
        <div className="rounded-3xl border border-line bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-heading">Tin mới nhất</h3>
          <ul className="mt-3 divide-y divide-line">
            {latest.map((n) => (
              <li key={n.id}>
                <Link to={`/news/${n.id}`} className="group flex gap-3 py-3">
                  <img
                    src={n.images[0]?.imageUrl || FALLBACK_THUMB}
                    alt={n.title}
                    loading="lazy"
                    className="h-16 w-20 shrink-0 bg-primary-50 object-cover transition group-hover:opacity-90"
                  />
                  <div className="min-w-0">
                    <p className="line-clamp-2 text-sm font-medium leading-snug text-heading group-hover:text-primary-600">
                      {n.title}
                    </p>
                    <p className="mt-1 text-[11px] text-muted">
                      {formatDate(n.createdAt)}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  );
}
