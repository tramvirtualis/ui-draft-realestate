import { authHttp } from "../../api/http";
import {
  UPLOAD_CONFIG, bankApiService, projectService, propertyTypeApiService, toAdminProject, toAdminZone, toBuildingTypeCode, toNumber,
  toZoneStatusCode, zoneApiService,
} from "./projectService";
import type { AdminProject, AdminProjectInput, AdminZone } from "../../types/project/adminProject.types";
import type { ZoneDto } from "../../types/project/project.types";

// Gom field (bỏ trường rỗng) + ảnh vào FormData cho @ModelAttribute + @RequestPart("image")
const toForm = (fields: Record<string, string | number | undefined>, image?: File): FormData => {
  const form = new FormData();
  Object.entries(fields).forEach(([k, v]) => {
    if (v !== undefined && v !== "") form.append(k, String(v));
  });
  if (image) form.append("image", image);
  return form;
};

const projectForm = (input: AdminProjectInput) => {
  const form = toForm(
    {
      name: input.name,
      location: input.location,
      investor: input.investor,
      consultancy: input.consultancy,
      developmentModel: input.developmentModel,
      buildingType: toBuildingTypeCode(input.buildingType),
      size: toNumber(input.size),
      totalInvestment: toNumber(input.totalInvestment),
      ownershipType: input.ownershipType,
    },
    input.imageFile,
  );
  // Toàn bộ ngân hàng của dự án; đánh số để tên có dấu phẩy không bị tách
  input.banks.forEach((name, i) => form.append(`banks[${i}]`, name));
  return form;
};

const zoneForm = (projectId: number, z: AdminZone) =>
  toForm({ projectId, name: z.name, description: z.description, status: toZoneStatusCode(z.status) }, z.imageFile);

// Đồng bộ phân khu: id <= 0 là phân khu mới (tạo), id có trên server là sửa, còn thiếu là xóa
async function syncZones(projectId: number, zones: AdminZone[]): Promise<void> {
  const existing = await zoneApiService.getByProject(projectId);
  const keep = new Set(zones.map((z) => z.id));
  const known = new Set(existing.map((z) => z.id));

  await Promise.all(existing.filter((z) => !keep.has(z.id)).map((z) => authHttp.delete(`/zones/${z.id}`)));
  for (const z of zones) {
    if (z.id > 0 && known.has(z.id)) await authHttp.put<ZoneDto>(`/zones/${z.id}`, zoneForm(projectId, z), UPLOAD_CONFIG);
    else await authHttp.post<ZoneDto>("/zones", zoneForm(projectId, z), UPLOAD_CONFIG);
  }
}

// Lưu ngay một phân khu (dùng khi đang sửa dự án đã có): id <= 0 là tạo mới
async function saveZone(projectId: number, zone: AdminZone): Promise<AdminZone> {
  const dto =
    zone.id > 0
      ? await authHttp.put<ZoneDto>(`/zones/${zone.id}`, zoneForm(projectId, zone), UPLOAD_CONFIG)
      : await authHttp.post<ZoneDto>("/zones", zoneForm(projectId, zone), UPLOAD_CONFIG);
  return toAdminZone(dto);
}

async function removeZone(id: number): Promise<void> {
  await authHttp.delete(`/zones/${id}`);
}

async function list(): Promise<AdminProject[]> {
  const page = await projectService.getAdminProjects(0, 200);
  return page.content.map((p) => toAdminProject(p));
}

async function get(id: number): Promise<AdminProject> {
  const [project, zones, types, banks] = await Promise.all([
    projectService.getAdminProject(id),
    zoneApiService.getByProject(id),
    propertyTypeApiService.getByProject(id), // loại hình được tạo từ các căn của dự án
    bankApiService.getByProject(id),
  ]);
  return toAdminProject(project, zones.map(toAdminZone), types, banks.map((b) => b.name));
}

async function create(input: AdminProjectInput): Promise<AdminProject> {
  const saved = await projectService.createProject(projectForm(input));
  await syncZones(saved.id, input.zones);
  return get(saved.id);
}

async function update(id: number, input: AdminProjectInput): Promise<AdminProject> {
  await projectService.updateProject(id, projectForm(input));
  await syncZones(id, input.zones);
  return get(id);
}

async function remove(id: number): Promise<void> {
  await projectService.deleteProject(id);
}

// Ẩn / hiện dự án trên trang khách
async function setHidden(id: number, hidden: boolean): Promise<void> {
  await projectService.setHidden(id, hidden);
}

async function setStatus(id: number, status: "PUBLISHED" | "HIDDEN" | "ARCHIVED"): Promise<void> {
  await projectService.setStatus(id, status);
}

async function setBookingEnabled(id: number, enabled: boolean): Promise<void> {
  await projectService.setBookingEnabled(id, enabled);
}

export const adminProjectService = { list, get, create, update, remove, setHidden, setStatus, setBookingEnabled, saveZone, removeZone };
