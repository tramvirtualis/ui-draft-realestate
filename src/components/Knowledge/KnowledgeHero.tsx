import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import type { FormEvent } from "react";
import type { DocumentCategory } from "../../types/document.types";

type Props = {
  keywordDraft: string;
  setKeywordDraft: (value: string) => void;
  onSearch: (e: FormEvent<HTMLFormElement>) => void;
  categories: DocumentCategory[];
  onPickCategory: (id: number | null) => void;
  /** [0] = tổng tài liệu (số lớn), các mục sau hiện dạng dòng phụ */
  stats: { value: string | number; label: string }[];
};

// Hero trang Kiến thức theo kiểu trang Dự án: tiêu đề in hoa có phần chữ gradient, số tài liệu cỡ lớn,
// quầng màu mờ phía sau; bên dưới là bảng tìm kiếm kính (ô tìm + danh mục gợi ý)
export default function KnowledgeHero({ keywordDraft, setKeywordDraft, onSearch, categories, onPickCategory, stats }: Props) {
  const [main, ...rest] = stats;
  const mainValue = typeof main?.value === "number" ? String(main.value).padStart(2, "0") : (main?.value ?? "··");

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
            Kiến thức
          </span>
        </nav>

        <div className="mt-8 grid items-end gap-10 lg:grid-cols-[1fr_auto]">
          <div>
            <h1 className="heading-display animate-rise-in text-[2.6rem] font-medium uppercase leading-[1.15]! tracking-[-0.03em] text-heading sm:text-6xl lg:text-7xl">
              <span className="block text-gradient-accent">Kiến thức</span>
              bất động sản
            </h1>
            <p className="animate-rise-in mt-6 max-w-xl leading-relaxed text-body [animation-delay:150ms]">
              Tra cứu pháp lý, quy trình mua bán và tài liệu tham khảo. Đọc ngay trên web hoặc tải về máy.
            </p>
            {rest.length > 0 && (
              <p className="animate-rise-in mt-4 flex flex-wrap gap-x-5 gap-y-1 font-heading text-[11px] font-bold uppercase tracking-[0.14em] text-muted [animation-delay:200ms]">
                {rest.map((s) => (
                  <span key={s.label}>
                    <span className="text-heading">{s.value}</span> {s.label}
                  </span>
                ))}
              </p>
            )}
          </div>

          {main && (
            <div className="animate-rise-in flex items-end gap-4 border-l border-primary-300/60 pl-6 [animation-delay:250ms]">
              <p className="heading-display text-7xl font-light tabular-nums tracking-[-0.04em] text-gradient-accent md:text-8xl" aria-live="polite">
                {mainValue}
              </p>
              <p className="pb-2 font-heading text-xs font-bold uppercase leading-snug tracking-[0.16em] text-body">
                {main.label}
                <br />
                đang chia sẻ
              </p>
            </div>
          )}
        </div>

        <form
          onSubmit={onSearch}
          role="search"
          className="animate-rise-in mt-12 rounded-[2rem] border border-white/80 bg-white/50 p-3 shadow-[0_30px_60px_-30px_rgba(63,42,107,0.45)] backdrop-blur-xl [animation-delay:350ms] md:p-4"
        >
          <div className="flex items-center gap-3 rounded-[1.4rem] bg-white py-2 pl-5 pr-2 shadow-sm ring-1 ring-primary-100 transition focus-within:ring-4 focus-within:ring-primary-200">
            <Search size={18} className="shrink-0 text-primary-500" />
            <input
              type="search"
              value={keywordDraft}
              onChange={(e) => setKeywordDraft(e.target.value)}
              placeholder='Tìm tài liệu, ví dụ "sổ hồng", "hợp đồng đặt cọc"…'
              aria-label="Tìm tài liệu"
              className="h-10 min-w-0 flex-1 bg-transparent text-sm text-heading outline-none placeholder:text-muted md:text-base"
            />
            <button
              type="submit"
              className="btn-gloss flex h-11 shrink-0 items-center gap-2 rounded-full px-5 font-heading text-xs font-bold uppercase tracking-widest text-white transition hover:-translate-y-0.5"
            >
              <Search size={15} /> <span className="hidden sm:inline">Tìm kiếm</span>
            </button>
          </div>

          {categories.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 px-2 pb-1 pt-4 text-xs">
              <span className="mr-1 font-heading text-[10px] font-bold uppercase tracking-[0.18em] text-muted">Danh mục</span>
              {categories.slice(0, 6).map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => onPickCategory(c.id)}
                  className="rounded-full border border-white/80 bg-white/80 px-3 py-1.5 font-medium text-heading transition hover:border-primary-300 hover:text-primary-700"
                >
                  {c.name}
                </button>
              ))}
            </div>
          )}
        </form>
      </div>
    </section>
  );
}
