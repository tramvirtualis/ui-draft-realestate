import { Navigate, Outlet, useLocation } from "react-router-dom";
import {
  selectAuthStatus,
  selectCanAccessAdmin,
  selectCurrentUser,
  selectIsSuperAdmin,
  selectPermissions,
  useAppSelector,
} from "../store";
import { canAccessAdminPath, firstAdminPath } from "../config/adminAccess";

/**
 Bọc các route quản trị: chưa đăng nhập → về login; không có quyền quản trị nào → về trang chủ;
 mở trang không có quyền (vd nhân viên tin tức mở /admin/users) → chuyển sang trang đầu tiên được vào.
 Chỉ là lớp chặn giao diện, BE vẫn kiểm tra quyền ở từng API.
 */
export default function AdminRoute() {
  const status = useAppSelector(selectAuthStatus);
  const user = useAppSelector(selectCurrentUser);
  const isSuperAdmin = useAppSelector(selectIsSuperAdmin);
  const permissions = useAppSelector(selectPermissions);
  const canAccessAdmin = useAppSelector(selectCanAccessAdmin);
  const { pathname, search } = useLocation();

  if (status === "idle" || status === "checking") return null;

  if (status === "unauthenticated") {
    const redirect = encodeURIComponent(pathname + search);
    return <Navigate to={`/login?redirect=${redirect}`} replace />;
  }

  // Quyền nằm trong GET /users/me: đợi tải xong (SUPER_ADMIN đọc được từ token nên không cần đợi)
  if (!user && !isSuperAdmin) return null;

  if (!canAccessAdmin) return <Navigate to="/" replace />;

  if (!canAccessAdminPath(pathname, permissions, isSuperAdmin)) {
    return <Navigate to={firstAdminPath(permissions, isSuperAdmin) ?? "/"} replace />;
  }

  return <Outlet />;
}
