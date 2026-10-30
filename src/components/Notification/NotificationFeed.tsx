import { BellOff, Loader2 } from "lucide-react";
import NotificationCard from "./NotificationCard";
import type { NotificationItem } from "../../types/notification.types";

/** Danh sách thông báo; hiện trạng thái đang tải / lỗi / rỗng, và nút "Xem thêm" khi còn trang sau */
export default function NotificationFeed({
  items,
  loading,
  error,
  hasMore,
  onLoadMore,
  onView,
}: {
  items: NotificationItem[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  onLoadMore: () => void;
  onView: (id: number) => void;
}) {
  if (loading) {
    return (
      <div role="status" className="flex justify-center py-20 text-primary-400">
        <Loader2 size={28} className="animate-spin" aria-label="Đang tải thông báo" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div role="status" className="flex flex-col items-center py-20 text-center">
        <BellOff size={36} className="text-primary-300" aria-hidden />
        <p className="mt-4 text-sm font-medium text-heading">{error ? "Không tải được thông báo" : "Chưa có thông báo"}</p>
        <p className="mt-1 text-xs text-body">{error ?? "Thông báo mới sẽ xuất hiện tại đây."}</p>
      </div>
    );
  }

  return (
    <>
      <ul className="space-y-3">
        {items.map((n) => (
          <NotificationCard key={n.id} item={n} onView={onView} />
        ))}
      </ul>
      {error && <p className="mt-3 text-center text-xs text-danger">{error}</p>}
      {hasMore && (
        <button
          type="button"
          onClick={onLoadMore}
          className="mx-auto mt-4 block rounded-full border border-line px-5 py-2 text-xs font-semibold text-heading transition hover:border-primary-300 hover:text-primary-600"
        >
          Xem thêm
        </button>
      )}
    </>
  );
}
