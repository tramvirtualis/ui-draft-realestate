import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import Heading from "./KnowledgeHeading";
import DocumentThumb from "./DocumentThumb";
import DocumentKindBadge from "./DocumentKindBadge";
import { formatDate } from "../../utils/formatDate";
import type { DocumentCategory, DocumentItem } from "../../types/document.types";

type Props = {
  items: DocumentItem[];
  loading: boolean;
  categories: DocumentCategory[];
  featuredCat: number | null;
  setFeaturedCat: (id: number | null) => void;
};

export default function FeaturedContent({ items, loading, categories, featuredCat, setFeaturedCat }: Props) {
  const [main, ...side] = items;
  const tabs = [{ id: null as number | null, name: "Tất cả" }, ...categories.slice(0, 3)];

  return (
    <section className="py-14">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <Heading eyebrow="Mới cập nhật" title="Tài liệu nổi bật" desc="Các tài liệu vừa được bổ sung hoặc cập nhật gần đây." />
          <div className="flex flex-wrap gap-2">
            {tabs.map((c) => (
              <button
                key={c.id ?? "all"}
                type="button"
                onClick={() => setFeaturedCat(c.id)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-medium ${featuredCat === c.id ? "bg-primary-100 text-primary-700" : "border border-line bg-white text-body"}`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="mt-8 grid animate-pulse gap-5 lg:grid-cols-[1.2fr_1fr]">
            <div className="h-[400px] rounded-3xl bg-primary-50" />
            <div className="space-y-4">{[0, 1, 2].map((n) => <div key={n} className="h-28 rounded-2xl bg-primary-50" />)}</div>
          </div>
        ) : main ? (
          <div className="mt-8 grid gap-5 lg:grid-cols-[1.2fr_1fr]">
            <Link to={`/knowledge/${main.slug}`} className="group relative block min-h-[320px] overflow-hidden rounded-3xl lg:min-h-[400px]">
              <DocumentThumb doc={main} iconSize={56} className="absolute inset-0 h-full w-full transition duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-footer via-footer/50 to-transparent" />
              <div className="absolute left-5 top-5 flex gap-2">
                {main.category && (
                  <span className="rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-semibold uppercase text-primary-700">{main.category.name}</span>
                )}
                <DocumentKindBadge doc={main} />
              </div>
              <div className="absolute inset-x-6 bottom-6 text-white">
                <h3 className="max-w-md text-2xl font-semibold leading-snug">{main.title}</h3>
                {main.description && <p className="mt-3 line-clamp-2 text-xs text-white/80">{main.description}</p>}
                <p className="mt-3 text-[11px] text-white/70">Cập nhật {formatDate(main.updatedAt)}</p>
              </div>
            </Link>
            <div className="flex flex-col gap-4">
              {side.map((d) => (
                <Link
                  key={d.id}
                  to={`/knowledge/${d.slug}`}
                  className="flex items-center gap-4 rounded-2xl border border-line bg-white p-3 shadow-sm transition hover:border-primary-200 hover:shadow-md"
                >
                  <DocumentThumb doc={d} className="h-24 w-28 shrink-0 rounded-xl" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-semibold uppercase text-primary-600">{d.category?.name ?? "Tài liệu"}</p>
                    <h4 className="mt-1 line-clamp-2 text-sm font-semibold leading-snug text-heading">{d.title}</h4>
                    <p className="mt-1.5 flex items-center gap-2 text-[11px] text-muted">
                      <DocumentKindBadge doc={d} /> {formatDate(d.updatedAt)}
                    </p>
                  </div>
                  <ChevronRight size={16} className="shrink-0 text-primary-600" />
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <p className="mt-8 rounded-2xl border border-dashed border-primary-200 py-12 text-center text-sm text-body">Chưa có tài liệu thuộc danh mục này.</p>
        )}
      </div>
    </section>
  );
}
