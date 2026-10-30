import { Link } from "react-router-dom";
import { Eye, Pencil, Trash2 } from "lucide-react";
import DocumentThumb from "../../Knowledge/DocumentThumb";
import DocumentKindBadge from "../../Knowledge/DocumentKindBadge";
import { formatFileSize } from "../../Knowledge/knowledgeHelpers";
import { formatDate, formatTime } from "../../../utils/formatDate";
import type { DocumentItem } from "../../../types/document.types";

type Props = {
  items: DocumentItem[];
  busyId?: number | null;
  onTogglePublished: (doc: DocumentItem) => void;
  onDelete: (doc: DocumentItem) => void;
};

const btn = "flex h-8 w-8 items-center justify-center rounded-lg transition focus-visible:outline-2 focus-visible:outline-primary-600 active:scale-95";
const TH = "px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-muted";

export default function DocumentTable({ items, busyId = null, onTogglePublished, onDelete }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[900px] text-left text-sm">
        <thead className="bg-primary-50/60">
          <tr>
            <th className={TH}>Tài liệu</th>
            <th className={TH}>Loại</th>
            <th className={TH}>Danh mục</th>
            <th className={TH}>Trạng thái</th>
            <th className={TH}>Cập nhật</th>
            <th className={TH} />
          </tr>
        </thead>
        <tbody>
          {items.map((d) => (
            <tr key={d.id} className="border-t border-line transition hover:bg-primary-50/40">
              <td className="max-w-[400px] px-4 py-3">
                <div className="flex items-center gap-3">
                  <DocumentThumb doc={d} iconSize={18} className="h-14 w-20 shrink-0 rounded-lg" />
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-footer" title={d.title}>{d.title}</p>
                    <p className="mt-0.5 truncate text-xs text-body">
                      {d.type === "FILE" ? `${d.originalFileName ?? ""} ${d.fileSize ? `· ${formatFileSize(d.fileSize)}` : ""}` : d.description || `/${d.slug}`}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3"><DocumentKindBadge doc={d} /></td>
              <td className="px-4 py-3 text-heading">{d.category?.name ?? "—"}</td>
              <td className="px-4 py-3">
                <button
                  type="button"
                  onClick={() => onTogglePublished(d)}
                  disabled={busyId === d.id}
                  title={d.published ? "Bấm để ẩn" : "Bấm để hiển thị"}
                  className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold transition hover:opacity-80 disabled:opacity-50 ${
                    d.published ? "bg-success/10 text-success" : "bg-line text-body"
                  }`}
                >
                  <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${d.published ? "bg-success" : "bg-muted"}`} />
                  {d.published ? "Đang hiển thị" : "Đang ẩn"}
                </button>
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-xs text-body">{formatDate(d.updatedAt)} · {formatTime(d.updatedAt)}</td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1.5">
                  {d.published && (
                    <Link to={`/knowledge/${d.slug}`} target="_blank" aria-label={`Xem ${d.title}`} title="Xem trên website" className={`${btn} text-body hover:bg-primary-50`}>
                      <Eye size={16} />
                    </Link>
                  )}
                  <Link to={`/admin/documents/${d.id}/edit`} aria-label={`Sửa ${d.title}`} title="Sửa" className={`${btn} text-body hover:bg-primary-50`}>
                    <Pencil size={16} />
                  </Link>
                  <button onClick={() => onDelete(d)} aria-label={`Xóa ${d.title}`} title="Xóa" className={`${btn} bg-danger/10 text-danger hover:bg-danger/20`}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
