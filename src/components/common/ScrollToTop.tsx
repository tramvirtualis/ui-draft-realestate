import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Sang trang khác (đổi đường dẫn) thì cuộn về đầu trang; link có #anchor thì để trình duyệt tự cuộn
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname, hash]);

  return null;
}
