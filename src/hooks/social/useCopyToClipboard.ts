import { useCallback, useEffect, useRef, useState } from "react";

// Sao chép chữ vào clipboard, bật cờ "đã sao chép" trong một lúc
export function useCopyToClipboard(resetAfter = 2000) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        clearTimeout(timer.current);
        timer.current = setTimeout(() => setCopied(false), resetAfter);
      } catch {
        /* trình duyệt chặn clipboard: bỏ qua */
      }
    },
    [resetAfter],
  );

  return { copied, copy };
}
