import { deleteToken, getToken } from "firebase/messaging";
import { authHttp } from "../../api";
import { getFirebaseMessaging, VAPID_KEY } from "../../config/firebase";

// Token đã gửi lên BE, để lúc đăng xuất biết cần tắt token nào
const TOKEN_KEY = "fcm-token";

export type PushStatus = "unsupported" | "default" | "granted" | "denied";

const readStoredToken = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

const writeStoredToken = (token: string | null) => {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // localStorage bị chặn: bỏ qua, chỉ mất khả năng tắt token khi đăng xuất
  }
};

export async function getPushStatus(): Promise<PushStatus> {
  if (!("Notification" in window) || !("serviceWorker" in navigator)) return "unsupported";
  if (!(await getFirebaseMessaging())) return "unsupported";
  return Notification.permission;
}

/**
 * Xin quyền (nếu chưa có) → lấy FCM token → PUT /me/devices.
 * askPermission = false: chỉ làm mới token khi đã được cấp quyền từ trước (không bật hộp hỏi quyền).
 */
export async function enablePush(askPermission = true): Promise<PushStatus> {
  const messaging = await getFirebaseMessaging();
  if (!messaging || !("serviceWorker" in navigator)) return "unsupported";

  let permission = Notification.permission;
  if (permission === "default" && askPermission) permission = await Notification.requestPermission();
  if (permission !== "granted") return permission;

  const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
  const token = await getToken(messaging, { vapidKey: VAPID_KEY, serviceWorkerRegistration: registration });
  if (!token) return "default";

  await authHttp.put("/me/devices", { token, deviceType: "WEB" }, { silentLoading: true });
  writeStoredToken(token);
  return "granted";
}

/** Gọi khi đăng xuất: báo BE tắt token (cần còn phiên đăng nhập) rồi xóa token khỏi trình duyệt */
export async function disablePush(): Promise<void> {
  const token = readStoredToken();
  if (!token) return;
  writeStoredToken(null);
  await authHttp
    .post("/me/devices/unregister", { token }, { silentLoading: true })
    .catch(() => undefined);
  const messaging = await getFirebaseMessaging();
  if (messaging) await deleteToken(messaging).catch(() => undefined);
}
