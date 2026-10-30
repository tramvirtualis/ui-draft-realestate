// Khớp DocumentResponse / DocumentCategoryResponse của BE (module document)

export type DocumentType = "FILE" | "ARTICLE";

export type DocumentIndexStatus = "PENDING" | "INDEXED" | "FAILED" | "SKIPPED";

export interface DocumentCategory {
  id: number;
  name: string;
  slug: string;
  active: boolean | null;
  createdAt: string;
}

export interface DocumentCategoryWithCount extends DocumentCategory {
  documentCount: number;
}

export interface DocumentItem {
  id: number;
  type: DocumentType;
  title: string;
  slug: string;
  description: string | null;
  thumbnail: string | null;
  content: string | null; // chỉ có ở API chi tiết
  fileUrl: string | null;
  originalFileName: string | null;
  mimeType: string | null; // application/pdf | ...wordprocessingml.document
  fileSize: number | null;
  pageCount: number | null;
  published: boolean;
  indexStatus: DocumentIndexStatus;
  category: { id: number; name: string; slug: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentFilter {
  keyword: string;
  categoryId: number | null;
  type: DocumentType | null;
}

export type DocumentSort = "NEWEST" | "OLDEST" | "UPDATED";

export const DOCUMENT_SORT_LABEL: Record<DocumentSort, string> = {
  NEWEST: "Mới đăng",
  OLDEST: "Cũ nhất",
  UPDATED: "Cập nhật gần đây",
};

export const DOCUMENT_TYPE_LABEL: Record<DocumentType, string> = {
  FILE: "Tài liệu tải về",
  ARTICLE: "Bài viết",
};

export const PDF_MIME = "application/pdf";
export const DOCX_MIME = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

// Dữ liệu form admin (file / thumbnail gửi riêng dạng File)
export interface DocumentInput {
  type: DocumentType;
  categoryId: number | null;
  title: string;
  slug: string;
  description: string;
  content: string;
  published: boolean;
  removeFile: boolean;
  removeThumbnail: boolean;
}
