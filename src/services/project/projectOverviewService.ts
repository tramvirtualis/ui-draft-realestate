import { Building2, Landmark, Layers, ShieldCheck, Trees, UserRound, Wallet } from "lucide-react";
import BaseService from "../base/BaseService";
import { toPage } from "../../api/http";
import newsService from "../news/newsService";
import { projectImageService } from "./projectImageService";
import { formatDate } from "../../utils/formatDate";
import { BUILDING_TYPE_LABEL, ZONE_STATUS_LABEL, projectService, propertyTypeApiService, zoneApiService } from "./projectService";
import type { AmenityDto, PolicyImageDto, ProgressDto, PropertyDirectionCode, PropertyDto, PropertyStatusCode, VideoDto, ZoneDto, ZoneStatusCode } from "../../types/project/project.types";
import type { ProgressStep, ProjectOverview, ProjectOverviewData, PropertyRow, ZoneItem, ZoneTone } from "../../types/project/projectOverview.types";

const DIRECTION_LABEL: Record<PropertyDirectionCode, string> = {
  NORTH: "Bắc",
  NORTHEAST: "Đông Bắc",
  EAST: "Đông",
  SOUTHEAST: "Đông Nam",
  SOUTH: "Nam",
  SOUTHWEST: "Tây Nam",
  WEST: "Tây",
  NORTHWEST: "Tây Bắc",
};

export const PROPERTY_STATUS_LABEL: Record<PropertyStatusCode, string> = {
  AVAILABLE: "Còn hàng",
  RESERVED: "Giữ chỗ",
  SOLD: "Đã bán",
  RENTED: "Đã cho thuê",
};

const ZONE_TONE: Record<ZoneStatusCode, ZoneTone> = {
  PLANNING: "warning",
  UNDER_CONSTRUCTION: "primary",
  COMPLETED: "success",
};

const vn = (n: number, digits = 1) => n.toLocaleString("vi-VN", { maximumFractionDigits: digits });

// 13900000000 → "13,9 tỷ"; 850000000 → "850 triệu"
const formatPrice = (v: number | null): string => {
  if (!v) return "Liên hệ";
  return v >= 1e9 ? `${vn(v / 1e9)} tỷ` : `${vn(v / 1e6, 0)} triệu`;
};

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();

class PolicyImageApiService extends BaseService {
  constructor() {
    super("/policy-images", { auth: false });
  }

  // GET /policy-images?projectId=
  async getByProject(projectId: number): Promise<PolicyImageDto[]> {
    return toPage(await this.getPage<PolicyImageDto>({ projectId, size: 50 })).content;
  }
}

class ProgressApiService extends BaseService {
  constructor() {
    super("/project-progress", { auth: false });
  }

  // GET /project-progress?projectId=
  async getByProject(projectId: number): Promise<ProgressDto[]> {
    return toPage(await this.getPage<ProgressDto>({ projectId, size: 50 })).content;
  }
}

class PropertyApiService extends BaseService {
  constructor() {
    super("/properties", { auth: false });
  }

  // GET /properties?zoneId=
  async getByZone(zoneId: number): Promise<{ items: PropertyDto[]; total: number }> {
    const page = toPage(await this.getPage<PropertyDto>({ zoneId, size: 50 }));
    return { items: page.content, total: page.totalElements };
  }
}

class AmenityApiService extends BaseService {
  constructor() {
    super("/amenities", { auth: false });
  }

  // GET /amenities?projectId=
  async getByProject(projectId: number): Promise<AmenityDto[]> {
    return toPage(await this.getPage<AmenityDto>({ projectId, size: 100, sort: "id,asc" })).content;
  }
}

class VideoApiService extends BaseService {
  constructor() {
    super("/videos", { auth: false });
  }

  // GET /videos?projectId=
  async getByProject(projectId: number): Promise<VideoDto[]> {
    return toPage(await this.getPage<VideoDto>({ projectId, size: 50, sort: "createdAt,desc" })).content;
  }
}

interface QuestionDto {
  id: number;
  projectId: number;
  question: string;
  answer: string | null;
}

class QuestionApiService extends BaseService {
  constructor() {
    super("/questions", { auth: false });
  }

  // GET /questions?projectId=
  async getByProject(projectId: number): Promise<QuestionDto[]> {
    return toPage(await this.getPage<QuestionDto>({ projectId, size: 50, sort: "id,asc" })).content;
  }
}

const questionApi = new QuestionApiService();
const policyApi = new PolicyImageApiService();
const amenityApi = new AmenityApiService();
const videoApi = new VideoApiService();
const progressApi = new ProgressApiService();
const propertyApi = new PropertyApiService();

// Một phần dữ liệu lỗi (hoặc chưa có) không được làm hỏng cả trang
const safe = <T>(p: Promise<T>, fallback: T): Promise<T> => p.catch(() => fallback);

const toProgressSteps = (list: ProgressDto[]): ProgressStep[] => {
  const sorted = [...list].sort((a, b) => (a.reportDate ?? "").localeCompare(b.reportDate ?? ""));
  const now = Date.now();
  const isPast = (s: ProgressDto) => !s.reportDate || new Date(s.reportDate).getTime() <= now;
  const lastPast = sorted.filter(isPast).length - 1;
  return sorted.map((s, i) => ({
    id: s.id,
    date: s.reportDate ? formatDate(s.reportDate) : "",
    title: s.title,
    desc: s.content ?? "",
    state: !isPast(s) ? "todo" : i === lastPast ? "current" : "done",
  }));
};

// Số bất động sản của từng phân khu: { [zoneId]: số căn }
export async function propertyCountByZone(zoneIds: number[]): Promise<Record<number, number>> {
  const entries = await Promise.all(
    zoneIds.map(async (id) => [id, (await safe(propertyApi.getByZone(id), { items: [] as PropertyDto[], total: 0 })).total] as const),
  );
  return Object.fromEntries(entries);
}

async function getProjectOverview(id: number): Promise<ProjectOverviewData> {
  const project = await projectService.getProject(id);
  const [types, zoneDtos, policyDtos, progressDtos, newsPage, projectImages, amenityDtos, videoDtos, questionDtos, relatedPage] =
    await Promise.all([
    safe(propertyTypeApiService.getByProject(id), [] as string[]),
    safe(zoneApiService.getByProject(id), [] as ZoneDto[]),
    safe(policyApi.getByProject(id), []),
    safe(progressApi.getByProject(id), []),
    safe(newsService.getNews({ filter: { keyword: "", categoryId: null, projectId: id }, sort: "NEWEST", size: 3 }), null),
    safe(projectImageService.list(id), []),
    safe(amenityApi.getByProject(id), [] as AmenityDto[]),
    safe(videoApi.getByProject(id), [] as VideoDto[]),
    safe(questionApi.getByProject(id), [] as QuestionDto[]),
    safe(projectService.getProjects(0, 8), null),
  ]);

  const perZone = await Promise.all(
    zoneDtos.map(async (z) => ({ zone: z, ...(await safe(propertyApi.getByZone(z.id), { items: [] as PropertyDto[], total: 0 })) })),
  );
  const propertyTotal = perZone.reduce((s, z) => s + z.total, 0);
  const prices = perZone
    .flatMap((z) => z.items)
    .filter((p) => p.status === "AVAILABLE" && p.price)
    .map((p) => p.price as number);

  const facts: ProjectOverview["facts"] = [];
  const addFact = (icon: ProjectOverview["facts"][number]["icon"], label: string, value: string | null | undefined) => {
    if (value) facts.push({ icon, label, value });
  };
  addFact(Building2, "Loại hình", types.join(" · "));
  addFact(Landmark, "Loại công trình", project.buildingType ? BUILDING_TYPE_LABEL[project.buildingType] : "");
  addFact(Trees, "Quy mô", project.size != null ? `${vn(project.size, 2)} ha` : "");
  addFact(Layers, "Số sản phẩm", propertyTotal ? `${propertyTotal.toLocaleString("vi-VN")} căn` : "");
  addFact(UserRound, "Chủ đầu tư", project.investor);
  addFact(Wallet, "Tổng vốn đầu tư", project.totalInvestment != null ? `${vn(project.totalInvestment, 2)} tỷ VNĐ` : "");
  addFact(ShieldCheck, "Hình thức sở hữu", project.ownershipType);

  const zones: ZoneItem[] = zoneDtos.map((z) => ({
    id: z.id,
    name: z.name,
    description: z.description ?? "",
    status: z.status ? ZONE_STATUS_LABEL[z.status] : "",
    tone: z.status ? ZONE_TONE[z.status] : "primary",
    image: z.imageUrl,
  }));

  const properties: PropertyRow[] = perZone.flatMap(({ zone, items }) =>
    items.map((p) => ({
      code: p.propertyCode,
      zone: zone.name,
      floor: p.floor != null ? String(p.floor) : "—",
      area: p.area != null ? `${vn(p.area)} m²` : "—",
      type: p.type || "—",
      direction: p.direction ? DIRECTION_LABEL[p.direction] : "—",
      price: formatPrice(p.price),
      status: p.status ? PROPERTY_STATUS_LABEL[p.status] : "—",
    })),
  );

  const hasAvailable = perZone.some((z) => z.items.some((p) => p.status === "AVAILABLE"));
  const saleStatus = hasAvailable
    ? "Đang mở bán"
    : zoneDtos.length > 0 && zoneDtos.every((z) => z.status === "COMPLETED")
      ? "Đã bàn giao"
      : zoneDtos.some((z) => z.status === "UNDER_CONSTRUCTION")
        ? "Đang xây dựng"
        : zoneDtos.some((z) => z.status === "PLANNING")
          ? "Đang lập kế hoạch"
          : null;

  return {
    profile: {
      id: project.id,
      investor: project.investor ?? "",
      consultancy: project.consultancy ?? "",
      location: project.location ?? "",
      developmentModel: project.developmentModel ?? "",
      buildingType: project.buildingType ? BUILDING_TYPE_LABEL[project.buildingType] : "",
      size: project.size != null ? `${vn(project.size, 2)} ha` : "",
      totalInvestment: project.totalInvestment != null ? `${vn(project.totalInvestment, 2)} tỷ VNĐ` : "",
      ownershipType: project.ownershipType ?? "",
      types,
      overviewImage: project.overviewImage,
      createdAt: project.createdAt,
      saleStatus,
    },
    faqs: questionDtos
      .filter((q) => q.question && q.answer)
      .map((q) => ({ id: q.id, question: q.question, answer: q.answer as string })),
    related: (relatedPage?.content ?? [])
      .filter((p) => p.id !== project.id)
      .slice(0, 3)
      .map((p) => ({
        id: p.id,
        name: p.name,
        location: p.location ?? "",
        investor: p.investor ?? "",
        image: p.overviewImage,
      })),
    project: {
      name: project.name,
      location: project.location ?? "",
      price: prices.length ? `Từ ${formatPrice(Math.min(...prices))}` : "Liên hệ",
      overview: project.developmentModel ?? "",
      facts,
    },
    // Ảnh tổng quan đứng đầu, sau đó là các ảnh trong thư viện ảnh dự án
    gallery: [
      ...(project.overviewImage ? [{ src: project.overviewImage, label: "Ảnh tổng quan", caption: project.name }] : []),
      ...projectImages.map((img, i) => ({ src: img.imageUrl, label: `Ảnh ${i + 1}`, caption: project.name })),
    ],
    zones,
    buildings: perZone.map(({ zone, total }) => ({
      code: initials(zone.name),
      name: zone.name,
      note: zone.description ?? "",
      meta: `${total} căn`,
    })),
    properties: properties.slice(0, 8),
    propertyTotal,
    policyImages: policyDtos.map((p) => ({ id: p.id, src: p.imageUrl })),
    progress: toProgressSteps(progressDtos),
    amenities: amenityDtos.map((a) => ({ id: a.id, name: a.name, image: a.imageUrl })),
    videos: videoDtos.map((v) => ({
      id: v.id,
      name: v.name,
      url: v.videoUrl,
      description: v.description ?? "",
      createdAt: v.createdAt,
    })),
    news: (newsPage?.content ?? []).map((n) => ({
      id: n.id,
      category: n.category?.name ?? "",
      title: n.title,
      meta: formatDate(n.createdAt),
      image: n.images[0]?.imageUrl ?? null,
    })),
  };
}

export const projectOverviewService = { getProjectOverview };
