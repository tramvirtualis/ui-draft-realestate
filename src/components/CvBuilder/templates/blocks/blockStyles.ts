/** Màu chữ/thanh theo nền: sáng (cột chính) hoặc tối (cột trái màu chủ đạo của mẫu Modern) */
export const blockTone = (dark: boolean) => ({
  strong: dark ? "text-white" : "text-gray-900",
  text: dark ? "text-white" : "text-gray-800",
  body: dark ? "text-white/90" : "text-gray-700",
  muted: dark ? "text-white/70" : "text-gray-500",
  track: dark ? "bg-white/25" : "bg-gray-200",
  fill: dark ? "#fff" : "var(--cv-color)",
});

/** Các khối con không bị cắt ngang giữa hai trang khi in */
export const AVOID_BREAK = "break-inside-avoid";

export const ACCENT = { color: "var(--cv-color)" } as const;
