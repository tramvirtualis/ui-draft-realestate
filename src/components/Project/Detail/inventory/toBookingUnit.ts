import type { BookingUnit } from "../BookingLockModal";
import type { ProjectUnit } from "../../../../types/project/projectUnits.types";
import { STATUS, fmt } from "./inventoryStatus";

// Ảnh dùng khi căn chưa có ảnh (thẻ căn, khung giữ chỗ)
export const UNIT_IMAGE_FALLBACK = "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=900&q=80";

// Chỉ căn còn trống mới cho giữ chỗ
export const canBook = (unit: ProjectUnit) => unit.status === "available";

export function toBookingUnit(unit: ProjectUnit): BookingUnit {
  return {
    code: unit.code,
    image: unit.image ?? UNIT_IMAGE_FALLBACK,
    statusLabel: STATUS[unit.status].label,
    location: `Phân khu ${unit.zone}${unit.floor ? ` · Tầng ${unit.floor}` : ""}`,
    spec: `${unit.type}${unit.area ? ` · ${unit.area} m²` : ""}`,
    direction: unit.direction || "—",
    price: unit.priceBillion ? fmt(unit.priceBillion) : "Liên hệ",
  };
}
