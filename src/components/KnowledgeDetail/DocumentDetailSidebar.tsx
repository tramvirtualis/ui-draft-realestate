import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import DocumentThumb from "../Knowledge/DocumentThumb";
import DocumentKindBadge from "../Knowledge/DocumentKindBadge";
import type { DocumentItem } from "../../types/document.types";

export default function DocumentDetailSidebar({ related }: { related: DocumentItem[] }) {
  return (
    <aside className="space-y-5 lg:sticky lg:top-24">
      {related.length > 0 && (
        <div className="rounded-3xl border border-line bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-heading">Tài liệu cùng danh mục</h3>
          <ul className="mt-4 space-y-4">
            {related.map((d) => (
              <li key={d.id}>
                <Link to={`/knowledge/${d.slug}`} className="group flex gap-3">
                  <DocumentThumb doc={d} iconSize={18} className="h-16 w-20 shrink-0 rounded-lg" />
                  <div className="min-w-0">
                    <p className="line-clamp-2 text-xs font-semibold leading-snug text-heading group-hover:text-primary-600">{d.title}</p>
                    <div className="mt-1.5"><DocumentKindBadge doc={d} /></div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Link
        to="/knowledge"
        className="flex items-center justify-center gap-2 rounded-2xl border border-line bg-white px-5 py-3 text-sm font-semibold text-heading shadow-sm transition hover:bg-primary-50"
      >
        <ArrowLeft size={16} /> Về thư viện kiến thức
      </Link>
    </aside>
  );
}
