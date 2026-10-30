import BaseService from "../base/BaseService";
import type { PageResponse } from "../../types/common.types";
import type { AdminNotification, NotificationInput } from "../../types/notification.types";

// PageResponse của BE: "page" là số trang (không phải object) nên không dùng toPage()
interface BePage<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

/** Admin soạn và quản lý thông báo: /admin/notifications (cần quyền ADMIN) */
class AdminNotificationService extends BaseService {
  constructor() {
    super("/admin/notifications");
  }

  // GET /admin/notifications?typeId=&page=&size=  (typeId 0 là lấy tất cả)
  async search(typeId: number, page: number, size: number): Promise<PageResponse<AdminNotification>> {
    const res = await this.http.get<BePage<AdminNotification>>(this.url(), {
      params: { typeId: typeId || undefined, page, size },
    });
    return {
      content: res.content ?? [],
      totalElements: res.totalElements ?? 0,
      totalPages: Math.max(1, res.totalPages ?? 1),
      number: res.page ?? page,
      size: res.size ?? size,
    };
  }

  get(id: number) {
    return this.getById<AdminNotification>(id);
  }

  add(input: NotificationInput) {
    return this.create<AdminNotification, NotificationInput>(input);
  }

  edit(id: number, input: NotificationInput) {
    return this.update<AdminNotification, NotificationInput>(id, input);
  }

  // PATCH /{id}/toggle: không có body, trả về thông báo sau khi đổi ẩn/hiện
  toggle(id: number) {
    return this.http.patch<AdminNotification>(this.url(id, "toggle"));
  }

  remove(id: number) {
    return this.delete(id);
  }
}

export const adminNotificationService = new AdminNotificationService();
