import { useCallback, useEffect, useState } from "react";
import notificationService from "../../services/notification/notificationService";
import { selectIsAuthenticated, useAppSelector } from "../../store";
import { useOnNotificationsChanged } from "../../components/Notification/notificationSync";

/**
 * Số thông báo chưa đọc (số đếm ở menu Header).
 * Chỉ gọi API khi đã đăng nhập: gọi lúc chưa đăng nhập sẽ bị 401 và bị đá về trang login.
 */
export default function useUnreadNotificationCount(): number {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const [count, setCount] = useState(0);

  const load = useCallback(() => {
    if (!isAuthenticated) return;
    notificationService
      .getUnreadCount()
      .then((res) => setCount(res.total))
      .catch(() => undefined); // lỗi thì giữ số cũ, không làm hỏng Header
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) load();
    else setCount(0);
  }, [isAuthenticated, load]);

  useOnNotificationsChanged(load);

  return count;
}
