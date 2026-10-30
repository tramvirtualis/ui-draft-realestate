import { useEffect, type RefObject } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Giữ focus trong `ref` khi đang mở (modal), đóng bằng Esc, khóa cuộn nền
 * và trả focus về phần tử đã mở modal khi đóng.
 */
export default function useFocusTrap(
  ref: RefObject<HTMLElement | null>,
  active: boolean,
  onEscape: () => void
) {
  useEffect(() => {
    if (!active) return;
    const root = ref.current;
    if (!root) return;

    const previous = document.activeElement as HTMLElement | null;
    const items = () => Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE));
    (items()[0] ?? root).focus();

    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onEscape();
        return;
      }
      if (e.key !== "Tab") return;
      const list = items();
      if (list.length === 0) return e.preventDefault();
      const first = list[0];
      const last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      previous?.focus?.();
    };
    // onEscape luôn là closure mới; chỉ gắn lại khi bật/tắt
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, ref]);
}
