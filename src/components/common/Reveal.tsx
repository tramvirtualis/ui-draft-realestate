import { useEffect, useRef, useState, type ReactNode } from "react";

type Variant = "up" | "left" | "right" | "zoom" | "clip";

type Props = {
  children: ReactNode;
  variant?: Variant;
  /** Trễ (ms) để các phần tử cùng nhóm xuất hiện lần lượt */
  delay?: number;
  className?: string;
};

const HIDDEN: Record<Variant, string> = {
  up: "translate-y-10",
  left: "-translate-x-12",
  right: "translate-x-12",
  zoom: "scale-95",
  clip: "[clip-path:inset(0_0_92%_0)]",
};

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Hiện dần khi phần tử cuộn vào khung nhìn (chỉ chạy một lần)
export default function Reveal({ children, variant = "up", delay = 0, className = "" }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(prefersReducedMotion);

  useEffect(() => {
    const el = ref.current;
    if (!el || shown) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.01, rootMargin: "0px 0px -6% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [shown]);

  // clip-path chỉ dùng cho biến thể "clip"; gắn cho mọi biến thể sẽ cắt mất bóng đổ của nội dung bên trong
  const visible = `translate-x-0 translate-y-0 scale-100 opacity-100 ${variant === "clip" ? "[clip-path:inset(0)]" : ""}`;

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out will-change-transform ${
        shown ? visible : `opacity-0 ${HIDDEN[variant]}`
      } ${className}`}
    >
      {children}
    </div>
  );
}
