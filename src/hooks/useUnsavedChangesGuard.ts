import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

/**
 Cảnh báo khi rời trang lúc còn thay đổi chưa lưu (dirty = true):
 - Reload, đóng tab, gõ địa chỉ khác: trình duyệt tự hiện hộp thoại (beforeunload).
 - Bấm link nội bộ (sidebar, breadcrumb...): chặn lại và đưa đường dẫn vào `target` để hiện hộp xác nhận.
   BrowserRouter không có useBlocker nên chặn bằng cách bắt click vào thẻ <a>.
 Nút Back của trình duyệt chưa chặn được.

   const guard = useUnsavedChangesGuard(dirty);
   {guard.target && <ConfirmDialog onConfirm={guard.leave} onClose={guard.stay} ... />}
   Nút Hủy: guard.requestLeave("/danh-sach")      Lưu xong: guard.allowLeave(); navigate(...)
 */
export default function useUnsavedChangesGuard(dirty: boolean) {
  const navigate = useNavigate();
  const [target, setTarget] = useState<string | null>(null);
  const bypass = useRef(false); // đã lưu xong hoặc người dùng đã đồng ý rời

  useEffect(() => {
    if (!dirty) return;

    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (bypass.current) return;
      e.preventDefault();
      e.returnValue = ""; // một số trình duyệt cần dòng này mới hiện hộp thoại
    };

    const onClick = (e: MouseEvent) => {
      if (bypass.current || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const anchor = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!anchor || (anchor.target && anchor.target !== "_self") || anchor.hasAttribute("download")) return;
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return; // link ra ngoài: beforeunload lo
      const next = url.pathname + url.search + url.hash;
      if (next === window.location.pathname + window.location.search + window.location.hash) return;
      e.preventDefault();
      e.stopPropagation(); // không cho Link của react-router chuyển trang
      setTarget(next);
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("click", onClick, true);
    };
  }, [dirty]);

  // Người dùng đồng ý bỏ thay đổi và rời đi
  const leave = useCallback(() => {
    bypass.current = true;
    if (target) navigate(target);
  }, [target, navigate]);

  // Ở lại trang
  const stay = useCallback(() => setTarget(null), []);

  // Gọi ngay trước khi tự chuyển trang sau khi lưu thành công
  const allowLeave = useCallback(() => {
    bypass.current = true;
  }, []);

  // Rời trang bằng code (vd nút Hủy): có thay đổi chưa lưu thì hỏi trước
  const requestLeave = useCallback(
    (to: string) => {
      if (dirty && !bypass.current) setTarget(to);
      else navigate(to);
    },
    [dirty, navigate],
  );

  return { target, leave, stay, allowLeave, requestLeave };
}
