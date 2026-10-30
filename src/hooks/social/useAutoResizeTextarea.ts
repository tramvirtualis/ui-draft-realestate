import { useEffect, type RefObject } from "react";

// Tự giãn chiều cao theo nội dung, tới max-h (CSS) thì mới hiện thanh cuộn
export function useAutoResizeTextarea(ref: RefObject<HTMLTextAreaElement | null>, value: string) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [ref, value]);
}
