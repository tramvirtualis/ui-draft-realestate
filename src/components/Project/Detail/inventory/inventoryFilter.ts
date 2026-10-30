import type { ProjectUnit } from "../../../../types/project/projectUnits.types";

export type InventoryFilter = { q: string; price: string; type: string; dir: string; zone: string; status: string };

export const EMPTY_FILTER: InventoryFilter = { q: "", price: "", type: "", dir: "", zone: "", status: "" };

export const DIRECTION_OPTIONS = ["Bắc", "Đông Bắc", "Đông", "Đông Nam", "Nam", "Tây Nam", "Tây", "Tây Bắc"];

// [giá trị, nhãn] của ô Khoảng giá (khớp nhánh lọc giá trong filterUnits)
export const PRICE_OPTIONS: [string, string][] = [
  ["", "Tất cả khoảng giá"],
  ["lt10", "Dưới 10 tỷ"],
  ["10-20", "10 – 20 tỷ"],
  ["gt20", "Trên 20 tỷ"],
];

// Áp bộ lọc lên danh sách căn (giá tính theo tỷ VNĐ)
export function filterUnits(units: ProjectUnit[], f: InventoryFilter): ProjectUnit[] {
  const q = f.q.trim().toLowerCase();
  return units.filter((u) => {
    if (q && !u.code.toLowerCase().includes(q)) return false;
    if (f.zone && String(u.zoneId) !== f.zone) return false;
    if (f.status && u.status !== f.status) return false;
    if (f.dir && u.direction !== f.dir) return false;
    if (f.type && u.type !== f.type) return false;
    if (f.price) {
      const p = u.priceBillion;
      if (p == null) return false;
      if (f.price === "lt10" && p >= 10) return false;
      if (f.price === "10-20" && (p < 10 || p > 20)) return false;
      if (f.price === "gt20" && p <= 20) return false;
    }
    return true;
  });
}
