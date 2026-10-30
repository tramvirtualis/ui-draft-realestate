import axios from "axios";
import { store } from "../../store";
import { clearAuth, setAccessToken } from "../../store/authSlice";
import { AUTH_ENDPOINTS } from "../endpoints";
import { BASE_CONFIG } from "./config";

// Instance riêng, không gắn interceptor → refresh lỗi không bị lặp lại refresh
const refreshApi = axios.create(BASE_CONFIG);

/**
 Chỉ cho chạy 1 lần refresh tại một thời điểm.
 BE xoay vòng refresh token (rotation): 2 lần refresh song song thì lần sau
 dùng token đã bị thu hồi → lỗi. Nên mọi nơi cùng chờ chung 1 promise.
 */
let refreshPromise: Promise<string> | null = null;

export const refreshAccessToken = (): Promise<string> => {
  if (!refreshPromise) {
    refreshPromise = refreshApi
      .post<{ data: { token: string } }>(AUTH_ENDPOINTS.REFRESH)
      .then((res) => {
        const token = res.data.data.token;
        store.dispatch(setAccessToken(token));
        return token;
      })
      .catch((err) => {
        store.dispatch(clearAuth());
        throw err;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
};

// Nếu đang refresh thì chờ xong (thành công hay thất bại đều được)
export const waitForRefresh = async (): Promise<void> => {
  if (refreshPromise) {
    await refreshPromise.catch(() => undefined);
  }
};
