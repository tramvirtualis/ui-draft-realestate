import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Heading from "./KnowledgeHeading";
import { CATEGORIES_PATH, categoryIcon, categoryPath } from "./knowledgeHelpers";
import type { DocumentCategoryWithCount } from "../../types/document.types";

type Props = {
  categories: DocumentCategoryWithCount[];
  total: number;
  loading: boolean;
};

// Trang Thư viện chỉ hiện vài danh mục đầu, phần còn lại xem ở trang Tất cả danh mục
const PREVIEW = 3;

export default function CategoryGrid({ categories, total, loading }: Props) {
  if (!loading && categories.length === 0) return null;

  return (
    <section className="bg-primary-50/70 py-14">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <Heading eyebrow="Danh mục tài liệu" title="Kiến thức có cấu trúc, dễ tìm và dễ áp dụng" desc="Tài liệu được phân loại theo danh mục để bạn đi thẳng đến thông tin cần biết." />
          <div className="flex gap-8 text-right">
            <div><p className="text-2xl font-bold text-heading">{total}</p><p className="text-[11px] text-body">Tài liệu</p></div>
            <div><p className="text-2xl font-bold text-heading">{categories.length}</p><p className="text-[11px] text-body">Danh mục</p></div>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {loading
            ? [0, 1, 2].map((n) => <div key={n} className="h-32 animate-pulse rounded-2xl bg-white" />)
            : categories.slice(0, PREVIEW).map((c, i) => {
                const Icon = categoryIcon(i);
                return (
                  <Link
                    key={c.id}
                    to={categoryPath(c.slug)}
                    className="group rounded-2xl bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary-100"
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600 transition group-hover:bg-primary-600 group-hover:text-white">
                        <Icon size={19} />
                      </span>
                      <span className="text-[11px] font-medium text-muted">{c.documentCount} tài liệu</span>
                    </div>
                    <p className="mt-4 text-lg font-semibold text-heading">{c.name}</p>
                  </Link>
                );
              })}
        </div>

        {!loading && (
          <div className="mt-8 flex justify-center">
            <Link
              to={CATEGORIES_PATH}
              className="group flex items-center gap-2 rounded-full border border-primary-200 bg-white px-6 py-3 text-sm font-semibold text-primary-700 shadow-sm transition hover:bg-primary-600 hover:text-white"
            >
              Xem tất cả {categories.length} danh mục <ArrowRight size={16} className="transition group-hover:translate-x-1" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
