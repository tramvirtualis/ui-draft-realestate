import { STATUS } from "../inventoryStatus";
import { area, billion, dateVi, million } from "../../unitDetail/unitDetailFormat";
import type { ProjectUnit } from "../../../../../types/project/projectUnits.types";

/**
 Một tiêu chí so sánh: text hiển thị (null = chưa có).
 Tiêu chí người mua quan tâm rõ "hơn / kém" (giá, diện tích, chiết khấu, ngân hàng) có thêm num + best + highlight
 để đánh dấu căn tốt nhất; tiêu chí tùy sở thích (hướng, tầng, loại hình...) chỉ hiển thị, không xếp hạng.
 */
export type CompareRow = {
  label: string;
  text: (u: ProjectUnit) => string | null;
  num?: (u: ProjectUnit) => number | null;
  best?: "min" | "max";
  highlight?: string; // nhãn của căn tốt nhất, vd "Giá thấp nhất"
  delta?: (diff: number) => string; // chênh lệch so với căn tốt nhất
};

export type CompareGroup = { title: string; rows: CompareRow[] };

const positive = (n: number | null) => (n != null && n > 0 ? n : null);
const comma = (n: number) => n.toLocaleString("vi-VN", { maximumFractionDigits: 2 });
const plain = (s: string | null | undefined) => (s && s.trim() && s !== "—" ? s.trim() : null);

export const COMPARE_GROUPS: CompareGroup[] = [
  {
    title: "Giá bán",
    rows: [
      { label: "Giá niêm yết", text: (u) => billion(u.priceBillion), num: (u) => positive(u.priceBillion), best: "min", highlight: "Giá thấp nhất", delta: (d) => `+${comma(d)} tỷ` },
      { label: "Đơn giá", text: (u) => million(u.unitPriceMillion), num: (u) => positive(u.unitPriceMillion), best: "min", highlight: "Đơn giá tốt nhất", delta: (d) => `+${comma(d)} tr/m²` },
      { label: "Giá thanh toán sớm", text: (u) => billion(u.prepaymentPriceBillion), num: (u) => positive(u.prepaymentPriceBillion), best: "min", highlight: "Giá TT sớm tốt nhất", delta: (d) => `+${comma(d)} tỷ` },
      { label: "Chiết khấu TT sớm", text: (u) => (u.prepaymentDiscountRate ? `${comma(u.prepaymentDiscountRate)}%` : null), num: (u) => positive(u.prepaymentDiscountRate), best: "max", highlight: "Chiết khấu cao nhất", delta: (d) => `−${comma(d)}%` },
      { label: "Giá vay", text: (u) => billion(u.loanPriceBillion) },
    ],
  },
  {
    title: "Thông tin căn",
    rows: [
      { label: "Loại hình", text: (u) => plain(u.type) },
      { label: "Phân khu", text: (u) => plain(u.zone) },
      { label: "Hướng", text: (u) => plain(u.direction) },
      { label: "Tầng", text: (u) => (u.floor != null ? String(u.floor) : null) },
      { label: "Tình trạng", text: (u) => STATUS[u.status].label },
    ],
  },
  {
    title: "Diện tích",
    rows: [
      { label: "Diện tích đất", text: (u) => area(u.area), num: (u) => positive(u.area), best: "max", highlight: "Đất rộng nhất", delta: (d) => `−${comma(d)} m²` },
      { label: "Diện tích xây dựng", text: (u) => area(u.constructionArea), num: (u) => positive(u.constructionArea), best: "max", highlight: "Xây dựng rộng nhất", delta: (d) => `−${comma(d)} m²` },
    ],
  },
  {
    title: "Tài chính & chính sách",
    rows: [
      { label: "Ngân hàng hỗ trợ", text: (u) => (u.banks.length > 0 ? u.banks.join(", ") : null), num: (u) => positive(u.banks.length), best: "max", highlight: "Nhiều ngân hàng nhất" },
      { label: "Quà tặng", text: (u) => plain(u.gift) },
      { label: "Chính sách áp dụng từ", text: (u) => dateVi(u.salesPolicyEffectiveDate) },
      { label: "Tiêu chuẩn bàn giao", text: (u) => plain(u.handoverStandard) },
    ],
  },
];

const RANKED_ROWS = COMPARE_GROUPS.flatMap((g) => g.rows).filter((r) => r.highlight);

// Giá trị tốt nhất của một tiêu chí; null khi dưới 2 căn có số liệu hoặc các căn bằng nhau (không có gì để nổi bật)
export function bestValue(row: CompareRow, units: ProjectUnit[]): number | null {
  if (!row.num || !row.best) return null;
  const values = units.map(row.num).filter((n): n is number => n != null);
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (min === max) return null;
  return row.best === "min" ? min : max;
}

// Các điểm nổi bật: mỗi tiêu chí xếp hạng được → (các) căn tốt nhất ở tiêu chí đó
export function highlights(units: ProjectUnit[]): { label: string; winners: ProjectUnit[] }[] {
  return RANKED_ROWS.flatMap((row) => {
    const best = bestValue(row, units);
    if (best === null) return [];
    return [{ label: row.highlight as string, winners: units.filter((u) => row.num?.(u) === best) }];
  });
}

// Các căn có cùng giá trị ở tiêu chí này (dùng cho "Chỉ hiện điểm khác nhau")
export const isSame = (row: CompareRow, units: ProjectUnit[]) => new Set(units.map((u) => row.text(u) ?? "")).size <= 1;

// Ảnh của căn: bộ ảnh nếu có, không thì ảnh đại diện
export const photosOf = (u: ProjectUnit) => (u.images.length > 0 ? u.images : u.image ? [u.image] : []);
