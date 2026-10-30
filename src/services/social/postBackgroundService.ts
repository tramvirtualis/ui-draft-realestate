import BaseService from "../base/BaseService";
import { toPage } from "../../api/http";
import type { PageResponse } from "../../types/common.types";
import type { AdminPostBackground, PostBackground, PostBackgroundInput } from "../../types/social/social.types";

export interface AdminPostBackgroundStats {
  total: number;
  active: number;
}

// GET /post-backgrounds — màu nền cho bài chỉ có chữ, khách cũng xem được
class PostBackgroundService extends BaseService {
  constructor() {
    super("/post-backgrounds", { auth: false });
  }

  list(): Promise<PostBackground[]> {
    return this.getList<PostBackground>();
  }
}

/**
 API quản trị màu nền: /api/admin/post-backgrounds (chỉ ADMIN).
 - GET ?page=&size=: kể cả đang tắt, theo thứ tự hiển thị, kèm số bài đang dùng; GET /stats: tổng / đang bật
 - POST / PUT /{id} (JSON: name, value, textColor, active) — value là #rrggbb hoặc linear-gradient
 - PATCH /{id}/active, PATCH /{id}/move (UP | DOWN), DELETE /{id} (chỉ khi chưa bài nào dùng)
 */
class AdminPostBackgroundService extends BaseService {
  constructor() {
    super("/admin/post-backgrounds");
  }

  async list(page = 0, size = 10): Promise<PageResponse<AdminPostBackground>> {
    return toPage(await this.getPage<AdminPostBackground>({ page, size }));
  }

  stats(): Promise<AdminPostBackgroundStats> {
    return this.http.get<AdminPostBackgroundStats>(this.url("stats"));
  }

  createBackground(input: PostBackgroundInput): Promise<AdminPostBackground> {
    return this.create<AdminPostBackground>(input);
  }

  updateBackground(id: number, input: PostBackgroundInput): Promise<AdminPostBackground> {
    return this.update<AdminPostBackground>(id, input);
  }

  setActive(id: number, active: boolean): Promise<AdminPostBackground> {
    return this.http.patch<AdminPostBackground>(this.url(id, "active"), { active });
  }

  // Đổi chỗ với màu đứng ngay trước (UP) / ngay sau (DOWN), kể cả khi màu đó ở trang khác
  async move(id: number, direction: "UP" | "DOWN"): Promise<void> {
    await this.http.patch(this.url(id, "move"), { direction });
  }

  remove(id: number): Promise<void> {
    return this.delete(id);
  }
}

export const postBackgroundService = new PostBackgroundService();
export const adminPostBackgroundService = new AdminPostBackgroundService();
