import { CheckCheck } from "lucide-react";

/** Nút "Đã đọc tất cả"; mờ đi khi không còn thông báo chưa đọc */
export default function MarkAllReadButton({ unread, onClick }: { unread: number; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={unread === 0}
      className="flex items-center gap-1.5 text-xs font-medium text-body transition hover:text-primary-600 disabled:cursor-default disabled:text-gray-300"
    >
      <CheckCheck size={14} aria-hidden /> Đã đọc tất cả
    </button>
  );
}
