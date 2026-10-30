// Trang Vị trí dự án (bảng project_locations, location_advantages, location_images)

export interface LocationImageDto {
  id: number;
  imageUrl: string;
}

export interface ProjectLocationDto {
  projectId: number;
  latitude: number | null;
  longitude: number | null;
  intro: string | null;
  articleTitle: string | null;
  content: string | null; // HTML từ trình soạn thảo (giống tin tức)
  advantages: string[]; // điểm thuận lợi, theo thứ tự admin nhập
  images: LocationImageDto[];
  updatedAt: string | null;
}

export interface LocationInput {
  latitude: number | null;
  longitude: number | null;
  intro: string;
  articleTitle: string;
  content: string;
  advantages: string[]; // toàn bộ danh sách theo thứ tự
}
