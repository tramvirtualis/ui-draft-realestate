export type NotificationTargetType =
  | "EVENT"
  | "NEWS"
  | "JOB"
  | "APPLICATION"
  | "PROJECT"
  | "POST"
  | "BOOKING"
  | "PROPERTY"
  | "SYSTEM";

// Một thông báo của người dùng đang đăng nhập (UserNotificationResponse) 
export interface NotificationItem {
  id: number; // id của bản ghi user_notification, dùng để đánh dấu đã đọc / xoá
  isRead: boolean;
  readAt: string | null;
  notificationId: number;
  title: string;
  content: string;
  image: string | null;
  targetType: NotificationTargetType | null;
  targetId: number | null;
  actionUrl: string | null;
  createdAt: string;
  notificationTypeId: number;
  notificationTypeName: string;
}

// Loại thông báo đang hiện, dùng dựng tab lọc (NotificationTypeResponse) 
export interface NotificationTypeItem {
  id: number;
  name: string;
  isActive: boolean;
  createdAt: string;
}

// Số chưa đọc: total cho chuông, byType (key là notificationTypeId) cho từng tab 
export interface UnreadCount {
  total: number;
  byType: Record<number, number>;
}

// "ALL" hoặc id loại thông báo
export type NotificationTab = "ALL" | number;

/** Thông báo gốc phía admin (NotificationResponse) */
export interface AdminNotification {
  id: number;
  notificationTypeId: number;
  notificationTypeName: string;
  createdBy: number | null;
  title: string;
  content: string;
  image: string | null;
  targetType: NotificationTargetType | null;
  targetId: number | null;
  actionUrl: string | null;
  isActive: boolean; // false là đang ẩn
  sendEmail: boolean; // có gửi kèm email
  createdAt: string;
  recipientCount: number; // số người nhận
  readCount: number; // số người đã đọc
}

/** Body tạo / sửa thông báo. Không gửi userIds thì BE gửi cho tất cả tài khoản đang hoạt động */
export interface NotificationInput {
  notificationTypeId: number;
  title: string;
  content: string;
  actionUrl: string | null; // sửa: "" để xóa link, null thì BE giữ nguyên
  userIds?: number[];
  sendEmail?: boolean; // chỉ dùng khi tạo: gửi kèm email cho người nhận
}

// Body tạo / sửa loại thông báo 
export interface NotificationTypeInput {
  name: string;
  isActive: boolean;
}
