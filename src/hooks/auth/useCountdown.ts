import { useCallback, useEffect, useState } from "react";

/**
 Đếm ngược theo giây. Lưu mốc kết thúc thay vì trừ dần nên tab bị ẩn/treo vẫn đếm đúng.
 start(n): bắt đầu đếm lại n giây.
 */
export function useCountdown(initialSeconds = 0) {
  const [endAt, setEndAt] = useState(() => Date.now() + initialSeconds * 1000);
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);

  useEffect(() => {
    const tick = () => setSecondsLeft(Math.max(0, Math.ceil((endAt - Date.now()) / 1000)));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [endAt]);

  const start = useCallback((seconds: number) => setEndAt(Date.now() + seconds * 1000), []);

  return { secondsLeft, start };
}

// 125 → "02:05"
export const formatSeconds = (s: number) =>
  `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
