import { isAxiosError } from "axios"; // ← thêm
import type { AxiosInstance, AxiosRequestConfig } from "axios";
import { authApi, publicApi } from "./core/axiosClient";
import type { PageResponse } from "../types/event/event.types"; // ← thêm

/**
 BE bọc kết quả trong ApiResponse { code, message, data } → chỉ lấy data.
 */
const unwrap = <T>(body: unknown): T => {
  if (
    body &&
    typeof body === "object" &&
    "data" in body &&
    ("code" in body || "status" in body)
  ) {
    return (body as { data: T }).data;
  }
  return body as T;
};

// Tạo bộ hàm get/post/put/patch/delete có kiểu rõ ràng từ 1 axios instance
const createHttp = (instance: AxiosInstance) => ({
  get: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> =>
    unwrap<T>((await instance.get(url, config)).data),

  post: async <T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> => unwrap<T>((await instance.post(url, data, config)).data),

  put: async <T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> => unwrap<T>((await instance.put(url, data, config)).data),

  patch: async <T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> => unwrap<T>((await instance.patch(url, data, config)).data),

  delete: async <T = void>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<T> => unwrap<T>((await instance.delete(url, config)).data),
});

// API công khai
export const publicHttp = createHttp(publicApi);

// API cần đăng nhập
export const authHttp = createHttp(authApi);

// Bỏ các param rỗng trước khi gửi query string
export const cleanParams = (obj: object): Record<string, unknown> =>
  Object.fromEntries(
    Object.entries(obj).filter(
      ([, v]) => v !== "" && v !== null && v !== undefined
    )
  );

/* ================= THÊM MỚI ================= */

// Page của Spring (có 2 dạng: cũ và mới có object "page")
export interface SpringPage<T> {
  content?: T[];
  totalElements?: number;
  totalPages?: number;
  number?: number;
  size?: number;
  // Dạng Page của Spring 4: object; dạng PageResponse của BE: số trang hiện tại (0-based)
  page?:
    | {
        size: number;
        number: number;
        totalElements: number;
        totalPages: number;
      }
    | number;
}

// Gom 2 dạng Page của Spring về 1 dạng PageResponse
export const toPage = <T>(p: SpringPage<T>): PageResponse<T> => {
  const meta = typeof p.page === "object" ? p.page : undefined;
  return {
    content: p.content ?? [],
    totalElements: meta?.totalElements ?? p.totalElements ?? 0,
    totalPages: Math.max(1, meta?.totalPages ?? p.totalPages ?? 1),
    number: meta?.number ?? (typeof p.page === "number" ? p.page : undefined) ?? p.number ?? 0,
    size: meta?.size ?? p.size ?? 0,
  };
};

// Lấy câu báo lỗi từ BE (ApiResponse.message)
export const getErrorMessage = (err: unknown): string => {
  if (isAxiosError<{ message?: string }>(err)) {
    if (!err.response) return "Không kết nối được máy chủ";
    return err.response.data?.message ?? "Đã có lỗi xảy ra, vui lòng thử lại";
  }
  return "Đã có lỗi xảy ra, vui lòng thử lại";
};
