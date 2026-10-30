import { divIcon, type DivIcon } from "leaflet";
import type { FundType } from "../../../../types/project/project.types";

export const FUND_TYPES: { key: FundType; label: string; color: string }[] = [
  { key: "EXCLUSIVE", label: "Quỹ độc quyền", color: "#e11d1d" },
  { key: "HIDDEN_CROSS", label: "Quỹ ẩn + chéo", color: "#9a7b0a" },
  { key: "BONUS", label: "Quỹ thưởng", color: "#16c04d" },
];

export const UNCLASSIFIED = { label: "Chưa phân loại", color: "#6b7280" };

export const fundColor = (type: FundType | null): string =>
  FUND_TYPES.find((f) => f.key === type)?.color ?? UNCLASSIFIED.color;

export const fundLabel = (type: FundType | null): string =>
  FUND_TYPES.find((f) => f.key === type)?.label ?? UNCLASSIFIED.label;

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] ?? c);

export const PIN_SCALE = { min: 0.6, max: 2, step: 0.1, default: 1 };

/**
 * Định dạng giá ngắn gọn hiển thị trên ô bảng hàng:
 * vd: 2_920_000_000 -> "2.92 tỷ"
 *     5_360_000_000 -> "5.36 tỷ"
 *     800_000_000   -> "800 tr"
 *     Nếu người dùng nhập trực tiếp số tỷ < 1000 (vd: 2.92) -> "2.92 tỷ"
 */
export function formatSheetPrice(vnd?: number | null): string {
  if (vnd == null || isNaN(vnd) || vnd <= 0) return "";
  if (vnd >= 1_000_000_000) {
    const b = vnd / 1_000_000_000;
    return `${b.toFixed(2).replace(/\.00$/, "").replace(/(\.[1-9])0$/, "$1")} tỷ`;
  }
  if (vnd >= 1_000_000) {
    const m = vnd / 1_000_000;
    return `${m.toFixed(0)} tr`;
  }
  if (vnd < 1000) {
    return `${vnd.toFixed(2).replace(/\.00$/, "").replace(/(\.[1-9])0$/, "$1")} tỷ`;
  }
  return `${vnd.toLocaleString("vi-VN")} đ`;
}

type BadgeOptions = {
  color: string;
  label: string;
  active?: boolean;
  dimmed?: boolean;
  title?: string;
  scale?: number;
};

/**
 * Thẻ hình chữ nhật hiển thị số tiền / loại quỹ nằm gọn trong ô ma trận bảng hàng
 * Dành riêng cho Bảng hàng (Sales Sheet), không ảnh hưởng đến các bản vẽ/ghim khác
 */
export function salesSheetBadgeIcon({
  color,
  label,
  active = false,
  dimmed = false,
  title,
  scale: size = 1,
}: BadgeOptions): DivIcon {
  const scale = active ? 1.15 : 1;
  const w = Math.round(54 * size);
  const h = Math.round(20 * size);
  const font = Math.max(9, Math.round(10.5 * size * 10) / 10);
  const html = `
    <div title="${escapeHtml(title ?? label)}" style="
      position: relative;
      width: ${w}px;
      height: ${h}px;
      transform: scale(${scale});
      transform-origin: 50% 50%;
      background-color: ${color};
      color: #ffffff;
      border-radius: ${Math.round(2 * size)}px;
      display: flex;
      align-items: center;
      justify-content: center;
      font: 700 ${font}px/1 system-ui, -apple-system, sans-serif;
      letter-spacing: -0.2px;
      white-space: nowrap;
      user-select: none;
      box-shadow: ${
        active
          ? "0 0 0 2px #ffffff, 0 0 0 4px " + color + ", 0 3px 6px rgba(0,0,0,0.35)"
          : "0 1px 2px rgba(0,0,0,0.3)"
      };
      opacity: ${dimmed ? 0.35 : 1};
      transition: transform .12s ease, box-shadow .12s ease;
      cursor: pointer;
    ">
      <span>${escapeHtml(label)}</span>
    </div>`;

  return divIcon({
    html,
    className: "",
    iconSize: [w, h],
    iconAnchor: [Math.round(w / 2), Math.round(h / 2)],
  });
}

export interface SheetPin {
  propertyId: number;
  code: string;
  fundType: FundType | null;
  x: number;
  y: number;
  floor?: number | null;
  axis?: string | null;
  price?: number | null;
}
