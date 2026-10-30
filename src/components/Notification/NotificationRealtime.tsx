import { useCallback, useEffect } from "react";
import { useToast } from "../common/toastContext";
import useNotificationStream from "../../hooks/notification/useNotificationStream";
import { notifyNotificationsChanged } from "./notificationSync";
import { enablePush } from "../../services/notification/pushService";
import { selectIsAuthenticated, useAppSelector } from "../../store";
import type { NotificationItem } from "../../types/notification.types";

// Đặt trong layout (bên trong ToastProvider): có thông báo mới thì hiện toast
// và báo chuông, ngăn kéo, trang Thông báo tải lại (qua sự kiện notifications-changed).

export default function NotificationRealtime() {
  const toast = useToast();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const onNotification = useCallback(
    (n: NotificationItem) => {
      notifyNotificationsChanged();
      // Hiện 8s (lâu hơn toast thường 3s), có nút đóng
      toast.show(n.title, "notification", 8000);
    },
    [toast]
  );

  useNotificationStream(onNotification);

  // FCM push: đã cho phép từ trước thì gửi lại token cho tài khoản vừa đăng nhập (không bật hộp hỏi quyền)
  useEffect(() => {
    if (isAuthenticated) enablePush(false).catch(() => undefined);
  }, [isAuthenticated]);

  return null;
}
