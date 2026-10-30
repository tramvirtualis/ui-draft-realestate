// Đọc claim "role" trong access token (chỉ để ẩn/hiện giao diện; BE mới là nơi chặn quyền thật)
// Role cao nhất (team dev): tự có mọi quyền và là role duy nhất vào được trang Phân quyền
export const SUPER_ADMIN_ROLE = "SUPER_ADMIN";

export const getRoleFromToken = (token: string): string | null => {
  try {
    const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const claims = JSON.parse(decodeURIComponent(escape(atob(payload)))) as { role?: string };
    // BE lưu "ROLE_SUPER_ADMIN" → bỏ tiền tố còn "SUPER_ADMIN"
    return claims.role ? claims.role.replace(/^ROLE_/, "") : null;
  } catch {
    return null;
  }
};
