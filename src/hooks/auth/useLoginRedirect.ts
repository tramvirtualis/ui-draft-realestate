import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// Chuyển sang trang đăng nhập, xong quay lại đúng trang hiện tại
export function useLoginRedirect() {
  const navigate = useNavigate();
  const { pathname, search } = useLocation();

  return useCallback(
    () => navigate(`/login?redirect=${encodeURIComponent(pathname + search)}`),
    [navigate, pathname, search],
  );
}
