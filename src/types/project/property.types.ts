// Bám theo bảng Properties (zone_id → Zones.id, Zones.project_id → Projects.id) và Property_Images
// Không đưa vector_embedding lên giao diện quản trị.

export type PropertyStatus = "available" | "holding" | "sold" | "closed";

// Ảnh đã lưu của căn (id để xóa)
export interface PropertyImageItem {
  id: number;
  imageUrl: string;
}

// Thay đổi ảnh khi lưu căn: ảnh mới chọn từ máy + id các ảnh đã lưu cần xóa
export interface PropertyImageChanges {
  add: File[];
  removeIds: number[];
}

export interface Property {
  id: number;
  zoneId: number;
  buildingId: number | null; // tòa nhà: chỉ căn của dự án cao tầng
  propertyCode: string;
  area: number; // m²
  price: number; // VNĐ, giữ nguyên giá trị gốc
  direction: string;
  floor: number | null; // tầng, trục và số phòng ngủ: chỉ căn của dự án cao tầng
  axis: string | null; // trục căn trong tòa, vd "08"
  bedrooms: number | null;
  status: PropertyStatus;
  type: string; // loại hình (Property_types.name), mỗi căn đúng một loại hình
  constructionArea: number | null; // m²
  prepaymentDiscountRate: number | null; // %
  loanPrice: number | null; // VNĐ
  pricingSheet: string;
  layoutUrl: string;
  salesPolicyEffectiveDate: string; // yyyy-MM-dd hoặc ""
  salesPolicySummaryUrl: string;
  salesPolicyDetailUrl: string;
  gift: string;
  handoverStandard: string;
  propertyInventoryType: string;
  images: string[]; // image_url trong Property_Images
  imageItems?: PropertyImageItem[];
}

export type PropertyInput = Omit<Property, "id" | "images">;

export interface PropertyProjectRef {
  id: number;
  name: string;
  highRise: boolean; // dự án cao tầng: căn có tầng + số phòng ngủ
}

export interface PropertyZoneRef {
  id: number;
  projectId: number;
  name: string;
}

export interface PropertyBuildingRef {
  id: number;
  zoneId: number;
  name: string;
  floors: number;
}

// Danh mục dự án/phân khu/tòa nhà dùng cho bộ lọc và form
export interface PropertyCatalog {
  projects: PropertyProjectRef[];
  zones: PropertyZoneRef[];
  buildings: PropertyBuildingRef[];
}

export interface PropertyFilter {
  projectId: number | null;
  zoneId: number | null;
  buildingId: number | null; // tòa nhà (dự án cao tầng)
  keyword: string;
  status: "" | PropertyStatus;
  areaMin: string;
  areaMax: string;
  priceMin: string; // đơn vị: tỷ
  priceMax: string;
}
