import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { selectAuthStatus, selectCurrentUser, selectIsSuperAdmin, selectPermissions, useAppSelector } from "../../store";
import { firstAdminPath } from "../../config/adminAccess";

/**
 Đăng nhập Google xong BE chuyển về trang chủ kèm ?login=google. Khi đã lấy được thông tin tài khoản,
 người có quyền quản trị (kể cả admin / giám đốc dự án) được đưa vào trang quản trị tương ứng,
 giống đăng nhập bằng mật khẩu; người dùng thường ở lại trang chủ.
 */
export default function OAuthLoginRedirect() {
  const { search, pathname } = useLocation();
  const navigate = useNavigate();
  const status = useAppSelector(selectAuthStatus);
  const user = useAppSelector(selectCurrentUser);
  const permissions = useAppSelector(selectPermissions);
  const isSuperAdmin = useAppSelector(selectIsSuperAdmin);

  useEffect(() => {
    const params = new URLSearchParams(search);
    if (params.get("login") !== "google") return;
    // Chờ khôi phục phiên và tải xong thông tin tài khoản (quyền nằm trong /users/me)
    if (status === "idle" || status === "checking" || (status === "authenticated" && !user)) return;
    params.delete("login");
    const qs = params.toString();
    const target = status === "authenticated" ? firstAdminPath(permissions, isSuperAdmin) : null;
    navigate(target ?? `${pathname}${qs ? `?${qs}` : ""}`, { replace: true });
  }, [search, pathname, status, user, permissions, isSuperAdmin, navigate]);

  return null;
}
