/* Nhận diện "Hubtech":
   - Biểu tượng: chữ H mà thanh ngang là MÁI NHÀ (chữ V ngược), đỉnh mái là một chấm vàng = "hub" (điểm kết nối).
   - Chữ: "hubtech" chữ thường nét đều (monoline) vẽ tay bằng SVG, hình học tròn trịa;
     2 chi tiết riêng: tâm chữ "b" có chấm vàng (hub), thanh ngang chữ "t" màu vàng.
   Nét dùng currentColor → tự đổi trắng/đen theo nền; màu vàng truyền qua `accent`. */

const GOLD = "#e0b23a";

type Props = {
  variant?: "full" | "mark" | "word";
  accent?: string;
  className?: string;
  title?: string;
};

export function HubtechMark({ accent = GOLD, className = "" }: { accent?: string; className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" aria-hidden>
      <g stroke="currentColor" strokeWidth="8" strokeLinecap="butt" strokeLinejoin="miter">
        <path d="M14 8 V56 M50 8 V56" />
        <path d="M14 42 L32 27 L50 42" />
      </g>
      {/* "Hub": nút tròn vàng lơ lửng ngay trên đỉnh mái */}
      <circle cx="32" cy="12" r="5.5" fill={accent} />
    </svg>
  );
}

// Chữ "hubtech": khung 0..360 ngang, đỉnh nét cao y=0, đỉnh chữ thường y=30, chân chữ y=80
export function HubtechWord({ accent = GOLD, className = "" }: { accent?: string; className?: string }) {
  return (
    <svg viewBox="-7 -7 398 94" className={className} fill="none" aria-hidden>
      <g stroke="currentColor" strokeWidth="12" strokeLinecap="butt" strokeLinejoin="round">
        {/* h */}
        <path d="M6 0 V80 M6 56 C6 39 16 30 28 30 C40 30 48 39 48 53 V80" />
        {/* u */}
        <path d="M64 30 V57 C64 71 72 80 84 80 C96 80 104 71 104 57 M104 30 V80" />
        {/* b: thân + vòng tròn */}
        <path d="M120 0 V80" />
        <circle cx="142" cy="55" r="22" />
        {/* t (thanh ngang vẽ riêng màu vàng) */}
        <path d="M188 6 V64 C188 74 193 80 202 80 H208" />
        {/* e: thanh ngang + vòng mở góc dưới phải (tâm 244,55) */}
        <path d="M222 55 H266 A22 22 0 1 0 260.85 69.14" />
        {/* c: vòng mở bên phải (tâm 304,55) */}
        <path d="M319.56 39.44 A22 22 0 1 0 319.56 70.56" />
        {/* h */}
        <path d="M336 0 V80 M336 56 C336 39 346 30 358 30 C370 30 378 39 378 53 V80" />
      </g>
      <path d="M176 30 H206" stroke={accent} strokeWidth="12" strokeLinecap="butt" />
      <circle cx="142" cy="55" r="6" fill={accent} />
    </svg>
  );
}

export default function HubtechLogo({ variant = "full", accent = GOLD, className = "", title = "Hubtech" }: Props) {
  if (variant === "mark") return <HubtechMark accent={accent} className={className} />;
  if (variant === "word") return <HubtechWord accent={accent} className={className} />;
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`} role="img" aria-label={title}>
      <HubtechMark accent={accent} className="h-8 w-8" />
      <HubtechWord accent={accent} className="h-[22px] w-auto" />
    </span>
  );
}
