import type { LucideIcon } from "lucide-react";

// Dữ liệu trang tổng quan dự án, dựng từ DB (projects, project_types, zones, property, policy_images, progress, news)
export interface ProjectOverview {
  name: string;
  location: string;
  price: string; // "Từ 13,9 tỷ" hoặc "Liên hệ"
  overview: string;
  facts: { icon: LucideIcon; label: string; value: string }[];
}

export interface GalleryImage {
  src: string;
  label: string;
  caption: string;
}

export type ZoneTone = "success" | "warning" | "primary";

export interface ZoneItem {
  id: number;
  name: string;
  description: string;
  status: string;
  tone: ZoneTone;
  image: string | null;
}

export interface BuildingItem {
  code: string;
  name: string;
  note: string;
  meta: string;
}

export interface PropertyRow {
  code: string;
  zone: string;
  floor: string;
  area: string;
  type: string;
  direction: string;
  price: string;
  status: string;
}

export interface PolicyImage {
  id: number;
  src: string;
}

export interface ProgressStep {
  id: number;
  date: string;
  title: string;
  desc: string;
  state: "done" | "current" | "todo";
}

export interface NewsItem {
  id: number;
  category: string;
  title: string;
  meta: string;
  image: string | null;
}

export interface AmenityItem {
  id: number;
  name: string;
  image: string | null;
}

export interface VideoItem {
  id: number;
  name: string;
  url: string;
  description: string;
  createdAt: string;
}

// Thông tin hồ sơ dự án (đúng các cột trong bảng projects, không suy diễn thêm)
export interface ProjectProfile {
  id: number;
  investor: string;
  consultancy: string;
  location: string;
  developmentModel: string; // dùng làm phần giới thiệu, có thể là HTML (rich text)
  buildingType: string;
  size: string; // "18,6 ha"
  totalInvestment: string; // "25.000 tỷ VNĐ"
  ownershipType: string;
  types: string[];
  overviewImage: string | null;
  createdAt: string;
  saleStatus: string | null; // suy ra từ phân khu / quỹ căn thực tế
}

export interface FaqItem {
  id: number;
  question: string;
  answer: string;
}

export interface RelatedProject {
  id: number;
  name: string;
  location: string;
  investor: string;
  image: string | null;
}

export interface ProjectOverviewData {
  profile: ProjectProfile;
  faqs: FaqItem[];
  related: RelatedProject[];
  project: ProjectOverview;
  gallery: GalleryImage[];
  zones: ZoneItem[];
  buildings: BuildingItem[];
  properties: PropertyRow[];
  propertyTotal: number;
  policyImages: PolicyImage[];
  progress: ProgressStep[];
  news: NewsItem[];
  amenities: AmenityItem[];
  videos: VideoItem[];
}
