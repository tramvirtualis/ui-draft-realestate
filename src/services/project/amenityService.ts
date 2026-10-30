import BaseService from "../base/BaseService";
import { authHttp, toPage } from "../../api/http";
import { UPLOAD_CONFIG } from "./projectService";
import type { AmenityDto } from "../../types/project/project.types";

const LIST_SIZE = 1000;

const toForm = (projectId: number, name: string, image?: File): FormData => {
  const form = new FormData();
  form.append("projectId", String(projectId));
  form.append("name", name.trim());
  if (image) form.append("image", image);
  return form;
};

// Đọc công khai; thêm / sửa / xóa chỉ ADMIN
class AmenityService extends BaseService {
  constructor() {
    super("/amenities", { auth: false });
  }

  // GET /amenities?projectId=
  async list(projectId: number): Promise<AmenityDto[]> {
    return toPage(await this.getPage<AmenityDto>({ projectId, size: LIST_SIZE, sort: "id,asc" })).content;
  }

  // Số tiện ích của từng dự án (hiển thị trong bộ chọn)
  async counts(): Promise<Record<number, number>> {
    const all = toPage(await this.getPage<AmenityDto>({ size: LIST_SIZE })).content;
    const out: Record<number, number> = {};
    all.forEach((a) => (out[a.projectId] = (out[a.projectId] ?? 0) + 1));
    return out;
  }

  // POST /amenities (multipart: projectId, name, image?)
  async add(projectId: number, name: string, image?: File): Promise<AmenityDto> {
    return authHttp.post<AmenityDto>(this.url(), toForm(projectId, name, image), UPLOAD_CONFIG);
  }

  // PUT /amenities/{id}: không gửi ảnh thì giữ ảnh cũ
  async edit(id: number, projectId: number, name: string, image?: File): Promise<AmenityDto> {
    return authHttp.put<AmenityDto>(this.url(id), toForm(projectId, name, image), UPLOAD_CONFIG);
  }

  // DELETE /amenities/{id}
  async remove(id: number): Promise<void> {
    await authHttp.delete(this.url(id));
  }
}

export const amenityService = new AmenityService();
