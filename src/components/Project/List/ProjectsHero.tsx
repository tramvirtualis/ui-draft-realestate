import { useEffect, useRef, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Search, X, RotateCcw } from "lucide-react";
import FilterSelect from "./FilterSelect";
import { TYPE_OPTIONS, type ProjectFilters } from "./projectFilters";

type Props = {
  /** Tổng số dự án đang công khai (chưa lọc) */
  total: number;
  loading: boolean;
  filters: ProjectFilters;
  investors: string[];
  areas: string[];
  chips: { key: keyof ProjectFilters; label: string }[];
  onChange: (next: Partial<ProjectFilters>) => void;
  onClearFilters: () => void;
  /** Bấm "Tìm kiếm" / Enter: cuộn tới kết quả (lọc đã chạy ngay khi gõ) */
  onSubmit: () => void;
};

const SHORTCUT = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.userAgent) ? "⌘ K" : "Ctrl K";

// Đầu trang danh sách dự án kiểu dàn trang tạp chí: chữ "DỰ ÁN" viền khổng lồ chìm phía sau, quầng tím mờ,
// tiêu đề grotesk có phần chữ gradient, số dự án cỡ lớn; bên dưới là bảng tìm kiếm kính (ô tìm + loại hình + 2 bộ lọc + chip đang lọc)
export default function ProjectsHero({ total, loading, filters, investors, areas, chips, onChange, onClearFilters, onSubmit }: Props) {
  const searchRef = useRef<HTMLInputElement>(null);

  // ⌘K / Ctrl+K: đưa con trỏ vào ô tìm kiếm
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <section className="relative isolate overflow-hidden bg-page-glow pb-14 pt-8 md:pb-20 md:pt-12">
      {/* Trang trí: chữ viền khổng lồ + hai quầng tím mờ */}
      <span
        aria-hidden
        className="heading-display pointer-events-none absolute -bottom-[0.18em] -right-[0.04em] -z-10 select-none text-[30vw] font-semibold uppercase leading-none! tracking-[-0.05em] text-transparent [-webkit-text-stroke:1.5px_var(--color-primary-300)] opacity-60 md:text-[24vw]"
      >
        Dự án
      </span>
      <span aria-hidden className="pointer-events-none absolute -right-24 -top-24 -z-10 h-96 w-96 rounded-full bg-primary-300/40 blur-3xl" />
      <span aria-hidden className="pointer-events-none absolute -left-32 top-1/2 -z-10 h-80 w-80 rounded-full bg-primary-200/60 blur-3xl" />

      <div className="container mx-auto px-4 lg:px-8">
        <nav aria-label="Breadcrumb" className="font-heading text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
          <Link to="/" className="transition hover:text-primary-600">
            Trang chủ
          </Link>
          <span className="mx-2 text-primary-300">/</span>
          <span aria-current="page" className="text-primary-600">
            Dự án
          </span>
        </nav>

        <div className="mt-8 grid items-end gap-10 lg:grid-cols-[1fr_auto]">
          <div>
            {/* In hoa, khít chữ như trang chủ; giãn dòng 1.15 đủ cho chữ hoa có dấu (Á, Ự, Ấ, Ộ) không chạm dòng trên */}
            <h1 className="heading-display animate-rise-in text-[2.6rem] font-medium uppercase leading-[1.15]! tracking-[-0.03em] text-heading sm:text-6xl lg:text-7xl">
              <span className="block text-gradient-accent">Dự án</span>
              bất động sản
            </h1>
            <p className="animate-rise-in mt-6 max-w-xl leading-relaxed text-body [animation-delay:150ms]">
              Dữ liệu xác thực, tiến độ minh bạch và lựa chọn phù hợp — giúp bạn tìm đúng dự án chỉ trong vài phút.
            </p>
          </div>

          <div className="animate-rise-in flex items-end gap-4 border-l border-primary-300/60 pl-6 [animation-delay:250ms]">
            <p className="heading-display text-7xl font-light tabular-nums tracking-[-0.04em] text-gradient-accent md:text-8xl" aria-live="polite">
              {loading ? "··" : String(total).padStart(2, "0")}
            </p>
            <p className="pb-2 font-heading text-xs font-bold uppercase leading-snug tracking-[0.16em] text-body">
              Dự án
              <br />
              đang giới thiệu
            </p>
          </div>
        </div>

        <form
          onSubmit={submit}
          role="search"
          className="animate-rise-in mt-12 rounded-[2rem] border border-white/80 bg-white/50 p-3 shadow-[0_30px_60px_-30px_rgba(63,42,107,0.45)] backdrop-blur-xl [animation-delay:350ms] md:p-4"
        >
          <div className="flex items-center gap-3 rounded-[1.4rem] bg-white py-2 pl-5 pr-2 shadow-sm ring-1 ring-primary-100 transition focus-within:ring-4 focus-within:ring-primary-200">
            <Search size={18} className="shrink-0 text-primary-500" />
            <input
              ref={searchRef}
              type="search"
              value={filters.keyword}
              onChange={(e) => onChange({ keyword: e.target.value })}
              aria-label="Tìm dự án"
              placeholder='Tên dự án, địa chỉ hoặc chủ đầu tư, ví dụ "Thủ Đức"'
              className="h-10 min-w-0 flex-1 bg-transparent text-sm text-heading outline-none placeholder:text-muted md:text-base"
            />
            <kbd className="hidden rounded-md border border-line bg-primary-50 px-2 py-1 font-sans text-[10px] font-semibold text-muted sm:block">
              {SHORTCUT}
            </kbd>
            <button
              type="submit"
              className="btn-gloss flex h-11 shrink-0 items-center gap-2 rounded-full px-5 font-heading text-xs font-bold uppercase tracking-widest text-white transition hover:-translate-y-0.5"
            >
              <Search size={15} /> <span className="hidden sm:inline">Tìm kiếm</span>
            </button>
          </div>

          <div className="grid gap-4 px-2 pb-2 pt-5 md:grid-cols-[auto_1fr_1fr]">
            <fieldset>
              <legend className="mb-1.5 font-heading text-[10px] font-bold uppercase tracking-[0.18em] text-muted">Loại hình</legend>
              <div className="flex h-12 rounded-2xl border border-white/80 bg-white/70 p-1 backdrop-blur">
                {TYPE_OPTIONS.map((t) => (
                  <button
                    key={t.value || "all"}
                    type="button"
                    aria-pressed={filters.type === t.value}
                    onClick={() => onChange({ type: t.value })}
                    className={`flex-1 whitespace-nowrap rounded-xl px-4 text-sm font-semibold transition md:flex-none ${
                      filters.type === t.value ? "btn-gloss text-white" : "text-body hover:text-primary-600"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </fieldset>
            <FilterSelect
              label="Chủ đầu tư"
              placeholder="Tất cả chủ đầu tư"
              value={filters.investor}
              options={investors}
              onChange={(investor) => onChange({ investor })}
            />
            <FilterSelect
              label="Khu vực"
              placeholder="Tất cả khu vực"
              value={filters.area}
              options={areas}
              onChange={(area) => onChange({ area })}
            />
          </div>

          {chips.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 border-t border-white/80 px-2 pb-1 pt-4 text-xs text-muted">
              <span className="font-heading font-bold uppercase tracking-[0.14em]">Đang lọc</span>
              {chips.map((c) => (
                <span
                  key={c.key}
                  className="flex items-center gap-1.5 rounded-full border border-primary-200 bg-white/80 py-1 pl-3 pr-1.5 font-medium text-primary-700"
                >
                  {c.label}
                  <button
                    type="button"
                    aria-label={`Bỏ lọc ${c.label}`}
                    onClick={() => onChange({ [c.key]: "" } as Partial<ProjectFilters>)}
                    className="flex h-5 w-5 items-center justify-center rounded-full transition hover:bg-primary-100"
                  >
                    <X size={11} />
                  </button>
                </span>
              ))}
              <button
                type="button"
                onClick={onClearFilters}
                className="ml-auto flex items-center gap-1.5 font-semibold text-primary-600 transition hover:text-primary-700"
              >
                <RotateCcw size={12} /> Xóa bộ lọc
              </button>
            </div>
          )}
        </form>
      </div>
    </section>
  );
}
