import type { ReactNode } from "react";

// Bảng màu trang nháp phong cách mềm: mực navy, nhấn xanh lá (chữ nhấn, nút, khối, mảng tô) + vàng kim (nhãn nhỏ, vạch, ngoặc kép, thanh tiến độ)
export const S = {
  ink: "#161b2c",
  muted: "rgba(22,27,44,0.62)",
  accent: "#0a9150",
  fresh: "#22c55e",
  tint: "#d6f7e1",
  bronze: "#c9a14a", // vàng kim: thanh tiến độ hành trình, ngôi sao
  bronzeTint: "#f3e6c4", // vàng kim nhạt: rãnh của thanh
  gold: "#b08a2e", // vàng kim đậm: nhãn nhỏ, chi tiết trên nền kem (đủ tương phản)
  goldBright: "#e6c35c", // vàng kim sáng: chi tiết trên nền tối / ảnh, ngoặc kép trang trí
  dark: "#0f1626",
  cream: "#f6f1e7",
};

export const SERIF = '"Playfair Display", Georgia, serif';
export const SANS = '"Be Vietnam Pro", ui-sans-serif, system-ui, sans-serif';

// Nhãn nhỏ viết hoa giãn chữ phía trên tiêu đề
export function Eyebrow({ children, light = false }: { children: ReactNode; light?: boolean }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.4em]" style={{ color: light ? S.goldBright : S.gold }}>
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
