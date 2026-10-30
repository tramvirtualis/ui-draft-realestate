import BaseService from "../base/BaseService";
import { authHttp, toPage } from "../../api/http";
import { UPLOAD_CONFIG } from "./projectService";
import type { ProjectImage } from "../../types/project/projectImage.types";

const MAX_PER_REQUEST = 10; // BE giới hạn số ảnh mỗi lần tải lên
const LIST_SIZE = 1000;

// Ảnh chính sách bán hàng: đọc công khai, tải lên / xóa chỉ ADMIN
class PolicyImageService extends BaseService {
  constructor() {
    super("/policy-images", { auth: false });
  }

  // GET /policy-images?projectId=
  async list(projectId: number): Promise<ProjectImage[]> {
    const page = toPage(await this.getPage<ProjectImage>({ projectId, size: LIST_SIZE, sort: "createdAt,desc" }));
    return page.content;
  }

  // Số ảnh chính sách của từng dự án
  async counts(): Promise<Record<number, number>> {
    const page = toPage(await this.getPage<ProjectImage>({ size: LIST_SIZE }));
    const out: Record<number, number> = {};
    page.content.forEach((x) => (out[x.projectId] = (out[x.projectId] ?? 0) + 1));
    return out;
  }

  // POST /policy-images (multipart: projectId + images)
  async add(projectId: number, files: File[]): Promise<ProjectImage[]> {
    const created: ProjectImage[] = [];
    for (let i = 0; i < files.length; i += MAX_PER_REQUEST) {
      const form = new FormData();
      form.append("projectId", String(projectId));
      files.slice(i, i + MAX_PER_REQUEST).forEach((f) => form.append("images", f));
      created.push(...(await authHttp.post<ProjectImage[]>(this.url(), form, UPLOAD_CONFIG)));
    }
    return created;
  }

  // DELETE /policy-images/{id}
  async remove(id: number): Promise<void> {
    await authHttp.delete(this.url(id));
  }
}

export const policyImageService = new PolicyImageService();
