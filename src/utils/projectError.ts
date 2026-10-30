import { getErrorStatus } from "../api/errors";

export const PROJECT_UNAVAILABLE = "Dự án này hiện chưa mở thông tin trên Đất Việt Group. Mời quý khách tham khảo các dự án đang được giới thiệu khác.";

// Thông điệp thân thiện cho khách khi không xem được dự án (không lộ mã lỗi hay id từ máy chủ)
export function projectLoadError(err: unknown): string {
  const status = getErrorStatus(err);
  if (status === 404 || status === 400) return PROJECT_UNAVAILABLE;
  if (status === 0) return "Kết nối đang gián đoạn nên chưa tải được thông tin dự án. Quý khách vui lòng thử lại sau ít phút.";
  return "Thông tin dự án đang được cập nhật. Quý khách vui lòng quay lại sau ít phút.";
}
