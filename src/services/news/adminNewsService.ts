import BaseService from "../base/BaseService";
import { authHttp, toPage } from "../../api/http";
import { UPLOAD_CONFIG } from "../project/projectService";
import type { PageResponse } from "../../types/event/event.types";
import type { News, NewsImage } from "../../types/new/news.types";

export interface NewsInput {
  title: string;
  content: string;
  categoryIds: number[]; // chuyên mục đầu tiên là chuyên mục chính
  projectId: number | null;
  active: boolean;
}

export interface AdminNewsQuery {
  keyword?: string;
  categoryId?: number | null;
  projectId?: number | null;
  active?: boolean | null; // null/undefined = cả ẩn lẫn hiện
  page: number;
  size: number;
}

export interface AdminNewsCategory {
  id: number;
  name: string;
  slug: string;
  active: boolean | null;
}

const withImages = (n: News): News => ({ ...n, images: n.images ?? [] });

/**
 API quản trị tin tức: /api/admin/news (chỉ ADMIN, gắn token, 401 tự refresh).
 - Danh sách lọc ở server: keyword, categoryId, projectId, active, page, size.
 - Tạo mới: multipart (kèm ảnh); sửa: JSON; ẩn/hiện: PATCH /{id}/active.
 - Ảnh: POST /{id}/images, DELETE /{id}/images/{imageId}.
 */
class AdminNewsService extends BaseService {
  constructor() {
    super("/admin/news");
  }

  async search(query: AdminNewsQuery): Promise<PageResponse<News>> {
    const res = await this.getPage<News>({
      keyword: query.keyword?.trim(),
      categoryId: query.categoryId ?? undefined,
      projectId: query.projectId ?? undefined,
      active: query.active ?? undefined,
      page: query.page,
      size: query.size,
      sort: "createdAt,desc",
    });
    const p = toPage(res);
    return { ...p, content: p.content.map(withImages) };
  }

  // Số tin theo từng trạng thái, dùng cho các thẻ đếm
  async counts(): Promise<{ all: number; active: number; hidden: number }> {
    const total = async (active?: boolean) =>
      (await this.search({ active, page: 0, size: 1 })).totalElements;
    const [all, active, hidden] = await Promise.all([
      total(),
      total(true),
      total(false),
    ]);
    return { all, active, hidden };
  }

  async get(id: number): Promise<News> {
    return withImages(await this.getById<News>(id));
  }

  // POST /admin/news (multipart: projectId, categoryId, title, content, active, images)
  async add(input: NewsInput, images: File[] = []): Promise<News> {
    const form = new FormData();
    form.append("projectId", String(input.projectId));
    input.categoryIds.forEach((id) => form.append("categoryIds", String(id)));
    form.append("title", input.title.trim());
    form.append("content", input.content.trim());
    form.append("active", String(input.active));
    images.forEach((f) => form.append("images", f));
    return withImages(
      await authHttp.post<News>(this.url(), form, UPLOAD_CONFIG)
    );
  }

  // PUT /admin/news/{id} (JSON)
  async edit(id: number, input: NewsInput): Promise<News> {
    return withImages(
      await this.update<News, Omit<NewsInput, "active"> & { active: boolean }>(
        id,
        {
          ...input,
          title: input.title.trim(),
          content: input.content.trim(),
        }
      )
    );
  }

  // PATCH /admin/news/{id}/active
  async setActive(id: number, active: boolean): Promise<News> {
    return withImages(
      await authHttp.patch<News>(this.url(id, "active"), { active })
    );
  }

  remove(id: number) {
    return this.delete(id);
  }

  // POST /admin/news/{id}/images (multipart)
  async addImages(id: number, files: File[]): Promise<NewsImage[]> {
    const form = new FormData();
    files.forEach((f) => form.append("images", f));
    return (
      (await authHttp.post<NewsImage[] | null>(
        this.url(id, "images"),
        form,
        UPLOAD_CONFIG
      )) ?? []
    );
  }

  // DELETE /admin/news/{id}/images/{imageId}
  async removeImage(id: number, imageId: number): Promise<void> {
    await authHttp.delete(this.url(id, "images", imageId));
  }

  // POST /admin/news-categories (JSON: name; slug tự sinh từ tên)
  async addCategory(name: string): Promise<AdminNewsCategory> {
    return authHttp.post<AdminNewsCategory>("/admin/news-categories", {
      name: name.trim(),
    });
  }

  // DELETE /admin/news-categories/{id}
  async removeCategory(id: number): Promise<void> {
    await authHttp.delete(`/admin/news-categories/${id}`);
  }

  // GET /admin/news-categories (gồm cả danh mục đang ẩn)
  async getCategories(): Promise<AdminNewsCategory[]> {
    return (
      (await authHttp.get<AdminNewsCategory[] | null>(
        "/admin/news-categories"
      )) ?? []
    );
  }
}

export const adminNewsService = new AdminNewsService();
