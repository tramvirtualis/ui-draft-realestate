import axios from "axios";
import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { store } from "../../store";
import { BASE_CONFIG } from "./config";
import { refreshAccessToken, waitForRefresh } from "./refreshToken";
import { trackRequest, untrackRequest } from "./pendingRequests";

// Public: không token, không chuyển trang khi 401
export const publicApi: AxiosInstance = axios.create(BASE_CONFIG);

// Auth: tự gắn Bearer token, 401 → refresh rồi gọi lại, refresh hỏng → về login
export const authApi: AxiosInstance = axios.create(BASE_CONFIG);

const redirectToLogin = () => {
  if (window.location.pathname === "/login") return;
  // Lưu trang hiện tại để đăng nhập xong quay lại đúng chỗ
  const redirect = encodeURIComponent(window.location.pathname + window.location.search);
  window.location.href = `/login?redirect=${redirect}`;
};

// 1. Trước khi gửi: gắn access token
authApi.interceptors.request.use(async (config) => {
  // Mở app lần đầu mà chưa có token → chờ phiên được khôi phục từ cookie
  await waitForRefresh();
  trackRequest(config);
  const token = store.getState().auth.accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean };

// 2. Sau khi nhận: gặp 401 → refresh token rồi gửi lại request
authApi.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetryConfig | undefined;

    // Chỉ thử refresh 1 lần cho mỗi request, tránh lặp vô hạn
    if (error.response?.status !== 401 || !original || original._retry) {
      return Promise.reject(error);
    }
    original._retry = true;

    try {
      const token = await refreshAccessToken();
      original.headers.Authorization = `Bearer ${token}`;
      return authApi(original);
    } catch {
      redirectToLogin();
      return Promise.reject(error);
    }
  }
);

// 3. Đăng ký sau bước refresh → chỉ chạy khi có kết quả cuối: tắt lớp loading toàn cục
authApi.interceptors.response.use(
  (response) => {
    untrackRequest(response.config);
    return response;
  },
  (error: AxiosError) => {
    untrackRequest(error.config);
    return Promise.reject(error);
  }
);
