import { useEffect, useRef, useState } from "react";

// Đếm từ 0 tới `end` khi phần tử cuộn vào khung nhìn
export function useCountUp(end: number, duration = 1600) {
  const ref = useRef<HTMLElement>(null);
  const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const [value, setValue] = useState(reduced ? end : 0);

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;
    let raf = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        setValue(Math.round(end * (1 - Math.pow(1 - t, 3))));
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [end, duration, reduced]);

  // Giảm chuyển động: hiện thẳng giá trị cuối (kể cả khi `end` đổi sau khi tải dữ liệu)
  return { ref, value: reduced ? end : value };
}
