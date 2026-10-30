import BaseService from "../base/BaseService";
import { toPage } from "../../api/http";
import type { PageResponse } from "../../types/common.types";
import type {
  RagAskResponse,
  RagChunk,
  RagDocumentRow,
  RagIndexResult,
  RagProjectRow,
  RagSourceKind,
  RagStatus,
} from "../../types/rag/rag.types";

// Index lại / hỏi thử phải chờ embed + gọi LLM, BE chờ RAG tối đa 60s nên FE chờ lâu hơn mức mặc định 10s
const SLOW = { timeout: 70_000 };

// status: RagDocumentStatus / RagProjectStatus, "" = tất cả
type ListParams = { status?: string; keyword?: string; page?: number; size?: number };

/**
 API quản lý trợ lý AI: /api/admin/rag (GET cần RAG_VIEW, còn lại RAG_MANAGE).
 - GET /status: số nguồn theo trạng thái, số chunk, lỗi gần nhất
 - GET /documents, /projects (?status=&keyword=&page=&size=): mọi nguồn kèm trạng thái index + số chunk
 - GET /documents/{id}/chunks, /projects/{id}/chunks: các đoạn AI đã đọc được
 - POST /documents/{id}/reindex, /projects/{id}/reindex?force=, /reindex-all
 - POST /ask: hỏi thử, không giới hạn lượt, trả mọi nguồn kèm score
 */
class AdminRagService extends BaseService {
  constructor() {
    super("/admin/rag");
  }

  status(): Promise<RagStatus> {
    return this.http.get<RagStatus>(this.url("status"));
  }

  async documents(params: ListParams): Promise<PageResponse<RagDocumentRow>> {
    return toPage(await this.getPage<RagDocumentRow>(params, "documents"));
  }

  async projects(params: ListParams): Promise<PageResponse<RagProjectRow>> {
    return toPage(await this.getPage<RagProjectRow>(params, "projects"));
  }

  chunks(kind: RagSourceKind, id: number): Promise<RagChunk[]> {
    return this.getList<RagChunk>(undefined, `${kind}/${id}/chunks`);
  }

  // Dự án luôn force: admin bấm tay nghĩa là muốn index lại thật, không muốn nhận UNCHANGED
  reindex(kind: RagSourceKind, id: number): Promise<RagIndexResult> {
    const query = kind === "projects" ? "?force=true" : "";
    return this.http.post<RagIndexResult>(`${this.url(kind, id, "reindex")}${query}`, undefined, SLOW);
  }

  async reindexAll(): Promise<void> {
    await this.http.post(this.url("reindex-all"));
  }

  ask(question: string, scope: { projectId?: number; documentId?: number } = {}): Promise<RagAskResponse> {
    return this.http.post<RagAskResponse>(this.url("ask"), { question, ...scope }, SLOW);
  }
}

export const adminRagService = new AdminRagService();
