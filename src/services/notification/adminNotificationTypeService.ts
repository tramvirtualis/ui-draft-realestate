import BaseService from "../base/BaseService";
import type { NotificationTypeInput, NotificationTypeItem } from "../../types/notification.types";

/** Admin quản lý loại thông báo: /admin/notification-types (trả cả loại đang ẩn) */
class AdminNotificationTypeService extends BaseService {
  constructor() {
    super("/admin/notification-types");
  }

  list() {
    return this.getList<NotificationTypeItem>();
  }

  get(id: number) {
    return this.getById<NotificationTypeItem>(id);
  }

  add(input: NotificationTypeInput) {
    return this.create<NotificationTypeItem, NotificationTypeInput>(input);
  }

  edit(id: number, input: NotificationTypeInput) {
    return this.update<NotificationTypeItem, NotificationTypeInput>(id, input);
  }

  remove(id: number) {
    return this.delete(id);
  }

  // PATCH /{id}/toggle: không có body, trả về loại sau khi đổi
  toggle(id: number) {
    return this.http.patch<NotificationTypeItem>(this.url(id, "toggle"));
  }
}

export const adminNotificationTypeService = new AdminNotificationTypeService();
