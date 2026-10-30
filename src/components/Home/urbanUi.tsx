import { useEffect, type ReactNode } from "react";

// Dùng chung cho trang chủ Urban (/): bảng màu, font, ảnh "sơn màu", tiêu đề mục

export const P = {
  bg: "#faf5f0",
  card: "#f3e9e4",
  blush: "#e1d4d5",
  lilac: "#cdc4cd",
  black: "#101010",
  muted: "rgba(16,16,16,0.6)",
  // Tông vàng kim sáng (tên khoá giữ "green"/"mint" từ bản xanh trước để khỏi đổi khắp nơi)
  green: "#c9991f", // vàng kim: khối màu, vạch, chấm, số, nhãn, icon
  mint: "#fcf1cc", // vàng NHẠT: mảng tô màu (nền ô khi rê chuột)
  neon: "#e8b93a",
};

export const FONT = '"Inter Tight", "Inter", system-ui, sans-serif';
export const MONO = '"JetBrains Mono", ui-monospace, monospace';

// Tải font Inter Tight + JetBrains Mono (chữ số kiểu bảng điện tử) chỉ khi mở trang cần dùng
export function useUrbanFonts() {
  useEffect(() => {
    const id = "font-urban";
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Inter+Tight:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap";
    document.head.appendChild(link);
  }, []);
}

// Ảnh có hiệu ứng sơn màu: rê chuột vào nhóm (group) thì lớp xanh lục trượt từ mép trên xuống phủ kín ảnh
export function PaintImage({ src, alt = "", className = "", zoom = true }: { src: string; alt?: string; className?: string; zoom?: boolean }) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <img src={src} alt={alt} loading="lazy" className={`h-full w-full object-cover transition duration-[1200ms] ${zoom ? "group-hover:scale-105" : ""}`} />
      <span
        className="pointer-events-none absolute inset-0 origin-top scale-y-0 opacity-35 mix-blend-multiply transition-transform duration-700 ease-[cubic-bezier(0.65,0,0.35,1)] group-hover:scale-y-100"
        style={{ background: "#f2cd5f" }}
        aria-hidden
      />
    </div>
  );
}

// Chữ đổi sang màu sơn khi rê chuột vào nhóm
export const paintText = "transition-colors duration-500 group-hover:text-[#a67d12]";

/* ---------- Bố cục phẳng "xẻ chéo" (như slide mẫu): khối màu đặc phẳng sát mép, ảnh / mục cắt chéo ---------- */

// Đường cắt dùng cho clip-path
export const CUT = {
  // Ảnh cắt góc dưới phải
  corner: "polygon(0 0, 100% 0, 100% 78%, 78% 100%, 0 100%)",
  // Ảnh cắt chéo mép trái
  leftSlant: "polygon(18% 0, 100% 0, 100% 100%, 0 100%)",
  // Ảnh cắt hình mũi tên ở mép phải (như slide "proposal")
  arrow: "polygon(0 0, 100% 0, 84% 50%, 100% 100%, 0 100%)",
} as const;

/* ---------- Đường chia trang "méo" tự nhiên ----------
   Đặt ở đầu một mục (mục phải relative, KHÔNG overflow-hidden): phần màu của mục "trồi" lên trên theo đường cong.
   - wave: lượn sóng mềm; peaks: đường chân trời dãy toà nhà đối xứng
   - pushed: một vật tròn (ảnh) ở mục trên đè xuống, ranh giới lõm vòng quanh nó */
const WAVE = "M0 100 C140 34 320 20 600 22 C790 24 880 52 1000 46 C1160 38 1300 28 1440 2 L1440 120 L0 120 Z";
// "peaks" = dãy toà nhà phẳng (đường chân trời), đối xứng quanh toà tháp ở giữa nên có nhịp, không ngẫu nhiên.
// Mỗi cặp: [bề ngang, độ cao mái tính từ đỉnh khung 120]
const SKYLINE_BLOCKS: [number, number][] = [
  [110, 84], [70, 64], [100, 74], [50, 40], [90, 58], [140, 80], [60, 52], [80, 34],
  [40, 14],
  [80, 34], [60, 52], [140, 80], [90, 58], [50, 40], [100, 74], [70, 64], [110, 84],
];
const PEAKS = (() => {
  let x = 0;
  let d = "M0 120";
  for (const [w, top] of SKYLINE_BLOCKS) {
    d += ` L${x} ${top} L${x + w} ${top}`;
    x += w;
  }
  return `${d} L1440 120 Z`;
})();

export function OrganicDivider({
  color,
  variant = "wave",
  flip = false,
  image,
  at = 70,
}: {
  color: string;
  variant?: "wave" | "peaks" | "pushed";
  flip?: boolean;
  image?: string; // ảnh tròn đè lên ranh giới (kiểu pushed)
  at?: number; // vị trí vật đè theo % bề ngang (kiểu pushed)
}) {
  if (variant !== "pushed") {
    return (
      <svg
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        className={`pointer-events-none absolute inset-x-0 bottom-full h-16 w-full md:h-28 ${flip ? "-scale-x-100" : ""}`}
        aria-hidden
      >
        <path d={variant === "wave" ? WAVE : PEAKS} fill={color} />
      </svg>
    );
  }

  // Kiểu pushed: 2 dải sóng nhẹ co giãn 2 bên + khúc giữa cố định hình "lòng chảo" ôm quanh ảnh tròn
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-full flex h-[150px] items-end" aria-hidden>
      <svg viewBox="0 0 100 150" preserveAspectRatio="none" className="h-full" style={{ flexBasis: `calc(${at}% - 150px)` }}>
        <path d="M0 26 C30 14 70 34 100 20 L100 150 L0 150 Z" fill={color} />
      </svg>
      <div className="relative h-full w-[300px] shrink-0">
        <svg viewBox="0 0 300 150" className="absolute inset-0 h-full w-full">
          <path d="M0 20 L16 20 Q46 20 46 40 A104 104 0 0 0 254 40 Q254 20 284 20 L300 20 L300 150 L0 150 Z" fill={color} />
        </svg>
        {image && (
          <img
            src={image}
            alt=""
            className="pointer-events-auto absolute left-[60px] top-[-50px] h-[180px] w-[180px] rounded-full object-cover"
          />
        )}
      </div>
      <svg viewBox="0 0 100 150" preserveAspectRatio="none" className="h-full flex-1">
        <path d="M0 20 C30 30 70 8 100 24 L100 150 L0 150 Z" fill={color} />
      </svg>
    </div>
  );
}

// Nhãn phẳng dán sát mép trái bên trong khung ảnh (không bóng, không lòi ra)
export function EdgeTag({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={`absolute left-0 top-6 z-10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#faf5f0] ${className}`}
      style={{ background: P.green }}
    >
      {children}
    </span>
  );
}

// Khối màu đặc phẳng (ô vuông / thanh) đặt sát mép hoặc góc của khối cha (relative)
export function Block({ className = "", color = P.green }: { className?: string; color?: string }) {
  return <span className={`pointer-events-none absolute z-10 ${className}`} style={{ background: color }} aria-hidden />;
}

// Tiêu đề mục: chữ in hoa lớn + đường kẻ kéo dài
export function Heading({ children, id, aside, light = false }: { children: ReactNode; id?: string; aside?: ReactNode; light?: boolean }) {
  return (
    <div id={id} className="flex scroll-mt-24 flex-wrap items-end gap-x-8 gap-y-4">
      <h2 className="text-4xl font-medium uppercase leading-[1.05] tracking-[-0.02em] md:text-6xl">{children}</h2>
      {/* Thanh màu đặc ngắn rồi đường kẻ mảnh kéo dài (phẳng, như slide mẫu) */}
      <span className="mb-3 hidden items-center md:flex md:flex-1">
        <span className="h-1.5 w-14 shrink-0" style={{ background: P.green }} />
        <span className="h-px min-w-16 flex-1" style={{ background: light ? "rgba(250,245,240,0.4)" : P.black }} />
      </span>
      {aside}
    </div>
  );
}
