import { useEffect } from "react";

// Đóng modal bằng phím Esc, kèm khoá cuộn trang nền (tuỳ chọn)
export function useModalBehavior(onClose: () => void, lockScroll = true) {
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    if (lockScroll) document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      if (lockScroll) document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose, lockScroll]);
}
