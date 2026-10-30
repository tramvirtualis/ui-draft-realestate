import { Link } from "react-router-dom";
import JobSearchBar from "./JobSearchBar";
import { useJobs } from "../../hooks/job/useJobs";
import { DEFAULT_JOB_FILTER, JOB_SORT, type JobFilter } from "../../types/job/job.types";

// Gợi ý vị trí: bấm là tìm theo từ khóa đó
const QUICK_ROLES = ["Chuyên viên kinh doanh", "Trưởng nhóm kinh doanh", "Marketing bất động sản", "Thực tập sinh"];

// Hero trang tuyển dụng theo kiểu trang Dự án: tiêu đề in hoa có phần chữ gradient, số tin đang tuyển cỡ lớn,
// quầng màu mờ phía sau; bên dưới là bảng tìm kiếm kính (ô tìm + gợi ý vị trí)
export default function RecruitmentHero({
  filter,
  onSearch,
}: {
  filter: JobFilter;
  onSearch: (f: JobFilter) => void;
}) {
  // Tổng số tin đang tuyển (không theo bộ lọc) — chỉ cần tổng nên lấy 1 bản ghi
  const { result, loading } = useJobs({ filter: DEFAULT_JOB_FILTER, sort: JOB_SORT.NEWEST, page: 0, size: 1 });

  return (
    <section className="relative isolate overflow-hidden bg-page-glow pb-14 pt-8 md:pb-20 md:pt-12">
      <span aria-hidden className="pointer-events-none absolute -right-24 -top-24 -z-10 h-96 w-96 rounded-full bg-primary-300/40 blur-3xl" />
      <span aria-hidden className="pointer-events-none absolute -left-32 top-1/2 -z-10 h-80 w-80 rounded-full bg-primary-200/60 blur-3xl" />

      <div className="container mx-auto px-4 lg:px-8">
        <nav aria-label="Breadcrumb" className="font-heading text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
          <Link to="/" className="transition hover:text-primary-600">
            Trang chủ
          </Link>
          <span className="mx-2 text-primary-300">/</span>
          <span aria-current="page" className="text-primary-600">
            Tuyển dụng
          </span>
        </nav>

        <div className="mt-8 grid items-end gap-10 lg:grid-cols-[1fr_auto]">
          <div>
            <h1 className="heading-display animate-rise-in text-[2.6rem] font-medium uppercase leading-[1.15]! tracking-[-0.03em] text-heading sm:text-6xl lg:text-7xl">
              <span className="block text-gradient-accent">Tuyển dụng</span>
              bất động sản
            </h1>
            <p className="animate-rise-in mt-6 max-w-xl leading-relaxed text-body [animation-delay:150ms]">
              Tìm công việc phù hợp, đúng dự án và vai trò theo năng lực của bạn cùng các nhà tuyển dụng uy tín trong ngành.
            </p>
          </div>

          <div className="animate-rise-in flex items-end gap-4 border-l border-primary-300/60 pl-6 [animation-delay:250ms]">
            <p className="heading-display text-7xl font-light tabular-nums tracking-[-0.04em] text-gradient-accent md:text-8xl" aria-live="polite">
              {loading ? "··" : String(result.totalElements).padStart(2, "0")}
            </p>
            <p className="pb-2 font-heading text-xs font-bold uppercase leading-snug tracking-[0.16em] text-body">
              Vị trí
              <br />
              đang tuyển
            </p>
          </div>
        </div>

        <div className="animate-rise-in mt-12 rounded-[2rem] border border-white/80 bg-white/50 p-3 shadow-[0_30px_60px_-30px_rgba(63,42,107,0.45)] backdrop-blur-xl [animation-delay:350ms] md:p-4">
          <JobSearchBar key={`${filter.keyword}|${filter.location}`} value={filter} onSearch={onSearch} />

          <div className="flex flex-wrap items-center gap-2 px-2 pb-1 pt-4 text-xs">
            <span className="mr-1 font-heading text-[10px] font-bold uppercase tracking-[0.18em] text-muted">Gợi ý</span>
            {QUICK_ROLES.map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => onSearch({ ...filter, keyword: role })}
                aria-pressed={filter.keyword === role}
                className={`rounded-full border px-3 py-1.5 font-medium transition ${
                  filter.keyword === role
                    ? "btn-gloss border-transparent text-white"
                    : "border-white/80 bg-white/80 text-heading hover:border-primary-300 hover:text-primary-700"
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
