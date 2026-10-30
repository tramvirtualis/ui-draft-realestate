import { useEffect, type ReactNode } from "react";

// Dùng chung cho trang chủ nháp (/home-draft-3): bảng màu, font, ảnh "sơn màu", tiêu đề mục

export const P = {
  // Nền kem như home-draft-3: trang → thẻ → mục đậm hơn; lilac: chữ lớn nhạt (chặng chưa xem)
  bg: "#f6f1e7",
  card: "#efe6d6",
  blush: "#e6dccb",
  lilac: "#d6cbb8",
  black: "#101010",
  muted: "rgba(16,16,16,0.6)",
  // Hai tông xanh phối nhau: xanh rừng đậm cho chữ / nét, xanh tươi cho khối màu, xanh nhạt cho mảng tô
  green: "#0a9150", // xanh rừng ĐẬM: chi tiết nhỏ tạo tương phản (vạch, chấm, số, nhãn, icon, chữ nhấn)
  mint: "#d6f7e1", // xanh NHẠT: mảng tô màu (nền ô khi rê chuột)
  neon: "#22c55e", // xanh TƯƠI: khối màu trang trí, nút
};

export const FONT = '"Inter Tight", "Inter", system-ui, sans-serif';
export const MONO = '"JetBrains Mono", ui-monospace, monospace';

// Tải font Inter Tight + JetBrains Mono (chữ số kiểu bảng điện tử) chỉ khi mở trang nháp
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

// Ảnh có hiệu ứng sơn màu: rê chuột vào nhóm (group) thì lớp màu nhấn trượt từ mép trên xuống phủ kín ảnh
export function PaintImage({ src, alt = "", className = "", zoom = true }: { src: string; alt?: string; className?: string; zoom?: boolean }) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <img src={src} alt={alt} loading="lazy" className={`h-full w-full object-cover transition duration-[1200ms] ${zoom ? "group-hover:scale-105" : ""}`} />
      <span
        className="pointer-events-none absolute inset-0 origin-top scale-y-0 opacity-30 mix-blend-multiply transition-transform duration-700 ease-[cubic-bezier(0.65,0,0.35,1)] group-hover:scale-y-100"
        style={{ background: "#bbf7d0" }}
        aria-hidden
      />
    </div>
  );
}

// Chữ đổi sang màu sơn khi rê chuột vào nhóm
export const paintText = "transition-colors duration-500 group-hover:text-[#0a9150]";

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

// Nhãn phẳng dán sát mép trái bên trong khung ảnh (không bóng, không lòi ra)
export function EdgeTag({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={`absolute left-0 top-6 z-10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#f6f1e7] ${className}`}
      style={{ background: P.green }}
    >
      {children}
    </span>
  );
}

// Khối màu đặc phẳng (ô vuông / thanh) đặt sát mép hoặc góc của khối cha (relative)
export function Block({ className = "", color = P.neon }: { className?: string; color?: string }) {
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
        <span className="h-px min-w-16 flex-1" style={{ background: light ? "rgba(246,241,231,0.4)" : P.black }} />
      </span>
      {aside}
    </div>
  );
}
