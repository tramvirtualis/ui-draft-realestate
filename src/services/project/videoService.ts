import BaseService from "../base/BaseService";
import { authHttp, toPage } from "../../api/http";
import type { VideoDto } from "../../types/project/project.types";

const LIST_SIZE = 500;

export interface VideoInput {
  name: string;
  description: string;
  videoUrl: string; // link YouTube
}

const toBody = (projectId: number, input: VideoInput) => ({
  projectId,
  name: input.name.trim(),
  description: input.description.trim() || null,
  videoUrl: input.videoUrl.trim(),
});

// Đọc công khai; thêm / sửa / xóa chỉ ADMIN
class VideoService extends BaseService {
  constructor() {
    super("/videos", { auth: false });
  }

  // GET /videos?projectId=
  async list(projectId: number): Promise<VideoDto[]> {
    return toPage(await this.getPage<VideoDto>({ projectId, size: LIST_SIZE, sort: "createdAt,desc" })).content;
  }

  // Số video của từng dự án (hiển thị trong bộ chọn)
  async counts(): Promise<Record<number, number>> {
    const all = toPage(await this.getPage<VideoDto>({ size: LIST_SIZE })).content;
    const out: Record<number, number> = {};
    all.forEach((v) => (out[v.projectId] = (out[v.projectId] ?? 0) + 1));
    return out;
  }

  // POST /videos (JSON)
  async add(projectId: number, input: VideoInput): Promise<VideoDto> {
    return authHttp.post<VideoDto>(this.url(), toBody(projectId, input));
  }

  // PUT /videos/{id} (JSON)
  async edit(id: number, projectId: number, input: VideoInput): Promise<VideoDto> {
    return authHttp.put<VideoDto>(this.url(id), toBody(projectId, input));
  }

  // DELETE /videos/{id}
  async remove(id: number): Promise<void> {
    await authHttp.delete(this.url(id));
  }
}

export const videoService = new VideoService();
