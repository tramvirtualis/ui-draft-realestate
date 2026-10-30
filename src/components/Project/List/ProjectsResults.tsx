import type { Ref } from "react";
import { AlertTriangle, Building2, ChevronDown, ChevronLeft, ChevronRight, LayoutGrid, List, RotateCcw } from "lucide-react";
import ProjectCard from "./ProjectCard";
import Reveal from "../../common/Reveal";
import type { ProjectCardData } from "./projectCardData";
import { SORT_OPTIONS, type ProjectSort } from "./projectFilters";

export type ProjectsView = "grid" | "list";

type Props = {
  ref?: Ref<HTMLElement>;
  projects: ProjectCardData[];
  /** Số thứ tự của thẻ đầu trang hiện tại (đánh số 01, 02… liên tục qua các trang) */
  offset: number;
  loading?: boolean;
  error?: string;
  onRetry: () => void;
  /** Số dự án khớp bộ lọc */
  total: number;
  /** Đang bật ít nhất một bộ lọc */
  filtered: boolean;
  onClearFilters: () => void;
  sort: ProjectSort;
  onSortChange: (sort: ProjectSort) => void;
  view: ProjectsView;
  onViewChange: (view: ProjectsView) => void;
  page: number;
  totalPages: number;
  pages: readonly (number | string)[];
  onPageChange: (page: number) => void;
};

const VIEWS = [
  { key: "grid", icon: LayoutGrid, label: "Dạng lưới" },
  { key: "list", icon: List, label: "Dạng danh sách" },
] as const;

const PANEL = "rounded-[2rem] border border-white/80 bg-white/60 px-6 py-14 text-center backdrop-blur";

// Kết quả: thanh công cụ (số kết quả, sắp xếp, kiểu xem), lưới thẻ đều nhau, phân trang
export default function ProjectsResults({
  ref,
  projects,
  offset,
  loading,
  error,
  onRetry,
  total,
  filtered,
  onClearFilters,
  sort,
  onSortChange,
  view,
  onViewChange,
  page,
  totalPages,
  pages,
  onPageChange,
}: Props) {
  const grid = view === "grid";

  return (
    <section ref={ref} id="ket-qua" className="scroll-mt-24 bg-page pb-20 pt-12">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-primary-200/70 pb-6">
          <h2 className="heading-display text-3xl text-heading md:text-4xl" aria-live="polite">
            {loading ? (
              "Đang tải dự án…"
            ) : (
              <>
                <span className="text-gradient-accent">{total}</span> dự án phù hợp
              </>
            )}
          </h2>

          <div className="flex items-center gap-3">
            <label className="relative flex h-11 items-center rounded-full border border-white/80 bg-white/70 pl-4 text-xs text-muted backdrop-blur">
              <span className="font-heading font-bold uppercase tracking-[0.14em]">Sắp xếp</span>
              <select
                value={sort}
                onChange={(e) => onSortChange(e.target.value as ProjectSort)}
                className="h-full appearance-none bg-transparent pl-2 pr-9 text-sm font-semibold text-heading outline-none"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={15} className="pointer-events-none absolute right-3.5 text-primary-500" />
            </label>

            <div className="flex rounded-full border border-white/80 bg-white/70 p-1 backdrop-blur" role="group" aria-label="Kiểu hiển thị">
              {VIEWS.map(({ key, icon: Icon, label }) => (
                <button
                  key={key}
                  type="button"
                  aria-label={label}
                  aria-pressed={view === key}
                  onClick={() => onViewChange(key)}
                  className={`flex h-9 w-9 items-center justify-center rounded-full transition ${
                    view === key ? "btn-gloss text-white" : "text-muted hover:text-primary-600"
                  }`}
                >
                  <Icon size={15} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading && (
          <div role="status" className={`mt-8 grid gap-6 ${grid ? "md:grid-cols-2 lg:grid-cols-3" : ""}`}>
            <span className="sr-only">Đang tải dự án...</span>
            {Array.from({ length: grid ? 6 : 3 }, (_, i) => (
              <div key={i} className={`animate-pulse rounded-[1.75rem] bg-white/70 ${grid ? "h-[26rem]" : "h-64"}`} />
            ))}
          </div>
        )}

        {!loading && error && (
          <div role="alert" className={`mt-8 ${PANEL}`}>
            <AlertTriangle size={28} className="mx-auto text-danger" />
            <p className="mt-3 text-sm text-danger">{error}</p>
            <button
              type="button"
              onClick={onRetry}
              className="btn-gloss mt-5 inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-heading text-xs font-bold uppercase tracking-widest text-white"
            >
              <RotateCcw size={14} /> Thử lại
            </button>
          </div>
        )}

        {!loading && !error && projects.length === 0 && (
          <div className={`mt-8 ${PANEL}`}>
            <Building2 size={30} className="mx-auto text-primary-400" />
            <p className="mt-3 font-heading text-lg font-extrabold uppercase text-heading">
              {filtered ? "Không có dự án phù hợp" : "Chưa có dự án nào"}
            </p>
            {filtered && (
              <>
                <p className="mt-1 text-sm text-body">Thử bỏ bớt bộ lọc hoặc đổi từ khóa tìm kiếm.</p>
                <button
                  type="button"
                  onClick={onClearFilters}
                  className="mt-5 inline-flex items-center gap-2 rounded-full border border-primary-300 px-5 py-2.5 font-heading text-xs font-bold uppercase tracking-widest text-primary-600 transition hover:bg-primary-50"
                >
                  <RotateCcw size={14} /> Xóa bộ lọc
                </button>
              </>
            )}
          </div>
        )}

        {!loading && !error && projects.length > 0 && (
          <div className={`mt-8 grid gap-6 ${grid ? "auto-rows-fr md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
            {projects.map((p, i) => (
              <Reveal key={p.id} delay={grid ? (i % 3) * 110 : 0} variant={grid ? "up" : "left"} className="h-full">
                <ProjectCard project={p} view={view} index={offset + i + 1} />
              </Reveal>
            ))}
          </div>
        )}

        {!loading && !error && totalPages > 1 && (
          <nav aria-label="Phân trang" className="mt-14 flex items-center justify-center gap-2 text-sm">
            <button
              type="button"
              aria-label="Trang trước"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/80 bg-white/70 text-heading transition hover:text-primary-600 disabled:opacity-40"
            >
              <ChevronLeft size={16} />
            </button>
            {pages.map((n, i) =>
              typeof n === "string" ? (
                <span key={`gap-${i}`} className="px-1 text-muted">
                  {n}
                </span>
              ) : (
                <button
                  key={n}
                  type="button"
                  aria-current={page === n ? "page" : undefined}
                  onClick={() => onPageChange(n)}
                  className={`flex h-11 w-11 items-center justify-center rounded-full font-heading font-bold tabular-nums transition ${
                    page === n ? "btn-gloss text-white" : "text-body hover:bg-white/80 hover:text-primary-600"
                  }`}
                >
                  {String(n).padStart(2, "0")}
                </button>
              ),
            )}
            <button
              type="button"
              aria-label="Trang sau"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/80 bg-white/70 text-heading transition hover:text-primary-600 disabled:opacity-40"
            >
              <ChevronRight size={16} />
            </button>
          </nav>
        )}
      </div>
    </section>
  );
}
