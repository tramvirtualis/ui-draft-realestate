import BaseService from "../base/BaseService";
import { toPage } from "../../api/http";
import { FALLBACK_IMAGE } from "../../components/Project/List/projectCardData";
import newsService from "../news/newsService";
import { projectImageService } from "./projectImageService";
import { projectService } from "./projectService";
import { tourService } from "./tourService";
import { locationService } from "./locationService";
import type { ProjectLocationDto } from "../../types/project/location.types";
import type { PolicyImageDto } from "../../types/project/project.types";
import type { News, NewsCategory } from "../../types/new/news.types";

export interface ProjectBasic {
  id: number;
  name: string;
  location: string;
  investor: string;
  overviewImage: string;
  sideImage: string; // ảnh thứ hai trong thư viện ảnh (hoặc ảnh tổng quan nếu chưa có)
}

export interface ProjectDocument {
  id: number;
  projectId: number;
  title: string;
  url: string;
  createdAt: string;
}

class PolicyImageApi extends BaseService {
  constructor() {
    super("/policy-images", { auth: false });
  }

  async getByProject(projectId: number): Promise<PolicyImageDto[]> {
    return toPage(
      await this.getPage<PolicyImageDto>({
        projectId,
        size: 50,
        sort: "createdAt,asc",
      })
    ).content;
  }
}

class DocumentApi extends BaseService {
  constructor() {
    super("/project-documents", { auth: false });
  }

  // GET /project-documents?projectId=
  async getByProject(projectId: number): Promise<ProjectDocument[]> {
    return (await this.getList<ProjectDocument>({ projectId })) ?? [];
  }
}

const policyApi = new PolicyImageApi();
const documentApi = new DocumentApi();

async function getBasic(projectId: number): Promise<ProjectBasic> {
  const [project, images] = await Promise.all([
    projectService.getProject(projectId),
    projectImageService.list(projectId).catch(() => []),
  ]);
  const overview =
    project.overviewImage ?? images[0]?.imageUrl ?? FALLBACK_IMAGE;
  return {
    id: project.id,
    name: project.name,
    location: project.location ?? "",
    investor: project.investor ?? "",
    overviewImage: overview,
    sideImage: images[0]?.imageUrl ?? overview,
  };
}

async function getPolicy(projectId: number) {
  const [project, images] = await Promise.all([
    getBasic(projectId),
    policyApi.getByProject(projectId).catch(() => []),
  ]);
  return {
    project,
    images: images.map((i) => ({ id: i.id, src: i.imageUrl })),
  };
}

// Trang Ảnh 360°: các tour đã xuất bản (chi tiết cảnh tải riêng theo tour đang xem)
async function getTours(projectId: number) {
  const [project, tours] = await Promise.all([getBasic(projectId), tourService.getPublished(projectId).catch(() => [])]);
  return { project, tours };
}

// Trang Vị trí: thông tin dự án + nội dung vị trí (chưa nhập gì thì các mục rỗng và được ẩn)
async function getLocation(projectId: number) {
  const empty: ProjectLocationDto = {
    projectId, latitude: null, longitude: null, intro: null, articleTitle: null, content: null, advantages: [], images: [], updatedAt: null,
  };
  const [project, location] = await Promise.all([getBasic(projectId), locationService.getPublished(projectId).catch(() => empty)]);
  return { project, location };
}

async function getDocuments(projectId: number) {
  const [project, documents] = await Promise.all([
    getBasic(projectId),
    documentApi.getByProject(projectId).catch(() => []),
  ]);
  return { project, documents };
}

// Toàn bộ tin của dự án (lọc / phân trang ở client)
async function getNews(
  projectId: number
): Promise<{
  project: ProjectBasic;
  news: News[];
  categories: NewsCategory[];
}> {
  const [project, page, categories] = await Promise.all([
    getBasic(projectId),
    newsService.getNews({
      filter: { keyword: "", categoryId: null, projectId },
      sort: "NEWEST",
      size: 200,
    }),
    newsService.getCategories().catch(() => [] as NewsCategory[]),
  ]);
  return { project, news: page.content, categories };
}

export const projectExtrasService = {
  getBasic,
  getPolicy,
  getTours,
  getLocation,
  getDocuments,
  getNews,
};
