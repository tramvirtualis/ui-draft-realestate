import { Bell, Briefcase, CalendarDays, Info, Newspaper, Percent, ShoppingBag, type LucideIcon } from "lucide-react";
import type { NotificationItem, NotificationTargetType } from "../../types/notification.types";
import { encodePostId } from "../../utils/postCode";

interface NotificationMeta {
  icon: LucideIcon;
  iconClass: string;
  badgeClass: string;
}

// Loại thông báo do admin tạo nên không cố định: chọn icon theo từ khoá trong tên, màu xoay vòng theo id
const ICON_BY_KEYWORD: { match: RegExp; icon: LucideIcon }[] = [
  { match: /hoa hồng|commission/i, icon: Percent },
  { match: /đơn hàng|order|booking|giữ chỗ/i, icon: ShoppingBag },
  { match: /sự kiện|event/i, icon: CalendarDays },
  { match: /tuyển dụng|ứng tuyển|job/i, icon: Briefcase },
  { match: /tin tức|news/i, icon: Newspaper },
  { match: /thông tin|info|hệ thống/i, icon: Info },
];

// Màu ngữ nghĩa dùng bảng màu mặc định của Tailwind
const COLORS = [
  { iconClass: "bg-blue-500 text-white", badgeClass: "bg-blue-50 text-blue-600" },
  { iconClass: "bg-amber-500 text-white", badgeClass: "bg-amber-50 text-amber-600" },
  { iconClass: "bg-green-500 text-white", badgeClass: "bg-green-50 text-green-600" },
  { iconClass: "bg-violet-500 text-white", badgeClass: "bg-violet-50 text-violet-600" },
  { iconClass: "bg-rose-500 text-white", badgeClass: "bg-rose-50 text-rose-600" },
];

export function getNotificationMeta(typeId: number, typeName: string): NotificationMeta {
  const icon = ICON_BY_KEYWORD.find((k) => k.match.test(typeName))?.icon ?? Bell;
  return { icon, ...COLORS[Math.abs(typeId) % COLORS.length] };
}

// Không có actionUrl thì suy ra trang theo đối tượng thông báo trỏ tới
const TARGET_PATH: Partial<Record<NotificationTargetType, (id: number | null) => string>> = {
  EVENT: (id) => (id ? `/events/${id}` : "/events"),
  NEWS: (id) => (id ? `/news/${id}` : "/news"),
  JOB: (id) => (id ? `/jobs/${id}` : "/jobs"),
  PROJECT: (id) => (id ? `/projects/${id}` : "/projects"),
  APPLICATION: () => "/applications",
  BOOKING: () => "/account/bookings",
  POST: (id) => (id ? `/social?post=${encodePostId(id)}` : "/social"),
};

/** Đường dẫn mở khi bấm "Xem"; null nếu thông báo không trỏ đi đâu */
export function getNotificationHref(item: NotificationItem): string | null {
  if (item.actionUrl) return item.actionUrl;
  if (!item.targetType) return null;
  return TARGET_PATH[item.targetType]?.(item.targetId) ?? null;
}
