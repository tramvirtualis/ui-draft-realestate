import { useRef, useState } from "react";
import type { MouseEvent, ReactNode } from "react";

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  /** Góc nghiêng tối đa (độ) */
  max?: number;
}

/** Thẻ nghiêng 3D theo chuột + vệt sáng chạy theo con trỏ */
export default function TiltCard({
  children,
  className = "",
  max = 7,
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({
    x: 0,
    y: 0,
    gx: 50,
    gy: 0,
    active: false,
  });

  // Người dùng bật "giảm chuyển động" thì không nghiêng
  const reduceMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const handleMove = (e: MouseEvent<HTMLDivElement>) => {
    if (reduceMotion || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width; // 0 → 1
    const py = (e.clientY - r.top) / r.height;
    setTilt({
      x: (0.5 - py) * max * 2,
      y: (px - 0.5) * max * 2,
      gx: px * 100,
      gy: py * 100,
      active: true,
    });
  };

  const reset = () => setTilt({ x: 0, y: 0, gx: 50, gy: 0, active: false });

  return (
    <div style={{ perspective: "1400px" }} className={className}>
      <div
        ref={ref}
        onMouseMove={handleMove}
        onMouseLeave={reset}
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transformStyle: "preserve-3d",
          transition: tilt.active
            ? "transform 80ms linear"
            : "transform 600ms cubic-bezier(.2,.8,.2,1)",
        }}
        className="relative rounded-[28px] border border-white/60 bg-white shadow-[0_40px_80px_-20px_rgba(2,6,23,0.55),0_0_0_1px_rgba(255,255,255,0.4)_inset]"
      >
        {/* Vệt sáng */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[28px] transition-opacity duration-300"
          style={{
            opacity: tilt.active ? 1 : 0,
            background: `radial-gradient(500px circle at ${tilt.gx}% ${tilt.gy}%, rgba(147,197,253,0.18), transparent 45%)`,
          }}
        />
        {/* Nội dung nổi lên trên mặt thẻ.
            KHÔNG đặt preserve-3d ở đây — nếu đặt, nút bấm bên trong sẽ không nhận click */}
        <div style={{ transform: "translateZ(40px)" }} className="relative">
          {children}
        </div>
      </div>
    </div>
  );
}
