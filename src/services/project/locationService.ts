import { authHttp, publicHttp } from "../../api/http";
import { UPLOAD_CONFIG } from "./projectService";
import type { LocationInput, ProjectLocationDto } from "../../types/project/location.types";

// ----- Khách: dự án đang hiển thị -----
async function getPublished(projectId: number): Promise<ProjectLocationDto> {
  return publicHttp.get<ProjectLocationDto>("/project-locations", { params: { projectId } });
}

// ----- Admin -----
async function get(projectId: number): Promise<ProjectLocationDto> {
  return authHttp.get<ProjectLocationDto>(`/admin/project-locations/${projectId}`);
}

// PUT (multipart): thông tin, điểm thuận lợi, bài viết; files = ảnh thêm mới, removeIds = ảnh cần xóa
async function save(projectId: number, input: LocationInput, files: File[], removeIds: number[]): Promise<ProjectLocationDto> {
  const form = new FormData();
  if (input.latitude !== null && input.longitude !== null) {
    form.append("latitude", String(input.latitude));
    form.append("longitude", String(input.longitude));
  }
  if (input.intro.trim()) form.append("intro", input.intro.trim());
  if (input.articleTitle.trim()) form.append("articleTitle", input.articleTitle.trim());
  if (input.content) form.append("content", input.content);
  // Đánh số từng điểm để câu có dấu phẩy không bị backend tách thành nhiều điểm
  input.advantages.forEach((text, i) => form.append(`advantages[${i}]`, text.trim()));
  removeIds.forEach((id) => form.append("removeImageIds", String(id)));
  files.forEach((f) => form.append("images", f));
  return authHttp.put<ProjectLocationDto>(`/admin/project-locations/${projectId}`, form, UPLOAD_CONFIG);
}

export const locationService = { getPublished };

export const adminLocationService = { get, save };
