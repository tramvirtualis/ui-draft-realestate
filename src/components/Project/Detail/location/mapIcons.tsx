import { renderToStaticMarkup } from "react-dom/server";
import { divIcon, type DivIcon } from "leaflet";
import { Building2 } from "lucide-react";

// Bản đồ nền OpenStreetMap (miễn phí, không cần API key; bắt buộc ghi nguồn)
export const TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
export const TILE_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

// Biểu tượng và màu của dự án trên bản đồ (marker + nhãn tên)
export const PROJECT_ICON = Building2;
export const PROJECT_COLOR = "#13294b";

let cached: DivIcon | null = null;

// Marker dự án: tròn lớn màu thương hiệu, icon tòa nhà
export function projectIcon(): DivIcon {
  if (cached) return cached;
  const size = 48;
  const svg = renderToStaticMarkup(<PROJECT_ICON size={22} strokeWidth={2.2} />);
  cached = divIcon({
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
    html: `<span style="display:flex;width:${size}px;height:${size}px;align-items:center;justify-content:center;border-radius:9999px;background:${PROJECT_COLOR};color:#fff;border:2px solid #fff;box-shadow:0 4px 12px rgba(15,23,42,.3)">${svg}</span>`,
  });
  return cached;
}
