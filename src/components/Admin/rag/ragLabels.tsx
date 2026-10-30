import type { RagDocumentStatus, RagProjectStatus } from "../../../types/rag/rag.types";

type Status = RagDocumentStatus | RagProjectStatus;

export const STATUS_LABEL: Record<Status, { label: string; dot: string; badge: string }> = {
  INDEXED: { label: "Đã index", dot: "bg-success", badge: "bg-green-50 text-green-700 ring-green-200" },
  PENDING: { label: "Chờ index", dot: "bg-warning", badge: "bg-amber-50 text-amber-700 ring-amber-200" },
  NOT_INDEXED: { label: "Chưa index", dot: "bg-warning", badge: "bg-amber-50 text-amber-700 ring-amber-200" },
  FAILED: { label: "Lỗi", dot: "bg-danger", badge: "bg-red-50 text-red-700 ring-red-200" },
  SKIPPED: { label: "Bỏ qua", dot: "bg-muted", badge: "bg-gray-50 text-gray-600 ring-gray-200" },
};

// Tên phần của chunk (cột section bên RAG)
export const SECTION_LABEL: Record<string, string> = {
  overview: "Tổng quan",
  content: "Nội dung",
  file: "File",
  location: "Vị trí",
};

export function StatusBadge({ status }: { status: Status }) {
  const s = STATUS_LABEL[status];
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${s.badge}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} /> {s.label}
    </span>
  );
}
