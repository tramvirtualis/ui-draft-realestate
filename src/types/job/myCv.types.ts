export interface MyCv {
  id: number;
  title: string;
  pdfUrl: string;
  fileName: string;
  fileSize: number | null;
  mimeType: string | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CvRequest {
  title: string;
  isDefault?: boolean;
}

// BE nhận tối đa 10MB, FE giới hạn 5MB cho nhẹ
export const MAX_CV_SIZE = 5 * 1024 * 1024;
export const CV_ACCEPT = ".pdf,.doc,.docx";
// Khớp DOCUMENT_TYPES của CloudinaryService bên BE
const CV_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

/** Trả về thông báo lỗi, rỗng nếu tệp hợp lệ */
export const validateCvFile = (file: File): string => {
  if (!CV_MIME_TYPES.includes(file.type))
    return "Chỉ hỗ trợ tệp PDF, DOC hoặc DOCX.";
  if (file.size > MAX_CV_SIZE) return "Tệp CV tối đa 5MB.";
  return "";
};

/** "1,2 MB" / "340 KB" */
export const formatCvSize = (bytes: number): string =>
  bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / 1024 / 1024).toFixed(1).replace(".", ",")} MB`;

/** "CV_Nguyen_Van_A.pdf" → "CV_Nguyen_Van_A" (tên gợi ý khi lưu CV) */
export const cvTitleFromFile = (file: File): string =>
  file.name.replace(/\.[^.]+$/, "").slice(0, 255);
