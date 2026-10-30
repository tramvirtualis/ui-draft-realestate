import { useEffect, useRef } from "react";
import { BASE_CONFIG } from "../../api/core/config";
import { refreshAccessToken } from "../../api";
import { store, selectIsAuthenticated, useAppSelector } from "../../store";
import type { NotificationItem } from "../../types/notification.types";

const STREAM_URL = `${BASE_CONFIG.baseURL}/me/notifications/stream`;
const MAX_RETRY_DELAY = 30_000;

/**
 * Nhận thông báo realtime qua Server-Sent Events (GET /me/notifications/stream).
 * Dùng fetch thay EventSource vì EventSource không gửi được header Authorization.
 * - Chỉ kết nối khi đã đăng nhập; đăng xuất / rời trang thì đóng.
 * - Rớt mạng thì tự kết nối lại (chờ 2s, 4s, 8s... tối đa 30s).
 * - 401 (token hết hạn) thì refresh token rồi kết nối lại.
 */
export default function useNotificationStream(onNotification: (n: NotificationItem) => void) {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  // Giữ callback mới nhất mà không phải mở lại kết nối mỗi lần render
  const handlerRef = useRef(onNotification);
  useEffect(() => {
    handlerRef.current = onNotification;
  }, [onNotification]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const controller = new AbortController();
    let retryDelay = 2_000;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;

    const scheduleRetry = () => {
      if (controller.signal.aborted) return;
      retryTimer = setTimeout(connect, retryDelay);
      retryDelay = Math.min(retryDelay * 2, MAX_RETRY_DELAY);
    };

    // Tách luồng text thành từng sự kiện SSE (cách nhau 1 dòng trống)
    const handleEvent = (raw: string) => {
      let event = "message";
      const data: string[] = [];
      for (const line of raw.split("\n")) {
        if (line.startsWith("event:")) event = line.slice(6).trim();
        else if (line.startsWith("data:")) data.push(line.slice(5).replace(/^ /, ""));
        // dòng bắt đầu bằng ":" là heartbeat, bỏ qua
      }
      if (event !== "notification" || !data.length) return;
      try {
        handlerRef.current(JSON.parse(data.join("\n")) as NotificationItem);
      } catch {
        // dữ liệu lỗi thì bỏ qua sự kiện này
      }
    };

    async function connect() {
      const token = store.getState().auth.accessToken;
      if (!token) return;
      try {
        const res = await fetch(STREAM_URL, {
          headers: { Authorization: `Bearer ${token}`, Accept: "text/event-stream" },
          credentials: "include",
          signal: controller.signal,
        });
        if (res.status === 401) {
          // Token hết hạn: refresh rồi thử lại ngay; refresh lỗi thì dừng (đã bị đăng xuất)
          await refreshAccessToken();
          if (!controller.signal.aborted) connect();
          return;
        }
        if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);

        retryDelay = 2_000; // kết nối thành công thì đặt lại thời gian chờ
        const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
        let buffer = "";
        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += value.replace(/\r\n/g, "\n");
          let sep;
          while ((sep = buffer.indexOf("\n\n")) >= 0) {
            handleEvent(buffer.slice(0, sep));
            buffer = buffer.slice(sep + 2);
          }
        }
        // Server đóng kết nối (hết hạn 30 phút) → kết nối lại
        scheduleRetry();
      } catch {
        if (!controller.signal.aborted) scheduleRetry();
      }
    }

    connect();
    return () => {
      controller.abort();
      clearTimeout(retryTimer);
    };
  }, [isAuthenticated]);
}
