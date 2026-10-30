import BaseService from "../base/BaseService";
import { authHttp, toPage } from "../../api/http";
import { UPLOAD_CONFIG } from "./projectService";
import { projectService, zoneApiService } from "./projectService";
import { buildingService } from "./buildingService";
import type { PropertyDirectionCode, PropertyDto, PropertyStatusCode } from "../../types/project/project.types";
import type { Property, PropertyCatalog, PropertyImageChanges, PropertyImageItem, PropertyInput, PropertyStatus } from "../../types/project/property.types";

// Giá trị hiển thị ↔ mã enum của BE
const STATUS_TO_CODE: Record<PropertyStatus, PropertyStatusCode> = {
  available: "AVAILABLE",
  holding: "RESERVED",
  sold: "SOLD",
  closed: "RENTED",
};
const CODE_TO_STATUS = Object.fromEntries(Object.entries(STATUS_TO_CODE).map(([k, v]) => [v, k])) as Record<PropertyStatusCode, PropertyStatus>;

const DIRECTION_TO_CODE: Record<string, PropertyDirectionCode> = {
  "Bắc": "NORTH",
  "Đông Bắc": "NORTHEAST",
  "Đông": "EAST",
  "Đông Nam": "SOUTHEAST",
  "Nam": "SOUTH",
  "Tây Nam": "SOUTHWEST",
  "Tây": "WEST",
  "Tây Bắc": "NORTHWEST",
};
const CODE_TO_DIRECTION = Object.fromEntries(Object.entries(DIRECTION_TO_CODE).map(([k, v]) => [v, k])) as Record<PropertyDirectionCode, string>;

interface PropertyImageDto {
  id: number;
  propertyId: number;
  imageUrl: string;
}

const MAX_PER_REQUEST = 10; // BE giới hạn số ảnh mỗi lần tải lên

const toProperty = (p: PropertyDto, images: PropertyImageItem[] = []): Property => ({
  id: p.id,
  zoneId: p.zoneId,
  buildingId: p.buildingId,
  propertyCode: p.propertyCode,
  area: p.area ?? 0,
  price: p.price ?? 0,
  direction: p.direction ? CODE_TO_DIRECTION[p.direction] : "",
  floor: p.floor,
  axis: p.axis,
  bedrooms: p.bedrooms,
  status: p.status ? CODE_TO_STATUS[p.status] : "available",
  type: p.type ?? "",
  constructionArea: p.constructionArea,
  prepaymentDiscountRate: p.prepaymentDiscountRate,
  loanPrice: p.loanPrice,
  pricingSheet: p.pricingSheet ?? "",
  layoutUrl: p.layoutUrl ?? "",
  salesPolicyEffectiveDate: p.salesPolicyEffectiveDate ?? "",
  salesPolicySummaryUrl: p.salesPolicySummaryUrl ?? "",
  salesPolicyDetailUrl: p.salesPolicyDetailUrl ?? "",
  gift: p.gift ?? "",
  handoverStandard: p.handoverStandard ?? "",
  propertyInventoryType: p.propertyInventoryType ?? "",
  images: images.map((i) => i.imageUrl),
  imageItems: images,
});

const toRequest = (input: PropertyInput) => ({
  zoneId: input.zoneId,
  buildingId: input.buildingId,
  propertyCode: input.propertyCode.trim(),
  area: input.area,
  price: input.price,
  direction: DIRECTION_TO_CODE[input.direction],
  floor: input.floor,
  axis: input.axis?.trim() || null,
  bedrooms: input.bedrooms,
  status: STATUS_TO_CODE[input.status],
  type: input.type.trim(),
  constructionArea: input.constructionArea,
  prepaymentDiscountRate: input.prepaymentDiscountRate,
  loanPrice: input.loanPrice,
  pricingSheet: input.pricingSheet.trim() || null,
  layoutUrl: input.layoutUrl.trim() || null,
  salesPolicyEffectiveDate: input.salesPolicyEffectiveDate || null,
  salesPolicySummaryUrl: input.salesPolicySummaryUrl.trim() || null,
  salesPolicyDetailUrl: input.salesPolicyDetailUrl.trim() || null,
  gift: input.gift.trim() || null,
  handoverStandard: input.handoverStandard.trim() || null,
  propertyInventoryType: input.propertyInventoryType.trim() || null,
});

const PAGE_SIZE = 500;

// Đọc dùng publicHttp (GET /properties công khai); ghi dùng authHttp, BE chỉ cho ADMIN
class PropertyApiService extends BaseService {
  constructor() {
    super("/properties", { auth: false });
  }

  async getAll(): Promise<PropertyDto[]> {
    return toPage(await this.getPage<PropertyDto>({ size: PAGE_SIZE })).content;
  }

  async getOne(id: number): Promise<PropertyDto> {
    return this.getById<PropertyDto>(id);
  }

  async createOne(body: ReturnType<typeof toRequest>): Promise<PropertyDto> {
    return authHttp.post<PropertyDto>(this.url(), body);
  }

  async updateOne(id: number, body: ReturnType<typeof toRequest>): Promise<PropertyDto> {
    return authHttp.put<PropertyDto>(this.url(id), body);
  }

  async removeOne(id: number): Promise<void> {
    await authHttp.delete(this.url(id));
  }
}

// Ảnh căn: đọc công khai, tải lên / xóa cần ADMIN
class PropertyImageApiService extends BaseService {
  constructor() {
    super("/property-images", { auth: false });
  }

  async getAll(): Promise<PropertyImageDto[]> {
    return toPage(await this.getPage<PropertyImageDto>({ size: 2000 })).content;
  }

  async getByProperty(propertyId: number): Promise<PropertyImageDto[]> {
    return toPage(await this.getPage<PropertyImageDto>({ propertyId, size: 200 })).content;
  }

  async add(propertyId: number, files: File[]): Promise<void> {
    for (let i = 0; i < files.length; i += MAX_PER_REQUEST) {
      const form = new FormData();
      form.append("propertyId", String(propertyId));
      files.slice(i, i + MAX_PER_REQUEST).forEach((f) => form.append("images", f));
      await authHttp.post(this.url(), form, UPLOAD_CONFIG);
    }
  }

  async remove(id: number): Promise<void> {
    await authHttp.delete(this.url(id));
  }
}

const api = new PropertyApiService();
const imageApi = new PropertyImageApiService();

const applyImageChanges = async (propertyId: number, changes?: PropertyImageChanges): Promise<void> => {
  if (!changes) return;
  await Promise.all(changes.removeIds.map((id) => imageApi.remove(id)));
  if (changes.add.length > 0) await imageApi.add(propertyId, changes.add);
};

const withImages = async (dto: PropertyDto): Promise<Property> =>
  toProperty(dto, (await imageApi.getByProperty(dto.id)).map((i) => ({ id: i.id, imageUrl: i.imageUrl })));

// Dự án + phân khu + tòa nhà (của dự án cao tầng) thật từ BE (zoneId là id phân khu trong DB)
async function catalog(): Promise<PropertyCatalog> {
  const [projects, zones] = await Promise.all([projectService.getAdminProjects(0, 200), zoneApiService.getAll()]);
  const highRiseIds = projects.content.filter((p) => p.buildingType === "HIGH_RISE").map((p) => p.id);
  const buildings = (await Promise.all(highRiseIds.map((id) => buildingService.list(id)))).flat();
  return {
    projects: projects.content.map((p) => ({ id: p.id, name: p.name, highRise: p.buildingType === "HIGH_RISE" })),
    zones: zones.map((z) => ({ id: z.id, projectId: z.projectId, name: z.name })),
    buildings: buildings.map((b) => ({ id: b.id, zoneId: b.zoneId, name: b.name, floors: b.floors })),
  };
}

async function list(): Promise<Property[]> {
  const [properties, images] = await Promise.all([api.getAll(), imageApi.getAll().catch(() => [] as PropertyImageDto[])]);
  return properties.map((p) =>
    toProperty(
      p,
      images.filter((i) => i.propertyId === p.id).map((i) => ({ id: i.id, imageUrl: i.imageUrl })),
    ),
  );
}

async function create(input: PropertyInput, changes?: PropertyImageChanges): Promise<Property> {
  const created = await api.createOne(toRequest(input));
  await applyImageChanges(created.id, changes);
  return withImages(created);
}

async function update(id: number, input: PropertyInput, changes?: PropertyImageChanges): Promise<Property> {
  const updated = await api.updateOne(id, toRequest(input));
  await applyImageChanges(id, changes);
  return withImages(updated);
}

// BE chưa có API đổi riêng trạng thái → lấy căn hiện tại rồi PUT lại với trạng thái mới
async function setStatus(id: number, status: PropertyStatus): Promise<void> {
  const current = toProperty(await api.getOne(id));
  await api.updateOne(id, toRequest({ ...current, status }));
}

async function remove(id: number): Promise<void> {
  await api.removeOne(id);
}

export const propertyService = { catalog, list, create, update, setStatus, remove };
