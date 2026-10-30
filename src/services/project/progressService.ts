import BaseService from "../base/BaseService";
import { authHttp, toPage } from "../../api/http";
import { UPLOAD_CONFIG } from "./projectService";
import { FALLBACK_IMAGE } from "../../components/Project/List/projectCardData";
import { projectService } from "./projectService";
import type { Progress, ProjectProgress } from "../../types/project/progress.types";

const sortKey = (p: { reportDate: string | null; createdAt: string }) =>
  new Date(p.reportDate ?? p.createdAt).getTime();

// Phản hồi của GET /project-progress (ProjectProgressResponse)
interface ProgressDto {
  id: number;
  projectId: number;
  title: string;
  content: string | null;
  reportDate: string | null;
  videoUrl: string | null;
  images: { id: number; progressId: number; imageUrl: string; createdAt: string }[] | null;
  createdAt: string;
}

class ProgressApiService extends BaseService {
  constructor() {
    super("/project-progress", { auth: false });
  }

  // GET /project-progress?projectId=
  async getByProject(projectId: number): Promise<ProgressDto[]> {
    return toPage(await this.getPage<ProgressDto>({ projectId, size: 200 })).content;
  }
}

const api = new ProgressApiService();

export interface ProgressInput {
  title: string;
  content: string;
  reportDate: string; // yyyy-MM-dd
  videoUrl: string; // link YouTube, rỗng = không có video (khi sửa: gỡ video cũ)
}

const toForm = (projectId: number, input: ProgressInput, files: File[], removeIds: number[] = []): FormData => {
  const form = new FormData();
  form.append("projectId", String(projectId));
  form.append("title", input.title.trim());
  form.append("reportDate", input.reportDate);
  if (input.content.trim()) form.append("content", input.content.trim());
  if (input.videoUrl.trim()) form.append("videoUrl", input.videoUrl.trim());
  removeIds.forEach((id) => form.append("removeImageIds", String(id)));
  files.forEach((f) => form.append("images", f));
  return form;
};

const withImages = (p: ProgressDto): Progress => ({ ...p, images: p.images ?? [] });

// Danh sách tiến độ của một dự án (mới nhất trước), dùng cho trang quản trị
async function list(projectId: number): Promise<Progress[]> {
  return (await api.getByProject(projectId)).map(withImages).sort((a, b) => sortKey(b) - sortKey(a));
}

// Số báo cáo tiến độ của từng dự án
async function counts(): Promise<Record<number, number>> {
  const all = toPage(await api.getPage<ProgressDto>({ size: 1000 })).content;
  const out: Record<number, number> = {};
  all.forEach((p) => (out[p.projectId] = (out[p.projectId] ?? 0) + 1));
  return out;
}

// POST /project-progress (multipart)
async function create(projectId: number, input: ProgressInput, files: File[]): Promise<Progress> {
  return withImages(await authHttp.post<ProgressDto>("/project-progress", toForm(projectId, input, files), UPLOAD_CONFIG));
}

// PUT /project-progress/{id} (multipart): files = ảnh thêm mới, removeIds = ảnh cần xóa
async function update(id: number, projectId: number, input: ProgressInput, files: File[], removeIds: number[]): Promise<Progress> {
  return withImages(
    await authHttp.put<ProgressDto>(`/project-progress/${id}`, toForm(projectId, input, files, removeIds), UPLOAD_CONFIG),
  );
}

// DELETE /project-progress/{id}
async function remove(id: number): Promise<void> {
  await authHttp.delete(`/project-progress/${id}`);
}

// Tiến độ của một dự án, mới nhất trước
async function getProjectProgress(projectId: number): Promise<ProjectProgress> {
  const [project, list] = await Promise.all([projectService.getProject(projectId), api.getByProject(projectId)]);

  const items: Progress[] = list
    .map((p) => ({ ...p, images: p.images ?? [] }))
    .sort((a, b) => sortKey(b) - sortKey(a));

  return {
    project: {
      id: project.id,
      name: project.name,
      location: project.location ?? "",
      investor: project.investor ?? "",
      overviewImage: project.overviewImage ?? FALLBACK_IMAGE,
    },
    items,
  };
}

export const progressService = { getProjectProgress, list, counts, create, update, remove };
