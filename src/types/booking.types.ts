// Bám theo API booking giữ chỗ (bảng bookings): mỗi booking giữ một căn trong thời hạn, admin xác nhận / từ chối / hoàn tất

export type BookingStatus = "PENDING" | "CONFIRMED" | "COMPLETED" | "REJECTED" | "EXPIRED" | "CANCELLED";
export type ProjectStatusCode = "PUBLISHED" | "HIDDEN" | "ARCHIVED";
export type PropertyStatusCode = "AVAILABLE" | "RESERVED" | "SOLD" | "RENTED";

export const BOOKING_STATUS_META: Record<BookingStatus, { label: string; badge: string; dot: string; note: string }> = {
  PENDING: { label: "Đang giữ chỗ", badge: "bg-warning/10 text-warning", dot: "bg-warning", note: "Chờ chuyên viên xác nhận trong thời hạn giữ chỗ" },
  CONFIRMED: { label: "Đã xác nhận", badge: "bg-primary-100 text-primary-700", dot: "bg-primary-600", note: "Căn đang được giữ cho bạn" },
  COMPLETED: { label: "Hoàn tất", badge: "bg-success/10 text-success", dot: "bg-success", note: "Giao dịch đã hoàn tất" },
  REJECTED: { label: "Bị từ chối", badge: "bg-danger/10 text-danger", dot: "bg-danger", note: "Yêu cầu không được chấp nhận" },
  EXPIRED: { label: "Hết hạn", badge: "bg-line text-body", dot: "bg-muted", note: "Quá thời hạn giữ chỗ, căn đã mở lại" },
  CANCELLED: { label: "Đã hủy", badge: "bg-line text-body", dot: "bg-muted", note: "Booking đã được hủy" },
};

export const BOOKING_STATUS_ORDER: BookingStatus[] = ["PENDING", "CONFIRMED", "COMPLETED", "REJECTED", "EXPIRED", "CANCELLED"];

// Booking còn giữ căn (khách có thể hủy, admin có thể xử lý)
export const isActiveBooking = (s: BookingStatus) => s === "PENDING" || s === "CONFIRMED";

export interface BookingDto {
  id: number;
  status: BookingStatus;
  propertyId: number;
  propertyCode: string;
  propertyStatus: PropertyStatusCode | null;
  zoneName: string;
  price: number | null;
  area: number | null;
  image: string | null;
  projectId: number;
  projectName: string;
  projectStatus: ProjectStatusCode;
  // Chỉ có ở API quản trị
  userId?: number | null;
  customerName?: string | null;
  customerEmail?: string | null;
  customerPhone?: string | null;
  assigneeId?: number | null;
  note: string | null;
  adminNote: string | null;
  requestTime: string;
  holdExpiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// Tình trạng giữ chỗ của khách: tự hủy liên tiếp đủ ngưỡng thì bị khóa, admin gỡ khóa
export interface BookingRestriction {
  blocked: boolean;
  consecutiveCancels: number;
  limit: number;
  blockedAt: string | null;
  // Chỉ có ở API quản trị
  userId?: number | null;
  customerName?: string | null;
  customerEmail?: string | null;
  customerPhone?: string | null;
}

export interface BookingStats {
  pending: number;
  confirmed: number;
  completed: number;
  rejected: number;
  expired: number;
  cancelled: number;
}
