import { useCallback, useEffect, useState } from "react";
import notificationService from "../../services/notification/notificationService";
import { getErrorMessage } from "../../api";
import { selectIsAuthenticated, useAppSelector } from "../../store";
import {
  notifyNotificationsChanged,
  useOnNotificationsChanged,
} from "../../components/Notification/notificationSync";
import type {
  NotificationItem,
  NotificationTab,
  NotificationTypeItem,
  UnreadCount,
} from "../../types/notification.types";

const PAGE_SIZE = 10;
const EMPTY_UNREAD: UnreadCount = { total: 0, byType: {} };

/**
 * Danh sách thông báo cho ngăn kéo và trang Thông báo. Tab đang chọn là state riêng của từng nơi;
 * "đã đọc" lưu ở BE, đánh dấu ở đâu thì nơi khác tải lại (xem notificationSync).
 */
export default function useNotifications() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const [source] = useState(() => Symbol("notifications"));

  const [types, setTypes] = useState<NotificationTypeItem[]>([]);
  const [tab, setTab] = useState<NotificationTab>("ALL");
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [unread, setUnread] = useState<UnreadCount>(EMPTY_UNREAD);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  // Tab lọc lấy từ các loại thông báo đang hiện
  useEffect(() => {
    if (!isAuthenticated) return;
    notificationService
      .getTypes()
      .then(setTypes)
      .catch(() => setTypes([]));
  }, [isAuthenticated]);

  const loadUnread = useCallback(() => {
    notificationService
      .getUnreadCount()
      .then(setUnread)
      .catch(() => undefined);
  }, []);

  // Đổi tab / tải lại → lấy lại trang đầu
  useEffect(() => {
    if (!isAuthenticated) return;
    let ignore = false;
    setLoading(true);
    setError(null);

    notificationService
      .getMine(tab === "ALL" ? undefined : tab, 0, PAGE_SIZE)
      .then((res) => {
        if (ignore) return;
        setItems(res.content);
        setPage(0);
        setTotalPages(res.totalPages);
      })
      .catch((err) => {
        if (ignore) return;
        setItems([]);
        setError(getErrorMessage(err));
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    loadUnread();

    return () => {
      ignore = true;
    };
  }, [isAuthenticated, tab, reloadKey, loadUnread]);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);
  useOnNotificationsChanged(reload, source);

  const loadMore = async () => {
    const next = page + 1;
    try {
      const res = await notificationService.getMine(
        tab === "ALL" ? undefined : tab,
        next,
        PAGE_SIZE
      );
      setItems((prev) => [...prev, ...res.content]);
      setPage(next);
      setTotalPages(res.totalPages);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  // Chuyển trang (trang Thông báo): thay danh sách bằng trang được chọn
  const goToPage = async (next: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await notificationService.getMine(
        tab === "ALL" ? undefined : tab,
        next,
        PAGE_SIZE
      );
      setItems(res.content);
      setPage(next);
      setTotalPages(res.totalPages);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const markRead = async (id: number) => {
    const target = items.find((n) => n.id === id);
    if (!target || target.isRead) return;

    // Cập nhật giao diện trước, lỗi thì tải lại từ BE
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    setUnread((prev) => ({
      total: Math.max(0, prev.total - 1),
      byType: {
        ...prev.byType,
        [target.notificationTypeId]: Math.max(
          0,
          (prev.byType[target.notificationTypeId] ?? 0) - 1
        ),
      },
    }));
    try {
      await notificationService.markRead(id);
      notifyNotificationsChanged(source);
    } catch {
      reload();
    }
  };

  const markAllRead = async () => {
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnread(EMPTY_UNREAD);
    try {
      await notificationService.markAllRead();
      notifyNotificationsChanged(source);
    } catch {
      reload();
    }
  };

  const unreadOf = (t: NotificationTab) =>
    t === "ALL" ? unread.total : unread.byType[t] ?? 0;

  return {
    types,
    tab,
    setTab,
    unreadOf,
    items,
    loading,
    error,
    hasMore: page + 1 < totalPages,
    loadMore,
    page,
    totalPages,
    goToPage,
    markRead,
    markAllRead,
  };
}
