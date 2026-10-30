import { Outlet } from "react-router-dom";
import { selectAuthStatus, useAppSelector } from "../store";
import AuthRequiredModal from "../components/common/AuthRequiredModal";

/**
 Bọc các route cần đăng nhập.
 Đang khôi phục phiên (idle/checking) thì chờ, chưa vội đá về login
 vì có thể cookie refreshToken vẫn còn hạn.
 */
export default function ProtectedRoute() {
  const status = useAppSelector(selectAuthStatus);

  if (status === "idle" || status === "checking") return null;

  // Chưa đăng nhập: hiện modal thay vì đá thẳng sang /login.
  // Modal tự gắn ?redirect=<trang hiện tại> để đăng nhập xong quay lại đúng chỗ.
  if (status === "unauthenticated") return <AuthRequiredModal />;

  return <Outlet />;
}
