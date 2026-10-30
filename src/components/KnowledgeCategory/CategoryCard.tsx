import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { categoryIcon, categoryPath } from "../Knowledge/knowledgeHelpers";
import type { DocumentCategoryWithCount } from "../../types/document.types";

type Props = {
  category: DocumentCategoryWithCount;
  index: number; // vị trí trong danh sách, để chọn icon
  total: number; // tổng tài liệu, để vẽ thanh tỉ lệ
};

// Thẻ danh mục ở trang Tất cả danh mục: icon, tên, số tài liệu, thanh tỉ lệ so với tổng
export default function CategoryCard({ category, index, total }: Props) {
  const Icon = categoryIcon(index);
  const percent = total > 0 ? Math.round((category.documentCount / total) * 100) : 0;

  return (
    <Link
      to={categoryPath(category.slug)}
      className="group flex flex-col rounded-3xl border border-line bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-lg hover:shadow-primary-100"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 transition group-hover:bg-primary-600 group-hover:text-white">
          <Icon size={22} />
        </span>
        <span className="rounded-full bg-primary-50 px-3 py-1 text-[11px] font-semibold text-primary-700">{category.documentCount} tài liệu</span>
      </div>

      <h2 className="mt-5 text-xl font-semibold text-heading group-hover:text-primary-600">{category.name}</h2>

      <div className="mt-4" aria-hidden>
        <div className="h-1.5 overflow-hidden rounded-full bg-primary-50">
          <div className="h-full rounded-full bg-primary-500" style={{ width: `${percent}%` }} />
        </div>
        <p className="mt-1.5 text-[11px] text-muted">{percent}% thư viện</p>
      </div>

      <span className="mt-6 flex items-center gap-1.5 text-sm font-semibold text-primary-600">
        Xem tài liệu <ArrowRight size={15} className="transition group-hover:translate-x-1" />
      </span>
    </Link>
  );
}
