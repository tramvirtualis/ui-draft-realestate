export type CompanyStatus = "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";

export const COMPANY_STATUS_ORDER: CompanyStatus[] = [
  "PENDING",
  "APPROVED",
  "REJECTED",
  "SUSPENDED",
];

export const COMPANY_STATUS_META: Record<
  CompanyStatus,
  { label: string; badge: string; dot: string }
> = {
  PENDING: {
    label: "Chờ duyệt",
    badge: "bg-amber-50 text-amber-700",
    dot: "bg-amber-500",
  },
  APPROVED: {
    label: "Đã duyệt",
    badge: "bg-green-50 text-green-700",
    dot: "bg-green-500",
  },
  REJECTED: {
    label: "Bị từ chối",
    badge: "bg-red-50 text-red-600",
    dot: "bg-red-500",
  },
  SUSPENDED: {
    label: "Tạm khóa",
    badge: "bg-gray-100 text-gray-600",
    dot: "bg-gray-400",
  },
};

// Link xem giấy tờ do BE ký, hết hạn sau expiresInSeconds giây → cần xem thì gọi lại API chi tiết
export interface CompanyDocuments {
  businessLicenseUrl: string | null;
  idCardFrontUrl: string | null;
  idCardBackUrl: string | null;
  expiresInSeconds: number;
}

export type CompanyDocumentKey =
  | "businessLicenseUrl"
  | "idCardFrontUrl"
  | "idCardBackUrl";

export const COMPANY_DOCUMENT_LABEL: Record<CompanyDocumentKey, string> = {
  businessLicenseUrl: "Giấy chứng nhận đăng ký kinh doanh",
  idCardFrontUrl: "CCCD mặt trước",
  idCardBackUrl: "CCCD mặt sau",
};

export interface Company {
  id: number;
  name: string;
  taxCode: string;
  address: string;
  phone: string;
  email: string;
  website: string | null;
  description: string | null;
  logoUrl: string | null; // logo công khai, hiện trên tin tuyển dụng
  representativeName: string;
  representativePosition: string | null;
  idCardNumber: string; // chủ hồ sơ nhận dạng che "********4567", admin nhận đủ
  status: CompanyStatus;
  statusLabel: string;
  statusReason: string | null; // lý do từ chối / tạm khóa
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
  owner: {
    id: number;
    fullName: string | null;
    email: string | null;
    phone: string | null;
    avatarUrl: string | null;
  } | null;
  documents: CompanyDocuments | null; // null ở danh sách admin
}

export interface CompanyInput {
  name: string;
  taxCode: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  description: string;
  representativeName: string;
  representativePosition: string;
  idCardNumber: string;
}

export interface CompanyFiles {
  logo: File | null; // không bắt buộc
  businessLicense: File | null;
  idCardFront: File | null;
  idCardBack: File | null;
}

// Logo công ty: ảnh công khai, tối đa 5MB
export const LOGO_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const LOGO_MAX_BYTES = 5 * 1024 * 1024;

// Khớp validate bên BE (CompanyRequest)
export const TAX_CODE_RULE = /^\d{10}(-\d{3})?$/;
export const ID_CARD_RULE = /^\d{12}$/;
export const COMPANY_PHONE_RULE = /^0\d{9,10}$/;
export const WEBSITE_RULE = /^https?:\/\/\S+$/;
export const DOCUMENT_ACCEPT =
  "image/jpeg,image/png,image/webp,application/pdf";
export const DOCUMENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];
export const DOCUMENT_MAX_BYTES = 10 * 1024 * 1024;

// Link ký của Cloudinary có tham số format=pdf với file PDF (ảnh thì nhúng xem trước được)
export const isPdfLink = (url: string) => /[?&]format=pdf(&|$)/.test(url);
