// Tour tham quan 360° (bảng virtual_tours → tour_scenes → tour_hotspots)

export type TourStatus = "DRAFT" | "PUBLISHED";
export type HotspotType = "SCENE" | "INFO";

export interface TourHotspotDto {
  id: number;
  sceneId: number;
  type: HotspotType;
  title: string;
  yaw: number; // độ, -180..180 (hệ toạ độ của trình xem panorama)
  pitch: number; // độ, -90..90
  targetSceneId: number | null; // loại SCENE
  description: string | null; // loại INFO
  imageUrl: string | null;
}

export interface TourSceneDto {
  id: number;
  tourId: number;
  parentSceneId: number | null; // cây phân cấp: dùng cho breadcrumb và nút quay lại
  title: string;
  imageUrl: string;
  initialYaw: number | null;
  initialPitch: number | null;
  initialHfov: number | null;
  sortOrder: number;
  hotspots: TourHotspotDto[] | null;
}

export interface TourDto {
  id: number;
  projectId: number;
  title: string;
  description: string | null;
  status: TourStatus;
  entrySceneId: number | null;
  coverImageUrl: string | null;
  sceneCount: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  scenes: TourSceneDto[] | null; // null ở API danh sách
}

export interface TourValidation {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface TourSceneInput {
  title: string;
  parentSceneId: number | null;
  initialYaw?: number | null;
  initialPitch?: number | null;
  initialHfov?: number | null;
}

export interface TourHotspotInput {
  type: HotspotType;
  title: string;
  yaw: number;
  pitch: number;
  targetSceneId: number | null;
  description: string;
  removeImage?: boolean;
}
