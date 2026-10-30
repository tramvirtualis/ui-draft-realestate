import { authHttp, toPage, type SpringPage } from "../../api/http";
import type { PageResponse } from "../../types/common.types";
import type { BookingDto, BookingRestriction, BookingStats, BookingStatus } from "../../types/booking.types";

// Khách: giữ chỗ / xem / hủy booking của mình (cần đăng nhập)
async function create(propertyId: number, note?: string): Promise<BookingDto> {
  return authHttp.post<BookingDto>("/bookings", { propertyId, note: note?.trim() || undefined });
}

async function mine(params: { status?: BookingStatus; page?: number; size?: number } = {}): Promise<PageResponse<BookingDto>> {
  return toPage(await authHttp.get<SpringPage<BookingDto>>("/bookings/me", { params: { size: 10, ...params } }));
}

// Tôi có đang bị khóa giữ chỗ không, đã hủy liên tiếp bao nhiêu lần
async function myRestriction(): Promise<BookingRestriction> {
  return authHttp.get<BookingRestriction>("/bookings/me/restriction");
}

async function cancel(id: number, note?: string): Promise<BookingDto> {
  return authHttp.put<BookingDto>(`/bookings/${id}/cancel`, { note: note?.trim() || undefined });
}

// Admin: xem mọi booking (kể cả dự án đang ẩn) và xử lý
async function search(params: { status?: BookingStatus; projectId?: number; keyword?: string; page?: number; size?: number }): Promise<PageResponse<BookingDto>> {
  return toPage(await authHttp.get<SpringPage<BookingDto>>("/admin/bookings", { params: { size: 10, ...params, keyword: params.keyword?.trim() || undefined } }));
}

async function stats(projectId?: number): Promise<BookingStats> {
  return authHttp.get<BookingStats>("/admin/bookings/stats", { params: { projectId } });
}

// Admin chỉ xác nhận và chốt bán; hủy booking do khách tự làm
export type BookingAction = "confirm" | "complete";

async function act(id: number, action: BookingAction, note?: string): Promise<BookingDto> {
  return authHttp.put<BookingDto>(`/admin/bookings/${id}/${action}`, { note: note?.trim() || undefined });
}

// Khách bị khóa giữ chỗ và gỡ khóa
async function blockedCustomers(page = 0, size = 10): Promise<PageResponse<BookingRestriction>> {
  return toPage(await authHttp.get<SpringPage<BookingRestriction>>("/admin/bookings/blocked-customers", { params: { page, size } }));
}

async function unblock(userId: number): Promise<BookingRestriction> {
  return authHttp.put<BookingRestriction>(`/admin/bookings/blocked-customers/${userId}/unblock`);
}

export const bookingService = { create, mine, cancel, myRestriction };
export const adminBookingService = { search, stats, act, blockedCustomers, unblock };
