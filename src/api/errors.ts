import { isAxiosError } from "axios";

export const getErrorStatus = (err: unknown): number =>
  isAxiosError(err) ? err.response?.status ?? 0 : 0;

// Lấy message tiếng Việt BE trả về để hiển thị cho người dùng
export const getErrorMessage = (err: unknown): string => {
  if (isAxiosError<{ message?: string }>(err)) {
    if (!err.response) return "Không kết nối được máy chủ";
    return err.response.data?.message ?? "Đã có lỗi xảy ra, vui lòng thử lại";
  }
  return "Đã có lỗi xảy ra, vui lòng thử lại";
};
