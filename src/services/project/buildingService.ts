import { authHttp, publicHttp } from "../../api/http";
import { UPLOAD_CONFIG } from "./projectService";
import type { BuildingDto, BuildingInput } from "../../types/project/building.types";

// multipart: zoneId, name, floors, image?
const toForm = (input: BuildingInput): FormData => {
  const form = new FormData();
  form.append("zoneId", String(input.zoneId));
  form.append("name", input.name.trim());
  form.append("floors", String(input.floors));
  if (input.imageFile) form.append("image", input.imageFile);
  return form;
};

// Tòa nhà của dự án cao tầng: đọc công khai (GET /buildings?projectId=), thêm / sửa / xóa cần quyền quản lý dự án
async function list(projectId: number): Promise<BuildingDto[]> {
  return (await publicHttp.get<BuildingDto[]>("/buildings", { params: { projectId } })) ?? [];
}

async function create(input: BuildingInput): Promise<BuildingDto> {
  return authHttp.post<BuildingDto>("/buildings", toForm(input), UPLOAD_CONFIG);
}

// Không gửi ảnh mới thì giữ ảnh cũ
async function update(id: number, input: BuildingInput): Promise<BuildingDto> {
  return authHttp.put<BuildingDto>(`/buildings/${id}`, toForm(input), UPLOAD_CONFIG);
}

async function remove(id: number): Promise<void> {
  await authHttp.delete(`/buildings/${id}`);
}

export const buildingService = { list, create, update, remove };
