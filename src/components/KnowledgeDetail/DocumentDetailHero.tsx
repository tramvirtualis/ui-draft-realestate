import { CalendarDays, Download, ExternalLink, RefreshCw } from "lucide-react";
import Breadcrumb from "../common/Breadcrumb";
import DocumentKindBadge from "../Knowledge/DocumentKindBadge";
import { categoryPath, downloadUrl, formatFileSize } from "../Knowledge/knowledgeHelpers";
import { formatDate } from "../../utils/formatDate";
import type { DocumentItem } from "../../types/document.types";

export default function DocumentDetailHero({ doc }: { doc: DocumentItem }) {
  const file = doc.fileUrl;

  return (
    <section className="bg-gradient-to-b from-primary-100 via-primary-50 to-page pb-24 pt-8">
      <div className="container mx-auto px-4 lg:px-8">
        <Breadcrumb
          items={[
            { label: "Trang chủ", to: "/" },
            { label: "Kiến thức", to: "/knowledge" },
            ...(doc.category ? [{ label: doc.category.name, to: categoryPath(doc.category.slug) }] : []),
            { label: doc.title },
          ]}
        />

        <div className="mt-8 max-w-4xl">
          <div className="flex flex-wrap items-center gap-2">
            {doc.category && (
              <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase text-primary-700">{doc.category.name}</span>
            )}
            <DocumentKindBadge doc={doc} />
          </div>
          <h1 className="mt-4 text-3xl font-bold leading-tight text-heading md:text-5xl">{doc.title}</h1>
          {doc.description && <p className="mt-4 max-w-3xl text-[15px] leading-relaxed text-body">{doc.description}</p>}

          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-body">
            <span className="flex items-center gap-1.5"><CalendarDays size={14} /> Đăng {formatDate(doc.createdAt)}</span>
            <span className="flex items-center gap-1.5"><RefreshCw size={14} /> Cập nhật {formatDate(doc.updatedAt)}</span>
            {file && doc.fileSize && <span>{doc.originalFileName ?? "Tệp đính kèm"} · {formatFileSize(doc.fileSize)}</span>}
          </div>

          {file && (
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={downloadUrl(file)}
                className="flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-200 transition hover:bg-primary-700 active:scale-95"
              >
                <Download size={16} /> Tải xuống
              </a>
              <a
                href={file}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-xl border border-line bg-white px-5 py-3 text-sm font-semibold text-heading transition hover:bg-primary-50"
              >
                <ExternalLink size={16} /> Mở tab mới
              </a>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
