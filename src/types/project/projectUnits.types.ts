import type { PropertyStatus } from "./property.types";

// Một căn trong quỹ căn công khai của dự án (dựng từ bảng Property + Zones)
export interface ProjectUnit {
  id: number;
  code: string;
  zoneId: number;
  zone: string;
  area: number | null; // m²
  priceBillion: number | null; // tỷ VNĐ
  unitPriceMillion: number | null; // triệu/m²
  direction: string;
  floor: number | null;
  type: string; // loại hình của căn: "Biệt thự", "Liền kề"...
  status: PropertyStatus;
  image: string | null;
  images: string[];
  constructionArea: number | null; // m²
  loanPriceBillion: number | null; // tỷ VNĐ
  prepaymentPriceBillion: number | null; // giá thanh toán sớm = giá × (1 − chiết khấu)
  prepaymentDiscountRate: number | null;
  banks: string[];
  pricingSheet: string | null;
  layoutUrl: string | null;
  salesPolicyEffectiveDate: string | null;
  salesPolicySummaryUrl: string | null;
  salesPolicyDetailUrl: string | null;
  gift: string | null;
  handoverStandard: string | null;
  propertyInventoryType: string | null;
}

export interface ProjectUnitsData {
  project: { id: number; name: string; location: string; overviewImage: string; bookingEnabled: boolean };
  zones: { id: number; name: string }[];
  units: ProjectUnit[];
}
