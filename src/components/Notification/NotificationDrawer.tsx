import { useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import NotificationTabs from "./NotificationTabs";
import NotificationFeed from "./NotificationFeed";
import MarkAllReadButton from "./MarkAllReadButton";
import PushToggle from "./PushToggle";
import useNotifications from "../../hooks/notification/useNotifications";
import useFocusTrap from "../common/useFocusTrap";

/**
 * Ngăn kéo "Thông báo" mở từ chuông ở Header, dữ liệu lấy từ API /me/notifications.
 */
export default function NotificationDrawer({
  onClose,
}: {
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  useFocusTrap(panelRef, true, onClose);

  const {
    types,
    tab,
    setTab,
    unreadOf,
    items,
    loading,
    error,
    hasMore,
    loadMore,
    markRead,
    markAllRead,
  } = useNotifications();

  // render ra <body> để không bị giới hạn bởi Header (sticky) chứa nút chuông
  return createPortal(
    <div className="fixed inset-0 z-[80] overflow-hidden">
      <div
        className="absolute inset-0 bg-heading/40"
        onClick={onClose}
        aria-hidden
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="notification-title"
        tabIndex={-1}
        className="absolute inset-y-0 right-0 flex w-full max-w-[560px] flex-col bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 id="notification-title" className="text-xl font-bold text-footer">
            Thông báo
          </h2>
          <div className="flex items-center gap-4">
            <MarkAllReadButton unread={unreadOf("ALL")} onClick={markAllRead} />
            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng thông báo"
              className="rounded-full p-1 text-gray-400 transition hover:bg-gray-100 hover:text-heading"
            >
              <X size={22} />
            </button>
          </div>
        </div>

        <PushToggle />

        <NotificationTabs
          types={types}
          value={tab}
          unreadOf={unreadOf}
          onChange={setTab}
        />

        <div className="flex-1 overflow-y-auto px-5 pb-6 pt-1">
          <NotificationFeed
            items={items}
            loading={loading}
            error={error}
            hasMore={hasMore}
            onLoadMore={loadMore}
            onView={(id) => {
              markRead(id);
              onClose();
            }}
          />
        </div>
      </div>
    </div>,
    document.body
  );
}
