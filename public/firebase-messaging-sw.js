/* global firebase, importScripts, clients */
/**
 * Service worker nhận FCM Web Push khi tab đã đóng / đang ẩn.
 * Backend gửi kèm phần "notification" nên Firebase TỰ hiện thông báo — không gọi showNotification ở đây
 * (gọi thêm sẽ hiện 2 lần). Lúc đang mở web thì thông báo đi qua SSE + toast, backend không gửi FCM.
 */

// Bấm thông báo → mở đúng trang (actionUrl backend gửi trong data).
// Đăng ký TRƯỚC importScripts để chạy trước xử lý mặc định của Firebase.
self.addEventListener("notificationclick", (event) => {
  const data = event.notification.data?.FCM_MSG?.data ?? {};
  const url = new URL(data.actionUrl || "/account/notifications", self.location.origin).href;
  event.notification.close();
  event.stopImmediatePropagation();
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((tabs) => {
      // Đã có tab của web thì chuyển sang tab đó, chưa có thì mở tab mới
      const tab = tabs.find((t) => t.url.startsWith(self.location.origin));
      return tab ? tab.focus().then(() => tab.navigate(url)) : clients.openWindow(url);
    }),
  );
});

// Cùng phiên bản với gói "firebase" trong package.json
importScripts("https://www.gstatic.com/firebasejs/13.0.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/13.0.0/firebase-messaging-compat.js");

// Config web công khai (giống VITE_FIREBASE_* trong .env) — service worker không đọc được biến môi trường
firebase.initializeApp({
  apiKey: "AIzaSyDvFiOmhfo0LNO8kx83cxiM340LtpgmRrw",
  authDomain: "mobie-137b4.firebaseapp.com",
  projectId: "mobie-137b4",
  messagingSenderId: "735329224892",
  appId: "1:735329224892:web:edb864fee5312e3e6768b9",
});

// Khởi tạo để Firebase tự hiện thông báo khi tab đóng / ẩn
firebase.messaging();
