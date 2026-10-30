import BaseService from "../base/BaseService";
import { authHttp } from "../../api/http";
import type { ProjectDocument } from "./projectExtrasService";

export interface DocumentInput {
  title: string;
  url: string;
}

// Đọc công khai; thêm / xóa chỉ ADMIN
class ProjectDocumentService extends BaseService {
  constructor() {
    super("/project-documents", { auth: false });
  }

  // GET /project-documents?projectId=
  async list(projectId: number): Promise<ProjectDocument[]> {
    return (await this.getList<ProjectDocument>({ projectId })) ?? [];
  }

  // POST /project-documents (JSON)
  async add(projectId: number, input: DocumentInput): Promise<ProjectDocument> {
    return authHttp.post<ProjectDocument>(this.url(), { projectId, title: input.title.trim(), url: input.url.trim() });
  }

  // DELETE /project-documents/{id}
  async remove(id: number): Promise<void> {
    await authHttp.delete(this.url(id));
  }
}

export const projectDocumentService = new ProjectDocumentService();
