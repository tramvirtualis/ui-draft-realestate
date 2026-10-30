import { useMemo } from "react";
import { Download, Paperclip } from "lucide-react";
import { sanitizeHtml } from "../../utils/richText";
import { downloadUrl, formatFileSize } from "../Knowledge/knowledgeHelpers";
import type { DocumentItem } from "../../types/document.types";

// Nội dung bài viết (HTML đã sanitize ở BE, làm sạch thêm 1 lần ở FE) + file đính kèm nếu có
export default function DocumentArticle({ doc }: { doc: DocumentItem }) {
  const html = useMemo(() => sanitizeHtml(doc.content ?? ""), [doc.content]);

  return (
    <article className="rounded-3xl border border-line bg-white p-6 shadow-sm md:p-10">
      <div className="rich-content" dangerouslySetInnerHTML={{ __html: html }} />

      {doc.fileUrl && (
        <a
          href={downloadUrl(doc.fileUrl)}
          className="mt-10 flex items-center gap-4 rounded-2xl border border-primary-200 bg-primary-50/60 p-4 transition hover:bg-primary-50"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-primary-600"><Paperclip size={18} /></span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold text-heading">{doc.originalFileName ?? "Tệp đính kèm"}</span>
            <span className="text-xs text-body">{formatFileSize(doc.fileSize)}</span>
          </span>
          <Download size={18} className="shrink-0 text-primary-600" />
        </a>
      )}
    </article>
  );
}
