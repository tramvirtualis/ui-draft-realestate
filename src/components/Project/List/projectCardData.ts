import { BUILDING_TYPE_LABEL } from "../../../services/project/projectService";
import type { ProjectDto } from "../../../types/project/project.types";

// Dữ liệu một thẻ dự án; BE chưa có giá/tiến độ/nhãn nên để rỗng và thẻ tự ẩn
export type ProjectCardData = {
  id: number;
  name: string;
  investor: string;
  location: string;
  type: string;
  tag: string;
  price: string;
  progress: number;
  note: string;
  image: string;
};

export const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80";

export const toCardData = (p: ProjectDto): ProjectCardData => ({
  id: p.id,
  name: p.name,
  investor: p.investor ?? "Đang cập nhật",
  location: p.location ?? "Đang cập nhật",
  type: p.buildingType ? BUILDING_TYPE_LABEL[p.buildingType] : "Đang cập nhật",
  tag: "",
  price: "",
  progress: 0,
  note: "",
  image: p.overviewImage ?? FALLBACK_IMAGE,
});
