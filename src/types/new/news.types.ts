import type { UserSummary } from "../event/event.types";

export interface NewsCategory {
  id: number;
  name: string;
  slug: string;
}

export interface NewsCategoryWithCount extends NewsCategory {
  newsCount: number;
}

// Thông tin rút gọn của Project
export interface ProjectSummary {
  id: number;
  name: string;
}

// Dự án kèm số bài viết (dùng cho sidebar)
export interface ProjectWithCount extends ProjectSummary {
  newsCount: number;
}

export interface NewsImage {
  id: number;
  title: string;
  imageUrl: string;
  createdAt: string;
}

export interface News {
  id: number;
  title: string;
  content: string;
  active: boolean;
  author: UserSummary;
  project: ProjectSummary;
  category: NewsCategory;
  // Tất cả chuyên mục của tin (gồm cả chuyên mục chính ở `category`)
  categories?: NewsCategory[];
  images: NewsImage[];
  createdAt: string;
  updatedAt?: string;
}

export type NewsSort = "NEWEST" | "OLDEST";

export const NEWS_SORT_LABEL: Record<NewsSort, string> = {
  NEWEST: "Mới nhất",
  OLDEST: "Cũ nhất",
};

export interface NewsFilter {
  keyword: string;
  categoryId: number | null;
  projectId: number | null;
}

export const DEFAULT_NEWS_FILTER: NewsFilter = {
  keyword: "",
  categoryId: null,
  projectId: null,
};
