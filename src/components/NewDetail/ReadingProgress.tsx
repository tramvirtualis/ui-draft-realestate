import { useEffect, useRef, type RefObject } from "react";

export default function ReadingProgress({
  target,
}: {
  target: RefObject<HTMLElement | null>;
}) {
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = target.current;
      if (!el || !bar.current) return;
      const r = el.getBoundingClientRect();
      const p = Math.min(
        1,
        Math.max(0, -r.top / Math.max(1, r.height - window.innerHeight * 0.6))
      );
      bar.current.style.transform = `scaleX(${p})`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [target]);

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[3px]"
      aria-hidden
    >
      <div
        ref={bar}
        style={{ transform: "scaleX(0)" }}
        className="h-full origin-left bg-gradient-to-r from-primary-300 via-primary-500 to-primary-700 shadow-[0_0_10px_rgba(201,153,31,0.7)]"
      />
    </div>
  );
}
