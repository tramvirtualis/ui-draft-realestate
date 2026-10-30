import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, ChevronDown, LayoutGrid, List, MapPin, RotateCw } from "lucide-react";
import { useSeo } from "../../../hooks/useSeo";
import { useProjectList } from "../../../hooks/project/useProjectList";
import ProjectsHero from "../../../components/Project/List/ProjectsHero";
import { toCardData, type ProjectCardData } from "../../../components/Project/List/projectCardData";
import {
  EMPTY_FILTERS,
  SORT_OPTIONS,
  activeChips,
  applyFilters,
  applySort,
  filterOptions,
  pageNumbers,
  type ProjectFilters,
  type ProjectSort,
} from "../../../components/Project/List/projectFilters";
import { EdgeTag, MONO, OrganicDivider, P, PaintImage, paintText } from "../../../components/Home/urbanUi";

/* Trang danh sách dự án (/projects), cùng phong cách trang chủ Hubtech:
   đầu trang ProjectsHero (tìm kiếm + loại hình + bộ lọc); bên dưới lưới thẻ đều 3 cột (ảnh sơn màu khi rê chuột) hoặc danh sách dạng bảng.
   Dữ liệu và bộ lọc thật (useProjectList + projectFilters). Header / footer / chatbot do UserLayout lo. */

const PAGE_SIZE = 9;
type View = "grid" | "list";

const pad = (n: number) => String(n).padStart(2, "0");

// Thẻ dự án dạng lưới
function GridCard({ p, no }: { p: ProjectCardData; no: number }) {
  return (
    <Link to={`/projects/${p.id}`} className="group block">
      <div className="relative">
        <EdgeTag>{p.type}</EdgeTag>
        <PaintImage src={p.image} alt={p.name} className="aspect-[4/3]" />
      </div>
      <div className="mt-4 flex items-start justify-between gap-4 border-t pt-4" style={{ borderColor: P.black }}>
        <div className="min-w-0">
          <p className="text-xs" style={{ fontFamily: MONO, color: P.green }}>
            {pad(no)}
          </p>
          {/* Tên luôn chiếm đúng 2 dòng (dài thì cắt "…") để các thẻ cao bằng nhau */}
          <h3 className={`mt-1 line-clamp-2 min-h-[2.5em] text-xl font-medium uppercase leading-tight tracking-tight ${paintText}`} title={p.name}>
            {p.name}
          </h3>
          <p className="mt-2 flex items-center gap-1.5 text-sm" style={{ color: P.muted }}>
            <MapPin size={13} className="shrink-0" /> <span className="truncate">{p.location}</span>
          </p>
        </div>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-colors group-hover:border-[#a67d12] group-hover:bg-[#a67d12] group-hover:text-[#faf5f0]" style={{ borderColor: P.black }}>
          <ArrowUpRight size={16} />
        </span>
      </div>
    </Link>
  );
}

// Một dòng dạng bảng: rê chuột thì nền xanh nhạt quét ngang + ảnh nhỏ hiện ra
function ListRow({ p, no }: { p: ProjectCardData; no: number }) {
  return (
    <li className="border-b" style={{ borderColor: P.black }}>
      <Link to={`/projects/${p.id}`} className="group relative grid grid-cols-[3rem_1fr_auto] items-center gap-4 overflow-hidden py-5 md:grid-cols-[4rem_1.6fr_1fr_1fr_8rem_3rem]">
        <span className="absolute inset-0 -z-10 origin-left scale-x-0 transition-transform duration-500 ease-[cubic-bezier(0.65,0,0.35,1)] group-hover:scale-x-100" style={{ background: P.mint }} aria-hidden />
        <span className="pl-3 text-sm" style={{ fontFamily: MONO, color: P.green }}>
          {pad(no)}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-lg font-medium uppercase tracking-tight transition-colors group-hover:text-[#a67d12] md:text-2xl">{p.name}</span>
          <span className="block truncate text-xs md:hidden" style={{ color: P.muted }}>
            {p.location}
          </span>
        </span>
        <span className="hidden truncate text-sm md:block" style={{ color: P.muted }}>
          {p.location}
        </span>
        <span className="hidden truncate text-sm md:block">{p.investor}</span>
        <span className="hidden h-16 w-28 overflow-hidden md:block">
          <img src={p.image} alt="" loading="lazy" className="h-full w-full translate-y-full object-cover opacity-0 transition duration-500 group-hover:translate-y-0 group-hover:opacity-100" />
        </span>
        <ArrowUpRight size={20} className="mr-3 justify-self-end transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#a67d12]" />
      </Link>
    </li>
  );
}

export default function ProjectsPage() {
  useSeo({
    title: "Dự án · Hubtech",
    description: "Toàn bộ dự án đang mở bán và sắp ra mắt: lọc theo khu vực, chủ đầu tư, loại hình.",
    canonical: `${window.location.origin}/projects`,
  });

  const { projects, loading, error, reload } = useProjectList();
  const [filters, setFilters] = useState<ProjectFilters>(EMPTY_FILTERS);
  const [sort, setSort] = useState<ProjectSort>("newest");
  const [page, setPage] = useState(1);
  const [view, setView] = useState<View>("grid");
  const resultsRef = useRef<HTMLElement>(null);

  const options = useMemo(() => filterOptions(projects), [projects]);
  const matched = useMemo(() => applySort(applyFilters(projects, filters), sort), [projects, filters, sort]);
  const chips = activeChips(filters);
  const totalPages = Math.max(1, Math.ceil(matched.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const shown = matched.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE).map(toCardData);
  const offset = (current - 1) * PAGE_SIZE;


  const change = (next: Partial<ProjectFilters>) => {
    setFilters((f) => ({ ...f, ...next }));
    setPage(1);
  };
  const goPage = (n: number) => {
    setPage(n);
    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="overflow-x-clip" style={{ color: P.black }}>
      {/* Đầu trang như cũ (tiêu đề + khung tìm kiếm + loại hình + 2 bộ lọc) */}
      <ProjectsHero
        total={projects.length}
        loading={loading}
        filters={filters}
        investors={options.investors}
        areas={options.areas}
        chips={chips}
        onChange={change}
        onClearFilters={() => change(EMPTY_FILTERS)}
        onSubmit={() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
      />
      {/* ================= Kết quả ================= */}
      <section ref={resultsRef} className="relative scroll-mt-24" style={{ background: P.card }}>
        <OrganicDivider color={P.card} variant="wave" />
        <div className="mx-auto max-w-[1440px] px-5 pb-24 pt-14 md:px-10 md:pb-32">
          {/* Số kết quả + sắp xếp + kiểu xem */}
          <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
            <p className="text-xs uppercase tracking-wider" style={{ fontFamily: MONO, color: P.muted }}>
              {loading ? "Đang tải…" : `${matched.length} dự án${chips.length ? " phù hợp" : ""}`}
            </p>
            <div className="flex items-center gap-3">
              <label className="relative flex items-center gap-2 border-b pb-1 text-sm" style={{ borderColor: P.black }}>
                <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: P.muted }}>
                  Sắp xếp
                </span>
                <select
                  value={sort}
                  onChange={(e) => {
                    setSort(e.target.value as ProjectSort);
                    setPage(1);
                  }}
                  className="cursor-pointer appearance-none bg-transparent pr-5 font-medium outline-none"
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="pointer-events-none absolute right-0" />
              </label>
              <div className="flex border" style={{ borderColor: P.black }}>
                {(
                  [
                    ["grid", LayoutGrid, "Lưới"],
                    ["list", List, "Danh sách"],
                  ] as const
                ).map(([v, Icon, label]) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setView(v)}
                    aria-pressed={view === v}
                    aria-label={label}
                    className="flex h-9 w-10 items-center justify-center transition-colors"
                    style={{ background: view === v ? P.black : "transparent", color: view === v ? P.bg : P.black }}
                  >
                    <Icon size={16} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[4/3]" style={{ background: P.blush }} />
                  <div className="mt-4 h-5 w-2/3" style={{ background: P.blush }} />
                  <div className="mt-2 h-4 w-1/2" style={{ background: P.blush }} />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="border-y py-16 text-center" style={{ borderColor: P.black }}>
              <p className="text-2xl font-medium uppercase tracking-tight">Không tải được dự án</p>
              <button type="button" onClick={reload} className="mt-6 inline-flex items-center gap-2 px-5 py-3 text-sm font-medium uppercase tracking-wide text-[#faf5f0]" style={{ background: P.green }}>
                <RotateCw size={15} /> Thử lại
              </button>
            </div>
          ) : shown.length === 0 ? (
            <div className="border-y py-16 text-center" style={{ borderColor: P.black }}>
              <p className="text-2xl font-medium uppercase tracking-tight">Không có dự án phù hợp</p>
              <button type="button" onClick={() => change(EMPTY_FILTERS)} className="mt-4 text-sm underline underline-offset-4" style={{ color: P.green }}>
                Xoá bộ lọc
              </button>
            </div>
          ) : (
            <>
              {view === "grid" ? (
                // Lưới đều: mọi thẻ cùng kích thước, thẳng hàng
                <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                  {shown.map((p, i) => (
                    <GridCard key={p.id} p={p} no={offset + i + 1} />
                  ))}
                </div>
              ) : (
                <ul className="border-t" style={{ borderColor: P.black }}>
                  {shown.map((p, i) => (
                    <ListRow key={p.id} p={p} no={offset + i + 1} />
                  ))}
                </ul>
              )}

              {/* Phân trang */}
              {totalPages > 1 && (
                <nav className="mt-20 flex items-center justify-center gap-1" style={{ fontFamily: MONO }} aria-label="Phân trang">
                  {pageNumbers(current, totalPages).map((n, i) =>
                    n === "…" ? (
                      <span key={`e${i}`} className="px-2" style={{ color: P.muted }}>
                        …
                      </span>
                    ) : (
                      <button
                        key={n}
                        type="button"
                        onClick={() => goPage(n)}
                        aria-current={n === current ? "page" : undefined}
                        className="h-10 min-w-10 px-2 text-sm transition-colors hover:text-[#a67d12]"
                        style={{ background: n === current ? P.green : "transparent", color: n === current ? P.bg : P.black }}
                      >
                        {pad(n)}
                      </button>
                    ),
                  )}
                </nav>
              )}
            </>
          )}
        </div>
      </section>

    </div>
  );
}
