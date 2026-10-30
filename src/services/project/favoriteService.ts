import BaseService from "../base/BaseService";
import { toPage } from "../../api/http";
import type { PageResponse } from "../../types/common.types";
import type { FavoriteDto, FavoriteStatus } from "../../types/project/project.types";

// Dự án yêu thích: mọi API đều cần đăng nhập (gắn token, 401 tự refresh)
class FavoriteService extends BaseService {
  constructor() {
    super("/favorites");
  }

  // GET /favorites?page=&size=
  async getMine(page = 0, size = 12): Promise<PageResponse<FavoriteDto>> {
    return toPage(await this.getPage<FavoriteDto>({ page, size }));
  }

  // GET /favorites/{projectId}/status
  async getStatus(projectId: number): Promise<FavoriteStatus> {
    return this.http.get<FavoriteStatus>(this.url(projectId, "status"));
  }

  // POST /favorites/{projectId}: bật/tắt, trả trạng thái sau khi đổi
  async toggle(projectId: number): Promise<FavoriteStatus> {
    return this.http.post<FavoriteStatus>(this.url(projectId), undefined, { silentLoading: true });
  }
}

export const favoriteService = new FavoriteService();
