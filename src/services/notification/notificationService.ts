import BaseService from "../base/BaseService";
import type { PageResponse } from "../../types/common.types";
import type {
  NotificationItem,
  NotificationTypeItem,
  UnreadCount,
} from "../../types/notification.types";

// PageResponse của BE: { content, page, size, totalElements, totalPages } — "page" là số trang
interface BePage<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

/** Thông báo của người đang đăng nhập: /me/notifications (cần token) */
class NotificationService extends BaseService {
  constructor() {
    super("/me/notifications");
  }

  // GET /me/notifications?typeId=&page=&size=  (typeId bỏ trống là lấy tất cả)
  async getMine(typeId: number | undefined, page = 0, size = 10): Promise<PageResponse<NotificationItem>> {
    const res = await this.http.get<BePage<NotificationItem>>(this.url(), {
      params: { typeId, page, size },
    });
    return {
      content: res.content ?? [],
      totalElements: res.totalElements,
      totalPages: res.totalPages,
      number: res.page,
      size: res.size,
    };
  }

  // GET /me/notifications/unread-count
  async getUnreadCount(): Promise<UnreadCount> {
    return this.http.get<UnreadCount>(this.url("unread-count"));
  }

  // PATCH /me/notifications/{id}/read
  async markRead(id: number): Promise<void> {
    await this.http.patch(this.url(id, "read"), undefined, { silentLoading: true });
  }

  // PATCH /me/notifications/read-all
  async markAllRead(): Promise<void> {
    await this.http.patch(this.url("read-all"), undefined, { silentLoading: true });
  }

  // GET /notification-types — các loại đang hiện, dựng tab lọc
  async getTypes(): Promise<NotificationTypeItem[]> {
    const data = await this.http.get<NotificationTypeItem[] | null>("/notification-types");
    return data ?? [];
  }
}

const notificationService = new NotificationService();
export default notificationService;
