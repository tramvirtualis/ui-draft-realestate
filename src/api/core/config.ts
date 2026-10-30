// Cấu hình chung cho mọi axios instance
export const BASE_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api",
  timeout: 10000,
  withCredentials: true, // bắt buộc để gửi/nhận cookie refreshToken
};
