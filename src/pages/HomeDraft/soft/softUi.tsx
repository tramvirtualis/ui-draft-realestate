import type { ReactNode } from "react";

// Bảng màu trang nháp phong cách mềm: mực navy, nhấn xanh rừng (chữ nhấn), xanh tươi (nút, khối), xanh nhạt (mảng tô)
export const S = {
  ink: "#161b2c",
  muted: "rgba(22,27,44,0.62)",
  accent: "#146b43",
  fresh: "#2bb673",
  tint: "#dcf3e4",
  bronze: "#94713a", // vàng nâu đậm (bảng màu home-draft-3 cũ): thanh tiến độ hành trình
  bronzeTint: "#efe3c8", // vàng nâu nhạt: rãnh của thanh
  dark: "#0f1626",
  cream: "#f6f1e7",
};

export const SERIF = '"Playfair Display", Georgia, serif';
export const SANS = '"Be Vietnam Pro", ui-sans-serif, system-ui, sans-serif';

// Nhãn nhỏ viết hoa giãn chữ phía trên tiêu đề
export function Eyebrow({ children, light = false }: { children: ReactNode; light?: boolean }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.4em]" style={{ color: light ? "#86efac" : S.accent }}>
      {children}
    </p>
  );
}

// Tiêu đề mục: serif chữ thường, phần nhấn in nghiêng tô màu (cùng dòng, tự xuống dòng khi hẹp)
export function SoftHeading({ eyebrow, title, accent, center = false }: { eyebrow: string; title: ReactNode; accent?: ReactNode; center?: boolean }) {
  return (
    <div className={center ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="mt-4 text-4xl font-medium leading-[1.18] md:text-6xl" style={{ fontFamily: SERIF, color: S.ink }}>
        {title}{" "}
        {accent && (
          <span className="italic" style={{ color: S.accent }}>
            {accent}
          </span>
        )}
      </h2>
    </div>
  );
}
