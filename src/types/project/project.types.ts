// Khớp ProjectResponse / ZoneResponse của BE
export type BuildingTypeCode = "HIGH_RISE" | "LOW_RISE";
export type ZoneStatusCode = "PLANNING" | "UNDER_CONSTRUCTION" | "COMPLETED";

export interface ProjectDto {
  id: number;
  name: string;
  overviewImage: string | null;
  location: string | null;
  investor: string | null;
  consultancy: string | null;
  developmentModel: string | null;
  buildingType: BuildingTypeCode | null;
  size: number | null;
  totalInvestment: number | null;
  ownershipType: string | null;
  createdAt: string;
  hidden?: boolean; // khách không xem được (HIDDEN hoặc ARCHIVED)
  status?: "PUBLISHED" | "HIDDEN" | "ARCHIVED";
  bookingEnabled?: boolean; // dự án đang nhận booking giữ chỗ
}

export interface ZoneDto {
  id: number;
  projectId: number;
  name: string;
  description: string | null;
  status: ZoneStatusCode | null;
  imageUrl: string | null;
}

// Ngân hàng hỗ trợ vay của dự án (bảng Bank)
export interface BankDto {
  id: number;
  projectId: number;
  name: string;
  createdAt: string;
}

export type PropertyDirectionCode = "NORTH" | "NORTHEAST" | "EAST" | "SOUTHEAST" | "SOUTH" | "SOUTHWEST" | "WEST" | "NORTHWEST";
export type PropertyStatusCode = "AVAILABLE" | "RESERVED" | "SOLD" | "RENTED";

export interface PropertyDto {
  id: number;
  zoneId: number;
  propertyCode: string;
  area: number | null;
  price: number | null;
  direction: PropertyDirectionCode | null;
  buildingId: number | null;
  floor: number | null;
  axis: string | null;
  bedrooms: number | null;
  status: PropertyStatusCode | null;
  constructionArea: number | null;
  prepaymentDiscountRate: number | null; // % chiết khấu thanh toán sớm
  loanPrice: number | null;
  type: string | null; // loại hình của căn
  pricingSheet: string | null;
  layoutUrl: string | null;
  salesPolicyEffectiveDate: string | null; // yyyy-MM-dd
  salesPolicySummaryUrl: string | null;
  salesPolicyDetailUrl: string | null;
  gift: string | null;
  handoverStandard: string | null;
  propertyInventoryType: string | null;
}

export interface PolicyImageDto {
  id: number;
  projectId: number;
  imageUrl: string;
  createdAt: string;
}

export interface ProgressImageDto {
  id: number;
  progressId: number;
  imageUrl: string;
}

export interface ProgressDto {
  id: number;
  projectId: number;
  title: string;
  content: string | null;
  reportDate: string | null;
  images: ProgressImageDto[] | null;
}

// Khớp FavoriteResponse / FavoriteStatusResponse của BE
export interface FavoriteDto {
  id: number;
  projectId: number;
  userId: number;
  createdAt: string;
  project: ProjectDto;
}

export interface FavoriteStatus {
  projectId: number;
  favorited: boolean;
}

// Khớp AmenityResponse / VideoResponse của BE
export interface AmenityDto {
  id: number;
  projectId: number;
  name: string;
  imageUrl: string | null;
}

export interface VideoDto {
  id: number;
  projectId: number;
  name: string;
  videoUrl: string;
  description: string | null;
  createdAt: string;
}

// Khớp QuestionResponse của BE (hỏi đáp của dự án)
export interface QuestionDto {
  id: number;
  projectId: number;
  question: string;
  answer: string | null;
  createdAt: string;
}

// Khớp FloorPlanResponse / FloorPlanPinResponse của BE (mặt bằng quỹ căn)
// Loại quỹ của căn trên mặt bằng
export type FundType = "EXCLUSIVE" | "HIDDEN_CROSS" | "BONUS";

// Dự án thấp tầng ghim căn (propertyId), dự án cao tầng ghim tòa nhà (buildingId)
export interface FloorPlanPinDto {
  id: number;
  propertyId: number | null;
  propertyCode: string | null;
  buildingId: number | null;
  buildingName: string | null;
  fundType: FundType | null;
  x: number; // % chiều rộng ảnh, gốc ở góc trên trái
  y: number; // % chiều cao ảnh
}

export interface FloorPlanDto {
  id: number;
  projectId: number;
  imageUrl: string | null; // null khi mặt bằng chỉ là PDF
  pdfUrl?: string | null; // bản PDF gốc (vector) để phóng to vẫn sắc nét
  pdfPage?: number | null; // trang PDF đã dùng làm mặt bằng (bắt đầu từ 1)
  pdfWarning?: string | null; // có khi bản PDF gốc không lưu được (ảnh nền vẫn lưu)
  tileBaseUrl?: string | null; // bộ ô ảnh đã cắt sẵn từ PDF: {tileBaseUrl}/{mức}/{x}/{y}.jpg
  tileLevels?: number | null;
  tileWidth?: number | null;
  tileHeight?: number | null;
  pins: FloorPlanPinDto[];
  pinScale: number; // hệ số kích thước ghim (mặc định 1)
  createdAt: string;
}

export interface FloorPlanPinInput {
  propertyId?: number;
  buildingId?: number;
  fundType: FundType | null;
  x: number;
  y: number;
}
