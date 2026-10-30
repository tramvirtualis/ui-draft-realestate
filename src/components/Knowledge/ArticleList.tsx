import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import DocumentThumb from "./DocumentThumb";
import DocumentKindBadge from "./DocumentKindBadge";
import { formatFileSize } from "./knowledgeHelpers";
import { formatDate } from "../../utils/formatDate";
import type { DocumentItem } from "../../types/document.types";

type Props = {
  rows: DocumentItem[];
  loading: boolean;
  error: string | null;
  emptyText: string;
};

export default function ArticleList({ rows, loading, error, emptyText }: Props) {
  if (loading) {
    return (
      <ul className="animate-pulse divide-y divide-line rounded-3xl border border-line bg-white px-5" aria-busy="true">
        {[0, 1, 2].map((n) => (
          <li key={n} className="flex gap-5 py-5">
            <div className="h-[96px] w-[132px] shrink-0 rounded-xl bg-primary-50" />
            <div className="flex-1 space-y-3"><div className="h-3 w-24 rounded bg-primary-50" /><div className="h-4 w-full rounded bg-primary-50" /><div className="h-3 w-2/3 rounded bg-primary-50" /></div>
          </li>
        ))}
      </ul>
    );
  }

  if (error || rows.length === 0) {
    return (
      <p role={error ? "alert" : undefined} className="rounded-3xl border border-line bg-white py-14 text-center text-sm text-body">
        {error ?? emptyText}
      </p>
    );
  }

  return (
    <ul className="divide-y divide-line rounded-3xl border border-line bg-white px-5 shadow-sm">
      {rows.map((d) => (
        <li key={d.id}>
          <Link to={`/knowledge/${d.slug}`} className="group flex gap-4 py-5 sm:gap-5">
            <DocumentThumb doc={d} className="h-[84px] w-[110px] shrink-0 rounded-xl sm:h-[96px] sm:w-[132px]" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 text-[11px]">
                {d.category && <span className="rounded-full bg-primary-100 px-2.5 py-1 font-semibold text-primary-700">{d.category.name}</span>}
                <DocumentKindBadge doc={d} />
                {d.fileSize && d.type === "FILE" && <span className="text-muted">{formatFileSize(d.fileSize)}</span>}
              </div>
              <h3 className="mt-2 line-clamp-2 text-base font-semibold leading-snug text-heading group-hover:text-primary-600">{d.title}</h3>
              {d.description && <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-body">{d.description}</p>}
              <p className="mt-2 text-[11px] text-muted">
                Đăng {formatDate(d.createdAt)}
                {d.updatedAt.slice(0, 10) !== d.createdAt.slice(0, 10) && ` · Cập nhật ${formatDate(d.updatedAt)}`}
              </p>
            </div>
            <ChevronRight size={16} className="mt-1 hidden shrink-0 text-primary-600 transition group-hover:translate-x-0.5 sm:block" />
          </Link>
        </li>
      ))}
    </ul>
  );
}
