// Đường dẫn API (nối sau baseURL, ví dụ http://localhost:8080/api)
// login/register/logout nằm trong authService (BaseService "/users").
// Refresh để riêng vì chạy trên axios instance không có interceptor.
export const AUTH_ENDPOINTS = {
  REFRESH: "/users/refresh-token",
};
