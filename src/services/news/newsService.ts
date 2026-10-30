import BaseService from "../base/BaseService";
import { toPage } from "../../api/http";
import type { PageResponse } from "../../types/event/event.types";
import type {
  News,
  NewsCategory,
  NewsCategoryWithCount,
  NewsFilter,
  NewsSort,
  ProjectWithCount,
} from "../../types/new/news.types";

export interface GetNewsParams {
  filter: NewsFilter;
  sort: NewsSort;
  page?: number;
  size?: number;
}

const NEWS_SORT_PARAM: Record<NewsSort, string> = {
  NEWEST: "createdAt,desc",
  OLDEST: "createdAt,asc",
};

// BE chưa có API đếm số bài → lấy 1 trang lớn để tính số bài theo chuyên mục / dự án
const STATS_SIZE = 200;
const FEATURED_SIZE = 8; // 4 bài cho slide lớn + 4 bài cho dải tin bên dưới hero
const SIDEBAR_PROJECT_LIMIT = 10;

const withImages = (news: News): News => ({
  ...news,
  images: news.images ?? [],
});

// API công khai
class NewsService extends BaseService {
  constructor() {
    super("/news", { auth: false });
  }

  // GET /news?keyword=&categoryId=&projectId=&page=&size=&sort=
  async getNews({
    filter,
    sort,
    page = 0,
    size = 9,
  }: GetNewsParams): Promise<PageResponse<News>> {
    const res = await this.getPage<News>({
      keyword: filter.keyword.trim(),
      categoryId: filter.categoryId,
      projectId: filter.projectId,
      page,
      size,
      sort: NEWS_SORT_PARAM[sort],
    });
    const p = toPage(res);
    return { ...p, content: p.content.map(withImages) };
  }

  // GET /news/{id}
  async getNewsById(id: number): Promise<News> {
    return withImages(await this.getById<News>(id));
  }

  // GET /news/news-categories
  async getCategories(): Promise<NewsCategory[]> {
    return (
      (await this.http.get<NewsCategory[] | null>(this.url("news-categories"))) ?? []
    );
  }

  // Chuyên mục kèm số bài + danh sách dự án có bài viết (cho sidebar)
  async getSidebarData(): Promise<{
    categories: NewsCategoryWithCount[];
    projects: ProjectWithCount[];
    total: number;
    featured: News[];
  }> {
    const [categories, page] = await Promise.all([
      this.getCategories(),
      this.getNews({
        filter: { keyword: "", categoryId: null, projectId: null },
        sort: "NEWEST",
        size: STATS_SIZE,
      }),
    ]);

    const projectMap = new Map<number, ProjectWithCount>();
    page.content.forEach((n) => {
      if (!n.project) return;
      const p = projectMap.get(n.project.id) ?? { ...n.project, newsCount: 0 };
      p.newsCount += 1;
      projectMap.set(p.id, p);
    });

    return {
      categories: categories.map((c) => ({
        ...c,
        newsCount: page.content.filter((n) => n.category?.id === c.id).length,
      })),
      // Chỉ lấy các dự án có nhiều bài nhất cho gọn sidebar
      projects: [...projectMap.values()]
        .sort((a, b) => b.newsCount - a.newsCount)
        .slice(0, SIDEBAR_PROJECT_LIMIT),
      total: page.totalElements,
      // Bài mới nhất có ảnh → slider ở hero
      featured: page.content
        .filter((n) => n.images[0]?.imageUrl)
        .slice(0, FEATURED_SIZE),
    };
  }

  // Cùng chuyên mục trước, thiếu thì bù bằng cùng dự án
  async getRelatedNews(news: News, limit = 3): Promise<News[]> {
    const fetchBy = (filter: Partial<NewsFilter>) =>
      this.getNews({
        filter: { keyword: "", categoryId: null, projectId: null, ...filter },
        sort: "NEWEST",
        size: limit + 1,
      }).then((p) => p.content);

    const [sameCategory, sameProject] = await Promise.all([
      news.category ? fetchBy({ categoryId: news.category.id }) : [],
      news.project ? fetchBy({ projectId: news.project.id }) : [],
    ]);

    const seen = new Set<number>([news.id]);
    return [...sameCategory, ...sameProject]
      .filter((n) => !seen.has(n.id) && seen.add(n.id))
      .slice(0, limit);
  }

  async getLatestNews(excludeId: number, limit = 4): Promise<News[]> {
    const page = await this.getNews({
      filter: { keyword: "", categoryId: null, projectId: null },
      sort: "NEWEST",
      size: limit + 1,
    });
    return page.content.filter((n) => n.id !== excludeId).slice(0, limit);
  }
}

const newsService = new NewsService();
export default newsService;
