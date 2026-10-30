import { useEffect, useId, useRef, useState } from "react";

export type MascotMood = "idle" | "happy" | "thinking";

type Props = {
  size?: number;
  mood?: MascotMood;
  wave?: boolean; // vẫy tay chào
  track?: boolean; // mắt nhìn theo con trỏ chuột
};

// Linh vật trợ lý "Đất Việt Bot": robot nhỏ đầu tròn, kính mặt tối, mắt vàng đồng phát sáng biết chớp, má hồng, ăng-ten đèn,
// tay vẫy, lửa phản lực dưới chân. Đèn ăng-ten đỏ cam (màu nhấn) để robot dễ thấy. Biểu cảm: idle (cười nhẹ), happy (mắt cong), thinking (mắt liếc lên, miệng chữ o)
export default function Mascot({ size = 72, mood = "idle", wave = false, track = false }: Props) {
  const id = useId().replace(/:/g, "");
  const ref = useRef<SVGSVGElement>(null);
  const [look, setLook] = useState({ x: 0, y: 0 });

  // Mắt nhìn theo con trỏ (lệch tối đa vài đơn vị trong kính mặt)
  useEffect(() => {
    if (!track || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const onMove = (e: PointerEvent) => {
      const r = ref.current?.getBoundingClientRect();
      if (!r) return;
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height * 0.4);
      const d = Math.max(1, Math.hypot(dx, dy));
      setLook({ x: (dx / d) * Math.min(5, d / 40), y: (dy / d) * Math.min(3.5, d / 50) });
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [track]);

  const eyes = mood === "thinking" ? { x: 3, y: -4 } : look;

  return (
    <svg ref={ref} viewBox="0 0 120 130" width={size} height={size * (130 / 120)} className="hd-mascot overflow-visible" aria-hidden>
      <defs>
        <linearGradient id={`${id}-shell`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#f0e2c2" />
        </linearGradient>
        <linearGradient id={`${id}-visor`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1c2541" />
          <stop offset="1" stopColor="#0a0f1a" />
        </linearGradient>
        <radialGradient id={`${id}-flame`} cx="0.5" cy="0" r="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.35" stopColor="#f3d79b" />
          <stop offset="1" stopColor="#c9991f" stopOpacity="0" />
        </radialGradient>
        <filter id={`${id}-glow`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.2" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Lửa phản lực + bóng dưới chân */}
      <ellipse cx="60" cy="126" rx="18" ry="3" fill="#e8b93a" opacity="0.3" />
      <path className="hd-mascot-flame" d="M50 104 Q60 132 70 104 Z" fill={`url(#${id}-flame)`} />

      <g className="hd-mascot-body">
        {/* Thân */}
        <rect x="38" y="76" width="44" height="30" rx="15" fill={`url(#${id}-shell)`} />
        <circle cx="60" cy="90" r="5" fill="#f3d79b" filter={`url(#${id}-glow)`} className="hd-mascot-core" />

        {/* Tay trái (đứng yên) và tay phải (vẫy) */}
        <rect x="26" y="80" width="14" height="9" rx="4.5" fill={`url(#${id}-shell)`} transform="rotate(25 40 84)" />
        <g className={wave ? "hd-mascot-wave" : ""} style={{ transformOrigin: "80px 84px" }}>
          <rect x="80" y="74" width="9" height="16" rx="4.5" fill={`url(#${id}-shell)`} transform="rotate(-35 80 84)" />
          <circle cx="90" cy="72" r="5" fill="#ffffff" />
        </g>

        {/* Ăng-ten */}
        <g className="hd-mascot-antenna" style={{ transformOrigin: "60px 22px" }}>
          <line x1="60" y1="22" x2="60" y2="9" stroke="#e3cf9f" strokeWidth="3" strokeLinecap="round" />
          <circle cx="60" cy="7" r="5" fill={mood === "thinking" ? "#fbbf24" : "#e0532f"} filter={`url(#${id}-glow)`} className="hd-mascot-bulb" />
        </g>

        {/* Tai */}
        <rect x="12" y="42" width="10" height="18" rx="5" fill="#e8b93a" />
        <rect x="98" y="42" width="10" height="18" rx="5" fill="#e8b93a" />

        {/* Đầu + kính mặt */}
        <rect x="18" y="20" width="84" height="62" rx="30" fill={`url(#${id}-shell)`} />
        <rect x="27" y="31" width="66" height="40" rx="20" fill={`url(#${id}-visor)`} stroke="#f3d79b" strokeOpacity="0.45" strokeWidth="1.5" />
        <path d="M34 38 Q44 33 54 34" stroke="#ffffff" strokeOpacity="0.35" strokeWidth="2.5" strokeLinecap="round" fill="none" />

        {/* Mắt (nhìn theo con trỏ, chớp) */}
        <g style={{ transform: `translate(${eyes.x}px, ${eyes.y}px)`, transition: "transform 0.25s ease-out" }}>
          {mood === "happy" ? (
            <g stroke="#f3d79b" strokeWidth="4" strokeLinecap="round" fill="none" filter={`url(#${id}-glow)`}>
              <path d="M42 53 Q48 46 54 53" />
              <path d="M66 53 Q72 46 78 53" />
            </g>
          ) : (
            <g className="hd-mascot-eyes" fill="#f3d79b" filter={`url(#${id}-glow)`}>
              <rect x="43" y="44" width="10" height="15" rx="5" />
              <rect x="67" y="44" width="10" height="15" rx="5" />
            </g>
          )}
          {/* Miệng */}
          {mood === "thinking" ? (
            <circle cx="60" cy="63" r="2.6" fill="none" stroke="#f3d79b" strokeWidth="2" />
          ) : (
            <path d="M54 61 Q60 67 66 61" stroke="#f3d79b" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          )}
        </g>
        {/* Má hồng */}
        <ellipse cx="36" cy="62" rx="5" ry="3" fill="#f472b6" opacity="0.55" />
        <ellipse cx="84" cy="62" rx="5" ry="3" fill="#f472b6" opacity="0.55" />
      </g>
    </svg>
  );
}
