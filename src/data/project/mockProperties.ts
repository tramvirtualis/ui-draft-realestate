import type { Property, PropertyStatus } from "../../types/project/property.types";

// Dữ liệu demo cho giao diện quản trị, KHÔNG phải dữ liệu từ backend.
// TODO: thay bằng API (Properties + Property_Images).
// zoneId = projectId * 100 + số thứ tự phân khu trong dự án (khớp phân khu của mockAdminProjects).

export const PROPERTY_STATUS: Record<PropertyStatus, { label: string; badge: string; dot: string }> = {
  available: { label: "Đang mở bán", badge: "bg-success/10 text-success", dot: "bg-success" },
  holding: { label: "Đã giữ chỗ", badge: "bg-warning/10 text-warning", dot: "bg-warning" },
  sold: { label: "Đã bán", badge: "bg-danger/10 text-danger", dot: "bg-danger" },
  closed: { label: "Đã cho thuê", badge: "bg-primary-100 text-primary-700", dot: "bg-primary-500" },
};

export const DIRECTIONS = ["Đông", "Tây", "Nam", "Bắc", "Đông Nam", "Đông Bắc", "Tây Nam", "Tây Bắc"];

const img = (id: string) => `https://images.unsplash.com/${id}?w=900&q=80`;
const ROOM = [img("photo-1600607687939-ce8a6c25118c"), img("photo-1600585154340-be6161a56a0c")];

let seq = 0;
const p = (zoneId: number, propertyCode: string, area: number, priceBillion: number, direction: string, floor: number, bedrooms: number, status: PropertyStatus, images: string[] = []): Property => ({
  id: ++seq, zoneId, buildingId: null, propertyCode, area, price: Math.round(priceBillion * 1_000_000_000), direction, floor, axis: null, bedrooms, status, images,
  type: bedrooms === 0 ? "Studio" : `${bedrooms}PN`,
  constructionArea: null, prepaymentDiscountRate: null, loanPrice: null,
  pricingSheet: "", layoutUrl: "", salesPolicyEffectiveDate: "", salesPolicySummaryUrl: "", salesPolicyDetailUrl: "",
  gift: "", handoverStandard: "", propertyInventoryType: "",
});

export const MOCK_PROPERTIES: Property[] = [
  p(101, "A1-1208", 92.6, 16.85, "Đông Nam", 12, 3, "available", ROOM),
  p(101, "A1-1506", 76.8, 13.42, "Tây Bắc", 15, 2, "holding"),
  p(101, "A1-0902", 66.2, 8.96, "Đông Bắc", 9, 1, "sold"),
  p(101, "A2-1805", 104, 15.6, "Đông Nam", 18, 3, "available"),
  p(102, "B2-0803", 86.7, 12.45, "Tây Bắc", 8, 2, "available", [ROOM[1]]),
  p(102, "B2-1106", 83.4, 11.75, "Bắc", 11, 2, "sold"),
  p(102, "B1-2501", 194, 34.5, "Đông Nam", 25, 4, "closed"),
  p(201, "C1-0902", 68.5, 6.8, "Đông", 9, 2, "available", ROOM),
  p(201, "C1-1203", 72, 7.4, "Nam", 12, 2, "holding"),
  p(201, "C1-1801", 95, 9.9, "Đông Nam", 18, 3, "available"),
  p(201, "C2-0507", 52, 5.2, "Tây", 5, 1, "sold"),
  p(202, "D1-1501", 118.2, 22.1, "Đông Nam", 15, 3, "available"),
  p(202, "D1-2002", 144, 22.8, "Nam", 20, 3, "holding"),
  p(203, "E1-0301", 168, 31.5, "Đông", 3, 4, "available"),
  p(203, "E1-0302", 160, 29.9, "Đông", 3, 4, "sold"),
  p(204, "G1-0709", 76.4, 10.88, "Tây Nam", 7, 2, "available"),
  p(204, "G1-1903", 95, 13.92, "Đông", 19, 3, "holding"),
  p(204, "G2-2802", 130, 19.5, "Đông Nam", 28, 0, "closed"),
];
