// TODO: thay bằng dữ liệu gọi từ API khi backend có module lãi suất (chỉ là dữ liệu mẫu cho giao diện)

export type RateTone = "primary" | "success" | "violet" | "warning";

export interface RateStat {
  key: string;
  label: string;
  value: string;
  note: string;
  tone: RateTone;
  icon: "bank" | "trend-down" | "chart" | "alert";
  noteTone?: "default" | "warning";
}

export const RATE_STATS: RateStat[] = [
  { key: "banks", label: "Ngân hàng đang theo dõi", value: "4", note: "16 gói vay đang áp dụng", tone: "primary", icon: "bank" },
  { key: "lowest", label: "Lãi suất thấp nhất", value: "5,9%", note: "Vietcombank · 12 tháng", tone: "success", icon: "trend-down" },
  { key: "average", label: "Lãi suất trung bình", value: "6,7%", note: "Giảm 0,1% trong 30 ngày", tone: "violet", icon: "chart" },
  { key: "expiring", label: "Ưu đãi sắp hết hạn", value: "3", note: "Trong 14 ngày tới", tone: "warning", icon: "alert", noteTone: "warning" },
];

export interface BankBrand {
  code: string;
  name: string;
  color: string; // màu nhận diện của ngân hàng
}

export const BANKS: Record<string, BankBrand> = {
  vcb: { code: "VCB", name: "Vietcombank", color: "#0b7a4b" },
  bidv: { code: "BIDV", name: "BIDV", color: "#0b4ea2" },
  tcb: { code: "TCB", name: "Techcombank", color: "#d81f26" },
  vp: { code: "VP", name: "VPBank", color: "#0c8a46" },
};

export const TREND_MONTHS = ["Thg 5", "Thg 6", "Thg 7", "Thg 8", "Thg 9", "Thg 10"];

export interface TrendSeries {
  bank: string;
  label: string;
  color: string;
  values: number[]; // % theo từng tháng trong TREND_MONTHS
}

export const TREND_SERIES: TrendSeries[] = [
  { bank: "vcb", label: "Vietcombank", color: "#0b7a4b", values: [8.0, 7.2, 6.9, 6.5, 6.1, 5.9] },
  { bank: "bidv", label: "BIDV", color: "#0b4ea2", values: [8.0, 7.4, 6.95, 6.6, 6.2, 5.95] },
  { bank: "tcb", label: "Techcombank", color: "#d81f26", values: [8.0, 7.55, 7.1, 6.75, 6.3, 6.0] },
  { bank: "vp", label: "VPBank", color: "#8b5cf6", values: [8.0, 7.6, 7.0, 6.65, 6.25, 5.9] },
];

export interface BestRate {
  bank: string;
  plan: string;
  rate: string;
}

export const BEST_RATES: BestRate[] = [
  { bank: "vcb", plan: "Nhà ở an tâm · 12 tháng", rate: "5,9%" },
  { bank: "bidv", plan: "An cư vững bước · 12 tháng", rate: "6,2%" },
  { bank: "tcb", plan: "HomeOne · 18 tháng", rate: "6,5%" },
  { bank: "vp", plan: "Vay mua nhà ưu đãi · 24 tháng", rate: "7,1%" },
];

export type UpdateTone = "success" | "primary" | "warning" | "violet";

export interface RateUpdate {
  id: number;
  bank: string;
  text: string;
  meta: string;
  badge: string;
  tone: UpdateTone;
}

export const RATE_UPDATES: RateUpdate[] = [
  { id: 1, bank: "vcb", text: "Giảm lãi suất gói Nhà ở an tâm từ 6,1% xuống 5,9%/năm", meta: "08:42 · 02/10/2026 · cập nhật bởi Lê Thu Trang", badge: "-0,2%", tone: "success" },
  { id: 2, bank: "bidv", text: "Cập nhật thời gian ưu đãi gói An cư vững bước lên 12 tháng", meta: "16:20 · 01/10/2026 · cập nhật bởi Lê Thu Trang", badge: "12 tháng", tone: "primary" },
  { id: 3, bank: "tcb", text: "Gói HomeOne sẽ kết thúc ưu đãi sau 9 ngày", meta: "14:05 · 01/10/2026 · cập nhật bởi Lê Thu Trang", badge: "Sắp hết hạn", tone: "warning" },
  { id: 4, bank: "vp", text: "Điều chỉnh tỷ lệ vay tối đa từ 75% lên 80% giá trị tài sản", meta: "10:18 · 30/09/2026 · cập nhật bởi Lê Thu Trang", badge: "80%", tone: "violet" },
];
