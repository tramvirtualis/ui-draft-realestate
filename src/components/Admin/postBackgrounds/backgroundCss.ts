// Chuyển qua lại giữa giá trị CSS lưu ở BE và các ô chọn màu trong form quản trị.
// BE chỉ nhận "#rrggbb" hoặc "linear-gradient(<góc>deg, #rrggbb <vị trí>%, ...)" (PostBackgroundRequest)

export type BackgroundKind = "solid" | "gradient";

export interface BackgroundDraft {
  kind: BackgroundKind;
  from: string;
  to: string;
  angle: number;
}

export const WHITE_TEXT = "#ffffff";
export const DARK_TEXT = "#111827";

export const GRADIENT_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];

const HEX = /#[0-9a-fA-F]{6}/g;

export const buildBackgroundCss = ({ kind, from, to, angle }: BackgroundDraft) =>
  kind === "solid" ? from.toLowerCase() : `linear-gradient(${angle}deg, ${from.toLowerCase()} 0%, ${to.toLowerCase()} 100%)`;

// Gradient nhiều hơn 2 màu (nếu có) thì lấy màu đầu và màu cuối
export const parseBackgroundCss = (value: string): BackgroundDraft => {
  const colors = value.match(HEX) ?? ["#2563eb"];
  if (!value.startsWith("linear-gradient")) {
    return { kind: "solid", from: colors[0], to: "#db2777", angle: 135 };
  }
  const angle = Number(/(\d{1,3})deg/.exec(value)?.[1] ?? 135);
  return { kind: "gradient", from: colors[0], to: colors[colors.length - 1], angle };
};

// Độ sáng 0–1 của mã màu #rrggbb (công thức luminance tương đối)
const luminance = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

// Gợi ý màu chữ: nền sáng → chữ đậm, nền tối → chữ trắng
export const suggestTextColor = ({ kind, from, to }: BackgroundDraft) => {
  const light = kind === "solid" ? luminance(from) : (luminance(from) + luminance(to)) / 2;
  return light > 0.45 ? DARK_TEXT : WHITE_TEXT;
};

export const isHexColor = (value: string) => /^#[0-9a-fA-F]{6}$/.test(value);
