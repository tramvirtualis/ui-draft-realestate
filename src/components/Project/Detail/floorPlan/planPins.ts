import { divIcon, type DivIcon } from "leaflet";
import type { FundType } from "../../../../types/project/project.types";

export const FUND_TYPES: { key: FundType; label: string; color: string }[] = [
  { key: "EXCLUSIVE", label: "Quỹ độc quyền", color: "#e11d1d" },
  { key: "HIDDEN_CROSS", label: "Quỹ ẩn + chéo", color: "#9a7b0a" },
  { key: "BONUS", label: "Quỹ thưởng", color: "#16c04d" },
];

export const UNCLASSIFIED = { label: "Chưa phân loại", color: "#6b7280" };

// Căn không còn trống: ghim đổi màu theo trạng thái, ưu tiên hơn màu loại quỹ
export const UNIT_STATE_PINS = {
  HOLDING: { label: "Đang giữ chỗ", color: "#7c3aed" },
  SOLD: { label: "Đã bán / không mở bán", color: "#475569" },
} as const;

export const fundColor = (type: FundType | null): string =>
  FUND_TYPES.find((f) => f.key === type)?.color ?? UNCLASSIFIED.color;

export const fundLabel = (type: FundType | null): string =>
  FUND_TYPES.find((f) => f.key === type)?.label ?? UNCLASSIFIED.label;

// Hình giọt nước (ghim bản đồ); đỉnh nhọn nằm ở đúng toạ độ của căn
const PIN_PATH = "M20 48C20 48 3 31 3 19a17 17 0 0 1 34 0c0 12-17 29-17 29z";

const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] ?? c);

export const PIN_SCALE = { min: 0.6, max: 2, step: 0.1, default: 1 };

type PinOptions = { color: string; label: string; active?: boolean; dimmed?: boolean; title?: string; scale?: number; locked?: boolean };

// Ghim có nhãn (giá hoặc mã căn) nằm trong phần tròn; căn đang chọn phóng to
export function pinIcon({ color, label, active = false, dimmed = false, title, scale: size = 1, locked = false }: PinOptions): DivIcon {
  const scale = active ? 1.25 : 1;
  const w = Math.round(40 * size);
  const h = Math.round(50 * size);
  const font = Math.max(8, Math.round(10.5 * size * 10) / 10);
  const html = `
    <div title="${escapeHtml(title ?? label)}" style="position:relative;width:${w}px;height:${h}px;transform:scale(${scale});transform-origin:50% 100%;opacity:${dimmed ? 0.35 : 1};transition:transform .15s ease, opacity .15s ease;filter:drop-shadow(0 2px 3px rgba(0,0,0,.35));">
      <svg viewBox="0 0 40 50" width="${w}" height="${h}" aria-hidden="true">
        <path d="${PIN_PATH}" fill="${color}" stroke="${active ? "#1a0b3d" : "#ffffff"}" stroke-width="${active ? 3 : 2}"/>
      </svg>
      <span style="position:absolute;left:0;top:${Math.round(11 * size)}px;width:${w}px;text-align:center;font:700 ${font}px/1 system-ui,sans-serif;color:#fff;letter-spacing:-.2px;">${escapeHtml(label)}</span>
      ${locked ? `<span style="position:absolute;right:${Math.round(-3 * size)}px;top:${Math.round(-3 * size)}px;width:${Math.round(16 * size)}px;height:${Math.round(16 * size)}px;border-radius:9999px;background:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 1px 2px rgba(0,0,0,.3);"><svg viewBox="0 0 24 24" width="${Math.round(10 * size)}" height="${Math.round(10 * size)}" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg></span>` : ""}
    </div>`;
  return divIcon({ html, className: "", iconSize: [w, h], iconAnchor: [Math.round(w / 2), Math.round(h * 0.96)] });
}
