import BaseService from "../base/BaseService";
import { authHttp, toPage, type SpringPage } from "../../api/http";
import type { PageResponse } from "../../types/common.types";
import type { AdminProject, AdminZone } from "../../types/project/adminProject.types";
import type { BankDto, BuildingTypeCode, ProjectDto, ZoneDto, ZoneStatusCode } from "../../types/project/project.types";

// Nhãn hiển thị ↔ mã enum của BE
export const BUILDING_TYPE_LABEL: Record<BuildingTypeCode, string> = {
  HIGH_RISE: "Cao tầng",
  LOW_RISE: "Thấp tầng",
};
export const ZONE_STATUS_LABEL: Record<ZoneStatusCode, string> = {
  PLANNING: "Đang lập kế hoạch",
  UNDER_CONSTRUCTION: "Đang xây dựng",
  COMPLETED: "Đã bàn giao",
};

const codeOf = <T extends string>(labels: Record<T, string>, label: string): T | undefined =>
  (Object.keys(labels) as T[]).find((k) => labels[k] === label.trim());

export const toBuildingTypeCode = (label: string) => codeOf(BUILDING_TYPE_LABEL, label);
export const toZoneStatusCode = (label: string) => codeOf(ZONE_STATUS_LABEL, label);

// "18,6" / "25.000" → số gửi lên BE; rỗng hoặc không đọc được → bỏ qua
export const toNumber = (text: string): number | undefined => {
  const cleaned = text.trim().replace(/[^\d.,]/g, "");
  if (!cleaned) return undefined;
  const n = Number(cleaned.includes(",") ? cleaned.replace(/\./g, "").replace(",", ".") : cleaned);
  return Number.isFinite(n) ? n : undefined;
};

export const toAdminZone = (z: ZoneDto): AdminZone => ({
  id: z.id,
  name: z.name,
  description: z.description ?? "",
  status: z.status ? ZONE_STATUS_LABEL[z.status] : "",
  imageUrl: z.imageUrl,
});

export const toAdminProject = (p: ProjectDto, zones: AdminZone[] = [], types: string[] = [], banks: string[] = []): AdminProject => ({
  id: p.id,
  name: p.name,
  buildingType: p.buildingType ? BUILDING_TYPE_LABEL[p.buildingType] : "",
  overviewImage: p.overviewImage,
  location: p.location ?? "",
  investor: p.investor ?? "",
  consultancy: p.consultancy ?? "",
  developmentModel: p.developmentModel ?? "",
  size: p.size == null ? "" : String(p.size),
  totalInvestment: p.totalInvestment == null ? "" : String(p.totalInvestment),
  ownershipType: p.ownershipType ?? "",
  createdAt: p.createdAt,
  hidden: p.hidden ?? false,
  status: p.status ?? "PUBLISHED",
  bookingEnabled: p.bookingEnabled ?? true,
  types,
  zones,
  banks,
});

/**
 Đọc dùng publicHttp (khách xem được); ghi (multipart) dùng authHttp.
 GET /projects?page=&size=&sort=
 */
// Upload ảnh lên Cloudinary có thể lâu hơn timeout mặc định 10s
export const UPLOAD_CONFIG = { timeout: 60000 };

class ProjectService extends BaseService {
  constructor() {
    super("/projects", { auth: false });
  }

  async getProjects(page = 0, size = 10): Promise<PageResponse<ProjectDto>> {
    return toPage(await this.getPage<ProjectDto>({ page, size }));
  }

  async getProject(id: number): Promise<ProjectDto> {
    return this.getById<ProjectDto>(id);
  }

  // Quản trị: gồm cả dự án đang ẩn (GET /admin/projects)
  async getAdminProjects(page = 0, size = 10): Promise<PageResponse<ProjectDto>> {
    return toPage(await authHttp.get<SpringPage<ProjectDto>>("/admin/projects", { params: { page, size } }));
  }

  async getAdminProject(id: number): Promise<ProjectDto> {
    return authHttp.get<ProjectDto>(`/admin/projects/${id}`);
  }

  // PUT /admin/projects/{id}/visibility?hidden=
  async setHidden(id: number, hidden: boolean): Promise<ProjectDto> {
    return authHttp.put<ProjectDto>(`/admin/projects/${id}/visibility`, null, { params: { hidden } });
  }

  // PUT /admin/projects/{id}/status?status=
  async setStatus(id: number, status: "PUBLISHED" | "HIDDEN" | "ARCHIVED"): Promise<ProjectDto> {
    return authHttp.put<ProjectDto>(`/admin/projects/${id}/status`, null, { params: { status } });
  }

  // PUT /admin/projects/{id}/booking-enabled?enabled=
  async setBookingEnabled(id: number, enabled: boolean): Promise<ProjectDto> {
    return authHttp.put<ProjectDto>(`/admin/projects/${id}/booking-enabled`, null, { params: { enabled } });
  }

  async createProject(form: FormData): Promise<ProjectDto> {
    return authHttp.post<ProjectDto>(this.url(), form, UPLOAD_CONFIG);
  }

  async updateProject(id: number, form: FormData): Promise<ProjectDto> {
    return authHttp.put<ProjectDto>(this.url(id), form, UPLOAD_CONFIG);
  }

  async deleteProject(id: number): Promise<void> {
    await authHttp.delete(this.url(id));
  }
}

export const projectService = new ProjectService();

class ZoneApiService extends BaseService {
  constructor() {
    super("/zones", { auth: false });
  }

  async getByProject(projectId: number): Promise<ZoneDto[]> {
    return toPage(await this.getPage<ZoneDto>({ projectId, size: 200 })).content;
  }

  // Tất cả phân khu (không lọc theo dự án)
  async getAll(): Promise<ZoneDto[]> {
    return toPage(await this.getPage<ZoneDto>({ size: 500 })).content;
  }
}

export const zoneApiService = new ZoneApiService();

// Loại hình do từng căn khai báo; ở cấp dự án chỉ đọc danh sách tên đang được dùng
class PropertyTypeApiService extends BaseService {
  constructor() {
    super("/property-types", { auth: false });
  }

  // GET /property-types?projectId= → tên các loại hình của căn trong dự án
  async getByProject(projectId: number): Promise<string[]> {
    return (await this.getList<string>({ projectId })) ?? [];
  }
}

export const propertyTypeApiService = new PropertyTypeApiService();

// Ngân hàng hỗ trợ vay của dự án (đọc công khai); thêm / xóa qua form dự án
class BankApiService extends BaseService {
  constructor() {
    super("/banks", { auth: false });
  }

  // GET /banks?projectId=
  async getByProject(projectId: number): Promise<BankDto[]> {
    return (await this.getList<BankDto>({ projectId })) ?? [];
  }

}

export const bankApiService = new BankApiService();
