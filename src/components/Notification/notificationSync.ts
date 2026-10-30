import { useEffect } from "react";

/**
 * Ngăn kéo, trang Thông báo và số đếm ở Header gọi API riêng. Khi một nơi đánh dấu đã đọc,
 * phát sự kiện này để các nơi còn lại tải lại; nơi phát (source) đã tự cập nhật nên bỏ qua.
 */
const CHANGED = "notifications-changed";

export function notifyNotificationsChanged(source?: symbol) {
  window.dispatchEvent(new CustomEvent(CHANGED, { detail: source }));
}

export function useOnNotificationsChanged(onChange: () => void, source?: symbol) {
  useEffect(() => {
    const handler = (e: Event) => {
      if (source && (e as CustomEvent).detail === source) return;
      onChange();
    };
    window.addEventListener(CHANGED, handler);
    return () => window.removeEventListener(CHANGED, handler);
  }, [onChange, source]);
}
