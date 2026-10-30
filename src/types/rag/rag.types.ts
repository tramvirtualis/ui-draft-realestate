// Trạng thái index của tài liệu (cột documents.index_status)
export type RagDocumentStatus = "PENDING" | "INDEXED" | "FAILED" | "SKIPPED";
// Trạng thái index của dự án (bảng rag_project_index); chưa index lần nào = NOT_INDEXED
export type RagProjectStatus = "INDEXED" | "FAILED" | "NOT_INDEXED";

// GET /admin/rag/status — BE chuyển nguyên JSON của RAG service
export interface RagStatus {
  documents: Partial<Record<RagDocumentStatus, number>>;
  projects: Partial<Record<RagProjectStatus | "PENDING", number>>;
  chunks: Partial<Record<"DOCUMENT" | "PROJECT", number>>;
  failedDocuments: { id: number; title: string }[];
  // Dự án lỗi hoặc có file đính kèm bị bỏ qua (RAG service trả snake_case)
  projectErrors: { project_id: number; name: string; status: string; error: string; indexed_at: string | null }[];
}

export interface RagDocumentRow {
  id: number;
  title: string;
  type: "ARTICLE" | "FILE";
  published: boolean;
  category: string | null;
  status: RagDocumentStatus;
  indexedAt: string | null;
  updatedAt: string | null;
  chunks: number;
}

export interface RagProjectRow {
  id: number;
  name: string;
  published: boolean;
  status: RagProjectStatus;
  error: string | null;
  indexedAt: string | null;
  chunks: number;
}

export interface RagChunk {
  id: number;
  section: string | null;
  chunkIndex: number;
  content: string;
  metadata: Record<string, unknown>;
  embeddingModel: string;
  createdAt: string;
}

// INDEXED | FAILED | NOT_FOUND | CHANGED (bị sửa lúc đang index) | UNCHANGED (dự án không đổi)
export interface RagIndexResult {
  sourceId: number;
  status: "INDEXED" | "FAILED" | "NOT_FOUND" | "CHANGED" | "UNCHANGED";
  chunks: number;
  error: string | null;
}

export interface RagAskSource {
  index: number;
  type: "DOCUMENT" | "PROJECT";
  id: number;
  title: string | null;
  slug: string | null;
  section: string | null;
  heading: string | null;
  page: number | null;
  score: number;
}

export interface RagAskResponse {
  answer: string;
  sources: RagAskSource[];
  usedLlm: boolean;
}

export type RagSourceKind = "documents" | "projects";
