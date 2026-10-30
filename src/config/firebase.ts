import { initializeApp, type FirebaseApp } from "firebase/app";
import { getMessaging, isSupported, type Messaging } from "firebase/messaging";

// Config web công khai của Firebase (project giống file service account ở backend)
const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY as string | undefined;

let app: FirebaseApp | null = null;

// null khi trình duyệt không hỗ trợ push (Safari cũ, iOS chưa cài thành PWA...) hoặc thiếu cấu hình
export async function getFirebaseMessaging(): Promise<Messaging | null> {
  if (!config.apiKey || !VAPID_KEY) return null;
  if (!(await isSupported().catch(() => false))) return null;
  app ??= initializeApp(config);
  return getMessaging(app);
}
