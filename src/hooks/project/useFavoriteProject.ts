import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getErrorMessage } from "../../api";
import { useToast } from "../../components/common/toastContext";
import { favoriteService } from "../../services/project/favoriteService";
import { selectAuthStatus, useAppSelector } from "../../store";

// Trạng thái "đã lưu" của một dự án + hàm bật/tắt; chưa đăng nhập thì chuyển tới trang đăng nhập
export function useFavoriteProject(projectId: number | undefined) {
  const status = useAppSelector(selectAuthStatus);
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const toast = useToast();
  const [favorited, setFavorited] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (projectId === undefined || status !== "authenticated") return;
    let cancelled = false;
    favoriteService
      .getStatus(projectId)
      .then((s) => !cancelled && setFavorited(s.favorited))
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [projectId, status]);

  const toggle = useCallback(async () => {
    if (projectId === undefined || busy) return;
    if (status !== "authenticated") {
      navigate(`/login?redirect=${encodeURIComponent(pathname + search)}`);
      return;
    }
    setBusy(true);
    try {
      const result = await favoriteService.toggle(projectId);
      setFavorited(result.favorited);
      toast.show(result.favorited ? "Đã lưu dự án" : "Đã bỏ lưu dự án");
    } catch (e) {
      toast.show(getErrorMessage(e), "error");
    } finally {
      setBusy(false);
    }
  }, [projectId, busy, status, navigate, pathname, search, toast]);

  return { favorited: status === "authenticated" && favorited, busy, toggle };
}
